from __future__ import annotations

from dataclasses import dataclass
import mimetypes
import os
import shutil
import subprocess
import tempfile
import time

from django.conf import settings
from django.core.files.storage import default_storage
from twelvelabs import TwelveLabs


DEFAULT_ANALYSIS_PROMPT = (
    "You are an interview analysis assistant. Analyze a recorded mock interview using the transcript "
    "(and timestamps if provided). Focus only on observable communication signals based on the "
    "candidate's words and structure.\n\n"
    "Pay attention to:\n"
    "- clarity and structure of answers\n"
    "- specificity and concrete examples (metrics, outcomes, scope)\n"
    "- ownership and agency language (\"I did\", decisions made)\n"
    "- collaboration and stakeholder mentions\n"
    "- reflection and tradeoffs\n"
    "- filler, vague, or hedging language (\"kind of\", \"maybe\")\n\n"
    "Cite evidence by quoting short phrases from the transcript and include timestamps when available. "
    "Give constructive, actionable feedback.\n\n"
    "Do NOT infer personality, emotions, confidence, or any protected or sensitive attributes. "
    "Do NOT make assumptions beyond the words used.\n\n"
    "Return a concise analysis with:\n"
    "1) a brief overall summary\n"
    "2) 3-5 strengths with evidence\n"
    "3) 3-5 improvement suggestions with example rewrites"
)


@dataclass(frozen=True)
class TwelveLabsResult:
    transcript: str
    analysis: str
    video_id: str


def analyze_video_from_storage(
    *, object_key: str, filename: str | None = None, prompt: str | None = None
) -> TwelveLabsResult:
    api_key = settings.TWELVELABS_API_KEY
    index_id = settings.TWELVELABS_INDEX_ID
    if not api_key:
        raise ValueError("TWELVELABS_API_KEY is not configured")
    if not index_id:
        raise ValueError("TWELVELABS_INDEX_ID is not configured")

    client = TwelveLabs(api_key=api_key)

    safe_filename = filename or os.path.basename(object_key) or "recording.webm"
    mime_type, _ = mimetypes.guess_type(safe_filename)
    if not mime_type:
        mime_type = "application/octet-stream"

    cleanup_paths: list[str] = []
    upload_handle = None
    try:
        with default_storage.open(object_key, "rb") as handle:
            upload_handle, upload_name, upload_mime, cleanup_paths = _prepare_upload_file(
                handle=handle, filename=safe_filename, mime_type=mime_type
            )
            asset = client.assets.create(
                method="direct",
                file=(upload_name, upload_handle, upload_mime),
                filename=upload_name,
            )
    finally:
        if upload_handle:
            upload_handle.close()
        for path in cleanup_paths:
            try:
                os.remove(path)
            except OSError:
                pass

    if not asset.id:
        raise RuntimeError("Asset upload failed: missing asset ID.")
    _wait_for_asset_ready(client, asset.id)

    indexed_asset = client.indexes.indexed_assets.create(index_id, asset_id=asset.id)
    if not indexed_asset.id:
        raise RuntimeError("Indexing request failed: missing indexed asset ID.")
    _wait_for_indexed_asset_ready(client, index_id, indexed_asset.id)

    indexed_asset_details = client.indexes.indexed_assets.retrieve(
        index_id, indexed_asset.id, transcription=True
    )
    transcript_text = _format_transcription(getattr(indexed_asset_details, "transcription", None))

    video_id = _resolve_video_id(client, index_id, safe_filename, indexed_asset_details)

    analysis_prompt = prompt or DEFAULT_ANALYSIS_PROMPT
    analysis = client.analyze(video_id=video_id, prompt=analysis_prompt)
    analysis_text = getattr(analysis, "data", str(analysis))

    return TwelveLabsResult(transcript=transcript_text, analysis=analysis_text, video_id=video_id)


def _wait_for_asset_ready(client: TwelveLabs, asset_id: str, sleep_interval: float = 5.0) -> None:
    while True:
        asset = client.assets.retrieve(asset_id)
        status = getattr(asset, "status", None)
        if status in ("ready", "failed"):
            if status != "ready":
                raise RuntimeError(f"Asset processing failed (status={status}).")
            return
        time.sleep(sleep_interval)


def _wait_for_indexed_asset_ready(
    client: TwelveLabs, index_id: str, indexed_asset_id: str, sleep_interval: float = 5.0
) -> None:
    while True:
        indexed_asset = client.indexes.indexed_assets.retrieve(index_id, indexed_asset_id)
        status = getattr(indexed_asset, "status", None)
        if status in ("ready", "failed"):
            if status != "ready":
                raise RuntimeError(f"Indexing failed (status={status}).")
            return
        time.sleep(sleep_interval)


def _resolve_video_id(client: TwelveLabs, index_id: str, filename: str, indexed_asset_details) -> str:
    response = client.indexes.videos.list(
        index_id=index_id,
        page=1,
        page_limit=5,
        sort_by="created_at",
        sort_option="desc",
        filename=filename,
    )
    for item in response:
        if item.id:
            return item.id

    system_metadata = getattr(indexed_asset_details, "system_metadata", None)
    if system_metadata:
        response = client.indexes.videos.list(
            index_id=index_id,
            page=1,
            page_limit=5,
            sort_by="created_at",
            sort_option="desc",
            duration=getattr(system_metadata, "duration", None),
            fps=getattr(system_metadata, "fps", None),
            width=getattr(system_metadata, "width", None),
            height=getattr(system_metadata, "height", None),
            size=getattr(system_metadata, "size", None),
        )
        for item in response:
            if item.id:
                return item.id

    response = client.indexes.videos.list(
        index_id=index_id,
        page=1,
        page_limit=1,
        sort_by="created_at",
        sort_option="desc",
    )
    for item in response:
        if item.id:
            return item.id

    raise RuntimeError("Unable to resolve video_id after indexing.")


def _format_transcription(transcription) -> str:
    if not transcription:
        return ""

    lines = []
    for item in transcription:
        text = getattr(item, "value", None)
        if not text:
            continue
        start = getattr(item, "start", None)
        end = getattr(item, "end", None)
        if isinstance(start, (int, float)) and isinstance(end, (int, float)):
            lines.append(f"[{start:.2f}-{end:.2f}] {text}")
        else:
            lines.append(text)

    return "\n".join(lines).strip()


def _prepare_upload_file(*, handle, filename: str, mime_type: str) -> tuple[object, str, str, list[str]]:
    if _looks_like_webm(filename, mime_type):
        return _transcode_webm_to_mp4(handle=handle, filename=filename)
    return handle, filename, mime_type, []


def _looks_like_webm(filename: str, mime_type: str) -> bool:
    return mime_type == "video/webm" or filename.lower().endswith(".webm")


def _transcode_webm_to_mp4(*, handle, filename: str) -> tuple[object, str, str, list[str]]:
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg is required to transcode webm recordings for TwelveLabs.")

    src_suffix = os.path.splitext(filename)[1] or ".webm"
    with tempfile.NamedTemporaryFile(suffix=src_suffix, delete=False) as src:
        shutil.copyfileobj(handle, src)
        src_path = src.name

    dst_path = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False).name
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        src_path,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
        dst_path,
    ]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"ffmpeg failed to transcode recording: {exc.stderr.decode('utf-8', 'ignore')}") from exc

    upload_handle = open(dst_path, "rb")
    upload_name = os.path.splitext(filename)[0] + ".mp4"
    return upload_handle, upload_name, "video/mp4", [src_path, dst_path]

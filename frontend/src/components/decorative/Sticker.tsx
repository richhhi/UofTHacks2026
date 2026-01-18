import Image from "next/image";
import * as React from "react";

import type { StickerDef } from "@/lib/stickers";
import { cn } from "@/lib/utils";

export type StickerProps = {
  sticker: StickerDef;
  className?: string;
  /**
   * Set to true if the sticker is purely decorative.
   * If false, alt text will be announced by screen readers.
   */
  decorative?: boolean;
  /** Rotation for the image itself (degrees). */
  rotate?: number;
};

export function Sticker({ sticker, className, decorative = true, rotate = 0 }: StickerProps) {
  return (
    <span
      aria-hidden={decorative ? "true" : undefined}
      className={cn("pointer-events-none absolute select-none", className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <Image
        src={sticker.src}
        alt={decorative ? "" : sticker.alt}
        width={220}
        height={220}
        className="h-full w-full"
        priority={false}
      />
    </span>
  );
}


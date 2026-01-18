export type StickerDef = {
  /** Swap this to a PNG path in `/public/stickers/...` */
  src: string;
  alt: string;
};

/**
 * Central sticker registry.
 *
 * Replace the `.svg` files in `public/stickers/` with `.png` (same names),
 * or update `src` here to point to your imported assets.
 */
export const STICKERS = {
  star: { src: "/stickers/star.svg", alt: "Star sticker" },
  heart: { src: "/stickers/heart.svg", alt: "Heart sticker" },
  tapeBlue: { src: "/stickers/tape-blue.svg", alt: "Blue washi tape sticker" },
} as const satisfies Record<string, StickerDef>;


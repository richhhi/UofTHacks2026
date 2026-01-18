import * as React from "react";

import { STICKERS } from "@/lib/stickers";
import { Sticker } from "@/components/decorative/Sticker";

/**
 * Decorative sticker layer. Central place to reposition / swap assets.
 * Safe to remove later (purely visual).
 */
export function StickerLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Top corners */}
      <Sticker sticker={STICKERS.tapeBlue} className="-left-12 top-2 h-20 w-56 opacity-90" rotate={-8} />
      <Sticker sticker={STICKERS.star} className="-right-10 top-10 h-20 w-20 opacity-95" rotate={12} />

      {/* Mid accents */}
      <Sticker sticker={STICKERS.heart} className="left-6 top-[48%] hidden h-16 w-16 opacity-90 md:block" rotate={-10} />
      <Sticker sticker={STICKERS.star} className="right-10 top-[58%] hidden h-14 w-14 opacity-75 lg:block" rotate={6} />

      {/* Bottom edges */}
      <Sticker sticker={STICKERS.tapeBlue} className="-right-24 bottom-8 h-20 w-56 opacity-80" rotate={9} />
    </div>
  );
}


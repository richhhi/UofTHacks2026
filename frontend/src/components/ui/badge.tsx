import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-sans text-xs font-medium",
        "shadow-sm",
        variant === "default" && "border-ink/10 bg-butter-yellow text-ink",
        variant === "secondary" && "border-soft-blue/40 bg-soft-blue/30 text-ink",
        className
      )}
      {...props}
    />
  );
}


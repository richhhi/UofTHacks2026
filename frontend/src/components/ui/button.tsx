import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans text-sm font-medium transition duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-[0.98]",
        "hover:animate-bounce",
        size === "default" && "h-11 px-6",
        size === "sm" && "h-10 px-4",
        size === "lg" && "h-12 px-7 text-base",
        variant === "default" &&
          "bg-soft-blue text-ink shadow-sm hover:-translate-y-0.5 hover:shadow-paper",
        variant === "secondary" &&
          "border-2 border-warm-gray bg-transparent text-warm-gray shadow-sm hover:-translate-y-0.5 hover:bg-off-white hover:text-ink",
        variant === "ghost" && "bg-transparent text-soft-blue hover:underline underline-offset-4",
        variant === "destructive" &&
          "bg-dusty-pink text-ink shadow-sm hover:-translate-y-0.5 hover:shadow-paper",
        className
      )}
      {...props}
    />
  );
}


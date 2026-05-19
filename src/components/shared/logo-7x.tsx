import Image from "next/image";
import { cn } from "@/lib/utils";

type Logo7xProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

/** 7X wordmark rendered in white (source asset is navy on black). */
export function Logo7x({
  className,
  width = 96,
  height = 48,
  priority = false,
}: Logo7xProps) {
  return (
    <Image
      src="/7x-logo.png"
      alt="7X"
      width={width}
      height={height}
      priority={priority}
      className={cn("object-contain brightness-0 invert", className)}
    />
  );
}

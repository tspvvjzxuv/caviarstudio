import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "size-8 [&_svg]:size-3.5",
  md: "size-12 [&_svg]:size-5",
  lg: "size-14 [&_svg]:size-6",
} as const;

export function IconDisc({
  children,
  className,
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  size?: keyof typeof SIZE;
}) {
  return (
    <span
      className={cn(
        "icon-disc inline-flex shrink-0 items-center justify-center [&_svg]:stroke-[1.75] [&_svg]:stroke-current",
        SIZE[size],
        className,
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

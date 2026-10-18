import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "size-8 [&_svg]:size-4",
  md: "size-12 [&_svg]:size-6",
  lg: "size-16 [&_svg]:size-8",
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
      className={cn("icon-disc", SIZE[size], className)}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

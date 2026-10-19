import type { ComponentProps, ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

export function GlassMark({
  children,
  className,
  ...props
}: ComponentProps<"span"> & { children?: ReactNode }) {
  return (
    <span className={cn("glass-mark", className)} aria-hidden="true" {...props}>
      {children ?? <GlassMarkChevron />}
    </span>
  );
}

export function GlassMarkChevron(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 12 12"
      width="12"
      height="12"
      fill="none"
      aria-hidden="true"
      {...props}
      className={cn("glass-mark-chevron", props.className)}
    >
      <path
        d="M3 4L6 8L9 4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

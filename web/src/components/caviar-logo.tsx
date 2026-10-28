import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

export function CaviarLogo({
  className,
  wordClassName,
  showTagline = true,
  wordOverlay,
  ref,
}: {
  className?: string;
  wordClassName?: string;
  showTagline?: boolean;
  wordOverlay?: ReactNode;
  ref?: Ref<HTMLSpanElement>;
}) {
  return (
    <span ref={ref} className={cn("caviar-lockup inline-flex flex-col items-center", className)}>
      <span className="caviar-word-slot">
        <span className={cn("caviar-word", wordClassName)}>CAVIAR</span>
        {wordOverlay}
      </span>
      <span className="caviar-rule" aria-hidden="true" />
      {showTagline ? <span className="caviar-tag">Studio · Trnava</span> : null}
    </span>
  );
}

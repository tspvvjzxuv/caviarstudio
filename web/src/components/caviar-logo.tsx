import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const WORD = ["C", "A", "V", "I", "A", "R"] as const;

export function CaviarLogo({
  className,
  wordClassName,
  showTagline = true,
  split = false,
}: {
  className?: string;
  wordClassName?: string;
  showTagline?: boolean;
  split?: boolean;
}) {
  return (
    <span className={cn("caviar-lockup inline-flex flex-col items-center", className)}>
      {split ? (
        <span className={cn("caviar-word hero-caviar-word", wordClassName)} aria-label="CAVIAR">
          {WORD.map((ch, i) => (
            <span
              key={`${ch}-${i}`}
              className="hero-caviar-ch"
              style={{ "--i": String(i - (WORD.length - 1) / 2) } as CSSProperties}
              aria-hidden="true"
            >
              {ch}
            </span>
          ))}
        </span>
      ) : (
        <span className={cn("caviar-word", wordClassName)}>CAVIAR</span>
      )}
      <span className="caviar-rule" aria-hidden="true" />
      {showTagline ? <span className="caviar-tag">Studio · Trnava</span> : null}
    </span>
  );
}

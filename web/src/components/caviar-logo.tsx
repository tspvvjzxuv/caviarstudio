import { cn } from "@/lib/utils";

export function CaviarLogo({
  className,
  wordClassName,
  showTagline = true,
}: {
  className?: string;
  wordClassName?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("caviar-lockup inline-flex flex-col items-center", className)}>
      <span className={cn("caviar-word", wordClassName)}>CAVIAR</span>
      <span className="caviar-rule" aria-hidden="true" />
      {showTagline ? <span className="caviar-tag">Studio · Trnava</span> : null}
    </span>
  );
}

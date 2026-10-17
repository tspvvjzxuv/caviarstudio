import { useId } from "react";
import { cn } from "@/lib/utils";

export function CaviarMark({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const bead = `caviar-bead-${uid}`;
  const ring = `caviar-c-${uid}`;
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("caviar-mark overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={bead} cx="34%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="32%" stopColor="#ffe44d" />
          <stop offset="68%" stopColor="#c5cad3" />
          <stop offset="100%" stopColor="#3d8aff" />
        </radialGradient>
        <linearGradient id={ring} x1="18%" y1="8%" x2="88%" y2="92%">
          <stop offset="0%" stopColor="#3d8aff" />
          <stop offset="46%" stopColor="#f4f5f7" />
          <stop offset="100%" stopColor="#ffe44d" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="15.5" fill={`url(#${bead})`} />
      <circle cx="32" cy="32" r="15.5" fill="none" stroke="rgb(244 245 247 / 0.35)" strokeWidth="1" />
      <path
        d="M44.2 19.4a17.6 17.6 0 1 0 0 25.2"
        fill="none"
        stroke={`url(#${ring})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CaviarLogo({
  className,
  wordClassName,
  markClassName,
}: {
  className?: string;
  wordClassName?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-[0.28em]", className)}>
      <CaviarMark className={cn("shrink-0", markClassName)} />
      <span
        className={cn(
          "caviar-word font-serif tracking-[-0.04em] text-transparent italic bg-linear-to-r from-azure via-pearl to-platinum bg-clip-text",
          wordClassName,
        )}
      >
        Caviar
      </span>
    </span>
  );
}

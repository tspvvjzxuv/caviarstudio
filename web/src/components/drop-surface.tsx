import { useRef } from "react";
import { useDropSurface } from "@/hooks/use-drop-surface";

export function DropSurface() {
  const ref = useRef<HTMLCanvasElement>(null);
  useDropSurface(ref);
  return (
    <span className="drop-ripple-clip" aria-hidden="true">
      <canvas ref={ref} className="drop-ripple" />
    </span>
  );
}

export function DropGooDefs() {
  return (
    <>
      <svg className="drop-goo-def" aria-hidden="true" width="0" height="0">
        <filter id="caviar-goo" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
      <style>{`
        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          .service-sec:not(.is-paused) .service-spill { filter: url(#caviar-goo); }
        }
      `}</style>
    </>
  );
}

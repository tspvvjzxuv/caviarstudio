import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { isRevealVisible, REVEAL_IO } from "@/lib/reveal-gate";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const flush = () => {
      if (isRevealVisible(el.getBoundingClientRect(), window.innerHeight)) el.classList.add("in");
    };
    if (!("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      REVEAL_IO,
    );
    io.observe(el);
    requestAnimationFrame(flush);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal overflow-visible", className)}
      style={{ "--d": delay } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="kicker">
      <span className="kicker-dot" aria-hidden="true" />
      {children}
    </p>
  );
}

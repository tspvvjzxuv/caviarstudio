import { type CSSProperties, type ReactNode, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CAVIAR_EASE, canHideForReveal, revealVars } from "@/lib/gsap-motion";
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

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      const title = el.querySelector<HTMLElement>(":scope > .section-title");
      const skipY = Boolean(el.closest(".service-card")) && !title;
      const vars = revealVars({ reduced, desktop, skipY });
      const extras = title ? [...el.children].filter((node) => node !== title) : [];
      let played = false;

      const play = () => {
        if (played) return;
        played = true;
        const visible =
          el.classList.contains("in") || isRevealVisible(el.getBoundingClientRect(), window.innerHeight);
        el.classList.add("in");
        if (!title) return;
        const hide = canHideForReveal({ observerReady: true, visible, reduced });
        gsap.fromTo(
          title,
          { y: hide ? vars.y : 0, opacity: hide ? vars.opacity : 1, force3D: false },
          {
            y: 0,
            opacity: 1,
            duration: vars.duration,
            delay: delay * vars.delayStep,
            ease: CAVIAR_EASE,
            force3D: false,
            overwrite: "auto",
          },
        );
        if (extras.length) {
          gsap.fromTo(
            extras,
            { y: hide && !skipY ? Math.min(16, vars.y) : 0, opacity: hide ? vars.opacity : 1 },
            {
              y: 0,
              opacity: 1,
              duration: vars.duration * 0.85,
              delay: delay * vars.delayStep + 0.12,
              stagger: 0.06,
              ease: CAVIAR_EASE,
              overwrite: "auto",
            },
          );
        }
      };

      if (!("IntersectionObserver" in window)) {
        play();
        return;
      }

      const io = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          play();
          io.disconnect();
        }
      }, REVEAL_IO);
      io.observe(el);
      const flush = () => {
        if (el.classList.contains("in") || isRevealVisible(el.getBoundingClientRect(), window.innerHeight)) {
          play();
        }
      };
      const raf = requestAnimationFrame(flush);
      return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
      };
    },
    { scope: ref, dependencies: [delay] },
  );

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

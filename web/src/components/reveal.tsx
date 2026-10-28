import { type CSSProperties, type ReactNode, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CAVIAR_EASE, REVEAL_START, revealVars } from "@/lib/gsap-motion";
import { isRevealVisible } from "@/lib/reveal-gate";
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
      el.classList.add("is-gsap");

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 768px)",
        },
        (context) => {
          const reduced = Boolean(context.conditions?.reduce);
          const desktop = Boolean(context.conditions?.desktop);
          const title = el.querySelector<HTMLElement>(":scope > .section-title");
          const skipY = Boolean(el.closest(".service-card")) && !title;
          const vars = revealVars({ reduced, desktop, skipY });
          const move = title ?? el;
          const extras = title
            ? [...el.children].filter((node) => node !== title)
            : [];

          gsap.set(move, { y: vars.y, opacity: vars.opacity, force3D: false });
          if (extras.length) gsap.set(extras, { y: skipY ? 0 : Math.min(16, vars.y), opacity: vars.opacity });

          const play = () => {
            el.classList.add("in");
            gsap.to(move, {
              y: 0,
              opacity: 1,
              duration: vars.duration,
              delay: delay * vars.delayStep,
              ease: CAVIAR_EASE,
              force3D: false,
              overwrite: "auto",
            });
            if (extras.length) {
              gsap.to(extras, {
                y: 0,
                opacity: 1,
                duration: vars.duration * 0.85,
                delay: delay * vars.delayStep + 0.12,
                stagger: 0.06,
                ease: CAVIAR_EASE,
                overwrite: "auto",
              });
            }
          };

          if (isRevealVisible(el.getBoundingClientRect(), window.innerHeight)) {
            play();
            return;
          }

          ScrollTrigger.create({
            trigger: el,
            start: REVEAL_START,
            once: true,
            onEnter: play,
          });
        },
      );
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

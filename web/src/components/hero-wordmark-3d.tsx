import { useEffect, useRef } from "react";
import { CaviarLogo } from "@/components/caviar-logo";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { CAVIAR_EASE, LOCKUP_SPLIT, lockupDelay } from "@/lib/gsap-motion";

export function HeroCaviarMark() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lockupRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let unmount = () => {};

    import("@/lib/hero-wordmark-3d")
      .then(({ mountHeroWordmark }) => {
        if (cancelled || !canvas.isConnected) return;
        unmount = mountHeroWordmark(canvas);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      unmount();
    };
  }, []);

  useGSAP(
    () => {
      const root = lockupRef.current;
      if (!root) return;
      const word = root.querySelector<HTMLElement>(".caviar-word");
      const tag = root.querySelector<HTMLElement>(".caviar-tag");
      const rule = root.querySelector<HTMLElement>(".caviar-rule");
      if (!word || !tag) return;

      root.classList.add("is-gsap");
      const split = SplitText.create([word, tag], {
        type: LOCKUP_SPLIT,
        tag: "span",
        linesClass: "lockup-line",
        aria: "auto",
      });
      const delay = lockupDelay(document.documentElement.classList.contains("intro-seen"));

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([split.lines, rule], { opacity: 1, y: 0, scaleX: 1 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = split.lines;
        gsap.set(lines, { y: 22, opacity: 0, force3D: false });
        if (rule) gsap.set(rule, { scaleX: 0.18, opacity: 0, transformOrigin: "50% 50%" });
        const tl = gsap.timeline({ delay });
        if (lines[0]) tl.to(lines[0], { y: 0, opacity: 1, duration: 0.95, ease: CAVIAR_EASE, force3D: false });
        if (rule) tl.to(rule, { scaleX: 1, opacity: 1, duration: 0.55, ease: CAVIAR_EASE }, "-=0.55");
        if (lines.length > 1) {
          tl.to(lines.slice(1), { y: 0, opacity: 1, duration: 0.85, ease: CAVIAR_EASE, force3D: false }, "-=0.32");
        }
      });

      return () => split.revert();
    },
    { scope: lockupRef },
  );

  return (
    <CaviarLogo
      ref={lockupRef}
      wordOverlay={<canvas ref={canvasRef} className="hero-wordmark-3d" aria-hidden="true" />}
    />
  );
}

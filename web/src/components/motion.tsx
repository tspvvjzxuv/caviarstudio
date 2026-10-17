import { useEffect, useRef, useState } from "react";
import { CaviarLogo } from "@/components/caviar-logo";
import { useLanguage } from "@/lib/language";

const INTRO_SEEN_KEY = "caviar-intro-seen";

const grain = <div className="grain [view-transition-name:site-grain]" aria-hidden="true" />;

const introMark = <CaviarLogo className="text-[clamp(2.4rem,7vw,4.2rem)]" />;

function markIntroSeen() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add("intro-seen");
}

function hasSeenIntro() {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function Grain() {
  return grain;
}

export function IntroVeil() {
  const [show, setShow] = useState(() => {
    const seen = hasSeenIntro();
    if (seen) markIntroSeen();
    return !seen;
  });

  useEffect(() => {
    if (!show) {
      markIntroSeen();
      return;
    }
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      /* private mode */
    }
    const t = window.setTimeout(() => setShow(false), 1700);
    return () => window.clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="intro-veil pointer-events-none fixed inset-0 z-[70] grid place-items-center bg-background"
      aria-hidden="true"
      onAnimationEnd={() => setShow(false)}
    >
      {introMark}
    </div>
  );
}

export function CustomCursor() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const { t } = useLanguage();
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    document.documentElement.classList.add("has-cursor");

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add("on");
      if (!raf) {
        const tick = () => {
          x += (tx - x) * 0.18;
          y += (ty - y) * 0.18;
          el.style.transform = `translate3d(${x}px,${y}px,0)`;
          raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.35 ? requestAnimationFrame(tick) : 0;
        };
        raf = requestAnimationFrame(tick);
      }
    };
    const onOver = (e: PointerEvent) => {
      const hit = (e.target as HTMLElement | null)?.closest("[data-cursor]");
      const kind = hit instanceof HTMLElement ? hit.dataset.cursor : "";
      el.classList.toggle("is-view", kind === "view");
      el.classList.toggle("is-soon", kind === "soon");
      if (label.current && hit) {
        const copy = tRef.current;
        label.current.textContent = kind === "view" ? copy.cursorView : copy.cursorSoon;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div ref={root} className="cursor-root hidden md:block [view-transition-name:site-cursor]" aria-hidden="true">
      <span className="block size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-azure/80" />
      <span className="absolute top-0 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lemon" />
      <span ref={label} className="absolute top-5 left-3 text-[0.62rem] tracking-[0.18em] text-lemon uppercase" />
    </div>
  );
}

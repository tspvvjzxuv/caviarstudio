import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language";

export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}

export function IntroVeil() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShow(false);
      return;
    }
    const t = window.setTimeout(() => setShow(false), 1700);
    return () => window.clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div
      className="intro-veil pointer-events-none fixed inset-0 z-[70] grid place-items-center bg-[#070708]"
      aria-hidden="true"
      onAnimationEnd={() => setShow(false)}
    >
      <p className="font-serif text-[clamp(1.4rem,4vw,2rem)] tracking-[0.42em] text-transparent uppercase bg-linear-to-r from-steel via-pearl to-platinum bg-clip-text">
        Caviar
      </p>
      <span className="intro-line absolute right-[12%] bottom-[38%] left-[12%] h-px origin-center scale-x-[0.18] bg-[image:var(--hair)]" />
    </div>
  );
}

export function CustomCursor() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const { t } = useLanguage();

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
        label.current.textContent = kind === "view" ? t.cursorView : t.cursorSoon;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [t]);

  return (
    <div ref={root} className="cursor-root hidden md:block" aria-hidden="true">
      <span className="block size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-platinum/70" />
      <span className="absolute top-0 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-platinum" />
      <span ref={label} className="absolute top-5 left-3 text-[0.62rem] tracking-[0.18em] text-platinum uppercase" />
    </div>
  );
}

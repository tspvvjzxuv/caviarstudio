import { useEffect } from "react";

const SELECTOR = "[data-magnetic]";

export function MagneticLayer() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduce || !fine) return;
    let current: HTMLElement | null = null;
    let box: DOMRect | null = null;
    let pending: PointerEvent | null = null;
    let raf = 0;
    const clear = () => {
      if (!current) return;
      current.style.removeProperty("--mx");
      current.style.removeProperty("--my");
      current = null;
      box = null;
    };
    const apply = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>(SELECTOR) : null;
      if (current && current !== el) clear();
      if (!el) return;
      if (current !== el) {
        current = el;
        box = el.getBoundingClientRect();
      } else if (!box) {
        box = el.getBoundingClientRect();
      }
      const r = box;
      const strength = el.classList.contains("metal-fill") ? 8 : 6;
      el.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width - 0.5) * strength).toFixed(2)}px`);
      el.style.setProperty("--my", `${(((e.clientY - r.top) / r.height - 0.5) * strength).toFixed(2)}px`);
    };
    const onMove = (e: PointerEvent) => {
      pending = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (pending) apply(pending);
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", clear, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", clear);
      if (raf) cancelAnimationFrame(raf);
      clear();
    };
  }, []);
  return null;
}

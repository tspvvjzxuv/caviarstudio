import { useEffect } from "react";

const SELECTOR = "[data-magnetic]";

export function MagneticLayer() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduce || !fine) return;
    let current: HTMLElement | null = null;
    const clear = () => {
      if (!current) return;
      current.style.removeProperty("--mx");
      current.style.removeProperty("--my");
      current = null;
    };
    const onMove = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>(SELECTOR) : null;
      if (current && current !== el) clear();
      if (!el) return;
      current = el;
      const r = el.getBoundingClientRect();
      const strength = el.classList.contains("metal-fill") ? 8 : 6;
      el.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width - 0.5) * strength).toFixed(2)}px`);
      el.style.setProperty("--my", `${(((e.clientY - r.top) / r.height - 0.5) * strength).toFixed(2)}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", clear, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", clear);
      clear();
    };
  }, []);
  return null;
}

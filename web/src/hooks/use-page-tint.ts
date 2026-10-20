import { useEffect } from "react";

type Stop = { top: number; r: number; g: number; b: number };

function parseHex(hex: string): { r: number; g: number; b: number } {
  const n = hex.replace("#", "");
  const v = n.length === 3
    ? n.split("").map((c) => c + c).join("")
    : n;
  const x = Number.parseInt(v, 16);
  return { r: (x >> 16) & 255, g: (x >> 8) & 255, b: x & 255 };
}

function smooth(t: number) {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return x * x * (3 - 2 * x);
}

export function usePageTint() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stops: Stop[] = [];
    let packed = -1;
    let ticking = false;

    const paint = () => {
      ticking = false;
      if (!stops.length) return;
      const sample = window.scrollY + window.innerHeight * 0.32;
      let i = 0;
      while (i < stops.length - 1 && sample >= stops[i + 1].top) i += 1;
      const a = stops[i];
      const b = stops[Math.min(i + 1, stops.length - 1)];
      const span = b.top - a.top;
      let t = span <= 1 ? 0 : (sample - a.top) / span;
      t = reduceMq.matches ? (t < 0.5 ? 0 : 1) : smooth(t);
      const r = Math.round(a.r + (b.r - a.r) * t);
      const g = Math.round(a.g + (b.g - a.g) * t);
      const bl = Math.round(a.b + (b.b - a.b) * t);
      const next = (r << 16) | (g << 8) | bl;
      if (next === packed) return;
      packed = next;
      root.style.setProperty("--page-bg", `rgb(${r} ${g} ${bl})`);
    };

    const measure = () => {
      const nodes = document.querySelectorAll<HTMLElement>("[data-page-tint]");
      const y = window.scrollY;
      stops = [];
      for (const el of nodes) {
        const hex = el.getAttribute("data-page-tint");
        if (!hex) continue;
        const box = el.getBoundingClientRect();
        stops.push({ top: box.top + y, ...parseHex(hex) });
      }
      paint();
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    };

    let measureTimer = 0;
    const scheduleMeasure = () => {
      if (measureTimer) return;
      measureTimer = window.setTimeout(() => {
        measureTimer = 0;
        measure();
      }, 120);
    };

    measure();
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    reduceMq.addEventListener("change", paint);
    document.addEventListener("visibilitychange", paint);

    return () => {
      ro.disconnect();
      window.clearTimeout(measureTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleMeasure);
      reduceMq.removeEventListener("change", paint);
      document.removeEventListener("visibilitychange", paint);
      root.style.removeProperty("--page-bg");
    };
  }, []);
}

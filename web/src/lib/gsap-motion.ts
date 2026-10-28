/** GSAP timing tokens. Keep this file plugin-free so node tests can load it. */

export const CAVIAR_EASE = "expo.out";

export const REVEAL_START = "top 90%";

export const LOCKUP_SPLIT = "lines";

export const SERVICE_FLIP_TARGETS = ".service-card, .service-panel, .service-row, .service-unit";

export function revealVars(opts: { reduced: boolean; desktop: boolean; skipY: boolean }) {
  return {
    y: opts.skipY ? 0 : opts.reduced ? 8 : opts.desktop ? 28 : 20,
    duration: opts.reduced ? 0.35 : opts.desktop ? 0.95 : 0.82,
    opacity: opts.reduced ? 1 : 0,
    delayStep: opts.reduced ? 0.04 : 0.09,
  };
}

export function flipDuration(desktop: boolean, reduced: boolean) {
  if (reduced) return 0;
  return desktop ? 0.48 : 0.36;
}

export function lockupDelay(introSeen: boolean) {
  return introSeen ? 0.08 : 1.55;
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

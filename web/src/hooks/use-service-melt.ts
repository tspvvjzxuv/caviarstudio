import { useEffect, type RefObject } from "react";
import type { MeltInstance } from "@/vendor/meltgl.min.js";
import { makeMetalSource } from "@/lib/metal-source";

const REDUCE = "(prefers-reduced-motion: reduce)";
const COARSE = "(hover: none), (pointer: coarse)";
const HOVER = 0.12;

function paused(host: HTMLElement) {
  return Boolean(host.closest(".service-sec.is-paused"));
}

function isOpen(button: HTMLElement) {
  return button.classList.contains("is-open") || button.getAttribute("aria-expanded") === "true";
}

export function useServiceMelt(hostRef: RefObject<HTMLDivElement | null>, seed: number) {
  useEffect(() => {
    const host = hostRef.current;
    const button = host?.closest(".service-chrome") as HTMLElement | null;
    const section = host?.closest(".service-sec") as HTMLElement | null;
    if (!host || !button) return;

    const reduce = window.matchMedia(REDUCE);
    const coarse = window.matchMedia(COARSE);
    let melt: MeltInstance | null = null;
    let dead = false;
    let hover = false;
    let building: Promise<void> | null = null;
    let idleTimer = 0;
    let unprogress: (() => void) | null = null;

    const tearDown = () => {
      window.clearTimeout(idleTimer);
      idleTimer = 0;
      unprogress?.();
      unprogress = null;
      melt?.dispose();
      melt = null;
    };

    const scheduleDispose = (ms: number) => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (dead || hover || isOpen(button) || paused(host)) return;
        if (melt && melt.progress < 0.002) tearDown();
      }, ms);
    };

    const apply = () => {
      if (dead) return;
      if (paused(host) || reduce.matches) {
        tearDown();
        return;
      }
      if (!melt) {
        if (isOpen(button) || hover) build();
        return;
      }
      melt.resume();
      if (isOpen(button)) {
        window.clearTimeout(idleTimer);
        if (melt.progress < 0.999 && melt.state !== "melting") melt.play();
        return;
      }
      if (hover && !coarse.matches) {
        window.clearTimeout(idleTimer);
        if (melt.progress < HOVER - 0.012) {
          if (melt.state !== "melting") melt.play();
        } else if (melt.progress > HOVER + 0.02) {
          if (melt.state !== "reforming") melt.reverse();
        } else if (melt.state === "melting" || melt.state === "reforming") {
          melt.pause();
        }
        return;
      }
      if (melt.progress > 0.002) {
        if (melt.state !== "reforming") melt.reverse();
        return;
      }
      melt.suspend();
      scheduleDispose(coarse.matches ? 400 : 2800);
    };

    const build = () => {
      if (dead || melt || building || reduce.matches || paused(host)) return;
      const box = host.getBoundingClientRect();
      if (box.width < 8 || box.height < 8) return;
      building = Promise.all([
        makeMetalSource(box.width, box.height, seed),
        import("@/vendor/meltgl.min.js"),
      ])
        .then(([source, { createMelt }]) =>
          createMelt({
            target: host,
            source,
            key: "none",
            material: {
              base: "solder",
              viscosity: 0.018,
              density: 3,
              tension: 0.95,
              yield: 0.08,
              gloss: 1,
              fresnel: 0.92,
              meltRate: 1.85,
              cooling: 0.22,
              blend: 0.38,
              tint: [0.62, 0.65, 0.7, 1],
            },
            simulation: {
              ground: "floor",
              simulationScale: coarse.matches ? 0.26 : 0.32,
              substeps: coarse.matches ? 2 : 3,
              viscosityIterations: coarse.matches ? 8 : 14,
              dripRoom: coarse.matches ? 0.58 : 0.7,
              topRoom: 0.04,
              sideRoom: 0.05,
              gravity: 1.15,
              columnFeed: 0.62,
              onsetSpread: 0.7,
              curvatureFlow: 0.16,
              seed: Math.round(11 + seed * 40),
              maxKeyframes: 24,
            },
            duration: 2.2,
            easing: "linear",
            maxPixelRatio: coarse.matches ? 1.2 : 1.4,
            maxStepsPerFrame: coarse.matches ? 8 : 14,
            respectReducedMotion: true,
          }),
        )
        .then((instance) => {
          if (dead) {
            instance.dispose();
            return;
          }
          melt = instance;
          melt.seek(0);
          unprogress = melt.on("progress", apply);
          melt.on("complete", apply);
          apply();
        })
        .catch(() => undefined)
        .finally(() => {
          building = null;
        });
    };

    const onEnter = () => {
      hover = true;
      build();
      apply();
    };
    const onLeave = () => {
      hover = false;
      apply();
    };

    const watch = new MutationObserver(() => {
      if (paused(host) || reduce.matches) {
        tearDown();
        return;
      }
      build();
      apply();
    });
    watch.observe(button, { attributes: true, attributeFilter: ["class", "aria-expanded"] });
    if (section) watch.observe(section, { attributes: true, attributeFilter: ["class"] });

    button.addEventListener("pointerenter", onEnter);
    button.addEventListener("pointerleave", onLeave);
    reduce.addEventListener("change", apply);
    if (isOpen(button) && !reduce.matches && !paused(host)) build();

    return () => {
      dead = true;
      watch.disconnect();
      reduce.removeEventListener("change", apply);
      button.removeEventListener("pointerenter", onEnter);
      button.removeEventListener("pointerleave", onLeave);
      tearDown();
    };
  }, [hostRef, seed]);
}

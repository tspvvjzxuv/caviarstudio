import { useEffect, type RefObject } from "react";

function prefersReduce() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasViewTimeline() {
  return (
    typeof CSS !== "undefined" &&
    (CSS.supports("animation-timeline: view()") || CSS.supports("animation-timeline: scroll()"))
  );
}

export function useHeroWordmark(heroRef: RefObject<HTMLElement | null>, markRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hero = heroRef.current;
    const mark = markRef.current;
    if (!hero || !mark) return;

    const reduce = prefersReduce();
    const timeline = hasViewTimeline();
    document.documentElement.classList.toggle("js-scroll-timeline", timeline);
    mark.classList.toggle("is-soft", reduce);

    if (timeline) {
      const io = new IntersectionObserver(
        ([entry]) => mark.classList.toggle("is-live", entry.isIntersecting),
        { rootMargin: "80px 0px" },
      );
      io.observe(hero);
      return () => {
        io.disconnect();
        mark.classList.remove("is-live");
        document.documentElement.classList.remove("js-scroll-timeline");
      };
    }

    let live = true;
    let raf = 0;
    let cy = 0;
    let spread = 0;
    let fade = 1;
    let cap = window.innerHeight;
    const amp = reduce ? 0.06 : 0.32;
    const spreadAmp = reduce ? 1.2 : 6.5;
    const fadeAmp = reduce ? 0.22 : 0.78;
    const lerp = reduce ? 0.28 : 0.14;

    const io = new IntersectionObserver(
      ([entry]) => {
        live = entry.isIntersecting;
        mark.classList.toggle("is-live", live);
        if (live && !raf) raf = requestAnimationFrame(tick);
      },
      { rootMargin: "80px 0px" },
    );
    io.observe(hero);

    const onResize = () => {
      cap = window.innerHeight;
    };

    const tick = () => {
      raf = 0;
      if (!live) return;
      const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, cap)));
      const e = p * p * (3 - 2 * p);
      const tCy = Math.round(e * amp * cap);
      const tSpread = e * spreadAmp;
      const tFade = 1 - e * fadeAmp;
      cy += (tCy - cy) * lerp;
      spread += (tSpread - spread) * lerp;
      fade += (tFade - fade) * lerp;
      const y = Math.round(cy);
      mark.style.setProperty("--cy", `${y}px`);
      mark.style.setProperty("--spread", `${spread.toFixed(2)}px`);
      mark.style.setProperty("--fade", fade.toFixed(3));
      if (Math.abs(tCy - cy) > 0.4 || Math.abs(tSpread - spread) > 0.04 || Math.abs(tFade - fade) > 0.004) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      if (!live || raf) return;
      raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      mark.classList.remove("is-live", "is-soft");
      mark.style.removeProperty("--cy");
      mark.style.removeProperty("--spread");
      mark.style.removeProperty("--fade");
      document.documentElement.classList.remove("js-scroll-timeline");
    };
  }, [heroRef, markRef]);
}

import { useEffect, type RefObject } from "react";

export function usePauseOffscreen(ref: RefObject<HTMLElement | null>, pausedClass = "is-paused") {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.classList.add(pausedClass);
      return;
    }

    const sync = (hidden: boolean) => {
      el.classList.toggle(pausedClass, hidden);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        sync(!entry.isIntersecting || document.hidden);
      },
      { threshold: 0.02 },
    );
    io.observe(el);

    const onVis = () => sync(document.hidden);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ref, pausedClass]);
}

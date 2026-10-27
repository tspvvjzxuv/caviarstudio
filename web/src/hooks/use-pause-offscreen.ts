import { useEffect, type RefObject } from "react";
import { heroShouldRun } from "@/lib/hero-motion";

function elementOnscreen(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.bottom > -80 && r.top < (window.innerHeight || 1) + 80;
}

export function usePauseOffscreen(ref: RefObject<HTMLElement | null>, pausedClass = "is-paused") {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const sync = (onscreen = elementOnscreen(el)) => {
      el.classList.toggle(pausedClass, !heroShouldRun(document.hidden, onscreen));
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        sync(entry.isIntersecting || elementOnscreen(el));
      },
      { threshold: 0, rootMargin: "80px 0px 80px 0px" },
    );
    io.observe(el);

    const onReveal = () => sync();
    document.addEventListener("visibilitychange", onReveal);
    window.addEventListener("scroll", onReveal, { passive: true });
    window.addEventListener("pageshow", onReveal);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onReveal);
      window.removeEventListener("scroll", onReveal);
      window.removeEventListener("pageshow", onReveal);
    };
  }, [ref, pausedClass]);
}

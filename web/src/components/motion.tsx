import { useEffect, useState } from "react";
import { CaviarLogo } from "@/components/caviar-logo";

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


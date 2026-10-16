import { useEffect, useRef, useState, type RefObject } from "react";
import { HeroSilverField } from "@/components/hero-silver-field";
import { HERO_LOOP } from "@/lib/config";

type Conn = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
};

function allowHeroVideo() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Conn).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return false;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
  return true;
}

function probe(url: string) {
  return fetch(url, { method: "HEAD" })
    .then((res) => (res.ok ? url : null))
    .catch(() => null);
}

function HeroLoop({ pausedRoot }: { pausedRoot: RefObject<HTMLDivElement | null> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sources, setSources] = useState<{ webm: string | null; mp4: string | null } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!allowHeroVideo()) return;
    const root = pausedRoot.current;
    if (!root) return;

    let cancelled = false;
    let idle = 0;
    let usedIdle = false;
    let probed = false;

    const load = () => {
      if (probed || cancelled) return;
      probed = true;
      Promise.all([probe(HERO_LOOP.webm), probe(HERO_LOOP.mp4)]).then(([webm, mp4]) => {
        if (cancelled || (!webm && !mp4)) return;
        setSources({ webm, mp4 });
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          videoRef.current?.pause();
          return;
        }
        if (probed || idle) {
          return;
        }
        const start = () => load();
        if (typeof window.requestIdleCallback === "function") {
          usedIdle = true;
          idle = window.requestIdleCallback(start, { timeout: 1800 });
        } else {
          idle = globalThis.setTimeout(start, 280);
        }
      },
      { threshold: 0.12 },
    );
    io.observe(root);

    return () => {
      cancelled = true;
      io.disconnect();
      if (usedIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [pausedRoot]);

  useEffect(() => {
    const video = videoRef.current;
    const root = pausedRoot.current;
    if (!video || !root || failed) return;

    const sync = () => {
      if (root.classList.contains("is-paused") || document.hidden) {
        video.pause();
        return;
      }
      void video.play().catch(() => setFailed(true));
    };

    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      mo.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [sources, failed, pausedRoot]);

  if (!sources || failed) return null;

  return (
    <video
      ref={videoRef}
      className="hero-loop pointer-events-none absolute inset-0 z-[1] size-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster={HERO_LOOP.poster}
      aria-hidden="true"
      onError={() => setFailed(true)}
    >
      {sources.webm ? <source src={sources.webm} type="video/webm" /> : null}
      {sources.mp4 ? <source src={sources.mp4} type="video/mp4" /> : null}
    </video>
  );
}

export function HeroBackdrop({ kenRef }: { kenRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div ref={kenRef} className="hero-ken absolute inset-0">
        <div className="hero-field absolute inset-0" />
        <HeroLoop pausedRoot={kenRef} />
        <p className="hero-wordmark absolute top-[calc(var(--header-h)+1.25rem)] right-[clamp(1.25rem,5vw,5rem)] font-serif text-[clamp(2rem,5vw,3.25rem)] leading-none tracking-[0.12em] text-platinum/12 italic min-[90rem]:top-[16%] min-[90rem]:text-[clamp(5rem,11vw,10rem)] [@media(max-height:44rem)]:hidden">
          Caviar
        </p>
        <HeroSilverField />
        <div className="hero-shine absolute inset-0 z-[1]" />
        <div className="hero-grain absolute inset-0 z-[1]" />
        <div className="hero-depth absolute inset-0 z-[1]" />
      </div>
    </div>
  );
}

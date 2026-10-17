import { useEffect, useRef, useState, type RefObject, type SyntheticEvent } from "react";
import { HeroSilverField } from "@/components/hero-silver-field";
import { HERO_LOOP } from "@/lib/config";
import { cn } from "@/lib/utils";

type Conn = Navigator & {
  connection?: { saveData?: boolean };
};

function saveDataOn() {
  if (typeof navigator === "undefined") return false;
  return Boolean((navigator as Conn).connection?.saveData);
}

function restartLoop(video: HTMLVideoElement) {
  try {
    video.currentTime = 0;
  } catch {
    /* ignore */
  }
  void video.play().catch(() => {});
}

function HeroLoop({ pausedRoot }: { pausedRoot: RefObject<HTMLDivElement | null> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const root = pausedRoot.current;
    if (!video || !root) return;

    const offscreen = () => document.hidden || root.classList.contains("is-paused");

    const arm = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
    };

    const tryPlay = () => {
      arm();
      if (offscreen()) {
        video.pause();
        return;
      }
      if (!video.paused) {
        setWaiting(false);
        return;
      }
      void video.play()
        .then(() => setWaiting(false))
        .catch(() => {});
    };

    const onPlaying = () => setWaiting(false);

    const mo = new MutationObserver(tryPlay);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });

    video.addEventListener("canplay", tryPlay);
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("playing", onPlaying);
    document.addEventListener("visibilitychange", tryPlay);
    window.addEventListener("pointerdown", tryPlay, { passive: true });
    window.addEventListener("touchstart", tryPlay, { passive: true });
    window.addEventListener("scroll", tryPlay, { passive: true });
    window.addEventListener("keydown", tryPlay);

    tryPlay();
    const stall = window.setTimeout(() => {
      if (video.paused && !offscreen()) setWaiting(true);
    }, 1500);
    const watchdog = window.setInterval(() => {
      if (!offscreen() && video.paused) tryPlay();
    }, 1000);

    return () => {
      mo.disconnect();
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("playing", onPlaying);
      document.removeEventListener("visibilitychange", tryPlay);
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("touchstart", tryPlay);
      window.removeEventListener("scroll", tryPlay);
      window.removeEventListener("keydown", tryPlay);
      window.clearTimeout(stall);
      window.clearInterval(watchdog);
    };
  }, [pausedRoot]);

  const onEnded = (event: SyntheticEvent<HTMLVideoElement>) => {
    restartLoop(event.currentTarget);
  };

  return (
    <video
      ref={videoRef}
      className={cn(
        "hero-loop pointer-events-none absolute inset-0 z-[1] size-full object-cover",
        waiting && "opacity-0",
      )}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={HERO_LOOP.poster}
      aria-hidden="true"
      disablePictureInPicture
      disableRemotePlayback
      onEnded={onEnded}
    >
      <source src={HERO_LOOP.mp4} type="video/mp4" />
      <source src={HERO_LOOP.webm} type="video/webm" />
    </video>
  );
}

export function HeroBackdrop({ kenRef }: { kenRef: RefObject<HTMLDivElement | null> }) {
  const [skip] = useState(saveDataOn);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div ref={kenRef} className="hero-ken absolute inset-0">
        <div className="hero-field absolute inset-0" />
        <img
          src={HERO_LOOP.poster}
          alt=""
          className="hero-poster absolute inset-0 z-0 size-full object-cover"
        />
        {skip ? <HeroSilverField /> : <HeroLoop pausedRoot={kenRef} />}
        <div className="hero-shine absolute inset-0 z-[2]" />
        <div className="hero-grain absolute inset-0 z-[2]" />
        <div className="hero-depth absolute inset-0 z-[2]" />
      </div>
    </div>
  );
}

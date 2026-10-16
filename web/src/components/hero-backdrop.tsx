import { useEffect, useRef, useState, type RefObject, type SyntheticEvent } from "react";
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
  return true;
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
  const [mount, setMount] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!allowHeroVideo()) return;
    setMount(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const root = pausedRoot.current;
    if (!video || !root || failed) return;

    const sync = () => {
      if (root.classList.contains("is-paused") || document.hidden) {
        video.pause();
        return;
      }
      video.muted = true;
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
  }, [mount, failed, pausedRoot]);

  if (!mount || failed) return null;

  const onEnded = (event: SyntheticEvent<HTMLVideoElement>) => {
    restartLoop(event.currentTarget);
  };

  return (
    <video
      ref={videoRef}
      className="hero-loop pointer-events-none absolute inset-0 z-[1] size-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={HERO_LOOP.poster}
      aria-hidden="true"
      disablePictureInPicture
      disableRemotePlayback
      onEnded={onEnded}
      onError={() => setFailed(true)}
    >
      <source src={HERO_LOOP.webm} type="video/webm" />
      <source src={HERO_LOOP.mp4} type="video/mp4" />
    </video>
  );
}

export function HeroBackdrop({ kenRef }: { kenRef: RefObject<HTMLDivElement | null> }) {
  const [videoOk, setVideoOk] = useState(false);

  useEffect(() => {
    setVideoOk(allowHeroVideo());
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div ref={kenRef} className="hero-ken absolute inset-0">
        <div className="hero-field absolute inset-0" />
        <img
          src={HERO_LOOP.poster}
          alt=""
          className="hero-poster absolute inset-0 z-[1] size-full object-cover"
        />
        <HeroLoop pausedRoot={kenRef} />
        <p className="hero-wordmark absolute top-[calc(var(--header-h)+1.25rem)] right-[clamp(1.25rem,5vw,5rem)] z-[2] font-serif text-[clamp(2rem,5vw,3.25rem)] leading-none tracking-[0.12em] text-platinum/12 italic min-[90rem]:top-[16%] min-[90rem]:text-[clamp(5rem,11vw,10rem)] [@media(max-height:44rem)]:hidden">
          Caviar
        </p>
        {videoOk ? null : <HeroSilverField />}
        <div className="hero-shine absolute inset-0 z-[2]" />
        <div className="hero-grain absolute inset-0 z-[2]" />
        <div className="hero-depth absolute inset-0 z-[2]" />
      </div>
    </div>
  );
}

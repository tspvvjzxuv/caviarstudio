import { useEffect, useRef, useState, type RefObject } from "react";
import { HeroSilverField } from "@/components/hero-silver-field";
import { HERO_LOOP } from "@/lib/config";

type Conn = Navigator & {
  connection?: { saveData?: boolean };
};

function saveDataOn() {
  if (typeof navigator === "undefined") return false;
  return Boolean((navigator as Conn).connection?.saveData);
}

function HeroLoop({ pausedRoot }: { pausedRoot: RefObject<HTMLDivElement | null> }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const root = pausedRoot.current;
    if (!video || !root) return;

    const arm = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
    };

    let inView = true;
    const sync = () => {
      arm();
      const hide = document.hidden || !inView || root.classList.contains("is-paused");
      if (hide) {
        video.pause();
        return;
      }
      void video.play().catch(() => {});
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0, rootMargin: "40px 0px" },
    );
    io.observe(video);

    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    video.addEventListener("canplay", sync);
    video.addEventListener("loadeddata", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pointerdown", sync, { passive: true, once: true });
    window.addEventListener("keydown", sync, { once: true });
    window.addEventListener("scroll", sync, { passive: true, once: true });
    sync();

    return () => {
      io.disconnect();
      mo.disconnect();
      video.removeEventListener("canplay", sync);
      video.removeEventListener("loadeddata", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointerdown", sync);
      window.removeEventListener("keydown", sync);
      window.removeEventListener("scroll", sync);
      video.pause();
    };
  }, [pausedRoot]);

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
      width={1920}
      height={1080}
      aria-hidden="true"
      disablePictureInPicture
      disableRemotePlayback
    >
      <source src={HERO_LOOP.av1Mobile} type="video/webm" media="(max-width: 767px)" />
      <source src={HERO_LOOP.av1} type="video/webm" media="(min-width: 768px)" />
      <source src={HERO_LOOP.hevcMobile} type='video/mp4; codecs="hvc1"' media="(max-width: 767px)" />
      <source src={HERO_LOOP.hevc} type='video/mp4; codecs="hvc1"' media="(min-width: 768px)" />
      <source src={HERO_LOOP.mp4Mobile} type="video/mp4" media="(max-width: 767px)" />
      <source src={HERO_LOOP.mp4} type="video/mp4" />
    </video>
  );
}

export function HeroBackdrop({ kenRef }: { kenRef: RefObject<HTMLDivElement | null> }) {
  const [skip] = useState(saveDataOn);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div ref={kenRef} className="hero-parallax hero-ken absolute inset-0">
        <div className="hero-field absolute inset-0" />
        <img
          src={HERO_LOOP.poster}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="hero-poster absolute inset-0 z-0 size-full object-cover"
        />
        {skip ? <HeroSilverField /> : <HeroLoop pausedRoot={kenRef} />}
        <div className="hero-shine absolute inset-0 z-[2]" />
        <div className="hero-depth absolute inset-0 z-[2]" />
      </div>
    </div>
  );
}

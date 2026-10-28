import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/language";
import { heroShouldRun } from "@/lib/hero-motion";
import {
  isTypographic,
  workLabels,
  workPrimaryHref,
  workSrc,
  workText,
  type WorkItem,
} from "@/lib/work";

function TypePill({ label }: { label: string }) {
  return (
    <span className="inline-flex w-fit rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[0.62rem] tracking-[0.18em] text-platinum uppercase backdrop-blur-md">
      {label}
    </span>
  );
}

function WorkFilm({ src, poster, priority }: { src: string; poster?: string; priority?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const arm = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
    };

    let inView = false;
    const videoOnscreen = () => {
      const r = video.getBoundingClientRect();
      return r.height > 8 && r.bottom > 0 && r.top < (window.innerHeight || 1);
    };
    const sync = () => {
      arm();
      if (!heroShouldRun(document.hidden, inView || videoOnscreen())) {
        video.pause();
        return;
      }
      if (video.paused) void video.play().catch(() => {});
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRect.height > 8;
        sync();
      },
      { threshold: 0, rootMargin: "40px 0px" },
    );
    io.observe(video);
    video.addEventListener("canplay", sync);
    video.addEventListener("loadeddata", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pageshow", sync);
    sync();

    return () => {
      io.disconnect();
      video.removeEventListener("canplay", sync);
      video.removeEventListener("loadeddata", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pageshow", sync);
      video.pause();
    };
  }, [src]);

  return (
    <div className="project-film">
      <video
        ref={ref}
        src={src}
        poster={poster || undefined}
        muted
        playsInline
        autoPlay
        loop
        preload={priority ? "auto" : "metadata"}
        width={500}
        height={560}
        aria-hidden="true"
        disablePictureInPicture
        disableRemotePlayback
      />
    </div>
  );
}

function TileCopy({ item }: { item: WorkItem }) {
  const { lang, t } = useLanguage();
  const title = workText(item.title, lang);
  const line = workText(item.line, lang);
  const labels = workLabels(item, t);
  return (
    <div className="project-copy">
      {labels.length ? (
        <ul className="flex list-none flex-wrap gap-2">
          {labels.map((label) => (
            <li key={label}>
              <TypePill label={label} />
            </li>
          ))}
        </ul>
      ) : null}
      <h3 className="font-serif text-[clamp(1.55rem,3.4vw,2.15rem)] leading-[1.12] font-normal tracking-[-0.02em] text-pearl">
        {title}
      </h3>
      {line ? <p className="max-w-[42ch] text-[0.95rem] leading-[1.5] text-platinum/85">{line}</p> : null}
    </div>
  );
}

export function WorkTile({ item, priority }: { item: WorkItem; priority?: boolean }) {
  const { lang } = useLanguage();
  const title = workText(item.title, lang);
  const href = workPrimaryHref(item);
  const type = isTypographic(item);
  const film = workSrc(item.video);
  const poster = workSrc(item.imageMobile) || workSrc(item.image);
  const body = (
    <>
      {type ? (
        <div className="project-type rounded-3xl p-6 md:p-8">
          <TileCopy item={item} />
        </div>
      ) : (
        <>
          {film ? <WorkFilm src={film} poster={poster} priority={priority} /> : null}
          <TileCopy item={item} />
        </>
      )}
    </>
  );

  return (
    <article
      className="project panel-enter"
      data-id={item.id}
      aria-label={title}
      style={{ viewTransitionName: `work-${item.id}` }}
    >
      {href ? (
        <a
          className="project-hit rounded-3xl focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={title}
        >
          {body}
        </a>
      ) : (
        body
      )}
    </article>
  );
}

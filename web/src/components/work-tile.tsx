import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language";
import {
  isTypographic,
  workIndex,
  workLabels,
  workPrimaryHref,
  workRepoHref,
  workSrc,
  workText,
  type WorkItem,
} from "@/lib/work";
import { cn } from "@/lib/utils";

type Conn = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
};

function allowWorkVideo() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Conn).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return false;
  return true;
}

function TypePill({ label }: { label: string }) {
  return (
    <span className="inline-flex w-fit rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[0.62rem] tracking-[0.18em] text-platinum uppercase backdrop-blur-md">
      {label}
    </span>
  );
}

function WorkMedia({ item, index }: { item: WorkItem; index: number }) {
  const { lang, t } = useLanguage();
  const title = workText(item.title, lang);
  const line = workText(item.line, lang);
  const alt = workText(item.alt, lang, title);
  const image = workSrc(item.image);
  const video = workSrc(item.video);
  const [brokenImage, setBrokenImage] = useState(false);
  const [brokenVideo, setBrokenVideo] = useState(false);
  const [mountVideo, setMountVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const showImage = Boolean(image) && !brokenImage;
  const showVideo = Boolean(video) && !brokenVideo && mountVideo;
  const n = String(index + 1).padStart(2, "0");
  const labels = workLabels(item, t);
  const layout = item.layout ?? "feature";

  useEffect(() => {
    if (!video) return;
    if (allowWorkVideo()) setMountVideo(true);
  }, [video]);

  useEffect(() => {
    if (!showVideo || showImage) return;
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) {
          el.muted = true;
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [showVideo, showImage]);

  return (
    <>
      <div className="project-media absolute inset-0 overflow-hidden">
        {showImage ? (
          <img
            src={image}
            alt={alt}
            loading="lazy"
            decoding="async"
            sizes={layout === "feature" ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
            onError={() => setBrokenImage(true)}
          />
        ) : null}
        {showVideo ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster={showImage ? image : undefined}
            aria-hidden="true"
            disablePictureInPicture
            disableRemotePlayback
            onError={() => setBrokenVideo(true)}
          >
            <source src={video} />
          </video>
        ) : null}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] grid gap-2 bg-linear-to-t from-[#070708] from-[8%] via-[#070708]/82 via-42% to-transparent p-[clamp(1.25rem,4vw,2.25rem)] pt-28">
        <span className="text-[0.62rem] tracking-[0.22em] text-silver uppercase">{n}</span>
        <h3 className="font-serif text-[clamp(1.8rem,4vw,3.2rem)] leading-none font-normal tracking-[-0.02em] text-pearl">{title}</h3>
        {line ? <p className="max-w-[36ch] text-[0.95rem] text-platinum/85">{line}</p> : null}
        {labels.length ? (
          <ul className="flex list-none flex-wrap gap-2">
            {labels.map((label) => (
              <li key={label}>
                <TypePill label={label} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}

function TypeTile({ item, index }: { item: WorkItem; index: number }) {
  const { lang, t } = useLanguage();
  const title = workText(item.title, lang);
  const line = workText(item.line, lang);
  const labels = workLabels(item, t);
  const n = String(index + 1).padStart(2, "0");
  const live = Boolean(item.href?.trim());
  return (
    <div className="project-media project-type absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 z-[3] flex flex-col justify-end gap-3 p-[clamp(1.25rem,4vw,2.25rem)]">
        <span className="text-[0.62rem] tracking-[0.22em] text-silver uppercase">{n}</span>
        <h3 className="max-w-[16ch] font-serif text-[clamp(1.8rem,4vw,3.2rem)] leading-[0.95] font-normal tracking-[-0.02em]">{title}</h3>
        {line ? <p className="max-w-[36ch] text-[0.95rem] text-muted-foreground">{line}</p> : null}
        {labels.length ? (
          <ul className="flex list-none flex-wrap gap-2">
            {labels.map((label) => (
              <li key={label}>
                <TypePill label={label} />
              </li>
            ))}
          </ul>
        ) : null}
        {!live ? (
          <span className="text-[0.62rem] tracking-[0.18em] text-silver uppercase">{t.workGitHub}</span>
        ) : null}
      </div>
    </div>
  );
}

function tileClass(item: WorkItem) {
  const layout = item.layout ?? "feature";
  const type = isTypographic(item);
  return cn(
    "project relative isolate min-h-[64vh] overflow-hidden rounded-3xl border border-border bg-card",
    !type && layout === "feature" && "min-h-[78vh] md:min-h-[min(84vh,920px)]",
    (type || layout === "pair") && "md:min-h-[min(68vh,700px)]",
    type && "min-h-[min(52vh,560px)]",
  );
}

export function WorkTile({ item }: { item: WorkItem }) {
  const { lang, t } = useLanguage();
  const title = workText(item.title, lang);
  const href = workPrimaryHref(item);
  const repo = workRepoHref(item);
  const index = workIndex(item);
  const type = isTypographic(item);
  return (
    <article
      className={cn(tileClass(item), "reveal")}
      data-id={item.id}
      data-cursor={href ? "view" : undefined}
      aria-label={title}
      style={{ viewTransitionName: `work-${item.id}` }}
    >
      {href ? (
        <a
          className="project-hit absolute inset-0 z-[2] rounded-3xl focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={title}
        />
      ) : null}
      {repo ? (
        <a
          className="work-git absolute top-4 right-4 z-[4] inline-flex rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[0.62rem] tracking-[0.18em] text-platinum uppercase backdrop-blur-md hover:border-lemon/40 hover:text-lemon focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.workGitHub}
        </a>
      ) : null}
      {type ? <TypeTile item={item} index={index} /> : <WorkMedia item={item} index={index} />}
    </article>
  );
}

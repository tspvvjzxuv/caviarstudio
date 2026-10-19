import { useLanguage } from "@/lib/language";
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

function Screen({
  src,
  alt,
  sizes,
  width,
  height,
  decorative,
}: {
  src: string;
  alt: string;
  sizes: string;
  width: number;
  height: number;
  decorative?: boolean;
}) {
  return (
    <div className="device-screen">
      <img
        src={src}
        alt={decorative ? "" : alt}
        width={width}
        height={height}
        loading="eager"
        decoding="async"
        sizes={sizes}
        draggable={false}
      />
      <span className="device-sheen" aria-hidden="true" />
    </div>
  );
}

function DevicePair({ item }: { item: WorkItem }) {
  const { lang } = useLanguage();
  const title = workText(item.title, lang);
  const alt = workText(item.alt, lang, title);
  const desktop = workSrc(item.image);
  const mobile = workSrc(item.imageMobile);
  return (
    <div className="device-stage">
      <span className="device-glow" aria-hidden="true" />
      <div className="device-laptop">
        <div className="device-lid">
          <span className="device-camera" aria-hidden="true" />
          <Screen src={desktop} alt={alt} sizes="(min-width: 768px) 42vw, 88vw" width={1440} height={900} />
        </div>
        <span className="device-hinge" aria-hidden="true" />
        <span className="device-base" aria-hidden="true" />
      </div>
      {mobile ? (
        <div className="device-phone" aria-hidden="true">
          <span className="device-island" />
          <Screen src={mobile} alt="" sizes="(min-width: 768px) 12vw, 38vw" width={390} height={844} decorative />
          <span className="device-home" />
        </div>
      ) : null}
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

export function WorkTile({ item }: { item: WorkItem }) {
  const { lang } = useLanguage();
  const title = workText(item.title, lang);
  const href = workPrimaryHref(item);
  const type = isTypographic(item);
  const body = (
    <>
      {type ? (
        <div className="project-type rounded-3xl p-6 md:p-8">
          <TileCopy item={item} />
        </div>
      ) : (
        <DevicePair item={item} />
      )}
      {type ? null : <TileCopy item={item} />}
    </>
  );

  return (
    <article
      className="project panel-enter"
      data-id={item.id}
      data-cursor={href ? "view" : undefined}
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

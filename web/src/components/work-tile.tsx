import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language";
import { workIndex, type WorkItem } from "@/lib/work";
import { cn } from "@/lib/utils";

function WorkMedia({ item, index }: { item: WorkItem; index: number }) {
  const { t } = useLanguage();
  const isSilver = item.kind === "silver" || !item.image;
  const [broken, setBroken] = useState(false);
  const showSilver = isSilver || broken;
  const n = String(index + 1).padStart(2, "0");
  const pack = t as Record<string, string>;

  return (
    <>
      <div
        className={cn(
          "project-media absolute inset-0 overflow-hidden",
          showSilver && `silver-sheen silver-${item.silver}`,
        )}
      >
        {showSilver ? null : (
          <img
            src={item.image}
            alt={pack[item.altKey] || ""}
            loading="lazy"
            decoding="async"
            sizes={item.layout === "feature" ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
            className="absolute inset-[-8%] size-[116%] object-cover grayscale-[0.42] contrast-[1.06] brightness-[0.88] motion-ok:transition-transform motion-ok:duration-[1350ms]"
            onError={() => setBroken(true)}
          />
        )}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] grid gap-2 bg-linear-to-t from-[#070708]/78 to-transparent p-[clamp(1.25rem,4vw,2.25rem)]">
        <span className="text-[0.62rem] tracking-[0.22em] text-silver uppercase">{n}</span>
        <h3 className="font-serif text-[clamp(1.8rem,4vw,3.2rem)] leading-none font-normal tracking-[-0.02em]">{pack[item.titleKey]}</h3>
        <p className="max-w-[36ch] text-[0.95rem] text-muted-foreground">{pack[item.lineKey]}</p>
        <ul className="mt-1.5 flex list-none flex-wrap gap-2">
          {item.tags.map((tag) => (
            <li key={tag}>
              <Badge variant="outline" className="rounded-[2px] border-silver/28 text-[0.62rem] tracking-[0.18em] text-platinum uppercase">
                {pack[tag]}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function tileClass(item: WorkItem) {
  return cn(
    "project relative isolate min-h-[64vh] overflow-hidden rounded-[2px] border border-border bg-card",
    item.layout === "feature" && "min-h-[78vh] md:min-h-[min(84vh,920px)]",
    item.layout === "pair" && "md:min-h-[min(68vh,700px)]",
  );
}

export function WorkLinkedTile({ item, index }: { item: WorkItem; index: number }) {
  const { t } = useLanguage();
  const pack = t as Record<string, string>;
  const title = pack[item.titleKey];
  return (
    <article className={tileClass(item)} data-id={item.id} data-cursor="view">
      <a
        className="absolute inset-0 z-[2] rounded-[2px] focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
        href={item.href}
        target={item.href.startsWith("http") ? "_blank" : undefined}
        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
        aria-label={title}
      />
      <WorkMedia item={item} index={index} />
    </article>
  );
}

export function WorkSoonTile({ item, index }: { item: WorkItem; index: number }) {
  const { t } = useLanguage();
  const pack = t as Record<string, string>;
  return (
    <article
      className={tileClass(item)}
      data-id={item.id}
      data-cursor="soon"
      aria-label={`${pack[item.titleKey]}. ${t.soonAria}`}
    >
      <WorkMedia item={item} index={index} />
    </article>
  );
}

export function renderWorkTile(item: WorkItem) {
  const index = workIndex(item);
  return item.href ? (
    <WorkLinkedTile key={item.id} item={item} index={index} />
  ) : (
    <WorkSoonTile key={item.id} item={item} index={index} />
  );
}

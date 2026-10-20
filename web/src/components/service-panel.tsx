import { useLayoutEffect, useRef, type RefObject } from "react";
import { WorkGallery } from "@/components/work-gallery";
import { useLanguage } from "@/lib/language";
import type { WorkItem } from "@/lib/work";
import { cn } from "@/lib/utils";

const OPEN_MS = 920;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function headerH() {
  const el = document.querySelector("header");
  return el instanceof HTMLElement ? el.getBoundingClientRect().height : 76;
}

/** Keep the tapped card parked under the nav while the panel grows or a neighbour collapses. */
function pinTrigger(el: HTMLElement, ms: number) {
  const destEnd = headerH() + 12;
  const startTop = el.getBoundingClientRect().top;
  if (reducedMotion()) {
    const delta = el.getBoundingClientRect().top - destEnd;
    if (Math.abs(delta) > 2) window.scrollBy(0, delta);
    return () => {};
  }
  const t0 = performance.now();
  let raf = 0;
  let stop = false;
  const ease = (t: number) => 1 - (1 - t) ** 4;
  const tick = (now: number) => {
    if (stop) return;
    const p = Math.min(1, (now - t0) / ms);
    const dest = startTop + (destEnd - startTop) * ease(p);
    const delta = el.getBoundingClientRect().top - dest;
    if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    stop = true;
    cancelAnimationFrame(raf);
  };
}

function measureOpenHeight(panel: HTMLElement, inner: HTMLElement) {
  const prev = panel.style.gridTemplateRows;
  const prevTransition = panel.style.transition;
  panel.style.transition = "none";
  panel.style.gridTemplateRows = "1fr";
  const height = Math.ceil(Math.max(inner.scrollHeight, inner.getBoundingClientRect().height));
  panel.style.gridTemplateRows = prev;
  void panel.offsetHeight;
  panel.style.transition = prevTransition;
  return height;
}

function tweenRows(panel: HTMLElement, from: number, to: number, settle: string) {
  panel.style.transition = "none";
  panel.style.gridTemplateRows = `${Math.max(0, Math.round(from))}px`;
  void panel.offsetHeight;
  panel.style.removeProperty("transition");
  panel.style.gridTemplateRows = `${Math.max(0, Math.round(to))}px`;
  const onEnd = (event: TransitionEvent) => {
    if (event.target !== panel || event.propertyName !== "grid-template-rows") return;
    panel.removeEventListener("transitionend", onEnd);
    panel.style.gridTemplateRows = settle;
  };
  panel.addEventListener("transitionend", onEnd);
  return () => panel.removeEventListener("transitionend", onEnd);
}

function ServiceExamples({ items }: { items: readonly string[] }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-3xl border border-white/12 bg-linear-to-b from-azure/12 to-lemon/6 p-5 md:p-6">
      <p className="text-[0.62rem] font-medium tracking-[0.2em] text-azure uppercase">{t.pExLabel}</p>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="grid grid-cols-[auto_1fr] items-start gap-2.5 text-[0.95rem] leading-[1.5] text-platinum">
            <span className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-azure" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ServiceDetail({
  title,
  examples,
  media,
  priority,
}: {
  title: string;
  examples: readonly string[];
  media: readonly WorkItem[];
  priority?: boolean;
}) {
  return (
    <div className="pt-6 md:pt-8" aria-label={title}>
      <div className="panel-enter">
        <ServiceExamples items={examples} />
      </div>
      <WorkGallery items={media} priority={priority} />
    </div>
  );
}

export function ServicePanel({
  id,
  open,
  title,
  examples,
  media,
  contentKey,
  followId,
  buttonRefs,
  skipEnter = false,
  className,
}: {
  id: string;
  open: boolean;
  title: string;
  examples: readonly string[];
  media: readonly WorkItem[];
  contentKey: string;
  followId?: string;
  buttonRefs?: RefObject<Record<string, HTMLButtonElement | null>>;
  skipEnter?: boolean;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef(skipEnter && open);
  const lastH = useRef(0);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!panel || !inner) return;

    if (skipRef.current && open) {
      skipRef.current = false;
      inner.classList.add("is-shown");
      panel.style.gridTemplateRows = "1fr";
      lastH.current = Math.max(8, Math.ceil(inner.scrollHeight), Math.ceil(panel.getBoundingClientRect().height));
      return;
    }

    if (open) {
      inner.classList.remove("is-shown");
      void inner.offsetWidth;
      inner.classList.add("is-shown");
    } else {
      inner.classList.remove("is-shown");
    }

    const from = lastH.current || panel.getBoundingClientRect().height;
    panel.style.transition = "none";
    panel.style.gridTemplateRows = `${Math.max(0, Math.round(from))}px`;
    void panel.offsetHeight;

    const to = open ? Math.max(8, measureOpenHeight(panel, inner)) : 0;
    lastH.current = to;

    if (reducedMotion()) {
      panel.style.gridTemplateRows = open ? "1fr" : "0fr";
      panel.style.removeProperty("transition");
      return;
    }

    if (Math.abs(from - to) < 2) {
      panel.style.gridTemplateRows = open ? "1fr" : "0fr";
      panel.style.removeProperty("transition");
      return;
    }

    const stopTween = tweenRows(panel, from, to, open ? "1fr" : "0fr");
    const trigger = open && followId ? buttonRefs?.current[followId] ?? null : null;
    const stopFollow = trigger ? pinTrigger(trigger, OPEN_MS) : () => {};
    return () => {
      stopTween();
      stopFollow();
    };
  }, [open, contentKey, followId, buttonRefs]);

  return (
    <div
      ref={panelRef}
      id={id}
      role="region"
      aria-hidden={!open}
      className={cn("service-panel", open && "is-open", className)}
    >
      <div className="service-panel-clip">
        <div ref={innerRef} className={cn("service-panel-inner", open && "is-shown")}>
          <ServiceDetail title={title} examples={examples} media={media} priority={open} />
        </div>
      </div>
    </div>
  );
}

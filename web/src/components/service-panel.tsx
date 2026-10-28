import { useLayoutEffect, useRef, type ComponentType, type RefObject, type SVGProps } from "react";
import { ChromeHeading } from "@/components/section";
import { WorkGallery } from "@/components/work-gallery";
import { IconDisc } from "@/components/icon-disc";
import { useLanguage } from "@/lib/language";
import { revealAfterOpen } from "@/lib/service-flip";
import type { WorkItem } from "@/lib/work";
import { cn } from "@/lib/utils";

type ServiceIcon = ComponentType<SVGProps<SVGSVGElement>>;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function measureOpenHeight(inner: HTMLElement) {
  // shortcut: don't flash 1fr (grows the metal canvas); settle still uses 1fr
  return Math.ceil(Math.max(inner.scrollHeight, inner.offsetHeight, 8));
}

function tweenRows(
  panel: HTMLElement,
  from: number,
  to: number,
  settle: string,
  onSettled?: () => void,
) {
  panel.style.transition = "none";
  panel.style.gridTemplateRows = `${Math.max(0, Math.round(from))}px`;
  void panel.offsetHeight;
  panel.style.removeProperty("transition");
  panel.style.gridTemplateRows = `${Math.max(0, Math.round(to))}px`;
  const onEnd = (event: TransitionEvent) => {
    if (event.target !== panel || event.propertyName !== "grid-template-rows") return;
    panel.removeEventListener("transitionend", onEnd);
    panel.style.gridTemplateRows = settle;
    onSettled?.();
  };
  panel.addEventListener("transitionend", onEnd);
  return () => panel.removeEventListener("transitionend", onEnd);
}

function ServiceExamples({ items }: { items: readonly string[] }) {
  const { t } = useLanguage();
  return (
    <div>
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

function alignPointer(panel: HTMLElement, trigger: HTMLElement | null) {
  if (!trigger) {
    panel.style.setProperty("--pointer-x", "50%");
    return;
  }
  const box = panel.getBoundingClientRect();
  const tab = trigger.getBoundingClientRect();
  if (box.width < 8) {
    panel.style.setProperty("--pointer-x", "50%");
    return;
  }
  const x = ((tab.left + tab.width / 2 - box.left) / box.width) * 100;
  panel.style.setProperty("--pointer-x", `${Math.min(92, Math.max(8, x)).toFixed(2)}%`);
}

export function ServiceDetail({
  title,
  examples,
  media,
  priority,
  Icon,
}: {
  title: string;
  examples: readonly string[];
  media: readonly WorkItem[];
  priority?: boolean;
  Icon?: ServiceIcon;
}) {
  return (
    <div className="service-panel-shell" aria-label={title}>
      <i className="service-panel-notch" aria-hidden="true" />
      <div className="service-panel-head panel-enter">
        {Icon ? (
          <IconDisc size="sm">
            <Icon />
          </IconDisc>
        ) : null}
        <ChromeHeading as="h3" className="chrome-title min-w-0 text-[clamp(1.45rem,2.6vw,1.9rem)]">
          {title}
        </ChromeHeading>
      </div>
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
  Icon,
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
  Icon?: ServiceIcon;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef(skipEnter && open);
  const lastH = useRef(0);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!panel || !inner) return;

    const trigger = followId ? buttonRefs?.current[followId] ?? null : null;
    alignPointer(panel, trigger);

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

    const to = open ? measureOpenHeight(inner) : 0;
    lastH.current = to;

    const flipping = Boolean(panel.closest(".service-sec")?.classList.contains("is-flipping"));
    if (flipping) {
      panel.style.gridTemplateRows = `${Math.max(0, Math.round(to))}px`;
      return;
    }

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

    const stopTween = tweenRows(panel, from, to, open ? "1fr" : "0fr", () => {
      if (open) {
        alignPointer(panel, trigger);
        revealAfterOpen(trigger, panel);
      }
    });
    return () => {
      stopTween();
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
          <ServiceDetail title={title} examples={examples} media={media} priority={open} Icon={Icon} />
        </div>
      </div>
    </div>
  );
}

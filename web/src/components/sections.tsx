import { useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { usePauseOffscreen } from "@/hooks/use-pause-offscreen";
import {
  AtSign,
  Camera,
  Clapperboard,
  Globe,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CaviarLogo } from "@/components/caviar-logo";
import { IconDisc } from "@/components/icon-disc";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAVIAR, formatPhone, waHref } from "@/lib/config";
import { FAQ_KEYS, type Dict } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { examplesWithMedia, PHOTO_EXAMPLES, VIDEO_EXAMPLES, WORK, type WorkItem } from "@/lib/work";
import { Kicker, Reveal } from "@/components/reveal";
import { HeroBackdrop } from "@/components/hero-backdrop";
import { Section } from "@/components/section";
import { WorkGallery } from "@/components/work-gallery";
import { cn } from "@/lib/utils";

const PANEL_HEAD = "flex flex-col grid-rows-none gap-3 p-6 md:gap-4 md:p-8";
const HERO_GHOST =
  "hero-ghost h-[52px] rounded-full px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full";

const SERVICES = [
  { id: "foto", name: "fotoName", examples: "pFotoEx", Icon: Camera, media: PHOTO_EXAMPLES },
  { id: "video", name: "videoName", examples: "pVideoEx", Icon: Clapperboard, media: VIDEO_EXAMPLES },
  { id: "web", name: "webName", examples: "pWebEx", Icon: Globe, media: WORK },
] as const;

const INITIAL_SERVICE = examplesWithMedia(WORK).length > 0 ? "web" : "";

const TEAM = [
  { mono: "MK", name: "Miroslav Kotvas" },
  { mono: "SK", name: "Sofia Klebanová" },
] as const;

const LAUNCH_PACKS = [
  { key: "fotoMini", name: "pFotoName", desc: "pFotoDesc" },
  { key: "videoReel", name: "pVideoName", desc: "pVideoDesc", note: "pVideoNote" },
  { key: "webOnePager", name: "pWebName", desc: "pWebDesc" },
  { key: "eshop", name: "pEshopName", desc: "pEshopDesc", includes: "pEshopEx", note: "pEshopNote" },
] as const;

const FEATURED_PACK = { key: "komplet", name: "pKompletName", desc: "pKompletDesc" } as const;

const MONTHLY_PACKS = [
  { key: "socialStart", name: "pMktStartName", desc: "pMktStartDesc", includes: "pMktStartEx" },
  { key: "socialPlus", name: "pMktPlusName", desc: "pMktPlusDesc", includes: "pMktPlusEx", featured: true },
  { key: "marketingKomplet", name: "pMktKompletName", desc: "pMktKompletDesc", includes: "pMktKompletEx" },
] as const;

type PricePack = (typeof LAUNCH_PACKS)[number] | typeof FEATURED_PACK;
type MonthlyPack = (typeof MONTHLY_PACKS)[number];

function dictText(pack: Dict, key: keyof Dict): string {
  const value = pack[key];
  return typeof value === "string" ? value : value[0] ?? "";
}

function dictList(pack: Dict, key: keyof Dict): readonly string[] {
  const value = pack[key];
  return typeof value === "string" ? [value] : value;
}

const NEED_OPTIONS = [
  { value: "Web", label: "needWeb" },
  { value: "E-shop", label: "needEshop" },
  { value: "Video", label: "needVideo" },
  { value: "Foto", label: "needFoto" },
  { value: "Komplet", label: "needKomplet" },
  { value: "Marketing", label: "needMkt" },
  { value: "Mix", label: "needMix" },
] as const;

export function Hero() {
  const { t } = useLanguage();
  const kenRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  usePauseOffscreen(kenRef);
  useEffect(() => {
    const root = heroRef.current;
    const ken = kenRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;
    const paint = () => {
      const y = Math.max(0, window.scrollY);
      const cap = window.innerHeight;
      const p = Math.min(y, cap);
      const hero = reduce ? p * 0.05 : p * 0.22;
      const logo = reduce ? p * 0.03 : p * 0.12;
      root.style.setProperty("--logo-py", `${logo.toFixed(1)}px`);
      ken?.style.setProperty("--hero-py", `${hero.toFixed(1)}px`);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section ref={heroRef} className="relative flex min-h-dvh flex-col justify-end pt-[var(--header-h)]" id="top">
      <HeroBackdrop kenRef={kenRef} />
      <div className="hero-stage relative z-[2] isolate mx-auto w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))] pt-8 pb-6 md:pt-10 md:pb-8">
        <div className="hero-logo-par">
          <h1 className="hero-logo w-fit max-w-[80%] text-[clamp(3.9rem,16vw,10.5rem)]">
            <CaviarLogo />
          </h1>
        </div>
        <p className="mt-8 max-w-[22ch] font-serif text-[clamp(1.35rem,2.8vw,1.9rem)] leading-[1.2] font-normal tracking-[-0.02em] text-pretty text-pearl">
          {t.heroTagline}
        </p>
        <p className="mt-4 max-w-[36ch] text-[0.98rem] leading-[1.5] text-pretty text-muted-foreground">{t.heroExplain}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild data-magnetic="" className="metal-fill h-[52px] rounded-full px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
            <a href="#kontakt">{t.ctaQuote}</a>
          </Button>
          <Button asChild variant="outline" data-magnetic="" className={HERO_GHOST}>
            <a href="#cennik">{t.ctaPricing}</a>
          </Button>
        </div>
      </div>
      <a
        href="#sluzby"
        aria-label={t.scrollCue}
        className="hero-cue relative z-[2] mt-4 mr-[clamp(1.25rem,5vw,5rem)] mb-8 flex shrink-0 flex-col items-center gap-2.5 self-end text-silver [@media(max-height:38rem)]:hidden"
      >
        <span className="rotate-180 text-[0.62rem] tracking-[0.22em] uppercase [writing-mode:vertical-rl]">{t.scrollCue}</span>
        <i className="relative block h-12 w-px overflow-hidden bg-linear-to-b from-platinum to-transparent">
          <span className="scroll-cue-dot absolute top-0 left-1/2 size-[5px] -translate-x-1/2 rounded-full bg-platinum" />
        </i>
      </a>
    </section>
  );
}

export function Services() {
  const { t } = useLanguage();
  const panelId = useId();
  const frameRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(INITIAL_SERVICE);
  const [shown, setShown] = useState(INITIAL_SERVICE);
  const skipEnterKick = useRef(Boolean(INITIAL_SERVICE));
  const lastOpenHeight = useRef(0);
  const active = SERVICES.find((item) => item.id === shown);
  usePauseOffscreen(frameRef);

  const toggleService = (id: string) => {
    if (open === id) {
      setOpen("");
      return;
    }
    setShown(id);
    setOpen(id);
  };

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!panel || !inner) return;

    let raf = 0;
    const laters: number[] = [];
    let cancelled = false;
    const reveal = () => {
      inner.querySelectorAll<HTMLElement>(".reveal").forEach((el) => el.classList.add("in"));
    };
    const measure = () => Math.ceil(inner.scrollHeight);
    let first = true;
    let kicked = false;

    const apply = () => {
      if (cancelled) return;
      reveal();
      if (!open) {
        const h = panel.getBoundingClientRect().height;
        const from = h > 8 ? Math.ceil(h) : lastOpenHeight.current;
        if (from > 8) {
          panel.style.transition = "none";
          panel.style.gridTemplateRows = "1fr";
          void panel.offsetHeight;
          const hold = Math.ceil(panel.getBoundingClientRect().height);
          panel.style.gridTemplateRows = `${hold >= 8 ? hold : from}px`;
          void panel.offsetHeight;
          panel.style.removeProperty("transition");
          panel.style.gridTemplateRows = "0px";
        } else {
          panel.style.removeProperty("transition");
          panel.style.gridTemplateRows = "0fr";
        }
        return;
      }
      if (!kicked) {
        kicked = true;
        if (skipEnterKick.current) {
          skipEnterKick.current = false;
          inner.classList.add("is-shown");
        } else {
          inner.classList.remove("is-shown");
          void inner.offsetWidth;
          inner.classList.add("is-shown");
        }
      }
      const next = Math.max(measure(), 8);
      lastOpenHeight.current = next;
      const panelH = panel.getBoundingClientRect().height;
      if (panelH < 8) {
        panel.style.transition = "none";
        panel.style.gridTemplateRows = `${next}px`;
        void panel.offsetHeight;
        panel.style.removeProperty("transition");
        first = false;
        return;
      }
      const specified = panel.style.gridTemplateRows;
      if (specified === "0fr" || specified === "0px") {
        if (Math.abs(panelH - next) > 8) panel.style.gridTemplateRows = `${next}px`;
        else panel.style.gridTemplateRows = "1fr";
        first = false;
        return;
      }
      if (first || next > panelH + 8) {
        first = false;
        if (Math.abs(panelH - next) > 8) panel.style.gridTemplateRows = `${next}px`;
      }
    };

    apply();
    if (!open) return;

    const ro = new ResizeObserver(apply);
    ro.observe(inner);
    const imgs = [...inner.querySelectorAll("img")];
    const onImg = () => {
      apply();
      requestAnimationFrame(apply);
    };
    imgs.forEach((img) => {
      img.addEventListener("load", onImg);
      img.addEventListener("error", onImg);
      if (img.complete) onImg();
      else void img.decode?.().then(onImg).catch(() => {});
    });
    raf = requestAnimationFrame(() => {
      apply();
      raf = requestAnimationFrame(apply);
    });
    for (const ms of [280, 900, 1600, 2200]) laters.push(window.setTimeout(apply, ms));
    laters.push(
      window.setTimeout(() => {
        if (cancelled) return;
        inner.querySelectorAll<HTMLElement>(".panel-enter").forEach((el) => {
          if (Number(getComputedStyle(el).opacity) > 0.05) return;
          el.style.transition = "none";
          el.style.opacity = "1";
          el.style.transform = "none";
          void el.offsetWidth;
          el.style.removeProperty("transition");
        });
      }, 140),
    );
    void document.fonts?.ready.then(apply);

    return () => {
      cancelled = true;
      ro.disconnect();
      cancelAnimationFrame(raf);
      laters.forEach((id) => window.clearTimeout(id));
      imgs.forEach((img) => {
        img.removeEventListener("load", onImg);
        img.removeEventListener("error", onImg);
      });
    };
  }, [open, shown]);

  return (
    <Section.Frame id="sluzby" density="compact" className="service-sec border-t border-border" ref={frameRef}>
      <div className="service-glow-field" aria-hidden="true" />
      <Section.Body className="relative z-10 overflow-visible">
        <h2 className="section-title max-w-[12ch]">{t.doKicker}</h2>
        <p className="mt-4 mb-10 max-w-[36ch] text-[1.05rem] leading-[1.5] text-muted-foreground md:mb-14">
          {t.doLead}
        </p>
        <div className="grid items-stretch gap-6 overflow-visible md:grid-cols-3 md:gap-8 xl:gap-10">
          {SERVICES.map((item, idx) => {
            const Icon = item.Icon;
            const expanded = open === item.id;
            return (
              <div key={item.id} className="service-card" data-service={item.id}>
                <span className="service-glow" aria-hidden="true" />
                <Reveal className="relative z-1 h-full overflow-visible" delay={idx}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => toggleService(item.id)}
                    className={cn(
                      "service-chrome group/service flex h-full min-h-[9.5rem] w-full items-center gap-4 rounded-3xl p-5 text-left md:min-h-[11rem] md:gap-5 md:p-7",
                      expanded && "is-open",
                    )}
                  >
                  <IconDisc>
                    <Icon />
                  </IconDisc>
                  <span className="min-w-0 flex-1 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.15] font-normal tracking-[-0.02em] text-pearl">
                    {dictText(t, item.name)}
                  </span>
                  <span className="service-mark" aria-hidden="true">
                    <i className="service-mark-plus" />
                  </span>
                  </button>
                </Reveal>
              </div>
            );
          })}
        <div
          ref={panelRef}
          id={panelId}
          data-after={shown || "web"}
          role="region"
          aria-hidden={!open}
          className={cn("service-panel md:col-span-3", open && "is-open")}
        >
          <div className="service-panel-clip">
            <div ref={innerRef} className={cn("service-panel-inner", open && "is-shown")}>
            {active ? (
              <div className="pt-6 md:pt-8" aria-label={dictText(t, active.name)}>
                <div className="panel-enter">
                  <ServiceExamples items={dictList(t, active.examples)} />
                </div>
                <WorkGallery items={active.media as readonly WorkItem[]} />
              </div>
            ) : null}
            </div>
          </div>
        </div>
        </div>
      </Section.Body>
    </Section.Frame>
  );
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

function PriceIdentity({ name, desc, badge }: { name: string; desc: string; badge?: string }) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-3">
      <Badge variant="outline" className="rounded-full border-lemon/35 bg-lemon/10 tracking-[0.2em] text-lemon uppercase">
        {badge ?? t.launchBadge}
      </Badge>
      <CardTitle className="font-serif text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.15] font-normal">{name}</CardTitle>
      <CardDescription className="max-w-[36ch] text-[0.95rem] leading-[1.55]">{desc}</CardDescription>
    </div>
  );
}

function PriceAmounts({
  launch,
  standard,
  monthly,
  monthlyLabel,
  period,
  vat,
}: {
  launch: number;
  standard?: number;
  monthly?: number;
  monthlyLabel?: string;
  period?: string;
  vat: string;
}) {
  const { t } = useLanguage();
  return (
    <div>
      <p className="font-serif text-[clamp(2rem,3.2vw,2.7rem)] leading-[1.12]">
        {t.priceFrom} <span className="text-lemon">{launch} EUR</span>{" "}
        <span className="mt-2 block font-sans text-[0.62rem] font-medium tracking-[0.16em] text-silver uppercase">
          {vat}
          {period ? ` ${period}` : ""}
        </span>
      </p>
      {monthly != null && monthlyLabel ? (
        <p className="mt-3 text-[0.95rem] leading-[1.5] text-muted-foreground">
          + <span className="text-lemon">{monthly} EUR</span>
          {monthlyLabel}
        </p>
      ) : null}
      {standard != null ? (
        <p className="mt-3 text-[0.85rem] text-muted-foreground">
          <s className="text-foreground/40">{standard} EUR</s>
          <span className="mt-0.5 block text-[0.62rem] tracking-[0.16em] uppercase">{t.stdLabel}</span>
        </p>
      ) : null}
    </div>
  );
}

function PriceIncludes({ items, note }: { items: readonly string[]; note?: string }) {
  return (
    <div className="grid gap-3">
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item} className="grid grid-cols-[auto_1fr] items-start gap-2.5 text-[0.95rem] leading-[1.5] text-platinum">
            <span className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-azure" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {note ? <p className="text-[0.85rem] leading-[1.5] text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function optionalAmount(price: object, key: string): number | undefined {
  const value = (price as Record<string, unknown>)[key];
  return typeof value === "number" ? value : undefined;
}

function LaunchPriceCard({ pack, vat, delay = 0 }: { pack: PricePack; vat: string; delay?: number }) {
  const { t } = useLanguage();
  const price = CAVIAR.prices[pack.key];
  const standard = optionalAmount(price, "standard");
  const monthly = optionalAmount(price, "monthly");
  const includes = "includes" in pack ? dictList(t, pack.includes) : null;
  const note = "note" in pack ? dictText(t, pack.note) : undefined;
  return (
    <Reveal className="h-full" delay={delay}>
      <Card className="h-full min-h-[20rem] overflow-visible rounded-3xl border border-border bg-card py-0 ring-0">
        <CardHeader className={PANEL_HEAD}>
          <PriceIdentity name={dictText(t, pack.name)} desc={dictText(t, pack.desc)} />
          <PriceAmounts launch={price.launch} standard={standard} monthly={monthly} monthlyLabel={monthly != null ? t.pEshopMonthly : undefined} vat={vat} />
          {includes ? <PriceIncludes items={includes} note={note} /> : note ? (
            <p className="text-[0.85rem] leading-[1.5] text-muted-foreground">{note}</p>
          ) : null}
          <Button asChild variant="outline" className="mt-1 h-11 rounded-full text-[0.68rem] tracking-[0.16em] uppercase">
            <a href="#kontakt">{t.ctaQuote}</a>
          </Button>
        </CardHeader>
      </Card>
    </Reveal>
  );
}

function FeaturedPriceCard({ pack, vat }: { pack: typeof FEATURED_PACK; vat: string }) {
  const { t } = useLanguage();
  const price = CAVIAR.prices[pack.key];
  return (
      <Reveal className="h-full md:col-span-2 xl:col-span-2" delay={3}>
      <Card className="h-full min-h-[16rem] overflow-visible rounded-3xl border border-azure/15 bg-linear-to-b from-azure/14 to-lemon/6 py-0 ring-0">
        <CardHeader className="flex flex-col gap-4 p-6 md:p-8 lg:grid lg:grid-cols-[1.15fr_auto] lg:items-end lg:gap-12">
          <PriceIdentity name={dictText(t, pack.name)} desc={dictText(t, pack.desc)} />
          <div className="grid gap-4 justify-items-start">
            <PriceAmounts launch={price.launch} standard={optionalAmount(price, "standard")} vat={vat} />
            <Button asChild data-magnetic="" className="metal-fill h-11 rounded-full px-6 text-[0.68rem] tracking-[0.16em] uppercase">
              <a href="#kontakt">{t.ctaQuote}</a>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </Reveal>
  );
}

function MonthlyPriceCard({ pack, vat, delay = 0 }: { pack: MonthlyPack; vat: string; delay?: number }) {
  const { t } = useLanguage();
  const price = CAVIAR.monthly[pack.key];
  const featured = "featured" in pack && pack.featured;
  return (
    <Reveal className="h-full" delay={delay}>
      <Card
        className={cn(
          "h-full min-h-[20rem] overflow-visible rounded-3xl py-0 ring-0",
          featured
            ? "border border-azure/15 bg-linear-to-b from-azure/14 to-lemon/6"
            : "border border-border bg-card",
        )}
      >
        <CardHeader className={cn(PANEL_HEAD, "h-full")}>
          <PriceIdentity
            name={dictText(t, pack.name)}
            desc={dictText(t, pack.desc)}
            badge={featured ? t.mktRec : t.mktBadge}
          />
          <PriceAmounts launch={price.monthly} period={t.mktPerMonth} vat={vat} />
          <PriceIncludes items={dictList(t, pack.includes)} />
          <Button
            asChild
            data-magnetic=""
            variant={featured ? undefined : "outline"}
            className={cn(
              "mt-auto h-11 rounded-full text-[0.68rem] tracking-[0.16em] uppercase",
              featured && "metal-fill px-6",
            )}
          >
            <a href="#kontakt">{t.ctaQuote}</a>
          </Button>
        </CardHeader>
      </Card>
    </Reveal>
  );
}

export function Pricing() {
  const { t } = useLanguage();
  const vat = t.vatTag;
  return (
    <Section.Frame id="cennik">
      <Section.Body>
        <Section.Heading className="mb-10 max-w-[38ch] md:mb-16" kicker={t.priceKicker} title={t.priceTitle} />
        <div className="grid items-stretch gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-3 xl:gap-10">
          {LAUNCH_PACKS.map((pack, idx) => (
            <LaunchPriceCard key={pack.key} pack={pack} vat={vat} delay={idx} />
          ))}
          <FeaturedPriceCard pack={FEATURED_PACK} vat={vat} />
        </div>
        <Reveal className="mt-16 mb-10 grid gap-4 md:mt-20 md:mb-12">
          <Kicker>{t.mktKicker}</Kicker>
          <h3 className="section-title">{t.mktTitle}</h3>
        </Reveal>
        <div className="grid items-stretch gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-3 xl:gap-10">
          {MONTHLY_PACKS.map((pack, idx) => (
            <MonthlyPriceCard key={pack.key} pack={pack} vat={vat} delay={idx} />
          ))}
        </div>
        <Reveal className="mt-7 max-w-[62ch] text-[0.88rem] leading-[1.55] text-muted-foreground">
          <p>{t.mktNote}</p>
          <p className="mt-3">{t.priceFoot}</p>
        </Reveal>
      </Section.Body>
    </Section.Frame>
  );
}

export function Team() {
  const { t } = useLanguage();
  return (
    <Section.Frame id="onas">
      <Section.Body>
        <Section.Heading className="mb-10 max-w-[38ch] md:mb-16" kicker={t.teamKicker} title={t.aboutTitle}>
          <p className="max-w-[36ch] text-[1.02rem] text-muted-foreground">{t.aboutLead}</p>
        </Section.Heading>
        <ul className="grid list-none gap-6 md:grid-cols-2 md:gap-8">
          {TEAM.map((p) => (
            <li key={p.name}>
              <Reveal>
                <div
                  className="relative grid aspect-4/5 max-h-[420px] max-w-[380px] place-items-center overflow-hidden rounded-3xl border border-border bg-linear-to-br from-[#1a1c22] to-[#0c0c10]"
                  aria-hidden="true"
                >
                  <b className="relative z-[1] font-serif text-[clamp(4.2rem,10vw,6.5rem)] font-normal tracking-[0.06em] text-transparent bg-linear-to-b from-[#ffffff] via-[#d9dee6] to-[#8f98a6] bg-clip-text">
                    {p.mono}
                  </b>
                </div>
                <h3 className="mt-4 font-serif text-[clamp(1.4rem,2.4vw,1.9rem)] tracking-[0.02em]">{p.name}</h3>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section.Body>
    </Section.Frame>
  );
}

export function Faq() {
  const { t } = useLanguage();
  const items = FAQ_KEYS.map(([q, a]) => ({ q: t[q], a: t[a] }));
  return (
    <Section.Frame id="faq">
      <Section.Body>
        <Section.Heading className="mb-10 md:mb-16" kicker={t.navFaq} title={t.faqTitle} />
        <Accordion type="single" collapsible className="grid gap-3">
          {items.map((item, idx) => (
            <AccordionItem
              key={item.q}
              value={`faq-${idx}`}
              className="rounded-3xl border border-border bg-card px-6 not-last:border-b-0 md:px-8"
            >
              <AccordionTrigger className="rounded-full py-5 font-sans text-[clamp(1.15rem,2.2vw,1.4rem)] leading-[1.3] font-semibold tracking-[-0.02em] text-pearl hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-[62ch] pb-6 leading-[1.55] text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section.Body>
    </Section.Frame>
  );
}

function ContactIntro() {
  const { t } = useLanguage();
  return (
    <Reveal>
      <Kicker>{t.contactKicker}</Kicker>
      <h2 className="section-title mt-4">
        <span className="block">{t.contactLine1}</span>
        <span className="block">{t.contactLine2}</span>
      </h2>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild data-magnetic="" className="metal-fill h-[52px] gap-2.5 rounded-full px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
          <a href={`mailto:${CAVIAR.EMAIL}`}>
            <IconDisc size="sm">
              <Mail />
            </IconDisc>
            {t.ctaMail}
          </a>
        </Button>
        <Button asChild variant="outline" className="h-[52px] gap-2.5 rounded-full px-5 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
          <a href={`tel:${CAVIAR.PHONE}`}>
            <IconDisc size="sm">
              <Phone />
            </IconDisc>
            {t.ctaPhone}
          </a>
        </Button>
        <Button asChild variant="outline" className="h-[52px] gap-2.5 rounded-full px-5 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
          <a href={waHref(t.waText)}>
            <IconDisc size="sm">
              <MessageCircle />
            </IconDisc>
            {t.ctaWa}
          </a>
        </Button>
        <Button asChild variant="outline" className="h-[52px] gap-2.5 rounded-full px-5 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
          <a
            href={CAVIAR.INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram ${CAVIAR.IG_HANDLE}`}
          >
            <IconDisc size="sm">
              <AtSign />
            </IconDisc>
            {t.ctaIg}
          </a>
        </Button>
      </div>
      <p className="mt-5 font-serif text-2xl tracking-[0.04em]">{formatPhone(CAVIAR.PHONE)}</p>
      <p className="mt-2 text-[0.85rem] tracking-[0.12em] text-silver uppercase">{t.place}</p>
    </Reveal>
  );
}

function ContactForm() {
  const { t } = useLanguage();
  const [need, setNeed] = useState("Web");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const biz = (form.elements.namedItem("business") as HTMLInputElement).value.trim();
    const budget = (form.elements.namedItem("budget") as HTMLInputElement).value.trim();
    const body = [
      `${t.mailName}: ${name}`,
      `${t.mailBiz}: ${biz}`,
      `${t.mailNeed}: ${need}`,
      `${t.mailBudget}: ${budget || "-"}`,
    ].join("\n");
    window.location.href =
      `mailto:${CAVIAR.EMAIL}` +
      `?subject=${encodeURIComponent(t.mailSubject)}` +
      `&body=${encodeURIComponent(body)}`;
  }

  return (
    <Reveal>
      <Card className="overflow-visible rounded-3xl border border-border py-0 ring-0">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={onSubmit} className="grid gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="f-name" className="text-[0.68rem] tracking-[0.2em] text-silver uppercase">
                  {t.fName}
                </FieldLabel>
                <Input id="f-name" name="name" autoComplete="name" required className="h-11 rounded-2xl bg-background px-3 leading-none" />
              </Field>
              <Field>
                <FieldLabel htmlFor="f-biz" className="text-[0.68rem] tracking-[0.2em] text-silver uppercase">
                  {t.fBiz}
                </FieldLabel>
                <Input id="f-biz" name="business" autoComplete="organization" required className="h-11 rounded-2xl bg-background px-3 leading-none" />
              </Field>
              <Field>
                <FieldLabel htmlFor="f-need" className="text-[0.68rem] tracking-[0.2em] text-silver uppercase">
                  {t.fNeed}
                </FieldLabel>
                <Select value={need} onValueChange={setNeed} required>
                  <SelectTrigger id="f-need" className="h-11 w-full rounded-2xl bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass rounded-3xl border-white/12 bg-transparent">
                    <SelectGroup>
                      {NEED_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {dictText(t, option.label)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="f-budget" className="text-[0.68rem] tracking-[0.2em] text-silver uppercase">
                  {t.fBudget}
                </FieldLabel>
                <Input
                  id="f-budget"
                  name="budget"
                  inputMode="decimal"
                  placeholder={t.fBudgetPh}
                  className="h-11 rounded-2xl bg-background px-3 leading-none"
                />
              </Field>
            </FieldGroup>
            <Button type="submit" data-magnetic="" className="metal-fill h-[52px] rounded-full text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
              {t.ctaQuote}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Reveal>
  );
}

export function Contact() {
  return (
    <Section.Frame id="kontakt">
      <Section.Body className="grid gap-10 md:grid-cols-2 md:gap-16">
        <ContactIntro />
        <ContactForm />
      </Section.Body>
    </Section.Frame>
  );
}

Contact.Intro = ContactIntro;
Contact.Form = ContactForm;

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { usePrefersMd } from "@/hooks/use-mobile";
import { usePauseOffscreen } from "@/hooks/use-pause-offscreen";
import { HeroCaviarMark } from "@/components/hero-wordmark-3d";
import {
  AtSign,
  Camera,
  Clapperboard,
  Drone,
  Globe,
  Palette,
  Plus,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconDisc } from "@/components/icon-disc";
import { WorkGallery } from "@/components/work-gallery";
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
import { BRAND_EXAMPLES, DRONE_EXAMPLES, PHOTO_EXAMPLES, preloadWorkShots, VIDEO_EXAMPLES, WORK, type WorkItem } from "@/lib/work";
import { Kicker, Reveal } from "@/components/reveal";
import { HeroBackdrop } from "@/components/hero-backdrop";
import { Section } from "@/components/section";
import { ServiceMetal } from "@/components/service-metal";
import { ServicePanel } from "@/components/service-panel";
import { cn } from "@/lib/utils";

const HERO_GHOST =
  "hero-ghost h-[52px] rounded-full px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full";

const SERVICES = [
  { id: "foto", name: "fotoName", examples: "pFotoEx", Icon: Camera, media: PHOTO_EXAMPLES },
  { id: "video", name: "videoName", examples: "pVideoEx", Icon: Clapperboard, media: VIDEO_EXAMPLES },
  { id: "web", name: "webName", examples: "pWebEx", Icon: Globe, media: [] },
  { id: "dron", name: "dronName", examples: "pDronEx", Icon: Drone, media: DRONE_EXAMPLES },
  { id: "brand", name: "brandName", examples: "pBrandEx", Icon: Palette, media: BRAND_EXAMPLES },
] as const;

const SERVICE_ROW_1 = SERVICES.slice(0, 3);
const SERVICE_ROW_2 = SERVICES.slice(3);
type ServiceItem = (typeof SERVICES)[number];

const TEAM = [{ name: "Miroslav Kotvas" }, { name: "Sofia Klebanová" }] as const;

const LAUNCH_PACKS = [
  { key: "fotoMini", name: "pFotoName", desc: "pFotoDesc" },
  { key: "videoReel", name: "pVideoName", desc: "pVideoDesc", note: "pVideoNote" },
  { key: "webOnePager", name: "pWebName", desc: "pWebDesc" },
  { key: "eshop", name: "pEshopName", desc: "pEshopDesc", includes: "pEshopEx", note: "pEshopNote" },
] as const;

const FEATURED_PACK = { key: "komplet", name: "pKompletName", desc: "pKompletDesc" } as const;

const DRONE_PACKS = [
  { key: "droneFoto", name: "pDronFotoName", desc: "pDronFotoDesc" },
  { key: "droneVideo", name: "pDronVideoName", desc: "pDronVideoDesc" },
  { key: "droneCombo", name: "pDronComboName", desc: "pDronComboDesc" },
] as const;

const BRAND_PACKS = [
  { key: "brandStart", name: "pBrandStartName", desc: "pBrandStartDesc" },
  { key: "brandKomplet", name: "pBrandKompletName", desc: "pBrandKompletDesc", includes: "pBrandKompletEx" },
  { key: "brandRebrand", name: "pBrandRebrandName", desc: "pBrandRebrandDesc" },
] as const;

const MONTHLY_PACKS = [
  { key: "socialStart", name: "pMktStartName", desc: "pMktStartDesc", includes: "pMktStartEx" },
  { key: "socialPlus", name: "pMktPlusName", desc: "pMktPlusDesc", includes: "pMktPlusEx", featured: true },
  { key: "marketingKomplet", name: "pMktKompletName", desc: "pMktKompletDesc", includes: "pMktKompletEx" },
] as const;

type PricePack = (typeof LAUNCH_PACKS)[number] | (typeof DRONE_PACKS)[number] | (typeof BRAND_PACKS)[number] | typeof FEATURED_PACK;
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
  { value: "Dron", label: "needDron" },
  { value: "Branding", label: "needBrand" },
  { value: "Komplet", label: "needKomplet" },
  { value: "Marketing", label: "needMkt" },
  { value: "Mix", label: "needMix" },
] as const;

export function Hero() {
  const { t } = useLanguage();
  const kenRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  usePauseOffscreen(kenRef);
  return (
    <section ref={heroRef} className="relative flex min-h-dvh flex-col justify-end pt-[var(--header-h)]" id="top">
      <HeroBackdrop kenRef={kenRef} />
      <div className="hero-stage relative z-[2] isolate mx-auto w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))] pt-8 pb-6 md:pt-10 md:pb-8">
        <h1 className="hero-logo mx-auto w-fit max-w-full text-center text-[clamp(3.9rem,16vw,10.5rem)] lg:text-[clamp(4.55rem,18.8vw,12.4rem)]">
          <HeroCaviarMark />
        </h1>
        <p className="hero-tagline max-w-[24ch] font-serif text-[clamp(1.35rem,2.8vw,1.9rem)] leading-[1.2] font-normal tracking-[-0.02em] text-pretty text-pearl">
          {t.heroTagline}
        </p>
        <p className="mt-4 max-w-[36ch] text-[0.98rem] leading-[1.5] text-pretty text-pearl">{t.heroExplain}</p>
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
        className="hero-cue relative z-[2] mt-4 mr-[clamp(1.25rem,5vw,5rem)] mb-8 flex shrink-0 flex-col items-center gap-2.5 self-end text-silver [@media(max-height:48rem)]:hidden"
      >
        <span className="rotate-180 text-[0.62rem] tracking-[0.22em] uppercase [writing-mode:vertical-rl]">{t.scrollCue}</span>
        <i className="relative block h-12 w-px overflow-hidden bg-linear-to-b from-platinum to-transparent">
          <span className="scroll-cue-dot absolute top-0 left-1/2 size-[5px] -translate-x-1/2 rounded-full bg-platinum" />
        </i>
      </a>
    </section>
  );
}

function ServiceCard({
  item,
  expanded,
  panelId,
  delay,
  onToggle,
  buttonRefs,
}: {
  item: ServiceItem;
  expanded: boolean;
  panelId: string;
  delay: number;
  onToggle: (id: string) => void;
  buttonRefs: RefObject<Record<string, HTMLButtonElement | null>>;
}) {
  const { t } = useLanguage();
  const Icon = item.Icon;
  return (
    <div className="service-card" data-service={item.id}>
      <span className="service-glow" aria-hidden="true" />
      <Reveal className="h-full overflow-visible" delay={delay}>
        <button
          ref={(el) => {
            buttonRefs.current[item.id] = el;
          }}
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => onToggle(item.id)}
          className={cn(
            "service-chrome group/service flex h-full min-h-[9.5rem] w-full items-center gap-4 rounded-3xl p-5 text-left md:min-h-[11rem] md:gap-5 md:p-7",
            expanded && "is-open",
          )}
        >
          <span className="service-ink">
            <IconDisc>
              <Icon />
            </IconDisc>
            <span className="service-title min-w-0 flex-1 font-serif text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.15] font-normal tracking-[-0.02em] text-pretty text-pearl">
              <span className="service-title-solid" aria-hidden="true">
                {dictText(t, item.name)}
              </span>
              <span className="service-title-live">{dictText(t, item.name)}</span>
            </span>
            <IconDisc
              className="ml-auto size-12 transition-colors duration-200 ease-out group-aria-expanded/service:border-azure/30 group-aria-expanded/service:bg-azure/15 md:size-[3.25rem]"
            >
              <Plus className="size-5 transition-transform duration-200 ease-out group-aria-expanded/service:rotate-45" strokeWidth={1.75} />
            </IconDisc>
          </span>
        </button>
      </Reveal>
    </div>
  );
}

function rowShown(row: readonly ServiceItem[], shown: string, open: string) {
  return row.find((item) => item.id === (open || shown)) ?? row.find((item) => item.id === shown) ?? row[0];
}

export function Services() {
  const { t } = useLanguage();
  const panelId = useId();
  const isMd = usePrefersMd();
  const frameRef = useRef<HTMLElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [open, setOpen] = useState("");
  const [shown, setShown] = useState("");
  usePauseOffscreen(frameRef);

  useEffect(() => {
    const run = () => preloadWorkShots();
    const idle = window.requestIdleCallback ?? ((cb: IdleRequestCallback) => window.setTimeout(cb, 1200) as unknown as number);
    const id = idle(run, { timeout: 8000 });
    return () => {
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  const toggleService = (id: string) => {
    if (open === id) {
      setOpen("");
      return;
    }
    setShown(id);
    setOpen(id);
  };

  const row1Id = `${panelId}-row1`;
  const row2Id = `${panelId}-row2`;
  const row1 = rowShown(SERVICE_ROW_1, shown, open);
  const row2 = rowShown(SERVICE_ROW_2, shown, open);
  const row1Open = SERVICE_ROW_1.some((item) => item.id === open);
  const row2Open = SERVICE_ROW_2.some((item) => item.id === open);

  return (
    <Section.Frame id="sluzby" density="compact" className="service-sec border-t border-border" ref={frameRef}>
      <div className="service-glow-field" aria-hidden="true" />
      <ServiceMetal />
      <Section.Body className="service-sec-body relative overflow-visible">
        <Section.Heading className="mb-10 max-w-[38ch] md:mb-16" kicker={t.navServices} title={t.doKicker}>
          <p className="max-w-[36ch] text-[1.02rem] text-pretty text-pearl">{t.doLead}</p>
        </Section.Heading>
        <div className="mb-12 md:mb-16">
          <WorkGallery items={WORK} priority />
        </div>
        {isMd ? (
          <div className="service-stack">
            <div className={cn("service-row service-row-3", row1Open && "is-expanded")}>
              {SERVICE_ROW_1.map((item, idx) => (
                <ServiceCard
                  key={item.id}
                  item={item}
                  expanded={open === item.id}
                  panelId={row1Id}
                  delay={idx}
                  onToggle={toggleService}
                  buttonRefs={btnRefs}
                />
              ))}
            </div>
            <ServicePanel
              id={row1Id}
              open={row1Open}
              title={dictText(t, row1.name)}
              examples={dictList(t, row1.examples)}
              media={row1.media as readonly WorkItem[]}
              contentKey={row1.id}
              followId={row1Open ? open : row1.id}
              buttonRefs={btnRefs}
              Icon={row1.Icon}
            />
            <div className={cn("service-row service-row-2", row2Open && "is-expanded")}>
              {SERVICE_ROW_2.map((item, idx) => (
                <ServiceCard
                  key={item.id}
                  item={item}
                  expanded={open === item.id}
                  panelId={row2Id}
                  delay={idx + SERVICE_ROW_1.length}
                  onToggle={toggleService}
                  buttonRefs={btnRefs}
                />
              ))}
            </div>
            <ServicePanel
              id={row2Id}
              open={row2Open}
              title={dictText(t, row2.name)}
              examples={dictList(t, row2.examples)}
              media={row2.media as readonly WorkItem[]}
              contentKey={row2.id}
              followId={row2Open ? open : row2.id}
              buttonRefs={btnRefs}
              Icon={row2.Icon}
            />
          </div>
        ) : (
          <div className="service-grid">
            {SERVICES.map((item, idx) => {
              const expanded = open === item.id;
              const itemPanelId = `${panelId}-${item.id}`;
              return (
                <div key={item.id} className="service-unit">
                  <ServiceCard
                    item={item}
                    expanded={expanded}
                    panelId={itemPanelId}
                    delay={idx}
                    onToggle={toggleService}
                    buttonRefs={btnRefs}
                  />
                  <ServicePanel
                    id={itemPanelId}
                    open={expanded}
                    title={dictText(t, item.name)}
                    examples={dictList(t, item.examples)}
                    media={item.media as readonly WorkItem[]}
                    contentKey={item.id}
                    followId={item.id}
                    buttonRefs={btnRefs}
                    Icon={item.Icon}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Section.Body>
    </Section.Frame>
  );
}

function optionalAmount(price: object, key: string): number | undefined {
  const value = (price as Record<string, unknown>)[key];
  return typeof value === "number" ? value : undefined;
}

function PriceIncludes({ items, note }: { items: readonly string[]; note?: string }) {
  return (
    <div className="mt-4 grid gap-2">
      <ul className="grid gap-1.5">
        {items.map((item) => (
          <li key={item} className="max-w-[52ch] text-[0.92rem] leading-[1.5] text-platinum">
            {item}
          </li>
        ))}
      </ul>
      {note ? <p className="max-w-[52ch] text-[0.85rem] leading-[1.5] text-silver">{note}</p> : null}
    </div>
  );
}

function PriceSum({
  amount,
  vat,
  period,
  monthly,
  monthlyLabel,
  standard,
}: {
  amount: number;
  vat: string;
  period?: string;
  monthly?: number;
  monthlyLabel?: string;
  standard?: number;
}) {
  const { t } = useLanguage();
  return (
    <div className="md:text-right">
      <p className="font-serif text-[clamp(1.85rem,3vw,2.45rem)] leading-none tabular-nums">
        {t.priceFrom} {amount} EUR
      </p>
      <p className="mt-2 text-[0.72rem] font-medium tracking-[0.14em] text-silver uppercase">
        {vat}
        {period ? ` ${period}` : ""}
      </p>
      {monthly != null && monthlyLabel ? (
        <p className="mt-2 text-[0.9rem] leading-[1.45] text-platinum">
          + {monthly} EUR{monthlyLabel}
        </p>
      ) : null}
      {standard != null ? (
        <p className="mt-2 text-[0.82rem] text-silver">
          <s>{standard} EUR</s>
          <span className="mt-0.5 block text-[0.62rem] tracking-[0.14em] uppercase">{t.stdLabel}</span>
        </p>
      ) : null}
    </div>
  );
}

function PriceRow({
  name,
  desc,
  amount,
  vat,
  period,
  monthly,
  monthlyLabel,
  standard,
  includes,
  note,
  featured = false,
  delay = 0,
}: {
  name: string;
  desc: string;
  amount: number;
  vat: string;
  period?: string;
  monthly?: number;
  monthlyLabel?: string;
  standard?: number;
  includes?: readonly string[];
  note?: string;
  featured?: boolean;
  delay?: number;
}) {
  const { t } = useLanguage();
  return (
    <Reveal delay={delay}>
      <article
        className={cn(
          "grid gap-5 py-8 md:grid-cols-[minmax(0,1.35fr)_auto] md:items-end md:gap-12",
          featured && "rounded-3xl bg-card px-6 py-8 md:px-10 md:py-10",
        )}
      >
        <div>
          <h3 className="font-serif text-[clamp(1.45rem,2.4vw,1.9rem)] leading-[1.15] font-normal text-pretty text-pearl">
            {name}
          </h3>
          <p className="mt-2 max-w-[42ch] text-[0.95rem] leading-[1.55] text-pretty text-platinum">{desc}</p>
          {includes ? <PriceIncludes items={includes} note={note} /> : note ? (
            <p className="mt-3 max-w-[52ch] text-[0.85rem] leading-[1.5] text-silver">{note}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3 md:flex-col md:items-end">
          <PriceSum
            amount={amount}
            vat={vat}
            period={period}
            monthly={monthly}
            monthlyLabel={monthlyLabel}
            standard={standard}
          />
          <Button
            asChild
            data-magnetic=""
            variant={featured ? undefined : "outline"}
            className={cn(
              "h-11 rounded-full text-[0.68rem] tracking-[0.16em] uppercase",
              featured && "metal-fill px-6",
            )}
          >
            <a href="#kontakt">{t.ctaQuote}</a>
          </Button>
        </div>
      </article>
    </Reveal>
  );
}

function LaunchRow({ pack, vat, delay = 0, featured = false }: { pack: PricePack; vat: string; delay?: number; featured?: boolean }) {
  const { t } = useLanguage();
  const price = CAVIAR.prices[pack.key];
  return (
    <PriceRow
      name={dictText(t, pack.name)}
      desc={dictText(t, pack.desc)}
      amount={price.launch}
      vat={vat}
      monthly={optionalAmount(price, "monthly")}
      monthlyLabel={optionalAmount(price, "monthly") != null ? t.pEshopMonthly : undefined}
      standard={optionalAmount(price, "standard")}
      includes={"includes" in pack ? dictList(t, pack.includes) : undefined}
      note={"note" in pack ? dictText(t, pack.note) : undefined}
      featured={featured}
      delay={delay}
    />
  );
}

function MonthlyRow({ pack, vat, delay = 0 }: { pack: MonthlyPack; vat: string; delay?: number }) {
  const { t } = useLanguage();
  const price = CAVIAR.monthly[pack.key];
  const featured = "featured" in pack && pack.featured;
  return (
    <PriceRow
      name={dictText(t, pack.name)}
      desc={dictText(t, pack.desc)}
      amount={price.monthly}
      vat={vat}
      period={t.mktPerMonth}
      includes={dictList(t, pack.includes)}
      featured={featured}
      delay={delay}
    />
  );
}

function PriceGroup({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <div className="mt-16 md:mt-20">
      <Reveal className="mb-2 grid gap-3">
        <Kicker>{kicker}</Kicker>
        <h3 className="section-title">{title}</h3>
      </Reveal>
      {children}
    </div>
  );
}

export function Pricing() {
  const { t } = useLanguage();
  const vat = t.vatTag;
  return (
    <Section.Frame id="cennik">
      <Section.Body>
        <Section.Heading className="mb-6 max-w-[38ch] md:mb-8" kicker={t.priceKicker} title={t.priceTitle} />
        <div>
          {LAUNCH_PACKS.map((pack, idx) => (
            <LaunchRow key={pack.key} pack={pack} vat={vat} delay={idx} />
          ))}
          <LaunchRow pack={FEATURED_PACK} vat={vat} delay={4} featured />
        </div>
        <PriceGroup kicker={t.dronKicker} title={t.dronTitle}>
          {DRONE_PACKS.map((pack, idx) => (
            <LaunchRow key={pack.key} pack={pack} vat={vat} delay={idx} />
          ))}
          <Reveal className="max-w-[62ch] pt-2 text-[0.88rem] leading-[1.55] text-silver">
            <p>{t.pDronNote}</p>
          </Reveal>
        </PriceGroup>
        <PriceGroup kicker={t.brandKicker} title={t.brandTitle}>
          {BRAND_PACKS.map((pack, idx) => (
            <LaunchRow key={pack.key} pack={pack} vat={vat} delay={idx} />
          ))}
          <Reveal className="max-w-[62ch] pt-2 text-[0.88rem] leading-[1.55] text-silver">
            <p>{t.pBrandNote}</p>
          </Reveal>
        </PriceGroup>
        <PriceGroup kicker={t.mktKicker} title={t.mktTitle}>
          {MONTHLY_PACKS.map((pack, idx) => (
            <MonthlyRow key={pack.key} pack={pack} vat={vat} delay={idx} />
          ))}
          <Reveal className="max-w-[62ch] pt-2 text-[0.88rem] leading-[1.55] text-silver">
            <p>{t.mktNote}</p>
            <p className="mt-3">{t.priceFoot}</p>
          </Reveal>
        </PriceGroup>
      </Section.Body>
    </Section.Frame>
  );
}

export function Team() {
  const { t } = useLanguage();
  return (
    <Section.Frame id="onas">
      <Section.Body>
        <Section.Heading className="mb-10 max-w-[38ch] md:mb-14" kicker={t.teamKicker} title={t.aboutTitle}>
          <p className="max-w-[36ch] text-[1.02rem] text-pretty text-pearl">{t.aboutLead}</p>
        </Section.Heading>
        <ul className="grid list-none gap-8 md:grid-cols-2 md:gap-16">
          {TEAM.map((p) => (
            <li key={p.name}>
              <Reveal>
                <h3 className="font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-normal tracking-[-0.02em] text-pearl">
                  {p.name}
                </h3>
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
        <Accordion type="single" collapsible className="grid">
          {items.map((item, idx) => (
            <AccordionItem key={item.q} value={`faq-${idx}`} className="border-b-0 px-0 not-last:border-b-0">
              <AccordionTrigger className="rounded-none py-5 font-sans text-[clamp(1.15rem,2.2vw,1.4rem)] leading-[1.3] font-semibold tracking-[-0.02em] text-pearl hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-[62ch] pb-6 leading-[1.55] text-platinum">{item.a}</AccordionContent>
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

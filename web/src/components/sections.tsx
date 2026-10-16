import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePauseOffscreen } from "@/hooks/use-pause-offscreen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useLanguage } from "@/lib/language";
import { WORK_ROWS } from "@/lib/work";
import { Kicker, Reveal } from "@/components/reveal";
import { HeroBackdrop } from "@/components/hero-backdrop";
import { Section } from "@/components/section";
import { renderWorkTile } from "@/components/work-tile";

const PANEL =
  "h-full min-h-[17rem] overflow-visible rounded-[2px] bg-card py-0 ring-1 ring-border";
const PANEL_HEAD = "flex flex-col grid-rows-none gap-3 p-6 md:gap-4 md:p-8";

const TEAM = [
  { mono: "MK", name: "Miroslav Kotvas" },
  { mono: "SK", name: "Sofia Klebanová" },
] as const;

const LAUNCH_PACKS = [
  { key: "fotoMini", name: "pFotoName", desc: "pFotoDesc" },
  { key: "videoReel", name: "pVideoName", desc: "pVideoDesc" },
  { key: "webOnePager", name: "pWebName", desc: "pWebDesc" },
] as const;

const FEATURED_PACK = { key: "komplet", name: "pKompletName", desc: "pKompletDesc" } as const;

type PricePack = (typeof LAUNCH_PACKS)[number] | typeof FEATURED_PACK;

const NEED_OPTIONS = [
  { value: "Web", label: "needWeb" },
  { value: "Video", label: "needVideo" },
  { value: "Foto", label: "needFoto" },
  { value: "Komplet", label: "needKomplet" },
  { value: "Mix", label: "needMix" },
] as const;

export function Hero() {
  const { t } = useLanguage();
  const kenRef = useRef<HTMLDivElement>(null);
  usePauseOffscreen(kenRef);
  return (
    <section className="relative flex min-h-dvh flex-col justify-end pt-[var(--header-h)]" id="top">
      <HeroBackdrop kenRef={kenRef} />
      <div className="hero-stage relative z-[2] isolate mx-auto w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))] pt-8 pb-6 md:pt-10 md:pb-8">
        <Kicker>{t.heroKicker}</Kicker>
        <h1
          className="mt-6 max-w-[22ch] font-serif text-[clamp(2.85rem,11vw,8.1rem)] leading-[1.08] font-normal tracking-[-0.035em] text-balance [&_em]:inline-block [&_em]:bg-linear-to-r [&_em]:from-steel [&_em]:via-pearl [&_em]:to-platinum [&_em]:bg-clip-text [&_em]:pb-[0.14em] [&_em]:font-serif [&_em]:italic [&_em]:text-transparent"
          dangerouslySetInnerHTML={{ __html: t.heroTitle }}
        />
        <p className="mt-6 max-w-[36ch] text-[clamp(1.05rem,2.1vw,1.32rem)] leading-[1.5] text-pretty">{t.heroExplain}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="metal-fill h-[52px] rounded-[2px] px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
            <a href="#kontakt">{t.ctaQuote}</a>
          </Button>
          <Button asChild variant="outline" className="h-[52px] rounded-[2px] px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
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
  const items = [
    { name: t.webName, lead: t.webLead, gets: t.webGets },
    { name: t.videoName, lead: t.videoLead, gets: t.videoGets },
    { name: t.fotoName, lead: t.fotoLead, gets: t.fotoGets },
  ];
  return (
    <Section.Frame id="sluzby" density="compact" className="border-t border-border">
      <Section.Body>
        <h2 className="max-w-[12ch] font-serif text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.08] tracking-[-0.03em] text-balance">
          {t.doKicker}
        </h2>
        <p className="mt-4 mb-10 max-w-[36ch] text-[1.05rem] leading-[1.5] text-muted-foreground md:mb-14">
          {t.doLead}
        </p>
        <div className="grid items-stretch gap-6 md:grid-cols-3 md:gap-8 xl:gap-10">
          {items.map((item, idx) => (
            <ServiceCard key={item.name} item={item} delay={idx} />
          ))}
        </div>
        <Reveal className="mt-6 overflow-visible rounded-[2px] border border-border bg-card p-6 md:mt-8 md:p-8 xl:mt-10" delay={3}>
          <span className="block text-[0.68rem] tracking-[0.22em] text-silver uppercase">{t.forWhomLabel}</span>
          <span className="mt-2 block font-serif text-[clamp(1.2rem,2.4vw,1.55rem)] leading-[1.55] italic">{t.forWhom}</span>
        </Reveal>
      </Section.Body>
    </Section.Frame>
  );
}

function ServiceCard({
  item,
  delay,
}: {
  item: { name: string; lead: string; gets: string };
  delay: number;
}) {
  return (
    <Reveal className="h-full" delay={delay}>
      <Card className={PANEL}>
        <CardHeader className={PANEL_HEAD}>
          <CardTitle className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.15] font-normal tracking-[-0.02em]">
            {item.name}
          </CardTitle>
          <p className="max-w-[34ch] text-[1.05rem] leading-[1.55]">{item.lead}</p>
          <CardDescription className="max-w-[38ch] text-[0.82rem] leading-[1.55] tracking-[0.03em]">{item.gets}</CardDescription>
        </CardHeader>
      </Card>
    </Reveal>
  );
}

function PriceIdentity({ name, desc }: { name: string; desc: string }) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-3">
      <Badge variant="outline" className="rounded-[2px] border-silver/40 bg-platinum/10 tracking-[0.2em] text-platinum uppercase">
        {t.launchBadge}
      </Badge>
      <CardTitle className="font-serif text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.15] font-normal">{name}</CardTitle>
      <CardDescription className="max-w-[36ch] text-[0.95rem] leading-[1.55]">{desc}</CardDescription>
    </div>
  );
}

function PriceAmounts({ launch, standard, vat }: { launch: number; standard: number; vat: string }) {
  const { t } = useLanguage();
  return (
    <div>
      <p className="font-serif text-[clamp(2rem,3.2vw,2.7rem)] leading-[1.12]">
        {t.priceFrom} {launch} EUR{" "}
        <span className="mt-2 block font-sans text-[0.62rem] font-medium tracking-[0.16em] text-silver uppercase">{vat}</span>
      </p>
      <p className="mt-3 text-[0.85rem] text-muted-foreground">
        <s className="text-foreground/40">{standard} EUR</s>
        <span className="mt-0.5 block text-[0.62rem] tracking-[0.16em] uppercase">{t.stdLabel}</span>
      </p>
    </div>
  );
}

function LaunchPriceCard({ pack, delay, vat }: { pack: PricePack; delay: number; vat: string }) {
  const { t } = useLanguage();
  const price = CAVIAR.prices[pack.key];
  return (
    <Reveal className="h-full" delay={delay}>
      <Card className="h-full min-h-[20rem] overflow-visible rounded-[2px] bg-card py-0 ring-1 ring-border">
        <CardHeader className={PANEL_HEAD}>
          <PriceIdentity name={t[pack.name]} desc={t[pack.desc]} />
          <PriceAmounts launch={price.launch} standard={price.standard} vat={vat} />
          <Button asChild variant="outline" className="mt-1 h-11 rounded-[2px] text-[0.68rem] tracking-[0.16em] uppercase">
            <a href="#kontakt">{t.ctaQuote}</a>
          </Button>
        </CardHeader>
      </Card>
    </Reveal>
  );
}

function FeaturedPriceCard({ pack, delay, vat }: { pack: typeof FEATURED_PACK; delay: number; vat: string }) {
  const { t } = useLanguage();
  const price = CAVIAR.prices[pack.key];
  return (
      <Reveal delay={delay} className="h-full md:col-span-2 xl:col-span-3">
      <Card className="h-full min-h-[16rem] overflow-visible rounded-[2px] py-0 ring-1 bg-linear-to-b from-platinum/7 to-platinum/1.5 ring-platinum/42">
        <CardHeader className="flex flex-col gap-4 p-6 md:p-8 lg:grid lg:grid-cols-[1.15fr_auto] lg:items-end lg:gap-12">
          <PriceIdentity name={t[pack.name]} desc={t[pack.desc]} />
          <div className="grid gap-4 justify-items-start">
            <PriceAmounts launch={price.launch} standard={price.standard} vat={vat} />
            <Button asChild className="metal-fill h-11 rounded-[2px] px-6 text-[0.68rem] tracking-[0.16em] uppercase">
              <a href="#kontakt">{t.ctaQuote}</a>
            </Button>
          </div>
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
            <LaunchPriceCard key={pack.key} pack={pack} delay={idx} vat={vat} />
          ))}
          <FeaturedPriceCard pack={FEATURED_PACK} delay={LAUNCH_PACKS.length} vat={vat} />
        </div>
        <Reveal className="mt-7 grid gap-2 text-[0.88rem] text-muted-foreground">
          <p>{t.noHidden}</p>
          <p>{t.vatYes}</p>
        </Reveal>
        <Reveal className="mt-8">
          <Button asChild className="metal-fill h-[52px] rounded-[2px] px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
            <a href="#kontakt">{t.ctaQuote}</a>
          </Button>
        </Reveal>
      </Section.Body>
    </Section.Frame>
  );
}

export function Process() {
  const { t } = useLanguage();
  const steps = [
    { n: "01", title: t.how1t, body: t.how1p },
    { n: "02", title: t.how2t, body: t.how2p },
    { n: "03", title: t.how3t, body: t.how3p },
    { n: "04", title: t.how4t, body: t.how4p },
  ];
  return (
    <Section.Frame id="ako" className="slide-grid">
      <Section.Body>
        <Section.Heading className="mb-10 max-w-[22ch] md:mb-16" kicker={t.howKicker} title={t.howTitle} />
        <ol className="grid list-none gap-6 md:gap-8 xl:gap-10">
          {steps.map((step, idx) => (
            <li key={step.n}>
              <Reveal delay={idx}>
                <Card className="overflow-visible rounded-[2px] py-0 ring-1 ring-border">
                  <CardContent className="grid grid-cols-[auto_1fr] items-start gap-x-6 gap-y-4 p-6 md:p-8">
                    <span className="grid min-w-[2.2ch] gap-3">
                      <i className="block h-px w-9 bg-platinum" aria-hidden="true" />
                      <span className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.15] text-silver italic">{step.n}</span>
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-serif text-[clamp(1.35rem,2.4vw,1.85rem)] leading-[1.2] font-normal">{step.title}</h3>
                      <p className="mt-2 max-w-[52ch] leading-[1.55] text-muted-foreground">{step.body}</p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section.Body>
    </Section.Frame>
  );
}

export function Work() {
  const { t } = useLanguage();
  const stage = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  usePauseOffscreen(sectionRef);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const root = stage.current;
    if (!root) return;
    let scrolling = false;
    const paint = () => {
      const vh = window.innerHeight;
      const projects = root.querySelectorAll<HTMLElement>(".project");
      const writes: { el: HTMLElement; py: string }[] = [];
      for (let i = 0; i < projects.length; i++) {
        const p = projects[i];
        const r = p.getBoundingClientRect();
        const top = r.top;
        const height = r.height;
        if (r.bottom < 0 || top > vh) continue;
        const v = (vh - top) / (vh + height) - 0.5;
        writes.push({ el: p, py: `${(v * 36).toFixed(2)}px` });
      }
      for (let i = 0; i < writes.length; i++) {
        writes[i].el.style.setProperty("--py", writes[i].py);
      }
      scrolling = false;
    };
    const onScroll = () => {
      if (!scrolling) {
        scrolling = true;
        requestAnimationFrame(paint);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const p = (e.target as HTMLElement | null)?.closest(".project") as HTMLElement | null;
      if (!p) return;
      const r = p.getBoundingClientRect();
      const width = r.width;
      const height = r.height;
      if (!width || !height) return;
      p.style.setProperty("--mx", `${(((e.clientX - r.left) / width - 0.5) * 18).toFixed(1)}px`);
      p.style.setProperty("--my", `${(((e.clientY - r.top) / height - 0.5) * 12).toFixed(1)}px`);
    };
    const onLeave = (e: PointerEvent) => {
      const p = (e.target as HTMLElement | null)?.closest(".project") as HTMLElement | null;
      if (!p) return;
      p.style.setProperty("--mx", "0px");
      p.style.setProperty("--my", "0px");
    };
    if (fine) {
      root.addEventListener("pointermove", onMove, { passive: true });
      root.addEventListener("pointerleave", onLeave, { passive: true });
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <Section.Frame id="praca" className="work-sec" ref={sectionRef}>
      <Section.Body className="mb-10 md:mb-16">
        <Section.Heading className="max-w-[38ch]" kicker={t.workKicker} title={t.workTitle}>
          <p className="text-[1.02rem] text-muted-foreground">{t.workLead}</p>
        </Section.Heading>
      </Section.Body>
      <div className="marquee overflow-hidden border-y border-border py-4" aria-hidden="true">
        <div className="marquee-track flex w-max gap-8 text-[0.72rem] tracking-[0.28em] text-silver uppercase">
          <span>{t.marquee}</span>
          <span>{t.marquee}</span>
          <span>{t.marquee}</span>
          <span>{t.marquee}</span>
        </div>
      </div>
      <Section.Wide className="mt-8">
        <div ref={stage} className="grid gap-4 md:gap-6 xl:gap-8">
          {WORK_ROWS.map((row) =>
            row.length === 2 ? (
              <div key={row[0].id} className="grid gap-4 md:grid-cols-2 md:gap-6 xl:gap-8">
                {row.map(renderWorkTile)}
              </div>
            ) : (
              renderWorkTile(row[0])
            ),
          )}
        </div>
      </Section.Wide>
      <Section.Body className="mt-7">
        <a
          href={CAVIAR.EVERLIGHT}
          className="inline-flex items-center pb-1.5 text-[0.78rem] tracking-[0.14em] text-silver uppercase hover:text-foreground"
        >
          {t.everLink}
        </a>
      </Section.Body>
    </Section.Frame>
  );
}

export function Team() {
  const { t } = useLanguage();
  return (
    <Section.Frame id="onas">
      <Section.Body>
        <Section.Heading className="mb-10 max-w-[22ch] md:mb-16" kicker={t.teamKicker} title={t.aboutTitle} />
        <ul className="grid list-none gap-6 md:grid-cols-2 md:gap-8">
          {TEAM.map((p, idx) => (
            <li key={p.name}>
              <Reveal delay={idx}>
                <div
                  className="relative grid aspect-4/5 max-h-[420px] max-w-[380px] place-items-center overflow-hidden border border-border bg-linear-to-br from-[#1a1c22] to-[#0c0c10]"
                  aria-hidden="true"
                >
                  <b className="relative z-[1] font-serif text-[clamp(4.2rem,10vw,6.5rem)] font-normal tracking-[0.06em] text-transparent italic bg-linear-to-b from-[#f7f8fa] to-steel bg-clip-text">
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
  const items = [
    { q: t.faq1q, a: t.faq1a },
    { q: t.faq2q, a: t.faq2a },
    { q: t.faq3q, a: t.faq3a },
    { q: t.faq4q, a: t.faq4a },
    { q: t.faq5q, a: t.faq5a },
    { q: t.faq6q, a: t.faq6a },
  ];
  return (
    <Section.Frame id="faq">
      <Section.Body>
        <Section.Heading className="mb-10 max-w-[22ch] md:mb-16" kicker="FAQ" title={t.faqTitle} />
        <Accordion type="single" collapsible className="grid gap-3">
          {items.map((item, idx) => (
            <AccordionItem
              key={item.q}
              value={`faq-${idx}`}
              className="rounded-[2px] border border-border bg-card px-6 not-last:border-b md:px-8"
            >
              <AccordionTrigger className="rounded-[2px] py-5 font-serif text-[clamp(1.25rem,2.4vw,1.6rem)] leading-[1.25] font-normal hover:no-underline">
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
      <h2 className="mt-4 max-w-[11ch] font-serif text-[clamp(2.5rem,7vw,5.6rem)] leading-[1.08] tracking-[-0.03em] text-balance">
        {t.contactTitle}
      </h2>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="metal-fill h-[52px] rounded-[2px] px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
          <a href={`mailto:${CAVIAR.EMAIL}`}>{t.ctaMail}</a>
        </Button>
        <Button asChild variant="outline" className="h-[52px] rounded-[2px] px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
          <a href={`tel:${CAVIAR.PHONE}`}>{t.ctaPhone}</a>
        </Button>
        <Button asChild variant="outline" className="h-[52px] rounded-[2px] px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
          <a href={waHref(t.waText)}>{t.ctaWa}</a>
        </Button>
        <Button asChild variant="outline" className="h-[52px] rounded-[2px] px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
          <a href={CAVIAR.INSTAGRAM} target="_blank" rel="noopener noreferrer">
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
      <Card className="overflow-visible rounded-[2px] py-0 ring-1 ring-border">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={onSubmit} className="grid gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="f-name" className="text-[0.68rem] tracking-[0.2em] text-silver uppercase">
                  {t.fName}
                </FieldLabel>
                <Input id="f-name" name="name" autoComplete="name" required className="h-11 rounded-[2px] bg-background" />
              </Field>
              <Field>
                <FieldLabel htmlFor="f-biz" className="text-[0.68rem] tracking-[0.2em] text-silver uppercase">
                  {t.fBiz}
                </FieldLabel>
                <Input id="f-biz" name="business" autoComplete="organization" required className="h-11 rounded-[2px] bg-background" />
              </Field>
              <Field>
                <FieldLabel htmlFor="f-need" className="text-[0.68rem] tracking-[0.2em] text-silver uppercase">
                  {t.fNeed}
                </FieldLabel>
                <Select value={need} onValueChange={setNeed} required>
                  <SelectTrigger id="f-need" className="h-11 w-full rounded-[2px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-[2px]">
                    <SelectGroup>
                      {NEED_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t[option.label]}
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
                  className="h-11 rounded-[2px] bg-background"
                />
              </Field>
            </FieldGroup>
            <Button type="submit" className="metal-fill h-[52px] rounded-[2px] text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
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

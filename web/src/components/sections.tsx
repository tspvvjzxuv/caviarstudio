import { useEffect, useRef, useState, type FormEvent } from "react";
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
import { WORK, type WorkItem } from "@/lib/work";
import { cn } from "@/lib/utils";
import { Kicker, Reveal } from "@/components/reveal";

export function Hero() {
  const { t } = useLanguage();
  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden pt-16" id="top">
      <div className="hero-ken absolute inset-0">
        <picture>
          <source srcSet="./img/hero.webp" type="image/webp" />
          <img
            src="./img/hero.jpg"
            alt={t.heroAlt}
            fetchPriority="high"
            width={1920}
            height={1080}
            className="size-full object-cover grayscale-[0.15] contrast-[1.05] brightness-[0.78]"
          />
        </picture>
        <div className="hero-shine absolute inset-0 z-[1]" aria-hidden="true" />
        <div className="absolute inset-0 bg-linear-to-b from-[#070708]/42 via-[#070708]/12 via-34% to-[#070708]" />
        <div className="absolute inset-0 bg-linear-to-r from-[#070708]/58 to-transparent to-58%" />
      </div>
      <div className="relative z-[2] mx-auto w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))] pb-[clamp(4.5rem,10vw,6.75rem)]">
        <Kicker>{t.heroKicker}</Kicker>
        <h1
          className="mt-6 max-w-[11ch] font-serif text-[clamp(3rem,12vw,8.4rem)] leading-[0.88] font-normal tracking-[-0.03em] [&_em]:bg-linear-to-r [&_em]:from-steel [&_em]:via-pearl [&_em]:to-platinum [&_em]:bg-clip-text [&_em]:font-serif [&_em]:italic [&_em]:text-transparent"
          dangerouslySetInnerHTML={{ __html: t.heroTitle }}
        />
        <p className="mt-7 max-w-[34ch] text-[clamp(1.05rem,2.1vw,1.32rem)] leading-[1.45]">{t.heroExplain}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="metal-fill h-[52px] rounded-[2px] px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
            <a href="#kontakt">{t.ctaQuote}</a>
          </Button>
          <Button asChild variant="outline" className="h-[52px] rounded-[2px] px-6 text-[0.72rem] tracking-[0.16em] uppercase max-md:w-full">
            <a href="#cennik">{t.ctaPricing}</a>
          </Button>
        </div>
        <p className="mt-5 max-w-[42ch] text-[0.72rem] tracking-[0.12em] text-silver uppercase">{t.heroTrust}</p>
      </div>
      <a
        href="#sluzby"
        className="absolute right-[clamp(1.25rem,5vw,5rem)] bottom-7 z-[2] flex flex-col items-center gap-2.5 text-silver"
      >
        <span className="rotate-180 text-[0.62rem] tracking-[0.22em] uppercase [writing-mode:vertical-rl]">{t.scrollCue}</span>
        <i className="relative block h-12 w-px bg-linear-to-b from-platinum to-transparent">
          <span className="scroll-cue-dot absolute top-0 left-1/2 size-[5px] -translate-x-1/2 rounded-full bg-platinum" />
        </i>
      </a>
    </section>
  );
}

export function Services() {
  const { t } = useLanguage();
  const items = [
    { name: t.webName, lead: t.webLead, gets: t.webGets, i: "01" },
    { name: t.videoName, lead: t.videoLead, gets: t.videoGets, i: "02" },
    { name: t.fotoName, lead: t.fotoLead, gets: t.fotoGets, i: "03" },
  ];
  return (
    <section id="sluzby" className="scroll-mt-20 border-t border-border py-[clamp(3rem,8vw,5.5rem)]">
      <div className="mx-auto w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))]">
        <div className="mb-8 md:mb-10">
          <h2>
            <Kicker>{t.doKicker}</Kicker>
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3 md:gap-6 xl:gap-8">
          {items.map((item, idx) => (
            <ServiceCard key={item.i} item={item} delay={idx} />
          ))}
        </div>
        <Reveal className="mt-4 rounded-[2px] border border-border bg-card p-6 md:mt-6 md:p-8 xl:mt-8" delay={3}>
          <span className="block text-[0.68rem] tracking-[0.22em] text-silver uppercase">{t.forWhomLabel}</span>
          <span className="mt-2 block font-serif text-[clamp(1.2rem,2.4vw,1.55rem)] leading-[1.45] italic">{t.forWhom}</span>
        </Reveal>
      </div>
    </section>
  );
}

function ServiceCard({
  item,
  delay,
}: {
  item: { name: string; lead: string; gets: string; i: string };
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <Card className="h-full rounded-[2px] bg-card py-0 ring-1 ring-border">
        <CardHeader className="gap-3 p-6 md:p-8">
          <span className="font-serif text-[1.35rem] text-silver italic">{item.i}</span>
          <CardTitle className="font-serif text-[clamp(2rem,4vw,3rem)] font-normal tracking-[-0.02em]">{item.name}</CardTitle>
          <p className="max-w-[34ch] text-[1.05rem] leading-[1.5]">{item.lead}</p>
          <CardDescription className="max-w-[38ch] text-[0.82rem] tracking-[0.03em]">{item.gets}</CardDescription>
        </CardHeader>
      </Card>
    </Reveal>
  );
}

export function Pricing() {
  const { t } = useLanguage();
  const packs = [
    { key: "fotoMini", name: t.pFotoName, desc: t.pFotoDesc, featured: false },
    { key: "videoReel", name: t.pVideoName, desc: t.pVideoDesc, featured: false },
    { key: "webOnePager", name: t.pWebName, desc: t.pWebDesc, featured: false },
    { key: "komplet", name: t.pKompletName, desc: t.pKompletDesc, featured: true },
  ] as const;
  const vat = CAVIAR.VAT_PAYER ? t.vatTag : t.vatTagEx;
  return (
    <section id="cennik" className="scroll-mt-20 py-[clamp(4.5rem,11vw,8.25rem)]">
      <div className="mx-auto w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))]">
        <Reveal className="mb-10 grid max-w-[38ch] gap-4 md:mb-16">
          <Kicker>{t.priceKicker}</Kicker>
          <h2 className="font-serif text-[clamp(2.2rem,5.6vw,4.4rem)] leading-[1.04] tracking-[-0.025em]">{t.priceTitle}</h2>
          <p className="text-[0.72rem] tracking-[0.14em] text-silver uppercase">
            {t.slots.replace("{x}", String(CAVIAR.SLOTS_REMAINING)).replace("{total}", String(CAVIAR.SLOTS_TOTAL))}
          </p>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 xl:gap-8">
          {packs.map((pack, idx) => {
            const price = CAVIAR.prices[pack.key];
            return (
              <Reveal key={pack.key} delay={idx} className={pack.featured ? "md:col-span-2 xl:col-span-3" : ""}>
                <Card
                  className={cn(
                    "h-full rounded-[2px] py-0 ring-1",
                    pack.featured
                      ? "bg-linear-to-b from-platinum/7 to-platinum/1.5 ring-platinum/42"
                      : "bg-card ring-border",
                  )}
                >
                  <CardHeader className={cn("gap-4 p-6 md:p-8", pack.featured && "lg:grid lg:grid-cols-[1.15fr_auto] lg:items-end lg:gap-12")}>
                    <div className="grid gap-3">
                      <Badge variant="outline" className="rounded-[2px] border-silver/40 bg-platinum/10 tracking-[0.2em] text-platinum uppercase">
                        {t.launchBadge}
                      </Badge>
                      <CardTitle className="font-serif text-[clamp(1.7rem,3vw,2.3rem)] font-normal">{pack.name}</CardTitle>
                      <CardDescription className="max-w-[36ch] text-[0.95rem]">{pack.desc}</CardDescription>
                    </div>
                    <div>
                      <p className="font-serif text-[clamp(2rem,3.2vw,2.7rem)] leading-none">
                        {t.priceFrom} {price.launch} EUR{" "}
                        <span className="mt-2 block font-sans text-[0.62rem] font-medium tracking-[0.16em] text-silver uppercase">{vat}</span>
                      </p>
                      <p className="mt-3 text-[0.85rem] text-muted-foreground">
                        <s className="text-foreground/40">{price.standard} EUR</s>
                        <span className="mt-0.5 block text-[0.62rem] tracking-[0.16em] uppercase">{t.stdLabel}</span>
                      </p>
                    </div>
                  </CardHeader>
                </Card>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="mt-7 grid gap-2 text-[0.88rem] text-muted-foreground">
          <p>{t.priceIntro}</p>
          <p>{t.noHidden}</p>
          <p>{CAVIAR.VAT_PAYER ? t.vatYes : t.vatNo}</p>
        </Reveal>
      </div>
    </section>
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
    <section id="ako" className="scroll-mt-20 py-[clamp(4.5rem,11vw,8.25rem)]">
      <div className="mx-auto w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))]">
        <Reveal className="mb-10 grid max-w-[22ch] gap-4 md:mb-16">
          <Kicker>{t.howKicker}</Kicker>
          <h2 className="font-serif text-[clamp(2.2rem,5.6vw,4.4rem)] leading-[1.04] tracking-[-0.025em]">{t.howTitle}</h2>
        </Reveal>
        <ol className="grid list-none gap-4 md:gap-6 xl:gap-8">
          {steps.map((step, idx) => (
            <li key={step.n}>
              <Reveal delay={idx}>
                <Card className="rounded-[2px] py-0 ring-1 ring-border">
                  <CardContent className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-4 p-6 md:p-8">
                    <span className="min-w-[2.2ch] font-serif text-[clamp(2rem,4vw,3rem)] text-silver italic">{step.n}</span>
                    <div>
                      <h3 className="font-serif text-[clamp(1.35rem,2.4vw,1.85rem)] font-normal">{step.title}</h3>
                      <p className="mt-2 max-w-[52ch] text-muted-foreground">{step.body}</p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function WorkCard({ item, index }: { item: WorkItem; index: number }) {
  const { t } = useLanguage();
  const isSilver = item.kind === "silver" || !item.image;
  const [broken, setBroken] = useState(false);
  const showSilver = isSilver || broken;
  const n = String(index + 1).padStart(2, "0");
  const pack = t as Record<string, string>;
  const inner = (
    <>
      <div
        className={cn(
          "project-media absolute inset-0 overflow-hidden",
          showSilver && `silver-sheen silver-${item.silver}`,
        )}
      >
        {!showSilver && (
          <img
            src={item.image}
            alt={pack[item.altKey] || ""}
            loading="lazy"
            decoding="async"
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
  const cls = cn(
    "project relative isolate min-h-[64vh] overflow-hidden rounded-[2px] border border-border bg-card",
    item.layout === "feature" && "min-h-[78vh] md:min-h-[min(84vh,920px)]",
    item.layout === "pair" && "md:min-h-[min(68vh,700px)]",
  );
  if (item.href) {
    return (
      <article className={cls} data-id={item.id} data-cursor="view">
        <a
          className="absolute inset-0 z-[2]"
          href={item.href}
          target={item.href.startsWith("http") ? "_blank" : undefined}
          rel={item.href.startsWith("http") ? "noopener" : undefined}
        />
        {inner}
      </article>
    );
  }
  return (
    <article className={cls} data-id={item.id} data-cursor="soon">
      {inner}
    </article>
  );
}

export function Work() {
  const { t } = useLanguage();
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const root = stage.current;
    if (!root) return;
    let scrolling = false;
    const paint = () => {
      const vh = window.innerHeight;
      root.querySelectorAll<HTMLElement>(".project").forEach((p) => {
        const r = p.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const v = (vh - r.top) / (vh + r.height) - 0.5;
        p.style.setProperty("--py", `${(v * 36).toFixed(2)}px`);
      });
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
      p.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width - 0.5) * 18).toFixed(1)}px`);
      p.style.setProperty("--my", `${(((e.clientY - r.top) / r.height - 0.5) * 12).toFixed(1)}px`);
    };
    const onLeave = (e: PointerEvent) => {
      const p = (e.target as HTMLElement | null)?.closest(".project") as HTMLElement | null;
      if (!p) return;
      p.style.setProperty("--mx", "0px");
      p.style.setProperty("--my", "0px");
    };
    if (fine) {
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const rows: WorkItem[][] = [];
  for (let i = 0; i < WORK.length; i++) {
    const item = WORK[i];
    const next = WORK[i + 1];
    if (item.layout === "pair" && next?.layout === "pair") {
      rows.push([item, next]);
      i += 1;
    } else {
      rows.push([item]);
    }
  }

  return (
    <section id="praca" className="work-sec scroll-mt-20 py-[clamp(4.5rem,11vw,8.25rem)]">
      <div className="mx-auto mb-10 w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))] md:mb-16">
        <Reveal className="grid max-w-[38ch] gap-4">
          <Kicker>{t.workKicker}</Kicker>
          <h2 className="font-serif text-[clamp(2.2rem,5.6vw,4.4rem)] leading-[1.04] tracking-[-0.025em]">{t.workTitle}</h2>
          <p className="text-[1.02rem] text-muted-foreground">{t.workLead}</p>
        </Reveal>
      </div>
      <div className="marquee overflow-hidden border-y border-border py-4" aria-hidden="true">
        <div className="marquee-track flex w-max gap-8 text-[0.72rem] tracking-[0.28em] text-silver uppercase">
          <span>{t.marquee}</span>
          <span>{t.marquee}</span>
          <span>{t.marquee}</span>
          <span>{t.marquee}</span>
        </div>
      </div>
      <div className="mx-auto mt-8 w-[min(1360px,calc(100%-2*clamp(1.25rem,5vw,5rem)))]">
        <div ref={stage} className="grid gap-4 md:gap-6 xl:gap-8">
          {rows.map((row, i) =>
            row.length === 2 ? (
              <div key={row[0].id} className="grid gap-4 md:grid-cols-2 md:gap-6 xl:gap-8">
                <WorkCard item={row[0]} index={WORK.indexOf(row[0])} />
                <WorkCard item={row[1]} index={WORK.indexOf(row[1])} />
              </div>
            ) : (
              <WorkCard key={row[0].id} item={row[0]} index={i === 0 ? 0 : WORK.indexOf(row[0])} />
            ),
          )}
        </div>
      </div>
      <div className="mx-auto mt-7 w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))]">
        <a
          href={CAVIAR.EVERLIGHT}
          className="inline-flex items-center pb-1.5 text-[0.78rem] tracking-[0.14em] text-silver uppercase hover:text-foreground"
        >
          {t.everLink}
        </a>
      </div>
    </section>
  );
}

export function Team() {
  const { t } = useLanguage();
  const people = [
    { mono: "MK", name: "Miroslav Kotvas" },
    { mono: "SK", name: "Sofia Klebanová" },
  ];
  return (
    <section id="onas" className="scroll-mt-20 py-[clamp(4.5rem,11vw,8.25rem)]">
      <div className="mx-auto w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))]">
        <Reveal className="mb-10 grid max-w-[22ch] gap-4 md:mb-16">
          <Kicker>{t.teamKicker}</Kicker>
          <h2 className="font-serif text-[clamp(2.2rem,5.6vw,4.4rem)] leading-[1.04] tracking-[-0.025em]">{t.aboutTitle}</h2>
        </Reveal>
        <ul className="grid list-none gap-6 md:grid-cols-2 md:gap-8">
          {people.map((p, idx) => (
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
      </div>
    </section>
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
    <section id="faq" className="scroll-mt-20 py-[clamp(4.5rem,11vw,8.25rem)]">
      <div className="mx-auto w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))]">
        <Reveal className="mb-10 grid max-w-[22ch] gap-4 md:mb-16">
          <Kicker>FAQ</Kicker>
          <h2 className="font-serif text-[clamp(2.2rem,5.6vw,4.4rem)] leading-[1.04] tracking-[-0.025em]">{t.faqTitle}</h2>
        </Reveal>
        <Accordion type="single" collapsible className="grid gap-3">
          {items.map((item, idx) => (
            <AccordionItem
              key={item.q}
              value={`faq-${idx}`}
              className="rounded-[2px] border border-border bg-card px-6 not-last:border-b md:px-8"
            >
              <AccordionTrigger className="rounded-[2px] py-5 font-serif text-[clamp(1.25rem,2.4vw,1.6rem)] font-normal hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-[62ch] pb-6 text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function Contact() {
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
      `${t.mailBudget}: ${budget || "—"}`,
    ].join("\n");
    window.location.href =
      `mailto:${CAVIAR.EMAIL}` +
      `?subject=${encodeURIComponent(t.mailSubject)}` +
      `&body=${encodeURIComponent(body)}`;
  }

  return (
    <section id="kontakt" className="scroll-mt-20 py-[clamp(4.5rem,11vw,8.25rem)]">
      <div className="mx-auto grid w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))] gap-10 md:grid-cols-2 md:gap-16">
        <Reveal>
          <Kicker>{t.contactKicker}</Kicker>
          <h2 className="mt-4 max-w-[11ch] font-serif text-[clamp(2.5rem,7vw,5.6rem)] leading-[0.98] tracking-[-0.03em]">
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
              <a href={CAVIAR.INSTAGRAM} target="_blank" rel="noopener">
                {t.ctaIg}
              </a>
            </Button>
          </div>
          <p className="mt-5 font-serif text-2xl tracking-[0.04em]">{formatPhone(CAVIAR.PHONE)}</p>
          <p className="mt-2 text-[0.85rem] tracking-[0.12em] text-silver uppercase">{t.place}</p>
        </Reveal>
        <Reveal>
          <Card className="rounded-[2px] py-0 ring-1 ring-border">
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
                    <FieldLabel className="text-[0.68rem] tracking-[0.2em] text-silver uppercase">{t.fNeed}</FieldLabel>
                    <Select value={need} onValueChange={setNeed} required>
                      <SelectTrigger className="h-11 w-full rounded-[2px] bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[2px]">
                        <SelectGroup>
                          <SelectItem value="Web">{t.needWeb}</SelectItem>
                          <SelectItem value="Video">{t.needVideo}</SelectItem>
                          <SelectItem value="Foto">{t.needFoto}</SelectItem>
                          <SelectItem value="Komplet">{t.needKomplet}</SelectItem>
                          <SelectItem value="Mix">{t.needMix}</SelectItem>
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
      </div>
    </section>
  );
}

import type { Lang } from "@/lib/i18n";

export type WorkLayout = "feature" | "pair";

/** String for every language, or a SK/EN/DE map (falls back to SK). */
export type WorkCopy = string | { sk: string; en?: string; de?: string };

export type WorkItem = {
  id: string;
  /** Still in /media. Example: "/media/work/ptra.webp" */
  image?: string;
  /** Optional muted hover film, or the tile media when there is no still. */
  video?: string;
  title: WorkCopy;
  line?: WorkCopy;
  alt?: WorkCopy;
  /** One small type label under the title, e.g. Web / Landing page. */
  tag?: WorkCopy;
  href?: string;
  repo?: string;
  /** feature = full-width tall tile. pair = two consecutive pair items sit side by side. */
  layout?: WorkLayout;
};

/**
 * Public websites already built. Owner screenshots of live sites, or a
 * typographic tile when there is no live page / no usable visual.
 *
 * {
 *   id: "ptra",
 *   image: "/media/work/ptra.webp",
 *   title: "Stredoveký festival Stropkov",
 *   tag: "Festival",
 *   href: "https://ptra.sk/",
 *   repo: "https://github.com/tspvvjzxuv/stredoveky-festival-stropkov",
 * }
 */
export const WORK: WorkItem[] = [
  {
    id: "thedesigns",
    image: "/media/work/thedesigns.webp",
    title: "thedesigns.org",
    line: {
      sk: "Landing s tromi sklenenými stĺpcami. Slovenčina a nemčina, jedna doména.",
      en: "Landing page with three glass columns. Slovak and German, one domain.",
      de: "Landingpage mit drei Glas-Säulen. Slowakisch und Deutsch, eine Domain.",
    },
    alt: {
      sk: "thedesigns.org — úvod landingu s tromi stĺpcami",
      en: "thedesigns.org — landing page with three columns",
      de: "thedesigns.org — Landingpage mit drei Säulen",
    },
    tag: {
      sk: "Landing page",
      en: "Landing page",
      de: "Landingpage",
    },
    href: "https://thedesigns.org/",
    repo: "https://github.com/tspvvjzxuv/tri-sluzby-glass-landing",
    layout: "feature",
  },
  {
    id: "lile-lentilka",
    image: "/media/work/lile-lentilka.webp",
    title: "LiLiLentilka",
    line: {
      sk: "Web s e-shopom. Hudba plná farieb, smiechu a lentiliek.",
      en: "Website with an e-shop. Music full of colour, laughter and lentil sweets.",
      de: "Website mit E-Shop. Musik voller Farbe, Lachen und Lentilkas.",
    },
    alt: {
      sk: "lililentilka.sk — úvod webu",
      en: "lililentilka.sk — top of the site",
      de: "lililentilka.sk — oberer Bereich der Website",
    },
    tag: {
      sk: "Web + e-shop",
      en: "Web + e-shop",
      de: "Web + E-Shop",
    },
    href: "https://lililentilka.sk/",
    repo: "https://github.com/tspvvjzxuv/lile-lentilka-pages",
    layout: "feature",
  },
  {
    id: "ptra",
    image: "/media/work/ptra.webp",
    title: {
      sk: "Stredoveký festival Stropkov",
      en: "Medieval festival Stropkov",
      de: "Mittelalterfestival Stropkov",
    },
    line: {
      sk: "GitHub Pages. Web festivalu PTRA v Stropkove.",
      en: "GitHub Pages. Site for the PTRA festival in Stropkov.",
      de: "GitHub Pages. Website des PTRA-Festivals in Stropkov.",
    },
    alt: {
      sk: "ptra.sk — úvod festivalového webu",
      en: "ptra.sk — top of the festival site",
      de: "ptra.sk — oberer Bereich der Festival-Website",
    },
    tag: "Festival",
    href: "https://ptra.sk/",
    repo: "https://github.com/tspvvjzxuv/stredoveky-festival-stropkov",
    layout: "feature",
  },
  {
    id: "malovanienatvar2",
    image: "/media/work/malovanienatvar2.webp",
    title: {
      sk: "Maľovanie na tvár",
      en: "Face painting",
      de: "Kinderschminken",
    },
    line: {
      sk: "CSS. GitHub Pages.",
      en: "CSS. GitHub Pages.",
      de: "CSS. GitHub Pages.",
    },
    alt: {
      sk: "Maľovanie na tvár — úvod GitHub Pages",
      en: "Face painting — top of the GitHub Pages site",
      de: "Kinderschminken — oberer Bereich der GitHub-Pages-Seite",
    },
    tag: "Web",
    href: "https://tspvvjzxuv.github.io/malovanienatvar2/",
    repo: "https://github.com/tspvvjzxuv/malovanienatvar2",
    layout: "feature",
  },
  {
    id: "creative-creature",
    title: "Creative Creature",
    line: {
      sk: "HTML, 2024. Maľovanie na tvár pre deti.",
      en: "HTML, 2024. Face painting for kids.",
      de: "HTML, 2024. Kinderschminken.",
    },
    tag: "Web",
    href: "https://tspvvjzxuv.github.io/creative-creature/",
    repo: "https://github.com/tspvvjzxuv/creative-creature",
    layout: "pair",
  },
  {
    id: "malovanie-na-tvar",
    title: {
      sk: "Maľovanie na tvár",
      en: "Face painting",
      de: "Kinderschminken",
    },
    line: {
      sk: "CSS. Živá stránka nie je.",
      en: "CSS. No live site.",
      de: "CSS. Keine Live-Seite.",
    },
    tag: "Web",
    repo: "https://github.com/tspvvjzxuv/malovanie-na-tvar",
    layout: "pair",
  },
  {
    id: "sofinkastranka",
    title: "Sofinka stránka",
    line: {
      sk: "Web pre biznis, 2024. Živá stránka nie je.",
      en: "Business website, 2024. No live site.",
      de: "Business-Website, 2024. Keine Live-Seite.",
    },
    tag: "Web",
    repo: "https://github.com/tspvvjzxuv/sofinkastranka",
    layout: "pair",
  },
];

export const HAS_WORK = WORK.length > 0;

export const WORK_INDEX = new Map(WORK.map((item, index) => [item.id, index]));

export function workIndex(item: WorkItem): number {
  return WORK_INDEX.get(item.id) ?? 0;
}

export function workText(value: WorkCopy | undefined, lang: Lang, fallback = ""): string {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") return value;
  return value[lang] || value.sk || fallback;
}

export function workSrc(path: string | undefined): string {
  if (!path) return "";
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("http") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
}

export function isTypographic(item: WorkItem): boolean {
  return !item.image && !item.video;
}

export function workLabel(item: WorkItem, lang: Lang): string {
  return workText(item.tag, lang);
}

export function groupWorkRows(items: WorkItem[]): WorkItem[][] {
  const rows: WorkItem[][] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const next = items[i + 1];
    const layout = item.layout ?? "feature";
    const nextLayout = next?.layout ?? "feature";
    if (layout === "pair" && nextLayout === "pair") {
      rows.push([item, next]);
      i += 1;
    } else {
      rows.push([item]);
    }
  }
  return rows;
}

export const WORK_SHOTS = WORK.filter((item) => !isTypographic(item));
export const WORK_TYPE = WORK.filter(isTypographic);
export const WORK_SHOT_ROWS: WorkItem[][] = groupWorkRows(WORK_SHOTS);
export const WORK_ROWS: WorkItem[][] = groupWorkRows(WORK);

export function workPrimaryHref(item: WorkItem): string {
  return (item.href || item.repo || "").trim();
}

export function workRepoHref(item: WorkItem): string {
  const repo = item.repo?.trim() ?? "";
  const live = item.href?.trim() ?? "";
  if (!repo || !live || repo === live) return "";
  return repo;
}

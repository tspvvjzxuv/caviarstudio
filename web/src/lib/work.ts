import type { Dict, Lang } from "@/lib/i18n";

export type WorkLayout = "feature" | "pair";
export type WorkCat = "web" | "eshop" | "landing" | "festival";
export type WorkFilter = "all" | WorkCat;

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
  /** Filter membership. A tile may sit in more than one category. */
  categories: WorkCat[];
  href?: string;
  repo?: string;
  /** feature = full-width tall tile. pair = two consecutive pair items sit side by side. */
  layout?: WorkLayout;
};

export const WORK_CAT_ORDER: WorkCat[] = ["web", "eshop", "landing", "festival"];

const CAT_DICT: Record<WorkCat, keyof Dict> = {
  web: "workCatWeb",
  eshop: "workCatEshop",
  landing: "workCatLanding",
  festival: "workCatFestival",
};

/**
 * Live public websites only. Each item needs a working href and a screenshot.
 *
 * {
 *   id: "ptra",
 *   image: "/media/work/ptra.webp",
 *   title: "Stredoveký festival Stropkov",
 *   categories: ["festival"],
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
    categories: ["landing"],
    href: "https://thedesigns.org/",
    repo: "https://github.com/tspvvjzxuv/tri-sluzby-glass-landing",
    layout: "pair",
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
    categories: ["web", "eshop"],
    href: "https://lililentilka.sk/",
    repo: "https://github.com/tspvvjzxuv/lile-lentilka-pages",
    layout: "pair",
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
    categories: ["festival"],
    href: "https://ptra.sk/",
    repo: "https://github.com/tspvvjzxuv/stredoveky-festival-stropkov",
    layout: "pair",
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
    categories: ["web"],
    href: "https://tspvvjzxuv.github.io/malovanienatvar2/",
    repo: "https://github.com/tspvvjzxuv/malovanienatvar2",
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

export function workCatLabel(cat: WorkCat, pack: Dict): string {
  return pack[CAT_DICT[cat]];
}

export function workLabels(item: WorkItem, pack: Dict): string[] {
  return (item.categories ?? [])
    .slice()
    .sort((a, b) => WORK_CAT_ORDER.indexOf(a) - WORK_CAT_ORDER.indexOf(b))
    .map((cat) => workCatLabel(cat, pack))
    .filter(Boolean);
}

export function workHasCat(item: WorkItem, filter: WorkFilter): boolean {
  if (filter === "all") return true;
  return item.categories.includes(filter);
}

export function filterWork(items: WorkItem[], filter: WorkFilter): WorkItem[] {
  return items.filter((item) => workHasCat(item, filter));
}

export function usedWorkCats(items: WorkItem[] = WORK): WorkCat[] {
  const used = new Set<WorkCat>();
  for (const item of items) {
    for (const cat of item.categories) used.add(cat);
  }
  return WORK_CAT_ORDER.filter((cat) => used.has(cat));
}

/** Hide the filter row when there are fewer than two categories left. */
export const SHOW_WORK_FILTERS = usedWorkCats().length >= 2;

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

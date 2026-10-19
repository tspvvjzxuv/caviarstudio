import type { Dict, Lang } from "@/lib/i18n";

export type WorkLayout = "feature" | "pair";
export type WorkCat = "web" | "eshop" | "festival";
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
  /** feature = full-width tall tile. pair = two consecutive pair items sit side by side. */
  layout?: WorkLayout;
};

export const WORK_CAT_ORDER: WorkCat[] = ["web", "eshop", "festival"];

const CAT_DICT = {
  web: "workCatWeb",
  eshop: "workCatEshop",
  festival: "workCatFestival",
} as const;

/**
 * Live public websites only. Each item needs a working href and a screenshot.
 *
 * {
 *   id: "ptra",
 *   image: "/media/work/ptra.webp",
 *   title: "Stredoveký festival Stropkov",
 *   categories: ["festival"],
 *   href: "https://ptra.sk/",
 * }
 */
export const WORK: WorkItem[] = [
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
      sk: "Web festivalu PTRA v Stropkove.",
      en: "Site for the PTRA festival in Stropkov.",
      de: "Website des PTRA-Festivals in Stropkov.",
    },
    alt: {
      sk: "ptra.sk — úvod festivalového webu",
      en: "ptra.sk — top of the festival site",
      de: "ptra.sk — oberer Bereich der Festival-Website",
    },
    categories: ["festival"],
    href: "https://ptra.sk/",
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
      sk: "Osobná stránka maliarky. Oslavy, festivaly a špeciálne príležitosti.",
      en: "A personal page for a face painter. Parties, festivals and special occasions.",
      de: "Persönliche Seite einer Kinderschminkerin. Feste, Festivals und besondere Anlässe.",
    },
    alt: {
      sk: "Maľovanie na tvár — osobná stránka, úvod",
      en: "Face painting — personal page, top of the site",
      de: "Kinderschminken — persönliche Seite, oberer Bereich",
    },
    categories: ["web"],
    href: "https://tspvvjzxuv.github.io/malovanienatvar2/",
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
  return item.href?.trim() ?? "";
}

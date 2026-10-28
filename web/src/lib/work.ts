import type { Dict, Lang } from "@/lib/i18n";

export type WorkLayout = "feature" | "pair";
export type WorkCat = "web" | "eshop" | "festival";
export type WorkFilter = "all" | WorkCat;

/** String for every language, or a SK/EN/DE map (falls back to SK). */
export type WorkCopy = string | { sk: string; en?: string; de?: string };

export type WorkItem = {
  id: string;
  /** Desktop still in /media. Example: "/media/work/ptra.webp" */
  image?: string;
  /** Mobile still of the same live site. Example: "/media/work/ptra-mobile.webp" */
  imageMobile?: string;
  /** Muted phone-frame scroll film. Example: "/media/work/ptra-scroll.mp4" */
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
 *   imageMobile: "/media/work/ptra-mobile.webp",
 *   title: "Stredoveký festival Stropkov",
 *   categories: ["festival"],
 *   href: "https://ptra.sk/",
 * }
 */
export const WORK: WorkItem[] = [
  {
    id: "lile-lentilka",
    image: "/media/work/lile-lentilka.webp",
    imageMobile: "/media/work/lile-lentilka-mobile.webp",
    video: "/media/work/lile-lentilka-scroll.mp4",
    title: "LiLiLentilka",
    line: {
      sk: "E-shop pre hudbu plnú farieb a lentiliek.",
      en: "A shop for music full of colour and lentil sweets.",
      de: "Ein Shop für Musik voller Farbe und Lentilkas.",
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
    imageMobile: "/media/work/ptra-mobile.webp",
    video: "/media/work/ptra-scroll.mp4",
    title: {
      sk: "Stredoveký festival Stropkov",
      en: "Medieval festival Stropkov",
      de: "Mittelalterfestival Stropkov",
    },
    line: {
      sk: "Web stredovekého festivalu v Stropkove.",
      en: "A site for the medieval festival in Stropkov.",
      de: "Website für das Mittelalterfestival in Stropkov.",
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
    imageMobile: "/media/work/malovanienatvar2-mobile.webp",
    video: "/media/work/malovanie-scroll.mp4",
    title: {
      sk: "Maľovanie na tvár",
      en: "Face painting",
      de: "Kinderschminken",
    },
    line: {
      sk: "Stránka, z ktorej si rezervujú maľovanie na tvár.",
      en: "A page people use to book face painting.",
      de: "Eine Seite, über die man Kinderschminken bucht.",
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

/** Owner photo examples. Empty until media is added — the UI shows nothing. */
export const PHOTO_EXAMPLES: WorkItem[] = [];

/** Owner video examples. Empty until media is added — the UI shows nothing. */
export const VIDEO_EXAMPLES: WorkItem[] = [];

/** Owner drone examples. Empty until media is added — the UI shows nothing. */
export const DRONE_EXAMPLES: WorkItem[] = [];

/** Owner branding examples. Empty until media is added — the UI shows nothing. */
export const BRAND_EXAMPLES: WorkItem[] = [];

export const HAS_WORK = WORK.length > 0;

export function examplesWithMedia(items: readonly WorkItem[]): WorkItem[] {
  return items.filter((item) => Boolean(item.image || item.video));
}

export const WORK_INDEX = new Map(WORK.map((item, index) => [item.id, index]));

export function workIndex(item: WorkItem): number {
  return WORK_INDEX.get(item.id) ?? 0;
}

export function workText(value: WorkCopy | undefined, lang: Lang, fallback = ""): string {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") return value;
  return value[lang] || value.sk || fallback;
}

/** Decode live-site stills before the Weby panel opens so height does not jump. */
export function preloadWorkShots() {
  if (typeof window === "undefined") return;
  for (const item of WORK) {
    for (const src of [workSrc(item.image), workSrc(item.imageMobile)]) {
      if (!src) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    }
  }
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
  const value = pack[CAT_DICT[cat]];
  return typeof value === "string" ? value : value[0] ?? "";
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

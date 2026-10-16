import type { Dict, Lang } from "@/lib/i18n";

export type WorkLayout = "feature" | "pair";

/** String for every language, or a SK/EN/DE map (falls back to SK). */
export type WorkCopy = string | { sk: string; en?: string; de?: string };

export type WorkItem = {
  id: string;
  /** Still in /media. Example: "/media/cafe.webp" */
  image?: string;
  /** Optional muted hover film, or the tile media when there is no still. */
  video?: string;
  title: WorkCopy;
  line?: WorkCopy;
  alt?: WorkCopy;
  /** "foto" | "video" | "web", or an array. Shown as tags. */
  category?: string | string[];
  href?: string;
  /** feature = full-width tall tile. pair = two consecutive pair items sit side by side. */
  layout?: WorkLayout;
};

/**
 * Owner photos only. Leave this array empty and the Work section stays on the
 * page with one invite line (no empty tiles, no “coming soon” grid).
 *
 * Add a still:
 *   1. Drop the file in media/  (e.g. media/cafe.webp)
 *   2. Push one object onto WORK
 *   3. cd web && npm run build:pages
 *
 * {
 *   id: "cafe",
 *   image: "/media/cafe.webp",
 *   title: "Café Ruža",
 *   category: "foto",
 * }
 *
 * Optional: video, line, alt, href, layout ("feature" | "pair").
 * title / line / alt may be a string (all languages) or { sk, en, de }.
 */
export const WORK: WorkItem[] = [];

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

export function workCategories(item: WorkItem): string[] {
  if (!item.category) return [];
  return (Array.isArray(item.category) ? item.category : [item.category])
    .map((entry) => String(entry).trim())
    .filter(Boolean);
}

const CAT_KEY: Record<string, keyof Dict> = {
  foto: "tagFoto",
  photo: "tagFoto",
  video: "tagVideo",
  web: "tagWeb",
};

export function workTags(item: WorkItem, pack: Dict): string[] {
  return workCategories(item).map((entry) => {
    const key = CAT_KEY[entry.toLowerCase()];
    return key ? pack[key] : entry;
  });
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

export const WORK_ROWS: WorkItem[][] = groupWorkRows(WORK);

export function workSilver(index: number): "a" | "b" | "c" {
  return (["a", "b", "c"] as const)[index % 3];
}

export type WorkKind = "image" | "video" | "silver";
export type WorkLayout = "feature" | "pair";

export type WorkItem = {
  id: string;
  kind: WorkKind;
  layout: WorkLayout;
  image: string;
  video: string;
  href: string;
  titleKey: string;
  lineKey: string;
  tags: string[];
  altKey: string;
  silver: "a" | "b" | "c";
};

/**
 * Owner photos only. Leave empty to hide the Work section and its nav link.
 * How to add stills: see README.md (“Work / photos”).
 *
 * Example once a real file exists in media/:
 * {
 *   id: "everlight",
 *   kind: "image",
 *   layout: "feature",
 *   image: "./media/everlight.webp",
 *   video: "",
 *   href: "https://thedesigns.org/foto/",
 *   titleKey: "wEverTitle",
 *   lineKey: "wEverLine",
 *   tags: ["tagFoto", "tagVideo"],
 *   altKey: "w5alt",
 *   silver: "c",
 * }
 */
export const WORK: WorkItem[] = [];

/** True when there is at least one owner still to show. */
export const SHOW_WORK = WORK.length > 0;

export const WORK_INDEX = new Map(WORK.map((item, index) => [item.id, index]));

export function workIndex(item: WorkItem): number {
  return WORK_INDEX.get(item.id) ?? 0;
}

export const WORK_ROWS: WorkItem[][] = (() => {
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
  return rows;
})();

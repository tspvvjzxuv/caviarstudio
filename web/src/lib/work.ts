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

export const WORK: WorkItem[] = [
  {
    id: "editorial",
    kind: "image",
    layout: "feature",
    image: "./media/editorial.webp",
    video: "",
    href: "",
    titleKey: "wEditorialTitle",
    lineKey: "wEditorialLine",
    tags: ["tagFoto"],
    altKey: "w1alt",
    silver: "a",
  },
  {
    id: "metal",
    kind: "image",
    layout: "pair",
    image: "./media/metal.webp",
    video: "",
    href: "",
    titleKey: "wMetalTitle",
    lineKey: "wMetalLine",
    tags: ["tagFoto"],
    altKey: "w2alt",
    silver: "c",
  },
  {
    id: "soon",
    kind: "silver",
    layout: "pair",
    image: "",
    video: "",
    href: "",
    titleKey: "wSoonTitle",
    lineKey: "wSoonLine",
    tags: ["tagSoon"],
    altKey: "soonAria",
    silver: "a",
  },
  {
    id: "motion",
    kind: "image",
    layout: "feature",
    image: "./media/motion.webp",
    video: "",
    href: "",
    titleKey: "wLightTitle",
    lineKey: "wLightLine",
    tags: ["tagVideo"],
    altKey: "w4alt",
    silver: "b",
  },
  {
    id: "everlight",
    kind: "image",
    layout: "pair",
    image: "./media/everlight.webp",
    video: "",
    href: "https://thedesigns.org/foto/",
    titleKey: "wEverTitle",
    lineKey: "wEverLine",
    tags: ["tagFoto", "tagVideo"],
    altKey: "w5alt",
    silver: "c",
  },
  {
    id: "folio",
    kind: "silver",
    layout: "pair",
    image: "",
    video: "",
    href: "",
    titleKey: "wFolioTitle",
    lineKey: "wFolioLine",
    tags: ["tagSoon"],
    altKey: "soonAria",
    silver: "b",
  },
];

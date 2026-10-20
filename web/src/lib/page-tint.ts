/** Page-field tints: near-black mixes, pearl/steel stay WCAG AA. */
export const PAGE_TINT = {
  hero: "#070708",
  services: "#0B1220",
  pricing: "#0C171C",
  contact: "#12151A",
  team: "#13101A",
  faq: "#0A0F16",
  footer: "#070708",
} as const;

export type PageTint = (typeof PAGE_TINT)[keyof typeof PAGE_TINT];

const HERO_V = "opt1";

export const HERO_LOOP = {
  poster: `/media/hero/liquid-chrome.jpg?v=${HERO_V}`,
  av1: `/media/hero/liquid-chrome.webm?v=${HERO_V}`,
  av1Mobile: `/media/hero/liquid-chrome-720.webm?v=${HERO_V}`,
  hevc: `/media/hero/liquid-chrome.hevc.mp4?v=${HERO_V}`,
  hevcMobile: `/media/hero/liquid-chrome-720.hevc.mp4?v=${HERO_V}`,
  mp4: `/media/hero/liquid-chrome.mp4?v=${HERO_V}`,
  mp4Mobile: `/media/hero/liquid-chrome-720.mp4?v=${HERO_V}`,
} as const;

export const CAVIAR = {
  PHONE: "+421905173086",
  WHATSAPP: "421905173086",
  WHATSAPP_TEXT: "Dobrý deň, mám záujem o cenovú ponuku od Caviar.",
  EMAIL: "mircoft.sk@gmail.com",
  INSTAGRAM: "https://www.instagram.com/caviarstudio.sk/",
  IG_HANDLE: "/caviarstudio.sk",
  HUB: "https://thedesigns.org/",
  EVERLIGHT: "https://thedesigns.org/foto/",
  SITE: "https://caviarstudio.sk/",
  prices: {
    fotoMini: { launch: 79 },
    videoReel: { launch: 59 },
    droneFoto: { launch: 89 },
    droneVideo: { launch: 129 },
    droneCombo: { launch: 179 },
    webOnePager: { launch: 219 },
    eshop: { launch: 590, monthly: 19 },
    komplet: { launch: 379 },
    brandStart: { launch: 249 },
    brandKomplet: { launch: 490 },
    brandRebrand: { launch: 349 },
  },
  monthly: {
    socialStart: { monthly: 249 },
    socialPlus: { monthly: 449 },
    marketingKomplet: { monthly: 690 },
  },
} as const;

export const OG_LOCALES = { sk: "sk_SK", en: "en_US", de: "de_DE" } as const;

export const PRICE_RANGE = (() => {
  const amounts = [
    ...Object.values(CAVIAR.prices).map((pack) => pack.launch),
    ...Object.values(CAVIAR.monthly).map((pack) => pack.monthly),
  ];
  return { min: Math.min(...amounts), max: Math.max(...amounts) };
})();

export function monthlyOffer(name: string, price: number) {
  return {
    "@type": "Offer",
    name,
    price: String(price),
    priceCurrency: "EUR",
    valueAddedTaxIncluded: true,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: String(price),
      priceCurrency: "EUR",
      valueAddedTaxIncluded: true,
      unitText: "MONTH",
    },
  };
}

export function formatPhone(raw: string) {
  const d = String(raw).replace(/[^\d+]/g, "");
  if (d.startsWith("+421") && d.length === 13) {
    return `+421 ${d.slice(4, 7)} ${d.slice(7, 10)} ${d.slice(10)}`;
  }
  return raw;
}

export function waHref(text: string) {
  return `https://wa.me/${CAVIAR.WHATSAPP}?text=${encodeURIComponent(text)}`;
}

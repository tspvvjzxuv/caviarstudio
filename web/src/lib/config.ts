export const HERO_LOOP = {
  poster: "/media/hero/liquid-chrome.jpg",
  webm: "/media/hero/liquid-chrome.webm",
  mp4: "/media/hero/liquid-chrome.mp4",
} as const;

export const CAVIAR = {
  PHONE: "+421905173086",
  WHATSAPP: "421905173086",
  WHATSAPP_TEXT: "Dobrý deň, mám záujem o cenovú ponuku od Caviar.",
  EMAIL: "mircoft.sk@gmail.com",
  INSTAGRAM: "https://www.instagram.com/mircoft",
  HUB: "https://thedesigns.org/",
  EVERLIGHT: "https://thedesigns.org/foto/",
  SITE: "https://caviarstudio.sk/",
  prices: {
    fotoMini: { launch: 49, standard: 120 },
    videoReel: { launch: 69, standard: 180 },
    webOnePager: { launch: 190, standard: 490 },
    komplet: { launch: 349, standard: 890 },
  },
} as const;

export const OG_LOCALES = { sk: "sk_SK", en: "en_US", de: "de_DE" } as const;

export const PRICE_RANGE = (() => {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const pack of Object.values(CAVIAR.prices)) {
    const launch = pack.launch;
    if (launch < min) min = launch;
    if (launch > max) max = launch;
  }
  return { min, max };
})();

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

import { createContext, startTransition, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CAVIAR, OG_LOCALES, PRICE_RANGE, monthlyOffer } from "@/lib/config";
import { dictionary, FAQ_KEYS, isLang, type Dict, type Lang } from "@/lib/i18n";

const LANG_STORAGE_KEY = "td-weby-lang:v1";
const LANG_STORAGE_LEGACY = "td-weby-lang";
const langStorageCache = new Map<string, string | null>();

function readStorage(key: string): string | null {
  if (langStorageCache.has(key)) return langStorageCache.get(key) ?? null;
  try {
    const value = localStorage.getItem(key);
    langStorageCache.set(key, value);
    return value;
  } catch {
    langStorageCache.set(key, null);
    return null;
  }
}

function writeStorage(key: string, value: string) {
  langStorageCache.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore quota / private mode */
  }
}

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "sk";
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (isLang(fromUrl)) return fromUrl;
  const saved = readStorage(LANG_STORAGE_KEY);
  if (isLang(saved)) return saved;
  const legacy = readStorage(LANG_STORAGE_LEGACY);
  if (isLang(legacy)) {
    writeStorage(LANG_STORAGE_KEY, legacy);
    try {
      localStorage.removeItem(LANG_STORAGE_LEGACY);
      langStorageCache.delete(LANG_STORAGE_LEGACY);
    } catch {
      /* ignore */
    }
    return legacy;
  }
  return "sk";
}

function applyDocumentMeta(lang: Lang, pack: Dict) {
  document.documentElement.lang = lang;
  document.title = pack.docTitle;
  const set = (selector: string, value: string, attr = "content") => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  };
  set('meta[name="description"]', pack.docDesc);
  set('meta[property="og:title"]', pack.docTitle);
  set('meta[property="og:description"]', pack.docDesc);
  set('meta[property="og:locale"]', OG_LOCALES[lang]);
  set('meta[property="og:image:alt"]', pack.heroAlt);
  set('meta[name="twitter:title"]', pack.docTitle);
  set('meta[name="twitter:description"]', pack.docDesc);
  set('meta[name="twitter:image:alt"]', pack.heroAlt);

  const ld = document.getElementById("caviar-jsonld");
  if (ld) {
    try {
      const data = JSON.parse(ld.textContent || "{}") as Record<string, unknown>;
      const names: Record<string, string> = {
        fotoMini: pack.pFotoName,
        videoReel: pack.pVideoName,
        droneFoto: pack.pDronFotoName,
        droneVideo: pack.pDronVideoName,
        droneCombo: pack.pDronComboName,
        webOnePager: pack.pWebName,
        eshop: pack.pEshopName,
        komplet: pack.pKompletName,
      };
      const monthlyNames: Record<string, string> = {
        socialStart: pack.pMktStartName,
        socialPlus: pack.pMktPlusName,
        marketingKomplet: pack.pMktKompletName,
      };
      data.makesOffer = [
        ...Object.entries(CAVIAR.prices).map(([key, p]) => ({
          "@type": "Offer",
          name: names[key] || key,
          price: String(p.launch),
          priceCurrency: "EUR",
          valueAddedTaxIncluded: true,
        })),
        ...Object.entries(CAVIAR.monthly).map(([key, p]) =>
          monthlyOffer(monthlyNames[key] || key, p.monthly),
        ),
      ];
      data.priceRange = `€${PRICE_RANGE.min}–€${PRICE_RANGE.max}`;
      data.description = pack.docDesc;
      ld.textContent = JSON.stringify(data);
    } catch {
      /* ignore */
    }
  }

  let faqLd = document.getElementById("caviar-faq-jsonld");
  if (!faqLd) {
    faqLd = document.createElement("script");
    faqLd.id = "caviar-faq-jsonld";
    (faqLd as HTMLScriptElement).type = "application/ld+json";
    document.head.appendChild(faqLd);
  }
  faqLd.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_KEYS.map(([q, a]) => ({
      "@type": "Question",
      name: pack[q],
      acceptedAnswer: { "@type": "Answer", text: pack[a] },
    })),
  });
}

type LanguageContextValue = {
  lang: Lang;
  t: Dict;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);
  const t = dictionary[lang];

  const setLang = useCallback((next: Lang) => {
    const apply = () => {
      setLangState(next);
      writeStorage(LANG_STORAGE_KEY, next);
      const url = new URL(window.location.href);
      if (url.searchParams.get("lang") !== next) {
        url.searchParams.set("lang", next);
        history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) apply();
    else startTransition(apply);
  }, []);

  useEffect(() => {
    applyDocumentMeta(lang, dictionary[lang]);
  }, [lang]);

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);
  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage() {
  const ctx = use(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CAVIAR, OG_LOCALES, PRICE_RANGE } from "@/lib/config";
import { dictionary, isLang, type Dict, type Lang } from "@/lib/i18n";

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
  set('meta[name="twitter:title"]', pack.docTitle);
  set('meta[name="twitter:description"]', pack.docDesc);

  const ld = document.getElementById("caviar-jsonld");
  if (ld) {
    try {
      const data = JSON.parse(ld.textContent || "{}") as Record<string, unknown>;
      const names: Record<string, string> = {
        fotoMini: "Foto Mini",
        videoReel: "Video Reel",
        webOnePager: "Web Jednostránka",
        komplet: "Caviar Komplet",
      };
      data.makesOffer = Object.entries(CAVIAR.prices).map(([key, p]) => ({
        "@type": "Offer",
        name: names[key] || key,
        price: String(p.launch),
        priceCurrency: "EUR",
        valueAddedTaxIncluded: !!CAVIAR.VAT_PAYER,
      }));
      data.priceRange = `€${PRICE_RANGE.min}–€${PRICE_RANGE.max}`;
      data.description = pack.docDesc;
      ld.textContent = JSON.stringify(data);
    } catch {
      /* ignore */
    }
  }
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
    setLangState(next);
    writeStorage(LANG_STORAGE_KEY, next);
    const url = new URL(window.location.href);
    if (url.searchParams.get("lang") !== next) {
      url.searchParams.set("lang", next);
      history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
  }, []);

  useEffect(() => {
    applyDocumentMeta(lang, dictionary[lang]);
  }, [lang]);

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

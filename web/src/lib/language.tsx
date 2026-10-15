import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CAVIAR, OG_LOCALES } from "@/lib/config";
import { dictionary, isLang, type Dict, type Lang } from "@/lib/i18n";

const STORAGE_KEY = "td-weby-lang";

type LanguageContextValue = {
  lang: Lang;
  t: Dict;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "sk";
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (isLang(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* ignore */
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
      const amounts = Object.values(CAVIAR.prices).map((p) => p.launch);
      data.makesOffer = Object.entries(CAVIAR.prices).map(([key, p]) => ({
        "@type": "Offer",
        name: names[key] || key,
        price: String(p.launch),
        priceCurrency: "EUR",
        valueAddedTaxIncluded: !!CAVIAR.VAT_PAYER,
      }));
      data.priceRange = `€${Math.min(...amounts)}–€${Math.max(...amounts)}`;
      data.description = pack.docDesc;
      ld.textContent = JSON.stringify(data);
    } catch {
      /* ignore */
    }
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);
  const t = dictionary[lang];

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
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

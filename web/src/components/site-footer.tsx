import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CAVIAR, formatPhone } from "@/lib/config";
import { isLang, LANGS, type Lang } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";

const LANG_NAME: Record<Lang, "langSk" | "langEn" | "langDe"> = {
  sk: "langSk",
  en: "langEn",
  de: "langDe",
};

export function SiteFooter() {
  const { t, lang, setLang } = useLanguage();
  return (
    <footer className="px-[clamp(1.25rem,5vw,5rem)] pt-8 pb-[max(3rem,env(safe-area-inset-bottom,0px))] [view-transition-name:site-footer]">
      <Separator className="mb-8 bg-[image:var(--hair)]" />
      <div className="flex flex-wrap items-start justify-between gap-8">
        <div className="grid gap-2 text-[0.82rem] leading-6 text-muted-foreground">
          <strong className="font-serif text-[0.95rem] font-normal tracking-[0.38em] text-foreground uppercase">
            Caviar
          </strong>
          <p className="text-[0.72rem] tracking-[0.14em] uppercase">{t.place}</p>
          <a href={`mailto:${CAVIAR.EMAIL}`} className="hover:text-azure">
            {CAVIAR.EMAIL}
          </a>
          <a href={`tel:${CAVIAR.PHONE}`} className="hover:text-azure">
            {formatPhone(CAVIAR.PHONE)}
          </a>
          <a
            href={CAVIAR.INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-azure"
            aria-label={`Instagram ${CAVIAR.IG_HANDLE}`}
          >
            {CAVIAR.IG_HANDLE}
          </a>
        </div>
        <a
          href={CAVIAR.HUB}
          className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase hover:text-azure"
        >
          {t.navHub}
        </a>
        <Tabs
          value={lang}
          onValueChange={(v) => {
            if (isLang(v)) setLang(v);
          }}
          className="gap-0"
        >
          <TabsList variant="line" className="rounded-[2px] p-0" aria-label={t.langLabel}>
            {LANGS.map((code) => (
              <TabsTrigger
                key={code}
                value={code}
                aria-label={t[LANG_NAME[code]]}
                className="rounded-[2px] text-[0.68rem] tracking-[0.16em] uppercase"
              >
                {code.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </footer>
  );
}

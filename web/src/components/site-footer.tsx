import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CAVIAR, formatPhone } from "@/lib/config";
import { isLang, LANGS } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";

export function SiteFooter() {
  const { t, lang, setLang } = useLanguage();
  return (
    <footer className="px-[clamp(1.25rem,5vw,5rem)] pt-8 pb-12 [view-transition-name:site-footer]">
      <Separator className="mb-8" />
      <div className="flex flex-wrap items-start justify-between gap-5 text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">
        <div className="max-w-xl leading-6 normal-case tracking-normal">
          <strong className="font-medium tracking-[0.14em] uppercase">Caviar</strong>
          {" · "}
          <a href={`mailto:${CAVIAR.EMAIL}`} className="hover:text-foreground">
            {CAVIAR.EMAIL}
          </a>
          {" · "}
          <a href={`tel:${CAVIAR.PHONE}`} className="hover:text-foreground">
            {formatPhone(CAVIAR.PHONE)}
          </a>
          {" · "}
          <a href={CAVIAR.INSTAGRAM} target="_blank" rel="noopener" className="hover:text-foreground">
            Instagram
          </a>
          {" · "}
          {t.place}
        </div>
        <a href={CAVIAR.HUB} className="hover:text-foreground">
          {t.navHub}
        </a>
        <Tabs
          value={lang}
          onValueChange={(v) => {
            if (isLang(v)) setLang(v);
          }}
          className="gap-0"
        >
          <TabsList variant="line" className="rounded-[2px] p-0">
            {LANGS.map((code) => (
              <TabsTrigger
                key={code}
                value={code}
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

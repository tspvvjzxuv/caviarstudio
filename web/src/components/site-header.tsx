import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isLang, LANGS, type Lang } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#sluzby", key: "navServices" as const },
  { href: "#cennik", key: "navPricing" as const },
  { href: "#praca", key: "navWork" as const },
  { href: "#faq", key: "navFaq" as const },
  { href: "#kontakt", key: "navContact" as const },
];

const LANG_NAME: Record<Lang, "langSk" | "langEn" | "langDe"> = {
  sk: "langSk",
  en: "langEn",
  de: "langDe",
};

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <ToggleGroup
      type="single"
      value={lang}
      onValueChange={(v) => {
        if (isLang(v)) setLang(v);
      }}
      spacing={0}
      size="sm"
      variant="outline"
      className={cn("rounded-[2px] border border-border", className)}
      aria-label={t.langLabel}
    >
      {LANGS.map((code) => (
        <ToggleGroupItem
          key={code}
          value={code}
          aria-label={t[LANG_NAME[code]]}
          className="h-8 rounded-none px-2.5 text-[0.68rem] tracking-[0.16em] uppercase data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {code}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function SiteHeader() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = window.scrollY > 8;
        setScrolled((prev) => (prev === next ? prev : next));
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-[var(--header-h)] items-center justify-between gap-4 px-[clamp(1.25rem,5vw,5rem)] pt-[env(safe-area-inset-top,0px)] [view-transition-name:site-header]",
        scrolled ? "border-b border-border bg-background/88 backdrop-blur-[18px]" : "border-b border-transparent bg-background/34 backdrop-blur-[18px]",
      )}
    >
      <a href="#top" className="relative z-[52] font-serif text-[0.95rem] tracking-[0.38em] uppercase">
        Caviar
      </a>

      <NavigationMenu viewport={false} className="hidden max-w-none min-w-0 flex-1 lg:flex" aria-label={t.navLabel}>
        <NavigationMenuList className="gap-1">
          {NAV.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                href={item.href}
                className="rounded-[2px] px-3 py-1.5 text-[0.72rem] tracking-[0.16em] text-silver uppercase hover:bg-transparent hover:text-foreground"
              >
                {t[item.key]}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center gap-3">
        <LangSwitch className="hidden sm:inline-flex" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild className="metal-fill hidden h-10 shrink-0 rounded-[2px] px-5 text-[0.72rem] tracking-[0.16em] uppercase lg:inline-flex">
              <a href="#kontakt">{t.ctaQuote}</a>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t.contactTitle}</TooltipContent>
        </Tooltip>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="h-10 rounded-[2px] tracking-[0.16em] uppercase lg:hidden"
              aria-expanded={open}
            >
              {open ? t.close : t.menu}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="top"
            className="h-dvh gap-0 border-0 bg-background p-[clamp(1.25rem,5vw,5rem)] pt-[max(6rem,calc(5.5rem+env(safe-area-inset-top,0px)))]"
            showCloseButton={false}
          >
            <SheetHeader className="p-0">
              <SheetTitle className="font-serif text-sm tracking-[0.38em] uppercase">Caviar</SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-1" aria-label={t.navLabel}>
              {NAV.map((item) => (
                <SheetClose asChild key={item.href}>
                  <a
                    href={item.href}
                    className="font-serif text-[clamp(2.2rem,9vw,3.2rem)] leading-[1.15] tracking-[-0.02em]"
                  >
                    {t[item.key]}
                  </a>
                </SheetClose>
              ))}
            </nav>
            <Separator className="my-8" />
            <LangSwitch />
            <SheetClose asChild>
              <Button asChild className="metal-fill mt-6 h-[52px] w-full rounded-[2px] text-[0.72rem] tracking-[0.16em] uppercase">
                <a href="#kontakt">{t.ctaQuote}</a>
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

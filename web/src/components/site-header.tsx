import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
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
import { Menu, X } from "lucide-react";
import { CaviarLogo } from "@/components/caviar-logo";
import { isLang, LANGS, type Lang } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#sluzby", key: "navServices" as const },
  { href: "#cennik", key: "navPricing" as const },
  { href: "#kontakt", key: "navContact" as const },
  { href: "#faq", key: "navFaq" as const },
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
      variant="default"
      className={cn("lang-switch", className)}
      aria-label={t.langLabel}
    >
      {LANGS.map((code) => (
        <ToggleGroupItem
          key={code}
          value={code}
          aria-label={t[LANG_NAME[code]]}
          className="lang-switch-item rounded-none!"
        >
          {code}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function SiteHeader() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <header className="glass fixed z-50 flex items-center justify-between gap-3 border-0 px-5 shadow-none [view-transition-name:site-header]">
      <a href="#top" className="relative z-[52]" aria-label="Caviar">
        <CaviarLogo className="text-[1.05rem] sm:text-[1.15rem]" />
      </a>

      <NavigationMenu viewport={false} className="hidden max-w-none min-w-0 flex-1 lg:flex" aria-label={t.navLabel}>
        <NavigationMenuList className="gap-1">
          {NAV.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                href={item.href}
                className="rounded-full px-3 py-1.5 text-[0.72rem] tracking-[0.16em] text-silver uppercase transition-colors duration-150 ease-out hover:bg-transparent hover:text-azure active:text-azure"
              >
                {t[item.key]}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center gap-3">
        <LangSwitch />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild data-magnetic="" className="metal-fill hidden h-10 shrink-0 rounded-full px-5 text-[0.72rem] tracking-[0.16em] uppercase lg:inline-flex">
              <a href="#kontakt">{t.ctaQuote}</a>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t.contactTitle}</TooltipContent>
        </Tooltip>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              data-nav-toggle=""
              className="nav-bean inline-flex size-11 items-center justify-center border border-pearl/14 bg-white/10 text-pearl shadow-none hover:bg-white/14 hover:text-pearl lg:hidden"
              aria-expanded={open}
              aria-label={open ? t.close : t.menu}
            >
              {open ? <X className="size-4" strokeWidth={1.5} /> : <Menu className="size-4" strokeWidth={1.5} />}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="top"
            className="nav-sheet gap-0 opacity-100"
            showCloseButton={false}
          >
            <SheetHeader className="sr-only p-0">
              <SheetTitle>{t.navLabel}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1" aria-label={t.navLabel}>
              {NAV.map((item) => (
                <SheetClose asChild key={item.href}>
                  <a href={item.href} className="nav-sheet-link">
                    {t[item.key]}
                  </a>
                </SheetClose>
              ))}
            </nav>
            <SheetClose asChild>
              <Button asChild data-magnetic="" className="metal-fill mt-5 h-[52px] w-full rounded-full px-8 text-[0.72rem] tracking-[0.16em] uppercase">
                <a href="#kontakt">{t.ctaQuote}</a>
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

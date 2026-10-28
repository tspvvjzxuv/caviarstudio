import { useState } from "react";
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
      variant="outline"
      className={cn("glass rounded-full border-0", className)}
      aria-label={t.langLabel}
    >
      {LANGS.map((code) => (
        <ToggleGroupItem
          key={code}
          value={code}
          aria-label={t[LANG_NAME[code]]}
          data-magnetic=""
          className="h-8 rounded-full border-y-0! px-2.5 text-[0.68rem] tracking-[0.16em] uppercase first:border-l-0! last:border-r-0! data-[state=on]:border-transparent data-[state=on]:bg-azure-deep data-[state=on]:text-pearl"
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
    <header className="glass fixed inset-x-0 top-0 z-50 flex h-[var(--header-h)] items-center justify-between gap-4 border-0 px-[clamp(1.25rem,5vw,5rem)] pt-[env(safe-area-inset-top,0px)] shadow-none [view-transition-name:site-header]">
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
              className="inline-flex size-11 items-center justify-center rounded-full border border-pearl/12 bg-[rgb(14_14_18/0.72)] text-pearl shadow-none backdrop-blur-xl hover:bg-elev hover:text-pearl lg:hidden"
              aria-expanded={open}
              aria-label={open ? t.close : t.menu}
            >
              {open ? <X className="size-4" strokeWidth={1.75} /> : <Menu className="size-4" strokeWidth={1.75} />}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="top"
            className="inset-0 z-[60] h-dvh min-h-dvh gap-0 border-0 bg-[rgb(7_7_8/0.96)] p-[clamp(1.25rem,5vw,5rem)] pt-[max(6rem,calc(5.5rem+env(safe-area-inset-top,0px)))] opacity-100 data-[side=top]:h-dvh md:items-end"
            showCloseButton={false}
          >
            <SheetHeader className="p-0 md:items-end md:text-right">
              <SheetTitle className="font-serif text-sm md:text-right">
                <CaviarLogo className="text-[1.2rem]" />
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-1 md:items-end md:text-right" aria-label={t.navLabel}>
              {NAV.map((item) => (
                <SheetClose asChild key={item.href}>
                  <a
                    href={item.href}
                    className="font-serif text-[clamp(2.2rem,9vw,3.2rem)] leading-[1.15] tracking-[-0.02em] hover:text-azure"
                  >
                    {t[item.key]}
                  </a>
                </SheetClose>
              ))}
            </nav>
            <Separator className="my-8 w-full" />
            <LangSwitch className="md:self-end" />
            <SheetClose asChild>
              <Button asChild data-magnetic="" className="metal-fill mt-6 h-[52px] w-full rounded-full px-8 text-[0.72rem] tracking-[0.16em] uppercase md:w-auto md:self-end">
                <a href="#kontakt">{t.ctaQuote}</a>
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

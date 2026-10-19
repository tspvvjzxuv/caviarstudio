import { useEffect, ViewTransition } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CustomCursor, Grain, IntroVeil } from "@/components/motion";
import {
  Contact,
  Faq,
  Hero,
  Pricing,
  Services,
  Team,
} from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LanguageProvider, useLanguage } from "@/lib/language";

function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#obsah"
      className="sr-only focus:not-sr-only focus:fixed focus:top-[max(0.75rem,env(safe-area-inset-top,0px))] focus:left-[max(1.25rem,env(safe-area-inset-left,0px))] focus:z-50 focus:bg-pearl focus:px-4 focus:py-2.5 focus:text-[0.8rem] focus:tracking-[0.08em] focus:text-background focus:uppercase focus:ring-3 focus:ring-ring"
    >
      {t.skip}
    </a>
  );
}

let didHonorHash = false;

function Page() {
  useEffect(() => {
    if (didHonorHash) return;
    didHonorHash = true;
    const id = location.hash.replace("#", "");
    if (!id) return;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 50);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <Grain />
      <IntroVeil />
      <CustomCursor />
      <SkipLink />
      <SiteHeader />
      <main id="obsah">
        <ViewTransition>
          <>
            <Hero />
            <Services />
            <Pricing />
            <Contact />
            <Team />
            <Faq />
          </>
        </ViewTransition>
      </main>
      <SiteFooter />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <TooltipProvider delayDuration={200}>
        <Page />
      </TooltipProvider>
    </LanguageProvider>
  );
}

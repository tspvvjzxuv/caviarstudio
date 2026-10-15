import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CustomCursor, Grain, IntroVeil } from "@/components/motion";
import {
  Contact,
  Faq,
  Hero,
  Pricing,
  Process,
  Services,
  Team,
  Work,
} from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LanguageProvider, useLanguage } from "@/lib/language";

function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#obsah"
      className="absolute top-[-80px] left-[clamp(1.25rem,5vw,5rem)] z-[100] bg-pearl px-4 py-2.5 text-[0.8rem] tracking-[0.08em] text-background uppercase focus:top-3"
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
        <Hero />
        <Services />
        <Pricing />
        <Process />
        <Work />
        <Team />
        <Faq />
        <Contact />
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

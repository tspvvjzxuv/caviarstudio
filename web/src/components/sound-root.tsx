import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { isSoundMuted, playUiSound, setSoundMuted, unlockSound } from "@/lib/sound";

type SoundContextValue = {
  muted: boolean;
  setMuted: (next: boolean) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundRoot({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState(isSoundMuted);

  const setMuted = useCallback((next: boolean) => {
    setSoundMuted(next);
    setMutedState(next);
  }, []);

  useEffect(() => {
    const unlock = () => {
      void unlockSound();
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const el = event.target instanceof Element ? event.target.closest("a, button") : null;
      if (!(el instanceof HTMLElement)) return;
      if (el.closest("[data-sound-toggle]")) return;
      if (el.classList.contains("service-chrome")) {
        playUiSound(el.getAttribute("aria-expanded") === "true" ? "click" : "whoosh");
        return;
      }
      if (el.classList.contains("metal-fill")) playUiSound("click");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const value = useMemo(() => ({ muted, setMuted }), [muted, setMuted]);
  return <SoundContext value={value}>{children}</SoundContext>;
}

export function useSound() {
  const ctx = use(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundRoot");
  return ctx;
}

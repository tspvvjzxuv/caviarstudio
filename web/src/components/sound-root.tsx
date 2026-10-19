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
    const playCard = (target: EventTarget | null) => {
      const el = target instanceof Element ? target.closest("button.service-chrome") : null;
      if (!(el instanceof HTMLElement)) return;
      playUiSound(el.getAttribute("aria-expanded") === "true" ? "close" : "open");
    };
    const onPointerDown = (event: PointerEvent) => {
      playCard(event.target);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
      playCard(event.target);
    };
    const onClick = (event: MouseEvent) => {
      const el = event.target instanceof Element ? event.target.closest("a, button") : null;
      if (!(el instanceof HTMLElement)) return;
      if (el.closest("[data-sound-toggle]")) return;
      if (el.classList.contains("service-chrome")) return;
      if (el.classList.contains("metal-fill")) playUiSound("hit");
    };
    document.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    document.addEventListener("keydown", onKeyDown, { capture: true });
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, { capture: true });
      document.removeEventListener("keydown", onKeyDown, { capture: true });
      document.removeEventListener("click", onClick);
    };
  }, []);

  const value = useMemo(() => ({ muted, setMuted }), [muted, setMuted]);
  return <SoundContext value={value}>{children}</SoundContext>;
}

export function useSound() {
  const ctx = use(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundRoot");
  return ctx;
}

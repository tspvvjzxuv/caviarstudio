import { useEffect, type ReactNode } from "react";
import { playUiSound, setSoundMuted, unlockSound } from "@/lib/sound";

export function SoundRoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    setSoundMuted(false);
    const unlock = () => {
      void unlockSound();
    };
    window.addEventListener("pointerdown", unlock, { once: true, capture: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock, { capture: true });
      window.removeEventListener("keydown", unlock, { capture: true });
    };
  }, []);

  useEffect(() => {
    const playCard = (target: EventTarget | null) => {
      const el = target instanceof Element ? target.closest("button.service-chrome") : null;
      if (!(el instanceof HTMLElement)) return;
      playUiSound(el.getAttribute("aria-expanded") === "true" ? "close" : "open");
    };
    const playHit = (target: EventTarget | null) => {
      const el = target instanceof Element ? target.closest("a, button") : null;
      if (!(el instanceof HTMLElement)) return;
      if (el.classList.contains("service-chrome")) return;
      if (el.classList.contains("metal-fill")) playUiSound("hit");
    };
    const onPointerDown = (event: PointerEvent) => {
      playCard(event.target);
      playHit(event.target);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
      playCard(event.target);
      playHit(event.target);
    };
    document.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, { capture: true });
      document.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, []);

  return children;
}

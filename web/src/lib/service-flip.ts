import { Flip } from "@/lib/gsap";
import { CAVIAR_EASE, SERVICE_FLIP_TARGETS, flipDuration, prefersReducedMotion } from "@/lib/gsap-motion";

export function revealAfterOpen(trigger: HTMLElement | null, panel: HTMLElement) {
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const box = panel.getBoundingClientRect();
  if (mobile) {
    const card = (trigger?.closest(".service-card") as HTMLElement | null) || trigger;
    const cardBox = card?.getBoundingClientRect();
    const hidden = (cardBox && cardBox.top < 64) || box.bottom > window.innerHeight - 12;
    if (!hidden) return;
    card?.scrollIntoView({ block: "start", behavior: "auto" });
    return;
  }
  if (box.top < window.innerHeight - 48) return;
  panel.scrollIntoView({ block: "nearest", behavior: "auto" });
}

export function captureServiceFlip(deck: HTMLElement) {
  deck.classList.add("is-flipping");
  return Flip.getState(deck.querySelectorAll(SERVICE_FLIP_TARGETS));
}

export function settleServicePanels(deck: HTMLElement) {
  deck.querySelectorAll<HTMLElement>(".service-panel").forEach((panel) => {
    panel.style.gridTemplateRows = panel.classList.contains("is-open") ? "1fr" : "0fr";
  });
}

export function playServiceFlip(deck: HTMLElement, state: ReturnType<typeof Flip.getState>) {
  // useGSAP revertOnUpdate strips this; put it back before Flip.from
  deck.classList.add("is-flipping");
  const reduced = prefersReducedMotion();
  const desktop = window.matchMedia("(min-width: 768px)").matches;
  const duration = flipDuration(desktop, reduced);
  if (duration === 0) {
    settleServicePanels(deck);
    deck.classList.remove("is-flipping");
    return;
  }
  return Flip.from(state, {
    duration,
    ease: CAVIAR_EASE,
    nested: true,
    prune: true,
    scale: false,
    onComplete: () => {
      settleServicePanels(deck);
      deck.classList.remove("is-flipping");
      const panel = deck.querySelector<HTMLElement>(".service-panel.is-open");
      const trigger = deck.querySelector<HTMLElement>(".service-chrome.is-open");
      if (panel) revealAfterOpen(trigger, panel);
    },
  });
}

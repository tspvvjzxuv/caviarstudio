/** Pause/resume gate for Čo robíme liquid metal. */

export function metalShouldRun({
  hidden,
  onscreen,
  paused,
  tweening,
  phoneOpen,
}: {
  hidden: boolean;
  onscreen: boolean;
  paused: boolean;
  tweening: boolean;
  phoneOpen: boolean;
}) {
  return !hidden && onscreen && !paused && !tweening && !phoneOpen;
}

export function panelTweening(sec: ParentNode) {
  for (const panel of sec.querySelectorAll<HTMLElement>(".service-panel")) {
    const rows = panel.style.gridTemplateRows;
    if (rows && rows.endsWith("px")) return true;
  }
  return false;
}

export function anyCardOpen(sec: ParentNode) {
  return Boolean(sec.querySelector(".service-chrome.is-open, .service-chrome[aria-expanded='true']"));
}

export function chromeIsOpen(btn: Pick<HTMLElement, "classList" | "getAttribute">) {
  return btn.classList.contains("is-open") || btn.getAttribute("aria-expanded") === "true";
}

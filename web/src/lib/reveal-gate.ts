/** Shared scroll-reveal gate. Content stays visible; .in is a light enhance. */

export const REVEAL_IO: IntersectionObserverInit = {
  threshold: 0,
  rootMargin: "20% 0px",
};

export function isRevealVisible(rect: { top: number; bottom: number }, viewportHeight: number) {
  return rect.bottom > 0 && rect.top < viewportHeight;
}

export function syncVisibleReveals(
  nodes: ArrayLike<{
    classList: { contains(token: string): boolean; add(token: string): void };
    getBoundingClientRect(): { top: number; bottom: number };
  }>,
  viewportHeight: number,
) {
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    if (el.classList.contains("in")) continue;
    if (isRevealVisible(el.getBoundingClientRect(), viewportHeight)) el.classList.add("in");
  }
}

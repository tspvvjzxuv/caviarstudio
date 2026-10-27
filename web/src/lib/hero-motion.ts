/** Shared pause/resume gate for the hero video and 3D wordmark. */

export function heroShouldRun(hidden: boolean, onscreen: boolean) {
  return !hidden && onscreen;
}

export function rafNeedsKick(running: boolean, rafId: number) {
  return !running || rafId === 0;
}

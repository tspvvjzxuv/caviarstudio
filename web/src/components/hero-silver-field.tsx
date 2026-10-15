import { useEffect, useRef } from "react";

function canMountField() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
  if (!window.matchMedia("(min-width: 768px)").matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  return true;
}

export function HeroSilverField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canMountField()) return;
    let cancelled = false;
    let unmount = () => {};

    import("@/lib/hero-silver-field")
      .then(({ mountSilverField }) => {
        if (cancelled || !canvas.isConnected) return;
        unmount = mountSilverField(canvas);
      })
      .catch(() => {
        /* keep the still hero */
      });

    return () => {
      cancelled = true;
      unmount();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-silver pointer-events-none absolute inset-0 z-[1] hidden mix-blend-screen motion-ok:md:block"
      aria-hidden="true"
    />
  );
}

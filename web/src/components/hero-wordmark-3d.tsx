import { useEffect, useRef } from "react";

export function HeroWordmark3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let unmount = () => {};

    import("@/lib/hero-wordmark-3d")
      .then(({ mountHeroWordmark }) => {
        if (cancelled || !canvas.isConnected) return;
        unmount = mountHeroWordmark(canvas);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      unmount();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-wordmark-3d" aria-hidden="true" />;
}

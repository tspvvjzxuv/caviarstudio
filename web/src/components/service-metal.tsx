import { useEffect, useRef } from "react";

function preferFallback() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return Boolean(nav.connection?.saveData);
}

export function ServiceMetal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const sec = canvas?.closest(".service-sec") as HTMLElement | null;
    if (!canvas || !sec) return;

    if (preferFallback()) {
      sec.classList.add("is-metal-fallback");
      return;
    }

    let cancelled = false;
    let unmount = () => {};

    import("@/lib/service-metal")
      .then(({ mountServiceMetal }) => {
        if (cancelled || !canvas.isConnected) return;
        unmount = mountServiceMetal(canvas);
      })
      .catch(() => {
        sec.classList.add("is-metal-fallback");
      });

    return () => {
      cancelled = true;
      unmount();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="service-metal"
      aria-hidden="true"
    />
  );
}

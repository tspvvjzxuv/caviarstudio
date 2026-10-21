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
    let started = false;
    let unmount = () => {};
    let idleId = 0;

    const start = () => {
      if (started || cancelled) return;
      started = true;
      import("@/lib/service-metal")
        .then(({ mountServiceMetal }) => {
          if (cancelled || !canvas.isConnected) return;
          unmount = mountServiceMetal(canvas);
        })
        .catch(() => {
          sec.classList.add("is-metal-fallback");
        });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
      },
      { rootMargin: "280px 0px" },
    );
    io.observe(sec);

    const ric = window.requestIdleCallback ?? ((cb: IdleRequestCallback) => window.setTimeout(cb, 1) as unknown as number);
    idleId = ric(start, { timeout: 1800 });

    return () => {
      cancelled = true;
      io.disconnect();
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
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

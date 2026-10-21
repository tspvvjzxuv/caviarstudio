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
    let fallbackId = 0;

    const start = () => {
      if (started || cancelled) return;
      started = true;
      window.clearTimeout(fallbackId);
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
        if (!entry.isIntersecting) return;
        io.disconnect();
        start();
      },
      { rootMargin: "480px 0px" },
    );
    io.observe(sec);
    const rect = sec.getBoundingClientRect();
    if (rect.bottom > -80 && rect.top < window.innerHeight + 480) start();
    fallbackId = window.setTimeout(start, 800);

    return () => {
      cancelled = true;
      io.disconnect();
      window.clearTimeout(fallbackId);
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

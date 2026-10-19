import { useEffect, useLayoutEffect, useRef } from "react";
import { usePauseOffscreen } from "@/hooks/use-pause-offscreen";
import { WorkTile } from "@/components/work-tile";
import { examplesWithMedia, groupWorkRows, isTypographic, type WorkItem } from "@/lib/work";

function pauseTileVideo(video: HTMLVideoElement) {
  video.pause();
  try {
    video.currentTime = 0;
  } catch {
    /* ignore */
  }
}

export function WorkGallery({ items }: { items: readonly WorkItem[] }) {
  const visible = examplesWithMedia(items);
  const stage = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const shotRows = groupWorkRows(visible.filter((item) => !isTypographic(item)));
  usePauseOffscreen(rootRef);

  useLayoutEffect(() => {
    stage.current?.querySelectorAll<HTMLElement>(".project").forEach((el) => {
      el.classList.add("in");
    });
  }, [visible]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const root = stage.current;
    const section = rootRef.current;
    if (!root) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const projectFrom = (node: EventTarget | null) =>
      node instanceof Element ? (node.closest(".project") as HTMLElement | null) : null;
    const onEnterFilm = (e: PointerEvent) => {
      const p = projectFrom(e.target);
      if (!p || p === projectFrom(e.relatedTarget)) return;
      p.classList.add("is-playing");
      const vid = p.querySelector("video");
      if (vid) void vid.play().catch(() => {});
    };
    const onLeaveFilm = (e: PointerEvent) => {
      const p = projectFrom(e.target);
      if (!p || p === projectFrom(e.relatedTarget)) return;
      p.classList.remove("is-playing");
      if (!p.querySelector(".project-media img")) return;
      const vid = p.querySelector("video");
      if (vid) pauseTileVideo(vid);
    };
    const pauseAll = () => {
      root.querySelectorAll("video").forEach((vid) => {
        pauseTileVideo(vid);
        vid.closest(".project")?.classList.remove("is-playing");
      });
    };
    const onVis = () => {
      if (document.hidden || section?.classList.contains("is-paused")) pauseAll();
    };
    if (fine) {
      root.addEventListener("pointerenter", onEnterFilm, { passive: true, capture: true });
      root.addEventListener("pointerleave", onLeaveFilm, { passive: true, capture: true });
    }
    document.addEventListener("visibilitychange", onVis);
    const mo = section ? new MutationObserver(onVis) : null;
    if (section && mo) mo.observe(section, { attributes: true, attributeFilter: ["class"] });
    return () => {
      root.removeEventListener("pointerenter", onEnterFilm, true);
      root.removeEventListener("pointerleave", onLeaveFilm, true);
      document.removeEventListener("visibilitychange", onVis);
      mo?.disconnect();
    };
  }, [visible]);

  if (!visible.length) return null;

  return (
    <div ref={rootRef} className="work-sec mt-6 md:mt-8">
      <div ref={stage} className="grid gap-4 md:gap-6 xl:gap-8">
        {shotRows.map((row) =>
          row.length === 2 ? (
            <div key={row[0].id} className="grid gap-4 md:grid-cols-2 md:gap-6 xl:gap-8">
              {row.map((item) => (
                <WorkTile key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <WorkTile key={row[0].id} item={row[0]} />
          ),
        )}
      </div>
    </div>
  );
}

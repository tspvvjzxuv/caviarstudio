import { useLayoutEffect, useRef } from "react";
import { usePauseOffscreen } from "@/hooks/use-pause-offscreen";
import { WorkTile } from "@/components/work-tile";
import { examplesWithMedia, type WorkItem } from "@/lib/work";

export function WorkGallery({ items }: { items: readonly WorkItem[] }) {
  const visible = examplesWithMedia(items);
  const stage = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  usePauseOffscreen(rootRef);

  useLayoutEffect(() => {
    stage.current?.querySelectorAll<HTMLElement>(".project").forEach((el) => {
      el.classList.add("in");
    });
  }, [visible]);

  if (!visible.length) return null;

  return (
    <div ref={rootRef} className="work-sec mt-6 md:mt-8">
      <div ref={stage} className="grid gap-8 md:grid-cols-2 md:gap-10 xl:gap-12">
        {visible.map((item) => (
          <WorkTile key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

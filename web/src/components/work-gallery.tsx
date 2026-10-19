import { useRef } from "react";
import { usePauseOffscreen } from "@/hooks/use-pause-offscreen";
import { WorkTile } from "@/components/work-tile";
import { examplesWithMedia, type WorkItem } from "@/lib/work";

export function WorkGallery({ items }: { items: readonly WorkItem[] }) {
  const visible = examplesWithMedia(items);
  const rootRef = useRef<HTMLDivElement>(null);
  usePauseOffscreen(rootRef);

  if (!visible.length) return null;

  return (
    <div ref={rootRef} className="work-sec mt-6 md:mt-8">
      <div className="grid gap-8 md:grid-cols-2 md:gap-10 xl:gap-12">
        {visible.map((item) => (
          <WorkTile key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

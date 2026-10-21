import { useRef } from "react";
import { useServiceMelt } from "@/hooks/use-service-melt";

export function MeltSurface({ seed }: { seed: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useServiceMelt(ref, seed);
  return <div ref={ref} className="melt-host" aria-hidden="true" />;
}

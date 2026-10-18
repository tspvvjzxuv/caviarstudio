import { useLanguage } from "@/lib/language";
import { usedWorkCats, workCatLabel, type WorkFilter } from "@/lib/work";
import { cn } from "@/lib/utils";

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-[0.68rem] tracking-[0.16em] uppercase backdrop-blur-md transition-[color,border-color,background-color] duration-200",
        active
          ? "border-azure/45 bg-azure-deep text-pearl"
          : "border-white/12 bg-white/[0.06] text-platinum hover:border-azure/35 hover:text-pearl",
      )}
    >
      {children}
    </button>
  );
}

export function WorkFilters({
  value,
  onChange,
}: {
  value: WorkFilter;
  onChange: (next: WorkFilter) => void;
}) {
  const { t } = useLanguage();
  const cats = usedWorkCats();
  if (cats.length < 2) return null;
  return (
    <div role="toolbar" aria-label={t.workFilter} className="mb-6 flex flex-wrap gap-2 md:mb-8">
      <FilterPill active={value === "all"} onClick={() => onChange("all")}>
        {t.workAll}
      </FilterPill>
      {cats.map((cat) => (
        <FilterPill key={cat} active={value === cat} onClick={() => onChange(cat)}>
          {workCatLabel(cat, t)}
        </FilterPill>
      ))}
    </div>
  );
}

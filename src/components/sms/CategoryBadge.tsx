import type { Category } from "@/lib/sms-data";
import { cn } from "@/lib/utils";

const styles: Record<Category, { className: string; label: string }> = {
  "Level 1": {
    className: "bg-emerald-100 text-emerald-700",
    label: "Level 1 — Topper",
  },
  "Level 2": {
    className: "bg-amber-100 text-amber-700",
    label: "Level 2 — Average",
  },
  "Level 3": {
    className: "bg-red-100 text-red-700",
    label: "Level 3 — Low",
  },
  Uncategorized: {
    className: "bg-muted text-muted-foreground",
    label: "Uncategorized",
  },
};

export function CategoryBadge({ category }: { category: Category }) {
  const s = styles[category] ?? styles.Uncategorized;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold",
        s.className,
      )}
    >
      {s.label}
    </span>
  );
}

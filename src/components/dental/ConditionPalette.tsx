import { cn } from "@/lib/utils";
import { CONDITIONS, ConditionDef } from "@/lib/dental/constants";
import { useDentalT } from "@/lib/dental/i18n";

interface Props {
  value: string | null;
  onChange: (key: string | null) => void;
  scope?: "tooth" | "surface" | "all";
}

export default function ConditionPalette({ value, onChange, scope = "all" }: Props) {
  const { dt } = useDentalT();
  const list: ConditionDef[] = CONDITIONS.filter((c) =>
    scope === "all" ? true : scope === "tooth" ? c.scope !== "surface" : c.scope !== "tooth"
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => onChange(value === c.key ? null : c.key)}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs transition-all",
            value === c.key ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border hover:bg-accent"
          )}
        >
          <span className="w-3 h-3 rounded-sm border border-black/10" style={{ backgroundColor: c.color }} />
          {dt(`cond.${c.key}`)}
        </button>
      ))}
    </div>
  );
}

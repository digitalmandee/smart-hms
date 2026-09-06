import { cn } from "@/lib/utils";
import {
  Dentition,
  SurfaceKey,
  getQuadrants,
  isPosterior,
  conditionColor,
  normalizeCondition,
  ABSENT_CONDITIONS,
} from "@/lib/dental/constants";
import { useDentalT } from "@/lib/dental/i18n";
import type { ToothState } from "./Dental3DChart";

interface Props {
  dentition: Dentition;
  toothStates: Record<number, ToothState>;
  selectedTooth: number | null;
  onSelectTooth: (t: number | null) => void;
  onPaintSurface?: (tooth: number, surface: SurfaceKey) => void;
}

function ToothBox({
  n,
  state,
  selected,
  onSelect,
  onPaint,
}: {
  n: number;
  state: ToothState;
  selected: boolean;
  onSelect: () => void;
  onPaint?: (s: SurfaceKey) => void;
}) {
  const cond = normalizeCondition(state?.condition);
  const absent = ABSENT_CONDITIONS.includes(cond);
  const surf = state?.surfaces || {};
  const col = (k: SurfaceKey) => {
    const c = normalizeCondition(surf[k]);
    return c === "healthy" ? "transparent" : conditionColor(c);
  };
  const click = (e: React.MouseEvent, k: SurfaceKey) => {
    e.stopPropagation();
    if (onPaint) onPaint(k);
    else onSelect();
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-1 p-1 rounded-md transition-all",
        selected && "ring-2 ring-primary bg-primary/5"
      )}
      title={`${n}`}
    >
      <span className="text-[10px] font-semibold text-muted-foreground">{n}</span>
      <div
        className={cn(
          "relative w-10 h-10 border-2 rounded-sm",
          absent ? "border-dashed opacity-50" : "border-border"
        )}
        style={{ backgroundColor: cond !== "healthy" && !absent ? conditionColor(cond) + "33" : undefined }}
      >
        {/* B (top) */}
        <div onClick={(e) => click(e, "B")} className="absolute inset-x-2 top-0 h-2 border-b border-border/60 cursor-pointer" style={{ backgroundColor: col("B") }} />
        {/* L (bottom) */}
        <div onClick={(e) => click(e, "L")} className="absolute inset-x-2 bottom-0 h-2 border-t border-border/60 cursor-pointer" style={{ backgroundColor: col("L") }} />
        {/* M (left) */}
        <div onClick={(e) => click(e, "M")} className="absolute inset-y-2 left-0 w-2 border-r border-border/60 cursor-pointer" style={{ backgroundColor: col("M") }} />
        {/* D (right) */}
        <div onClick={(e) => click(e, "D")} className="absolute inset-y-2 right-0 w-2 border-l border-border/60 cursor-pointer" style={{ backgroundColor: col("D") }} />
        {/* O / I (center) */}
        <div
          onClick={(e) => click(e, "O")}
          className={cn("absolute left-2 right-2 top-2 bottom-2 cursor-pointer", !isPosterior(n) && "rounded-sm")}
          style={{ backgroundColor: col("O") }}
        />
        {absent && <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground">×</div>}
      </div>
    </button>
  );
}

export default function Odontogram2D({ dentition, toothStates, selectedTooth, onSelectTooth, onPaintSurface }: Props) {
  const { dt } = useDentalT();
  const quadrants = getQuadrants(dentition);

  return (
    <div className="space-y-4 overflow-x-auto">
      {quadrants.map((q) => (
        <div key={q.key}>
          <p className="text-xs font-medium text-muted-foreground mb-1">{dt(`quadrant.${q.labelKey}`)}</p>
          <div className="flex gap-1 flex-wrap">
            {q.teeth.map((n) => (
              <ToothBox
                key={n}
                n={n}
                state={toothStates[n] || { condition: "healthy", surfaces: {} }}
                selected={selectedTooth === n}
                onSelect={() => onSelectTooth(selectedTooth === n ? null : n)}
                onPaint={onPaintSurface ? (s) => onPaintSurface(n, s) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

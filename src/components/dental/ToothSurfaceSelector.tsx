import { cn } from "@/lib/utils";
import { SurfaceKey, SURFACE_KEYS, surfaceLabelKey, conditionColor, normalizeCondition, isPosterior, isUpperTooth } from "@/lib/dental/constants";
import { useDentalT } from "@/lib/dental/i18n";

interface Props {
  toothNumber: number;
  surfaces: Partial<Record<SurfaceKey, string>>;
  onSelectSurface: (surface: SurfaceKey) => void;
  activeSurface?: SurfaceKey | null;
}

const POSITION: Record<SurfaceKey, string> = {
  M: "left-0 top-1/2 -translate-y-1/2 w-6 h-12",
  D: "right-0 top-1/2 -translate-y-1/2 w-6 h-12",
  B: "left-1/2 top-0 -translate-x-1/2 h-6 w-12",
  L: "left-1/2 bottom-0 -translate-x-1/2 h-6 w-12",
  O: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10",
};

export default function ToothSurfaceSelector({ toothNumber, surfaces, onSelectSurface, activeSurface }: Props) {
  const { dt } = useDentalT();

  return (
    <div className="space-y-2">
      <div className="relative w-32 h-32 mx-auto">
        {SURFACE_KEYS.map((k) => {
          const cond = normalizeCondition(surfaces?.[k]);
          const painted = cond !== "healthy";
          const label = k === "O" ? (isPosterior(toothNumber) ? "O" : "I") : k === "L" ? (isUpperTooth(toothNumber) ? "P" : "L") : k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onSelectSurface(k)}
              title={dt(surfaceLabelKey(k, toothNumber))}
              className={cn(
                "absolute border-2 rounded transition-all flex items-center justify-center text-[11px] font-bold",
                POSITION[k],
                activeSurface === k ? "border-primary ring-2 ring-primary/40" : "border-border",
                painted ? "text-white" : "bg-muted text-muted-foreground hover:bg-accent"
              )}
              style={painted ? { backgroundColor: conditionColor(cond) } : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        {SURFACE_KEYS.filter((k) => normalizeCondition(surfaces?.[k]) !== "healthy").map((k) => (
          <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {dt(surfaceLabelKey(k, toothNumber))}: {dt(`cond.${normalizeCondition(surfaces?.[k])}`)}
          </span>
        ))}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

const SURFACES = [
  { key: "M", label: "Mesial", position: "left-0 top-1/2 -translate-y-1/2 w-6 h-10" },
  { key: "O", label: "Occlusal", position: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-sm" },
  { key: "D", label: "Distal", position: "right-0 top-1/2 -translate-y-1/2 w-6 h-10" },
  { key: "B", label: "Buccal", position: "left-1/2 top-0 -translate-x-1/2 h-6 w-10" },
  { key: "L", label: "Lingual", position: "left-1/2 bottom-0 -translate-x-1/2 h-6 w-10" },
];

interface ToothSurfaceSelectorProps {
  toothNumber: number;
  selectedSurfaces: string[];
  onToggleSurface: (surface: string) => void;
}

export default function ToothSurfaceSelector({ toothNumber, selectedSurfaces, onToggleSurface }: ToothSurfaceSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Tooth #{toothNumber} — Surface Selection</p>
      <div className="relative w-28 h-28 mx-auto">
        {SURFACES.map(s => {
          const active = selectedSurfaces.includes(s.key);
          return (
            <button
              key={s.key}
              onClick={() => onToggleSurface(s.key)}
              className={cn(
                "absolute border-2 rounded transition-all flex items-center justify-center text-xs font-bold",
                s.position,
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:bg-accent"
              )}
              title={s.label}
            >
              {s.key}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Selected: {selectedSurfaces.length ? selectedSurfaces.join(", ") : "None"}
      </p>
    </div>
  );
}

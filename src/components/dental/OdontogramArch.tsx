import { useMemo } from "react";
import { cn } from "@/lib/utils";
import ToothGlyph from "./ToothGlyph";
import {
  Dentition,
  SurfaceKey,
  getQuadrants,
  isPosterior,
  isUpperTooth,
} from "@/lib/dental/constants";
import { Notation, toothLabel } from "@/lib/dental/notation";
import type { ChartFinding } from "@/hooks/useDentalWorkspace";

const ABSENT_KEYS = ["missing", "extracted", "unerupted"];

export interface Props {
  dentition: Dentition;
  notation: Notation;
  findings: ChartFinding[];
  selectedTeeth: number[];
  activeSurfaces?: SurfaceKey[];
  onToothClick: (tooth: number, additive: boolean) => void;
  onSurfaceClick: (tooth: number, surface: SurfaceKey, additive: boolean) => void;
}

function surfaceLetter(k: SurfaceKey, tooth: number) {
  const upper = isUpperTooth(tooth);
  const post = isPosterior(tooth);
  if (k === "O") return post ? "O" : "I";
  if (k === "B") return post ? "B" : "F";
  if (k === "L") return upper ? "P" : "L";
  return k;
}

function SurfaceGrid({
  tooth,
  colors,
  active,
  onClick,
}: {
  tooth: number;
  colors: Partial<Record<SurfaceKey, string>>;
  active?: SurfaceKey[];
  onClick: (s: SurfaceKey, additive: boolean) => void;
}) {
  const mesialRight = [1, 4, 5, 8].includes(Math.floor(tooth / 10));
  const left: SurfaceKey = mesialRight ? "D" : "M";
  const right: SurfaceKey = mesialRight ? "M" : "D";
  const upper = isUpperTooth(tooth);
  const top: SurfaceKey = upper ? "B" : "L";
  const bottom: SurfaceKey = upper ? "L" : "B";

  const Cell = ({ s, className }: { s: SurfaceKey; className?: string }) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(s, e.shiftKey);
      }}
      title={`${tooth} ${surfaceLetter(s, tooth)}`}
      className={cn(
        "flex items-center justify-center text-[8px] leading-none font-semibold border border-border/70 transition-colors hover:bg-accent",
        active?.includes(s) && "ring-1 ring-primary ring-inset",
        className
      )}
      style={colors[s] ? { backgroundColor: colors[s], color: "#fff" } : undefined}
    >
      {surfaceLetter(s, tooth)}
    </button>
  );

  return (
    <div className="grid grid-cols-3 grid-rows-3 w-[34px] h-[34px] bg-background">
      <div />
      <Cell s={top} />
      <div />
      <Cell s={left} />
      <Cell s="O" />
      <Cell s={right} />
      <div />
      <Cell s={bottom} />
      <div />
    </div>
  );
}

function ToothColumn({
  tooth,
  notation,
  dentition,
  toothColor,
  absent,
  surfaceColors,
  selected,
  activeSurfaces,
  onToothClick,
  onSurfaceClick,
}: {
  tooth: number;
  notation: Notation;
  dentition: Dentition;
  toothColor?: string;
  absent: boolean;
  surfaceColors: Partial<Record<SurfaceKey, string>>;
  selected: boolean;
  activeSurfaces?: SurfaceKey[];
  onToothClick: (tooth: number, additive: boolean) => void;
  onSurfaceClick: (tooth: number, surface: SurfaceKey, additive: boolean) => void;
}) {
  const upper = isUpperTooth(tooth);
  const glyph = (
    <div className="w-[34px]" onClick={(e) => onToothClick(tooth, e.shiftKey)}>
      <ToothGlyph
        toothNumber={tooth}
        fill={toothColor || "#f3ead9"}
        absent={absent}
        selected={selected}
        title={`Tooth ${tooth}`}
      />
    </div>
  );
  const grid = (
    <SurfaceGrid
      tooth={tooth}
      colors={surfaceColors}
      active={selected ? activeSurfaces : undefined}
      onClick={(s, additive) => onSurfaceClick(tooth, s, additive)}
    />
  );
  const label = (
    <button
      type="button"
      onClick={(e) => onToothClick(tooth, e.shiftKey)}
      className={cn(
        "text-[10px] font-semibold px-1 rounded",
        selected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
      )}
    >
      {toothLabel(tooth, notation, dentition)}
    </button>
  );

  return (
    <div className={cn("flex flex-col items-center gap-1", selected && "bg-primary/5 rounded-md")}>
      {upper ? (
        <>
          {glyph}
          {grid}
          {label}
        </>
      ) : (
        <>
          {label}
          {grid}
          {glyph}
        </>
      )}
    </div>
  );
}

export default function OdontogramArch({
  dentition,
  notation,
  findings,
  selectedTeeth,
  activeSurfaces,
  onToothClick,
  onSurfaceClick,
}: Props) {
  const quads = getQuadrants(dentition);
  const upperRight = quads[0].teeth;
  const upperLeft = quads[1].teeth;
  const lowerLeft = quads[2].teeth;
  const lowerRight = quads[3].teeth;

  const { toothColor, absentSet, surfaceColor } = useMemo(() => {
    const toothColor: Record<number, string> = {};
    const absentSet = new Set<number>();
    const surfaceColor: Record<number, Partial<Record<SurfaceKey, string>>> = {};
    // oldest first so newer findings win
    [...findings]
      .filter((f) => !f.closed_at)
      .sort((a, b) => a.charted_at.localeCompare(b.charted_at))
      .forEach((f) => {
        if (ABSENT_KEYS.includes(f.finding_key)) absentSet.add(f.tooth_number);
        if (f.surface) {
          surfaceColor[f.tooth_number] = surfaceColor[f.tooth_number] || {};
          surfaceColor[f.tooth_number][f.surface as SurfaceKey] = f.color || "#dc2626";
        } else if (f.finding_key !== "healthy") {
          toothColor[f.tooth_number] = f.color || "#dc2626";
        }
      });
    return { toothColor, absentSet, surfaceColor };
  }, [findings]);

  const renderRow = (teeth: number[]) =>
    teeth.map((t) => (
      <ToothColumn
        key={t}
        tooth={t}
        notation={notation}
        dentition={dentition}
        toothColor={toothColor[t]}
        absent={absentSet.has(t)}
        surfaceColors={surfaceColor[t] || {}}
        selected={selectedTeeth.includes(t)}
        activeSurfaces={activeSurfaces}
        onToothClick={onToothClick}
        onSurfaceClick={onSurfaceClick}
      />
    ));

  return (
    <div className="w-full overflow-x-auto" dir="ltr">
      <div className="min-w-[680px] space-y-2 py-2">
        <div className="flex justify-center gap-2">
          <div className="flex gap-0.5">{renderRow(upperRight)}</div>
          <div className="w-px bg-border" />
          <div className="flex gap-0.5">{renderRow(upperLeft)}</div>
        </div>

        <div className="relative flex items-center">
          <div className="flex-1 border-t border-dashed border-border" />
          <span className="px-3 text-[9px] tracking-[0.2em] text-muted-foreground">OCCLUSAL PLANE</span>
          <div className="flex-1 border-t border-dashed border-border" />
        </div>

        <div className="flex justify-center gap-2">
          <div className="flex gap-0.5">{renderRow([...lowerRight].reverse())}</div>
          <div className="w-px bg-border" />
          <div className="flex gap-0.5">{renderRow([...lowerLeft].reverse())}</div>
        </div>
      </div>
    </div>
  );
}

// ── Dental odontogram constants ──────────────────────────────────────────────

export type Dentition = "permanent" | "primary";

export const PERMANENT_TEETH = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft: [38, 37, 36, 35, 34, 33, 32, 31],
  lowerRight: [41, 42, 43, 44, 45, 46, 47, 48],
};

export const PRIMARY_TEETH = {
  upperRight: [55, 54, 53, 52, 51],
  upperLeft: [61, 62, 63, 64, 65],
  lowerLeft: [75, 74, 73, 72, 71],
  lowerRight: [81, 82, 83, 84, 85],
};

export function getQuadrants(dentition: Dentition) {
  const set = dentition === "primary" ? PRIMARY_TEETH : PERMANENT_TEETH;
  return [
    { key: "q1", labelKey: "upperRight", teeth: set.upperRight },
    { key: "q2", labelKey: "upperLeft", teeth: set.upperLeft },
    { key: "q3", labelKey: "lowerLeft", teeth: set.lowerLeft },
    { key: "q4", labelKey: "lowerRight", teeth: set.lowerRight },
  ];
}

export function getAllTeeth(dentition: Dentition): number[] {
  const q = getQuadrants(dentition);
  return q.flatMap((x) => x.teeth);
}

export function isUpperTooth(n: number): boolean {
  const q = Math.floor(n / 10);
  return q === 1 || q === 2 || q === 5 || q === 6;
}

export type ToothClass = "incisor" | "canine" | "premolar" | "molar";

export function getToothClass(n: number): ToothClass {
  const pos = n % 10;
  const q = Math.floor(n / 10);
  const primary = q >= 5;
  if (primary) {
    if (pos <= 2) return "incisor";
    if (pos === 3) return "canine";
    return "molar"; // primary 4 & 5 are molars
  }
  if (pos <= 2) return "incisor";
  if (pos === 3) return "canine";
  if (pos <= 5) return "premolar";
  return "molar";
}

export function isPosterior(n: number) {
  const c = getToothClass(n);
  return c === "premolar" || c === "molar";
}

// ── Surfaces ────────────────────────────────────────────────────────────────
export type SurfaceKey = "M" | "D" | "B" | "L" | "O";

export const SURFACE_KEYS: SurfaceKey[] = ["M", "D", "B", "L", "O"];

export function surfaceLabelKey(key: SurfaceKey, toothNumber: number) {
  if (key === "O") return isPosterior(toothNumber) ? "surface.occlusal" : "surface.incisal";
  if (key === "L") return isUpperTooth(toothNumber) ? "surface.palatal" : "surface.lingual";
  if (key === "B") return isPosterior(toothNumber) ? "surface.buccal" : "surface.facial";
  return key === "M" ? "surface.mesial" : "surface.distal";
}

// ── Conditions ──────────────────────────────────────────────────────────────
export interface ConditionDef {
  key: string;
  color: string; // hex, used for 3D + swatches
  scope: "tooth" | "surface" | "both";
}

export const CONDITIONS: ConditionDef[] = [
  { key: "healthy", color: "#e8e2d5", scope: "both" },
  { key: "caries", color: "#dc2626", scope: "surface" },
  { key: "filling_composite", color: "#60a5fa", scope: "surface" },
  { key: "filling_amalgam", color: "#64748b", scope: "surface" },
  { key: "sealant", color: "#34d399", scope: "surface" },
  { key: "fracture", color: "#f97316", scope: "both" },
  { key: "crown", color: "#eab308", scope: "tooth" },
  { key: "veneer", color: "#fcd34d", scope: "tooth" },
  { key: "bridge_pontic", color: "#fb923c", scope: "tooth" },
  { key: "bridge_abutment", color: "#c2761b", scope: "tooth" },
  { key: "implant", color: "#a855f7", scope: "tooth" },
  { key: "root_canal", color: "#ec4899", scope: "tooth" },
  { key: "mobility", color: "#0ea5e9", scope: "tooth" },
  { key: "impacted", color: "#7c3aed", scope: "tooth" },
  { key: "unerupted", color: "#94a3b8", scope: "tooth" },
  { key: "supernumerary", color: "#14b8a6", scope: "tooth" },
  { key: "missing", color: "#9ca3af", scope: "tooth" },
  { key: "extracted", color: "#6b7280", scope: "tooth" },
  { key: "to_extract", color: "#b91c1c", scope: "tooth" },
];

export const CONDITION_MAP: Record<string, ConditionDef> = CONDITIONS.reduce(
  (acc, c) => { acc[c.key] = c; return acc; },
  {} as Record<string, ConditionDef>
);

export const TOOTH_CONDITIONS = CONDITIONS.filter((c) => c.scope !== "surface");
export const SURFACE_CONDITIONS = CONDITIONS.filter((c) => c.scope !== "tooth");

export function conditionColor(key: string | undefined) {
  return (key && CONDITION_MAP[key]?.color) || CONDITION_MAP.healthy.color;
}

// Legacy condition values stored before per-surface charting
export const LEGACY_CONDITION_ALIASES: Record<string, string> = {
  decayed: "caries",
  restored: "filling_composite",
  fractured: "fracture",
};

export function normalizeCondition(key: string | undefined | null): string {
  if (!key) return "healthy";
  return LEGACY_CONDITION_ALIASES[key] || key;
}

// Teeth that should not render as present
export const ABSENT_CONDITIONS = ["missing", "extracted", "unerupted"];

// ── Periodontal sites ───────────────────────────────────────────────────────
export const PERIO_SITES = ["MB", "B", "DB", "ML", "L", "DL"] as const;
export type PerioSite = (typeof PERIO_SITES)[number];

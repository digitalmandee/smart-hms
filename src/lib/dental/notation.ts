import { Dentition } from "./constants";

export type Notation = "fdi" | "universal" | "palmer";

// FDI order used for universal mapping
const PERM_UNIVERSAL: Record<number, string> = {};
[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
 38, 37, 36, 35, 34, 33, 32, 31, 41, 42, 43, 44, 45, 46, 47, 48].forEach((fdi, i) => {
  PERM_UNIVERSAL[fdi] = String(i + 1);
});

const PRIMARY_LETTERS = "ABCDEFGHIJKLMNOPQRST".split("");
const PRIMARY_UNIVERSAL: Record<number, string> = {};
[55, 54, 53, 52, 51, 61, 62, 63, 64, 65, 75, 74, 73, 72, 71, 81, 82, 83, 84, 85].forEach((fdi, i) => {
  PRIMARY_UNIVERSAL[fdi] = PRIMARY_LETTERS[i];
});

const PALMER_WRAP: Record<number, (p: string) => string> = {
  1: (p) => `${p}⌐`,
  2: (p) => `⌐${p}`,
  3: (p) => `⌊${p}`,
  4: (p) => `${p}⌋`,
  5: (p) => `${p}⌐`,
  6: (p) => `⌐${p}`,
  7: (p) => `⌊${p}`,
  8: (p) => `${p}⌋`,
};

export function toothLabel(fdi: number, notation: Notation, dentition: Dentition = "permanent"): string {
  if (notation === "fdi") return String(fdi);
  if (notation === "universal") {
    return (dentition === "primary" ? PRIMARY_UNIVERSAL[fdi] : PERM_UNIVERSAL[fdi]) || String(fdi);
  }
  const q = Math.floor(fdi / 10);
  const pos = fdi % 10;
  const primaryLetter = "ABCDE"[pos - 1] || String(pos);
  const label = q >= 5 ? primaryLetter : String(pos);
  return (PALMER_WRAP[q] || ((p: string) => p))(label);
}

export const NOTATIONS: { value: Notation; labelKey: string }[] = [
  { value: "fdi", labelKey: "dw.notation.fdi" },
  { value: "universal", labelKey: "dw.notation.universal" },
  { value: "palmer", labelKey: "dw.notation.palmer" },
];

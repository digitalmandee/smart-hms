## Remove pipeline block from Traction slide

**File:** `src/components/executive/ExecTractionSlide.tsx`

**Change:** Delete the dashed pipeline callout (`<div className="mt-4 rounded-xl border-2 border-dashed border-primary/40 ...">` containing "35+ facilities..." and "$1.8M").

**Result:** Traction slide keeps the 6 stat cards + footer only. Pipeline detail remains on the GTM slide (13) where it's accurate and KSA-aligned, eliminating the USD/SAR and KSA/Pakistan contradictions.

No other slides touched.
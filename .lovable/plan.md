
# Auto-Correct Medicine Name Before Search

## What Changes

When the pharmacist types a partial or misspelled medicine name (e.g., "pana", "augmnt", "amoxl") and hits Search, Tabeebi will first show a small confirmation line like:

> "Did you mean **Panadol**?"

with two options: a checkmark to confirm (proceeds with the corrected name) or an edit icon to go back and retype. Only after confirmation does the full alternatives search run. This prevents wasted AI calls on wrong names.

## How It Works

**File: `src/components/pharmacy/POSMedicineAlternatives.tsx`**

1. **Two-step search flow**:
   - Step 1 (correction): Send a short AI prompt: `"Correct this medicine name to the closest real medicine: '${query}'. Return ONLY the corrected name, nothing else."`
   - Step 2 (alternatives): If user confirms, run the existing alternatives prompt with the corrected name

2. **New state variables**:
   - `correctedName: string | null` -- holds the AI-corrected name
   - `awaitingConfirmation: boolean` -- true while showing the "Did you mean...?" line

3. **UI between search input and results** (new confirmation strip):
   - A single-line card: DoctorAvatar (xs) + "Did you mean **Panadol**?" + Confirm button (checkmark) + Edit button (pencil, resets to input)
   - If the corrected name matches the typed query (already correct), skip confirmation and go straight to alternatives
   - Subtle fade-in animation, teal accent border

4. **Modified `handleSearch` flow**:
   - On first call: send the correction prompt only
   - A new `useEffect` watches for the correction response, sets `correctedName`
   - On confirm: update `query` to corrected name, send the full alternatives prompt
   - On edit: clear correction, re-focus input

5. **Two separate `useAIChat` instances** are NOT needed. Instead, use a `searchPhase` state (`"correct"` or `"alternatives"`) to determine how to parse the response in the existing `useEffect`.

## Technical Details

| Change | Detail |
|--------|--------|
| New states | `correctedName`, `searchPhase: "correct" \| "alternatives"` |
| Correction prompt | `"Correct this medicine name: '${query}'. Return ONLY the corrected name."` |
| Skip logic | If corrected name equals query (case-insensitive), auto-proceed to alternatives |
| Parse phase | In the existing parse `useEffect`, check `searchPhase` -- if `"correct"`, extract plain text as corrected name; if `"alternatives"`, parse JSON as before |
| UI | Single confirmation line between search bar and results, with confirm/edit buttons |
| No new files | All changes in `POSMedicineAlternatives.tsx` only |

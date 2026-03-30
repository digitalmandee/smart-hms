

# Dialysis Session Detail — UI Overhaul & Missing Flows Fix

## Problems (from screenshot)

1. **Ugly card-based layout** — 4 wide cards with too much whitespace, no clear workflow actions
2. **No "Start Session" button visible** — the pre-assessment form only shows for nurse/admin roles; receptionist sees nothing actionable
3. **No "Machines" link in receptionist sidebar** — can't manage machines
4. **Chair is separate from Machine** — when selecting a machine, chair should auto-fill from the machine's `chair_number` field
5. **No availability view** — no way to see which machines/chairs are free for a given date/shift
6. **Session detail page is too sparse for "scheduled" status** — needs clear action buttons and workflow steps

## What to Build

### 1. Redesign Session Detail Page Layout
**File: `DialysisSessionDetailPage.tsx`**

Replace the 4 equal cards with a compact header section:
- Top: Patient name, MRN, session number, date — single row
- Status badge prominent with colored background
- Machine + Chair + Prescription in a compact 2-column details grid (not cards)
- Clear workflow stepper: Scheduled → In Progress → Completed
- Action buttons prominent at top: "Start Session", "Cancel", "No Show"
- The pre-assessment fields inline below the action area (not hidden in a card)

### 2. Auto-fill Chair from Machine Selection
**File: `DialysisNewSessionPage.tsx`**

When a machine is selected, auto-populate `chair_number` from the machine's `chair_number` field. Remove the separate Chair Number input — chair is always linked to machine.

**File: `DialysisSessionDetailPage.tsx`**

Display chair from `machine.chair_number` instead of session's `chair_number`.

### 3. Add Machines to Receptionist Sidebar
**File: `src/config/role-sidebars.ts`**

Add `{ name: "Machines", path: "/app/dialysis/machines", icon: "Monitor" }` to the receptionist's Dialysis children.

### 4. Add Availability Panel to New Session Page
**File: `DialysisNewSessionPage.tsx`**

After selecting date + shift, show a mini availability grid:
- Query `dialysis_machines` where status = "available"
- Cross-reference `dialysis_sessions` for the selected date + shift to find occupied machines
- Show available vs occupied with green/red indicators
- Clicking an available machine auto-selects it

### 5. Convert Machines Page to Table View
**File: `DialysisMachinesPage.tsx`**

Replace card grid with `ReportTable` — columns: Machine #, Chair #, Model, Manufacturer, S/N, Status, Last Disinfected, Actions. Add status filter, edit dialog.

### 6. i18n Keys
Add all new labels in en.ts, ar.ts, ur.ts.

## Files Changed
- `src/pages/app/dialysis/DialysisSessionDetailPage.tsx` — full UI redesign with workflow stepper and prominent actions
- `src/pages/app/dialysis/DialysisNewSessionPage.tsx` — auto-fill chair from machine, availability panel
- `src/pages/app/dialysis/DialysisMachinesPage.tsx` — table view with filters
- `src/config/role-sidebars.ts` — add Machines to receptionist sidebar
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys


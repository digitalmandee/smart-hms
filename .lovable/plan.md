

# UI Overhaul: Table Views with Pagination + Dialysis Enrolled Patient Management

## Problems Identified
1. **Dialysis Patients page** — card list, no filters, no pagination, no print dialysis card, no link to patient profile
2. **Dialysis Sessions page** — card list, no filters, no pagination
3. **Dialysis Schedule page** — grouped cards, no table view
4. **Lab Queue page** — `LabOrderCard` cards stacked vertically, no pagination (all records rendered)
5. **Radiology Imaging Orders** — grid of cards, no pagination
6. **Radiology Reporting Worklist** — card list, no pagination

## Solution

Convert all 6 list pages from card-based layouts to **compact table views** using the existing `ReportTable` component (already has built-in search, sorting, pagination, and column definitions). Keep card-based detail pages unchanged — only list/queue pages get the table treatment.

### 1. Dialysis Patients Page — Full Rebuild
**File: `src/pages/app/dialysis/DialysisPatientsPage.tsx`**

- Replace card grid with `ReportTable` columns: MRN, Patient Name, Access Type, Schedule (MWF/TTS), Shift, Dry Weight, HBV, HCV, HIV, Enrolled Date
- Add filter bar: access type dropdown, hepatitis status dropdown, schedule pattern dropdown
- Row click → navigate to new detail page
- Add **"Print Card"** button per row (opens print dialog with dialysis ID card)
- Add **"View Profile"** link per row → `/app/patients/{patient_id}`

### 2. New: Dialysis Patient Detail Page
**File: `src/pages/app/dialysis/DialysisPatientDetailPage.tsx`** (NEW)
**Route: `/app/dialysis/patients/:id`**

- Shows enrolled patient info: access type, dry weight, hepatitis status, EPO protocol, schedule
- Session history table (all sessions for this patient)
- **Print Dialysis Card** button — generates a printable card with patient photo, MRN, access type, schedule, hepatitis badges
- Link to main patient profile

### 3. Dialysis Sessions Page — Table View
**File: `src/pages/app/dialysis/DialysisSessionsPage.tsx`**

- `ReportTable` columns: Session #, Date, Patient, Chair, Machine, Pre-Weight, Post-Weight, UF (ml), Duration, Status
- Filter bar: status dropdown (scheduled/in_progress/completed/cancelled), date range
- Row click → navigate to session detail

### 4. Dialysis Schedule Page — Table View
**File: `src/pages/app/dialysis/DialysisSchedulePage.tsx`**

- `ReportTable` columns: Patient, Pattern (MWF/TTS), Shift, Chair, Machine, Start Date, End Date
- Filter bar: pattern dropdown, shift dropdown

### 5. Lab Queue Page — Hybrid Table
**File: `src/pages/app/lab/LabQueuePage.tsx`**

- Keep existing filter tabs (status, payment, priority) — they work well
- Replace `LabOrderCard` list with `ReportTable`: Order #, Patient, MRN, Tests, Priority, Payment, Status, Time Ago
- Priority column uses colored badges, payment column uses colored badges
- Row click → navigate to result entry page
- Keep action buttons (Collect Payment, Enter Results) as inline row buttons
- Add pagination (default 20 rows)

### 6. Radiology Imaging Orders — Table View
**File: `src/pages/app/radiology/ImagingOrdersListPage.tsx`**

- Keep existing filter dropdowns (status, modality, priority)
- Replace card grid with `ReportTable`: Order #, Patient, Modality, Procedure, Priority, Status, Date
- Row click → navigate to order detail
- Add pagination

### 7. Radiology Reporting Worklist — Table View
**File: `src/pages/app/radiology/ReportingWorklistPage.tsx`**

- Keep view toggle buttons (Pending/Verification/Completed)
- Replace card list with `ReportTable`: Order #, Patient, Modality, Procedure, Priority, Performed At, Action
- Action column: Report/Verify/View buttons
- Add pagination

### 8. Route + i18n
- Add route: `/app/dialysis/patients/:id` → `DialysisPatientDetailPage`
- Add i18n keys for: "Print Card", "View Profile", "Enrolled Date", "Session History", table headers in all 3 languages

## Technical Notes

- All pages use the existing `ReportTable` component from `src/components/reports/ReportTable.tsx` which already provides: sortable columns, search, pagination with page numbers, and empty states
- The `LabOrderCard` component is NOT deleted — it's still used in the mobile view (`MobileLabQueue`) and potentially in detail contexts
- The `ImagingOrderCard` is also kept for potential reuse in other views
- Print Dialysis Card uses `window.print()` with a dedicated print-friendly component

## Files Changed
- `src/pages/app/dialysis/DialysisPatientsPage.tsx` — table view + filters + print/profile links
- `src/pages/app/dialysis/DialysisPatientDetailPage.tsx` — NEW page
- `src/pages/app/dialysis/DialysisSessionsPage.tsx` — table view + filters
- `src/pages/app/dialysis/DialysisSchedulePage.tsx` — table view + filters
- `src/pages/app/lab/LabQueuePage.tsx` — table view (keep filter tabs)
- `src/pages/app/radiology/ImagingOrdersListPage.tsx` — table view (keep filters)
- `src/pages/app/radiology/ReportingWorklistPage.tsx` — table view (keep toggles)
- `src/App.tsx` — add dialysis patient detail route
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys


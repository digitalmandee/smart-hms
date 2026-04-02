

# Add Missing Reports to Reports Hub

## Problem
The Reports Hub page (`ReportsHubPage.tsx`) is missing several existing report pages that already have routes:

1. **OPD Department Report** — exists at `/app/reports/opd-departments` but not in hub
2. **Day End Summary Report** — exists at `/app/reports/day-end-summary` but not in hub
3. **Consultation Report** — no dedicated report page exists yet (consultation data only visible in OPD History)

## Changes

### 1. Add missing reports to `src/pages/app/reports/ReportsHubPage.tsx`

Add to **clinicalReports** array:
- **OPD Department Report** — path: `/app/reports/opd-departments`, icon: Building2, module: "OPD"
- **Consultation Report** — path: `/app/opd/consultations/report`, icon: Stethoscope, module: "OPD" (new page)

Add to **financialReports** array:
- **Day End Summary** — path: `/app/reports/day-end-summary`, icon: FileText, module: "Finance"

Update the quick stats count (it auto-calculates from array lengths).

### 2. Create new Consultation Report page: `src/pages/app/reports/ConsultationReport.tsx`

A dedicated report showing consultation data with:
- **Filters**: date range, doctor, department, branch
- **Summary cards**: total consultations, completed, avg per doctor, top diagnosis
- **Table**: date, patient, doctor, diagnosis, symptoms, follow-up status
- **Export**: CSV/print support using existing `ReportExportButton`
- Data sourced from `consultations` table joined with `patients`, `doctors`, `appointments`

### 3. Add route in `src/App.tsx`

Add route: `<Route path="opd/consultations/report" element={<ConsultationReport />} />`

### 4. Add translations in `en.ts`, `ur.ts`, `ar.ts`

New keys for consultation report labels: title, description, column headers.

## Files to Change
- `src/pages/app/reports/ReportsHubPage.tsx` — add 3 missing report cards
- `src/pages/app/reports/ConsultationReport.tsx` — new consultation report page
- `src/App.tsx` — add consultation report route
- `src/lib/i18n/translations/en.ts` — English labels
- `src/lib/i18n/translations/ur.ts` — Urdu labels
- `src/lib/i18n/translations/ar.ts` — Arabic labels




# Diagnostics Module — Audit & Enhancement Plan

## Current State Summary

| Sub-Module | Pages | Status |
|------------|-------|--------|
| **Laboratory (LIS)** | 11 pages | Fully functional: Queue, Result Entry, Templates, Analyzers, Reports, Barcode |
| **Radiology (RIS)** | 19 pages | Fully functional: Worklist, PACS, Reporting, Verification, Image Upload |
| **Blood Bank** | 21 pages | Fully functional: Donors, Donations, Inventory, Cross-Match, Transfusions, Labels |

All three modules are **complete and distinct** from OPD. OPD generates orders; Diagnostics fulfills them.

## What Works Well
- Lab: Template-based result entry, abnormal value flagging (H/L), barcode specimen tracking, specimen label printing, TAT analysis in reports, analyzer integration setup, mobile views
- Radiology: Full PACS integration, structured reporting with templates, verification workflow, image upload/storage, modality management, scheduling
- Blood Bank: Donor lifecycle, cross-matching, transfusion reactions, expiry alerts, blood bag labels, analytics dashboard

## Gaps Identified (Missing Features Advertised in Docs/Proposals)

### HIGH PRIORITY

| # | Gap | Where Advertised | Current State |
|---|-----|-------------------|---------------|
| 1 | **Critical/Panic Value Alerts** | Landing page, proposal, lab docs | Abnormal flagging exists in UI (red highlight) but **no alert/notification** is triggered when a critical value is entered. No toast, no notification to ordering doctor. |
| 2 | **Sample Rejection Workflow** | Proposal ("Rejection handling") | **No UI exists** in Lab Queue to reject a collected specimen (e.g., hemolyzed, clotted, insufficient). No rejection reason tracking. |
| 3 | **Lab TAT Dashboard Widget** | Proposal ("TAT monitoring"), lab docs | TAT analysis exists only in the monthly Reports page. **No real-time TAT tracker** on the Lab Dashboard showing orders exceeding target TAT. |

### MEDIUM PRIORITY

| # | Gap | Impact |
|---|-----|--------|
| 4 | **Delta Check (Previous Results Comparison)** | Advertised in proposal. No implementation — when entering results, the tech cannot see the patient's previous values for the same test. |
| 5 | **Blood Bank Dashboard not i18n** | Dashboard hardcodes English strings ("Blood Bank", "Register Donor", etc.) while other pages use `useTranslation`. |
| 6 | **Radiology Dashboard hardcodes English** | Quick action labels like "Technician Worklist", "Reporting Worklist" are not translated. |

---

## Enhancement Plan

### 1. Critical/Panic Value Alert System
**What**: When a lab tech enters a result that exceeds critical thresholds (defined in template), show a prominent alert and auto-create an in-app notification for the ordering doctor.

**How**:
- Add `critical_min` and `critical_max` fields to `TemplateField` interface (already has `normal_min`/`normal_max`)
- In `TestResultForm.tsx`: detect critical values on change, show a red banner "CRITICAL VALUE — Notify physician immediately"
- On save/submit: if any critical value exists, insert into a `notifications` table (or use existing notification mechanism) targeting the ordering doctor
- Add critical value indicator ("C" or "!!") in `PrintableLabReport` alongside the existing H/L flags

**Files**: `useLabTestTemplates.ts`, `TestResultForm.tsx`, `PrintableLabReport.tsx`, `LabTestTemplateFormPage.tsx` (add critical range inputs), i18n files

### 2. Sample Rejection Workflow
**What**: Allow lab tech to reject a collected specimen with a reason, auto-request recollection.

**How**:
- Add "Reject Sample" button on `LabOrderCard` when status is `collected`
- Dialog with rejection reason dropdown (Hemolyzed, Clotted, Insufficient Volume, Wrong Container, Mislabeled, Other)
- On reject: set item status back to `ordered`, add rejection note, increment a `rejection_count` field
- Show rejection history on the order detail

**Files**: New `SampleRejectionDialog.tsx`, `LabOrderCard.tsx`, `useLabOrders.ts`, i18n files

### 3. Real-Time TAT Tracker on Lab Dashboard
**What**: A widget on the Lab Dashboard showing orders that are approaching or exceeding target TAT, color-coded.

**How**:
- Add `tat_target_hours` to lab settings or per-test-template
- New `useLabTATTracker` hook: query active orders, calculate elapsed time since `created_at`, compare to target
- Dashboard widget: list of overdue orders sorted by elapsed time, with red/amber/green indicators
- Click navigates to the order

**Files**: `useLabDashboardStats.ts` (add TAT query), `LabDashboard.tsx` (add widget), i18n files

### 4. Delta Check — Previous Results Display
**What**: During result entry, show the patient's last result for the same test beside each field.

**How**:
- New `usePreviousLabResults(patientId, testName)` hook: query the most recent completed `lab_order_items` + `lab_results` for the same test
- In `TestResultForm.tsx`: display previous value and date in a subtle column next to the input
- Flag if the change exceeds a configurable delta threshold (e.g., >20% change)

**Files**: New hook in `useLabOrders.ts`, `TestResultForm.tsx`, i18n files

### 5. Blood Bank + Radiology Dashboard i18n
**What**: Replace hardcoded English strings with translation keys.

**Files**: `BloodBankDashboard.tsx`, `RadiologyDashboard.tsx`, `en.ts`, `ar.ts`, `ur.ts`

---

## Implementation Order
1. Critical/Panic Value Alerts (high clinical safety impact)
2. Sample Rejection Workflow (operational gap)
3. TAT Tracker Widget (quality monitoring)
4. Delta Check Display (clinical decision support)
5. Dashboard i18n fixes (consistency)

## Files Changed (Total)
- `src/hooks/useLabTestTemplates.ts` — add critical range fields
- `src/components/lab/TestResultForm.tsx` — critical alerts + delta check
- `src/components/lab/PrintableLabReport.tsx` — critical value indicator
- `src/pages/app/lab/LabTestTemplateFormPage.tsx` — critical range inputs
- `src/components/lab/LabOrderCard.tsx` — reject sample button
- `src/components/lab/SampleRejectionDialog.tsx` — new component
- `src/hooks/useLabOrders.ts` — rejection mutation + previous results hook
- `src/pages/app/lab/LabDashboard.tsx` — TAT tracker widget
- `src/hooks/useLabDashboardStats.ts` — TAT query
- `src/pages/app/blood-bank/BloodBankDashboard.tsx` — i18n
- `src/pages/app/radiology/RadiologyDashboard.tsx` — i18n
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys




# Plan: Complete All 7 Remaining Gaps

This plan covers all TODO items from the roadmap in a single implementation pass: 4 NPHIES RCM features + 3 standalone operational modules.

---

## Phase 1: Claim Scrubbing/Validation Engine (High Priority)

### New Files
- **`src/lib/claimScrubber.ts`** — Pure logic module with validation rules:
  - ICD-10 format check (regex `^[A-Z]\d{2}(\.\d{1,4})?$`)
  - CPT format check (5-digit numeric)
  - Missing required fields (patient info, diagnosis, service codes, payer)
  - Duplicate claim detection (same patient + same date + same payer within 7 days)
  - Amount validation (zero/negative amounts, item totals vs claim total mismatch)
  - Pre-auth requirement check (if plan requires it and none provided)
  - Returns `ScrubResult[]` with severity (error/warning/info), code, message, and auto-fix suggestion

- **`src/components/insurance/ClaimScrubResults.tsx`** — UI panel showing scrub results as color-coded alerts (red errors block submission, yellow warnings allow override)

### Modified Files
- **`ClaimFormPage.tsx`** — Run scrubber on "Submit" click; show `ClaimScrubResults` inline; block submission if errors exist; allow "Submit Anyway" for warnings only
- **`ClaimDetailPage.tsx`** — Add "Run Validation" button that re-scrubs before NPHIES submission
- **Translations** — Scrub rule messages in EN/AR/UR

---

## Phase 2: Payment Reconciliation (ERA/Remittance) (High Priority)

### New Files
- **`src/pages/app/billing/PaymentReconciliationPage.tsx`** — Main ERA page:
  - Table of NPHIES remittance responses (from `insurance_claims` where `nphies_status = approved/partially_approved`)
  - Match each remittance line to the original claim
  - Show: Claimed Amount, Approved Amount, Adjustment Reason, Patient Responsibility
  - "Post to Accounts" button → creates journal entry (Debit: Insurance Receivable, Credit: Revenue; Debit: Cash/Bank for patient portion)
  - Settlement status tracking (unreconciled / matched / posted)
  - Filters by date range, payer, settlement status

- **`src/hooks/usePaymentReconciliation.ts`** — Fetch approved/partially_approved claims with remittance data, track reconciliation status

### Modified Files
- **App router** — Add route `/app/billing/reconciliation`
- **Sidebar/nav** — Add "Payment Reconciliation" under Billing/Insurance menu
- **`nphies-gateway/index.ts`** — On `check_claim_status`, extract `adjudication.amount` and store as `approved_amount` and `adjustment_reasons` on the claim
- **Translations** — ERA-related labels

---

## Phase 3: Batch Claim Submission (Medium Priority)

### Modified Files
- **`ClaimsListPage.tsx`** — Add:
  - Checkbox column for multi-select
  - "Select All Draft/Ready" toggle
  - "Submit Selected to NPHIES" bulk action button
  - Progress dialog showing per-claim status (submitting/success/failed) with a progress bar
  - Uses sequential `useSubmitClaimToNphies` calls with error collection

- **`src/components/insurance/BatchSubmitDialog.tsx`** (New) — Modal with:
  - List of selected claims with real-time status icons
  - Progress bar (X of Y submitted)
  - Error summary at end
  - "Retry Failed" button

- **Translations** — Batch submission labels

---

## Phase 4: NPHIES Attachment Support (Medium Priority)

### New Files
- **`src/components/insurance/ClaimAttachments.tsx`** — File upload component for claim attachments:
  - Upload to Supabase Storage bucket `claim-attachments`
  - Supports PDF, images (medical reports, lab results, radiology images)
  - Links attachments to claim via `claim_attachments` join table
  - Shows attached files list with download/delete

### Database
- **Migration**: Create `claim_attachments` table (`id`, `claim_id` FK, `file_name`, `file_type`, `file_url`, `attachment_type` enum [medical_report, lab_result, radiology_image, prescription, other], `created_at`)
- **Storage bucket**: `claim-attachments` with RLS

### Modified Files
- **`ClaimDetailPage.tsx`** — Add Attachments section with `ClaimAttachments` component
- **`nphies-gateway/index.ts`** — On `submit_claim`, if attachments exist, include them as FHIR `CommunicationRequest` resources in the submission bundle with base64-encoded content or URL references
- **Translations** — Attachment labels

---

## Phase 5: Kitchen/Diet Management (Standalone) (Low Priority)

### New Files
- **`src/pages/app/kitchen/KitchenDashboard.tsx`** — Overview: total meals today, pending orders by meal type, diet type distribution chart
- **`src/pages/app/kitchen/MealOrdersPage.tsx`** — All diet orders from IPD admissions aggregated as kitchen work orders, grouped by meal time (breakfast/lunch/dinner/snack), with preparation status tracking
- **`src/pages/app/kitchen/MealPlanningPage.tsx`** — Weekly meal planning calendar, menu templates per diet type, cost tracking per meal
- **`src/hooks/useKitchen.ts`** — Aggregate diet charts into kitchen orders, meal cost calculations

### Modified Files
- **App router** — Add `/app/kitchen/*` routes
- **Sidebar** — Add Kitchen module with icon
- **Translations** — Kitchen module labels

---

## Phase 6: Asset/Maintenance Management (Low Priority)

### New Files
- **`src/pages/app/assets/AssetDashboard.tsx`** — Equipment counts by status (active/maintenance/retired), upcoming maintenance schedule, AMC expiry alerts
- **`src/pages/app/assets/AssetRegistryPage.tsx`** — CRUD for equipment: name, category, serial number, purchase date, purchase cost, location, department, status, warranty expiry, vendor
- **`src/pages/app/assets/MaintenanceSchedulePage.tsx`** — Preventive maintenance calendar, work orders (open/in-progress/completed), technician assignment
- **`src/pages/app/assets/AMCTrackingPage.tsx`** — Annual Maintenance Contracts list, renewal dates, vendor contacts, cost tracking

### Database
- **Migration**: Create `assets` table and `maintenance_records` table with RLS

### Modified Files
- **App router + Sidebar** — Add Asset Management module
- **Translations** — Asset module labels

---

## Phase 7: Housekeeping (Standalone) (Low Priority)

### New Files
- **`src/pages/app/housekeeping/HousekeepingDashboard.tsx`** — Task summary: pending/in-progress/completed today, room turnover stats, issue count
- **`src/pages/app/housekeeping/TaskAssignmentsPage.tsx`** — Create/assign cleaning tasks to staff, priority levels, room/area selection, due time
- **`src/pages/app/housekeeping/InspectionChecklistPage.tsx`** — Configurable checklists per room type, inspector sign-off, photo evidence upload
- **`src/pages/app/housekeeping/IssueReportingPage.tsx`** — Report maintenance/cleanliness issues, track resolution status

### Database
- **Migration**: Create `housekeeping_tasks` and `housekeeping_inspections` tables

### Modified Files
- **App router + Sidebar** — Add Housekeeping module
- **Translations** — Housekeeping labels

---

## File Summary

| Phase | New Files | Modified Files | DB Migrations |
|-------|-----------|----------------|---------------|
| 1. Claim Scrubbing | 2 | 3 + translations | — |
| 2. ERA Reconciliation | 2 | 3 + translations | — |
| 3. Batch Submission | 1 | 1 + translations | — |
| 4. NPHIES Attachments | 1 | 2 + edge fn + translations | 1 (table + storage) |
| 5. Kitchen | 4 | router + sidebar + translations | — |
| 6. Asset Management | 4 | router + sidebar + translations | 1 (2 tables) |
| 7. Housekeeping | 4 | router + sidebar + translations | 1 (2 tables) |
| **Total** | **~18** | **~12** | **3** |

Implementation order follows priority: Phases 1-2 first (High), then 3-4 (Medium), then 5-7 (Low).


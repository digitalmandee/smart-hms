

# Blood Bank Module — Gap Analysis & Completion Plan

## Current State: What Works

1. **Donor Management** — Register, update, defer, view donors. Donor cards printable.
2. **Donation Recording** — Create donations with workflow: registered → screening → collecting → collected → processing → completed. Reject option exists.
3. **Inventory** — Add blood units manually, filter by group/component/status, track expiry.
4. **Blood Requests** — Create from OPD consultation (Blood tab) or standalone. Workflow: pending → processing → cross_matching → ready → issued.
5. **Cross-Match Tests** — Record major/minor cross-match, link to request and blood unit.
6. **Transfusions** — Schedule, start, complete, stop. Duration tracking.
7. **Labels** — Blood bag label printing with barcode.
8. **Dashboard** — Stats, stock widget, expiry alerts, pending requests, active transfusions.
9. **Analytics** — Monthly collection/consumption, blood group distribution, component volumes.

## Gaps Found

### Gap 1: No auto-creation of inventory from completed donation
When a donation reaches "completed" status, nothing automatically creates a `blood_inventory` record. The user must manually go to Inventory → New Unit. This is the critical missing link.

### Gap 2: No blood screening/testing workflow
The `blood_donations` table has `testing_status` and `screening_result` fields, but there is no UI to record mandatory blood tests (HIV, HBV, HCV, Syphilis, Malaria). These tests determine if blood is safe for use. Without this, blood goes to inventory without safety confirmation.

### Gap 3: No transfusion reaction recording UI
The `transfusion_reactions` table exists in the database with full schema (reaction_type, severity, symptoms, vitals, actions_taken, medications_given, outcome, investigation). But there is NO hook or UI page to record reactions. The "Stop (Reaction)" button on the transfusion detail page just changes status — no reaction form appears.

### Gap 4: No inventory status update on issue/transfuse
When a transfusion is started or blood is "issued" from a request, the `blood_inventory` unit status should change from `available` → `issued` → `transfused`. Currently, `useCreateTransfusion` and `useUpdateTransfusion` only invalidate queries — they don't update the blood unit's status.

### Gap 5: No surgery → blood request integration
OT module shows patient blood group but has no "Request Blood" action. During surgery, if blood is needed, there's no link to create a blood request from the surgery context (pre-op or intra-op).

### Gap 6: No discard/disposal workflow
Expired or contaminated units have no discard flow. Units just sit with "available" status past their expiry date. No UI to mark units as discarded with a reason.

## Plan

### 1. Auto-create inventory on donation completion
**File: `src/hooks/useBloodBank.ts`** — `useUpdateDonation`

When donation status changes to `completed`, automatically insert a `blood_inventory` record:
- Blood group from donor
- Component type = `whole_blood` (default)
- Volume = `volume_collected_ml`
- Status = `quarantine` (pending testing)
- Collection date from donation
- Expiry date = collection + 35 days (whole blood standard)
- Link via `donation_id`
- Bag number from donation

### 2. Blood screening tests UI
**New file: `src/pages/app/blood-bank/BloodTestingPage.tsx`**

- Show quarantined units in a table
- For each unit, a form to record test results: HIV, HBV, HCV, Syphilis, Malaria (positive/negative)
- All negative → move unit status to `available`
- Any positive → move unit to `discarded` with reason
- Store results in the donation's `screening_result` field as JSON or update `testing_status`

**File: `src/hooks/useBloodBank.ts`** — Add `useQuarantinedUnits()` hook and `useRecordTestResults()` mutation

### 3. Transfusion reaction recording
**New file: `src/pages/app/blood-bank/TransfusionReactionForm.tsx`**

- Dialog/form that opens from TransfusionDetailPage when "Stop (Reaction)" is clicked
- Fields: reaction_type (febrile, allergic, hemolytic, anaphylactic, TRALI, other), severity, symptoms checklist, vitals at reaction, actions taken, medications given
- On submit: insert into `transfusion_reactions`, update transfusion status to `stopped`

**File: `src/hooks/useBloodBank.ts`** — Add `useCreateTransfusionReaction()` mutation

### 4. Auto-update inventory status on issue/transfuse
**File: `src/hooks/useBloodBank.ts`**

- In `useCreateTransfusion`: after creating transfusion, update blood unit status to `reserved`
- When transfusion starts (`in_progress`): update unit to `issued`
- When transfusion completes: update unit to `transfused`
- When transfusion is stopped: update unit to `transfused` (partially used)
- When request status → `issued`: update `units_issued` count

### 5. Surgery blood request button
**File: `src/pages/app/ot/SurgeryDetailPage.tsx`**

- Add "Request Blood" button in the surgery detail sidebar
- Navigates to `/app/blood-bank/requests/new?patientId=X&surgeryId=Y&bloodGroup=Z`

**File: `src/pages/app/blood-bank/BloodRequestFormPage.tsx`**

- Read `surgeryId` from search params
- Auto-fill patient and blood group when coming from surgery

### 6. Discard/disposal flow
**File: `src/pages/app/blood-bank/InventoryPage.tsx`**

- Add "Discard" action button on each unit row
- Opens dialog: reason (expired, contaminated, damaged, reactive), notes
- Updates unit status to `discarded`

### 7. Add route and sidebar link for Blood Testing
**File: routes and sidebar config** — Add `/app/blood-bank/testing` route and menu item

### 8. i18n updates
**Files: `en.ts`, `ar.ts`, `ur.ts`** — New keys for: Blood Testing, Screening Results, HIV, HBV, HCV, Syphilis, Malaria, Reaction Type, Severity, Discard Unit, Reason, Request Blood, Quarantine, all test-related labels

## Files Changed
- `src/hooks/useBloodBank.ts` — auto-create inventory on donation complete, quarantine hooks, reaction mutation, inventory status sync
- `src/pages/app/blood-bank/BloodTestingPage.tsx` — new page for screening tests
- `src/pages/app/blood-bank/TransfusionDetailPage.tsx` — reaction form dialog on stop
- `src/pages/app/blood-bank/InventoryPage.tsx` — discard action
- `src/pages/app/blood-bank/BloodRequestFormPage.tsx` — surgery context auto-fill
- `src/pages/app/ot/SurgeryDetailPage.tsx` — "Request Blood" button
- Route config + sidebar config — testing page route
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys


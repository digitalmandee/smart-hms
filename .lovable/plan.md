

# Dialysis Module — Fix Missing Flows, Seed Data & Schedule-to-Session Bridge

## Problems Found

1. **No machines exist** — the machines query returns `[]`. Cannot assign machine/chair to sessions
2. **No "Start Session from Schedule"** — schedule page shows entries but there is no button to create a session from a schedule row
3. **No session number generation** — `session_number` is not auto-generated
4. **Billing column hardcodes `status="pending"`** — does not join `invoices` table for real status
5. **Machine dropdown empty** on New Session page because no machines are seeded
6. **Schedule list has no "Create Session" action** — you created a schedule but cannot convert it to a session

## What to Build

### 1. Seed Machines & Pricing via SQL Insert
Insert 6 dialysis machines (Machine-01 through Machine-06) with chair numbers, model, and status "available". Verify `service_types` has "Dialysis Session" with price 8000.

### 2. Add "Create Session" button on Schedule page
**File: `DialysisSchedulePage.tsx`**

Add an action column to the `ReportTable` with a "Create Session" button per row. On click, navigate to `/app/dialysis/sessions/new?patient_id={dialysis_patient_id}&shift={shift}&pattern={pattern}` so the New Session page pre-fills from the schedule.

### 3. Auto-fill New Session from schedule query params
**File: `DialysisNewSessionPage.tsx`**

Read `patient_id`, `shift` from URL search params. Auto-select the patient and shift when the page loads from a schedule link.

### 4. Auto-generate session_number on creation
**File: `useDialysis.ts` — `useCreateDialysisSession`**

Generate `DS-{YYYYMMDD}-{random3}` as `session_number` before insert.

### 5. Fix billing column to show real invoice status
**File: `DialysisSessionsPage.tsx`**

Update session query to join `invoices(id, status, invoice_number)` via `invoice_id`. Show real status instead of hardcoded "pending".

### 6. Add "Start Session" action on Dashboard today's sessions
**File: `DialysisDashboard.tsx`**

Add row-click to navigate to session detail so nurses can start/complete from the dashboard view.

## Technical Details

- Machine seed: 6 machines with `organization_id = 'b1111111-...'`, `branch_id = 'c1111111-...'`, status `available`
- Session number format: `DS-20260330-XXX` (3 random digits)
- Schedule → Session pre-fill uses URL search params
- Invoice join: change sessions query select to include `invoices!invoice_id(id, status, invoice_number)`

## Files Changed
- SQL insert: seed 6 machines into `dialysis_machines`
- `src/pages/app/dialysis/DialysisSchedulePage.tsx` — add "Create Session" action column
- `src/pages/app/dialysis/DialysisNewSessionPage.tsx` — read search params, auto-fill
- `src/hooks/useDialysis.ts` — auto-generate session_number
- `src/pages/app/dialysis/DialysisSessionsPage.tsx` — fix invoice status column with real join
- `src/pages/app/dialysis/DialysisDashboard.tsx` — clickable today's sessions


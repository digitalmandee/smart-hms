

# Dialysis Module — Full Verification & Enhancement Plan

## Current State: 10 Pages, All Functional

| Screen | Route | Status | Issues Found |
|--------|-------|--------|-------------|
| Dashboard | `/app/dialysis` | Working | Stats, today's sessions, quick links |
| Patients List | `/app/dialysis/patients` | Working | Shows access type, hepatitis badges |
| Enroll Patient | `/app/dialysis/patients/enroll` | Working | Search + clinical metadata form |
| Machines | `/app/dialysis/machines` | Working | Grid cards, status change, disinfection |
| New Session | `/app/dialysis/sessions/new` | Working | Patient, machine, prescription fields |
| Sessions List | `/app/dialysis/sessions` | Working | All sessions with vitals summary |
| Session Detail | `/app/dialysis/sessions/:id` | Working | Start/Complete/Cancel/No-Show, vitals chart |
| Schedule List | `/app/dialysis/schedule` | Working | Grouped by pattern+shift |
| Create Schedule | `/app/dialysis/schedule/new` | Working | Pattern/shift/machine/chair |
| Reports | `/app/dialysis/reports` | Working | Status bar, access pie, UF trend |

## Gaps Found in Treatment Workflow

| # | Gap | Severity | Detail |
|---|-----|----------|--------|
| 1 | **Pre-dialysis vitals not captured on Start** | HIGH | DB has `pre_bp_systolic`, `pre_bp_diastolic`, `pre_pulse`, `pre_temperature` columns but the "Start Session" workflow only captures `pre_weight_kg`. BP/pulse/temp are ignored. |
| 2 | **Post-dialysis vitals not captured on Complete** | HIGH | DB has `post_bp_systolic`, `post_bp_diastolic`, `post_pulse` but "Complete Session" only captures `post_weight_kg`. |
| 3 | **No actual start/end time tracking** | MEDIUM | DB has `actual_start_time` and `actual_end_time` but code never sets them. Duration calculation impossible. |
| 4 | **No doctor assignment UI** | MEDIUM | DB has `attended_by` (doctor FK) and `nurse_id` but session detail has no dropdowns for these. |
| 5 | **No doctor notes field** | MEDIUM | DB has `doctor_notes` column but UI only shows `nursing_notes` and `complications`. |
| 6 | **Session outcome summary incomplete** | MEDIUM | Completed session shows weight/UF but not BP comparison, duration, or treatment adequacy. |
| 7 | **`useUpdateDialysisSession` type too narrow** | LOW | Mutation type doesn't include pre/post BP, pulse, temperature, doctor_notes, attended_by, nurse_id, actual times. |
| 8 | **Session detail fetches ALL sessions** | LOW | Uses `useDialysisSessions()` then `.find(id)` — inefficient. |
| 9 | **No i18n on any dialysis page** | LOW | All 10 pages hardcode English strings. |

## Implementation Plan

### 1. Expand `useUpdateDialysisSession` mutation type
Add all missing fields: `pre_bp_systolic`, `pre_bp_diastolic`, `pre_pulse`, `pre_temperature`, `post_bp_systolic`, `post_bp_diastolic`, `post_pulse`, `actual_start_time`, `actual_end_time`, `doctor_notes`, `attended_by`, `nurse_id`.

### 2. Enhance Session Detail — Pre-Dialysis Assessment
When status is `scheduled`, show a "Pre-Dialysis Assessment" card with:
- Pre-Weight (existing)
- Pre-BP (systolic/diastolic)
- Pre-Pulse
- Pre-Temperature
- On "Start Session": save all pre-vitals + set `actual_start_time = now()` + status = `in_progress`

### 3. Enhance Session Detail — Completion Form
When status is `in_progress`, show:
- Post-Weight (existing)
- Post-BP (systolic/diastolic)
- Post-Pulse
- Actual UF (ml)
- Complications (existing)
- Nursing Notes (existing)
- Doctor Notes (new field)
- On "Complete Session": save all post-vitals + set `actual_end_time = now()` + status = `completed`

### 4. Add Doctor & Nurse Assignment
In the session info cards area, add a staff assignment section:
- Doctor dropdown (from doctors table)
- Nurse dropdown (from profiles/staff)
- Saved via `useUpdateDialysisSession`

### 5. Enhance Completed Session Summary
Show a comprehensive treatment outcome card:
- Pre vs Post weight comparison with weight loss calculated
- Pre vs Post BP comparison
- Duration (actual_end - actual_start)
- UF achieved vs target
- Prescription recap (dialyzer, BFR, DFR, heparin)
- Complications and notes
- Attending doctor and nurse names

### 6. Add `useDialysisSession(id)` single-session query
Query by ID directly instead of fetching all sessions — improves performance.

### 7. i18n for all dialysis pages
Add translation keys in en.ts, ar.ts, ur.ts for all 10 pages. Use `useTranslation` hook throughout.

## Files Changed
- `src/hooks/useDialysis.ts` — expand mutation type, add single-session hook
- `src/pages/app/dialysis/DialysisSessionDetailPage.tsx` — pre/post assessment, staff assignment, outcome summary
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — dialysis i18n keys




# Evaluation: OPD Token Flow, Display UI, and Multi-Department Filtering

## Overall Assessment

The implementation is **well-structured and complete** from a code perspective. All the planned features have been implemented correctly. However, there are several issues that prevent real verification and a few code-level improvements needed.

---

## What Works Well

1. **Token Generation Flow** -- `OPDWalkInPage` wizard with 4-step flow (Patient, Doctor, Payment, Complete) is fully wired. Token numbers auto-generate via DB trigger `generate_opd_token`. Department-prefixed tokens (e.g., `MED-001`) are supported via `formatTokenDisplay`.

2. **Three Display Screens** -- All three display pages exist and are functional:
   - `TokenKioskPage` (internal, auth-required) -- has real-time Supabase subscription, dark/light mode, audio chime, department selector, recently completed section
   - `QueueDisplayPage` (internal) -- has department selector, priority indicators, fullscreen, real-time subscription
   - `PublicQueueDisplay` (public, no auth) -- supports `deptCode` URL param, resolves to department ID, department branding

3. **Routing** -- Both routes exist in `App.tsx`:
   - `/display/queue/:organizationId` (all departments)
   - `/display/queue/:organizationId/:deptCode` (specific department)

4. **KioskSetupPage** -- Generates per-department URLs with copy/preview buttons. Shows "no departments configured" message when empty.

5. **Hooks** -- `usePublicOPDQueue` supports optional `opdDepartmentId` filter. `usePublicOPDDepartmentByCode` resolves code to ID. All hooks include `opd_department` in their select queries.

6. **Translations** -- All 8+ keys exist in en/ar/ur for `opd.nowServing`, `opd.nextUp`, `opd.recentlyCompleted`, `opd.inConsultation`, `opd.consultationComplete`, `opd.allDepartments`, `opd.departmentDisplay`, `opd.noDepartmentsConfigured`, `opd.departmentSpecificDisplays`.

7. **PrintableTokenSlip** -- Accepts `departmentCode` and `departmentName` props. Uses `formatTokenDisplay` for prefixed tokens.

---

## Issues Found

### Critical: No Test Data
- **0 appointments today** in the database (39 total, all historical)
- **0 OPD departments** configured
- Without data, none of the display screens can be visually verified
- This is the single biggest blocker for end-to-end testing

### Code Issues

1. **PublicQueueDisplay duplicates query logic** -- Lines 71-112 manually construct a Supabase query instead of using the already-existing `usePublicOPDQueue` hook. This means:
   - Double maintenance burden
   - The hook has `refetchInterval: 5000` but the component also has `setInterval(fetchQueue, 10000)` plus a real-time subscription -- triple polling
   - Fix: Replace the manual query with `usePublicOPDQueue(organizationId, department?.id)`

2. **Recently Completed in TokenKioskPage relies on raw payload** -- Line 73-82: When an appointment completes, the `payload.new` object from Supabase real-time does NOT include joined relations (`patient`, `doctor`, `opd_department`). So `recentlyCompleted` entries will have no `opd_department.code`, and `formatTokenDisplay` on line 300 will fall back to raw numbers. The display will show `001` instead of `MED-001` for completed tokens.

3. **QueueDisplayPage has no "Recently Completed" section** -- The plan mentioned adding it, and `TokenKioskPage` has it, but `QueueDisplayPage` does not. This is an inconsistency.

4. **TokenKioskPage `OPDDepartmentSelector` has no `branchId`** -- Line 160-168: The selector is rendered without a `branchId` prop. The `useOPDDepartments` hook filters by `branchId` when provided. If the organization has multiple branches, this may show departments from all branches or none, depending on the hook's default behavior.

5. **PublicQueueDisplay `fetchQueue` has a closure issue** -- Line 139: The `useEffect` dependency array includes `department` (an object), which will cause infinite re-renders if the reference changes on each render. Should use `department?.id` instead.

6. **Audio chime plays only for first `nowServing` change** -- Both `TokenKioskPage` (line 109) and `QueueDisplayPage` (line 94) only track `nowServing[0]`. If multiple doctors are serving simultaneously and a second doctor starts serving, no chime plays.

### Minor Issues

7. **Hardcoded English strings in QueueDisplayPage** -- Lines 197, 232, 258, 309, 328, 339 use hardcoded English ("Emergency Patients", "Now Serving", "UP NEXT", "waiting") instead of translation keys.

8. **Hardcoded English in PublicQueueDisplay** -- Lines 196, 258, 301, 309, 347 use hardcoded English ("OPD Queue Display", "NOW SERVING", "UP NEXT", "No patients waiting").

9. **KioskSetupPage hardcoded English** -- All card titles, descriptions, and instructions are hardcoded English instead of using translation keys.

---

## Recommended Next Steps

### Priority 1: Seed Test Data
Create OPD departments and today's appointments so the displays can be verified visually. This could be done via:
- An edge function that seeds departments (Medicine/MED, Surgery/SURG, Pediatrics/PED) and 10-15 appointments with various statuses
- Or manual SQL inserts

### Priority 2: Fix PublicQueueDisplay
Refactor to use `usePublicOPDQueue` hook instead of duplicating query logic. Remove the triple-polling (hook interval + manual interval + real-time subscription).

### Priority 3: Fix Recently Completed Data
The `payload.new` from real-time subscriptions does not contain joined data. Either:
- Re-fetch the full appointment with joins when a completion event fires
- Or query recently completed appointments separately (WHERE status = 'completed' AND updated_at > NOW() - 2 minutes)

### Priority 4: Translate Hardcoded Strings
Add translation key usage to `QueueDisplayPage`, `PublicQueueDisplay`, and `KioskSetupPage` for all hardcoded English strings.

---

## Summary Table

| Area | Status | Notes |
|------|--------|-------|
| Token Generation (Walk-In) | Code complete | Untestable without data |
| TokenKioskPage | Code complete | Recently completed dept codes broken |
| QueueDisplayPage | Code complete | No recently completed section |
| PublicQueueDisplay | Code complete | Duplicates hook logic, triple polling |
| Per-Dept Routing | Code complete | Route and URL generation working |
| KioskSetupPage | Code complete | All English hardcoded |
| usePublicQueue hooks | Code complete | All 3 hooks correct |
| PrintableTokenSlip | Code complete | Dept code/name props wired |
| Translations | Partial | Keys exist but many screens still hardcoded |
| Test Data | Missing | 0 departments, 0 today appointments |


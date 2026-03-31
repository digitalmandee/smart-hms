

# HR Module Audit & Payroll Approval Flow

## 1. Payroll Admin Approval Flow

### Current State
- Payroll status enum: `draft → processing → completed → cancelled`
- `payroll_runs` table has `approved_by` column (unused)
- No approval step — HR can directly mark payroll as "completed" which triggers journal entry posting

### Changes

**Migration**: Add `pending_approval` and `approved` to `payroll_run_status` enum
```sql
ALTER TYPE public.payroll_run_status ADD VALUE 'pending_approval' AFTER 'processing';
ALTER TYPE public.payroll_run_status ADD VALUE 'approved' AFTER 'pending_approval';
```

**File: `src/pages/app/hr/payroll/PayrollRunDetailPage.tsx`**
- Change flow: `draft → processing → pending_approval → approved → completed`
- "processing" status shows "Submit for Approval" button (sets status to `pending_approval`)
- "pending_approval" shows approval info banner + "Approve" / "Reject (→ draft)" buttons (admin/finance_manager only)
- On approve: set `approved_by = auth.uid()`, status = `approved`
- "approved" shows "Mark Completed" (triggers journal entry + WPS)
- Add role check: only `org_admin`, `super_admin`, `finance_manager` can approve

**File: `src/hooks/usePayroll.ts`**
- Add `useApprovePayrollRun` mutation that sets `approved_by` + status
- Update `usePayrollRun` to fetch `approved_by_profile`

**File: `src/pages/app/hr/payroll/PayrollPage.tsx`**
- Add "Pending Approval" filter/tab
- Show approval badge on payroll list

---

## 2. HR Module Audit — Gaps Found & Fixes

### A. Onboarding
- **Working**: Checklist-based onboarding with progress tracking, step toggle, initiate dialog
- **Gap**: No offboarding link — when resignation is accepted, onboarding page should show "Offboarding" section or link to Exit module
- **Fix**: Add offboarding awareness banner on OnboardingPage linking to Exit → Clearance

### B. Offboarding / Exit
- **Working**: Resignations (submit/acknowledge/accept/reject), Clearance (department checklist), Final Settlements (with ESB calc), Exit Interviews
- **Gap**: No automated trigger — accepting a resignation doesn't auto-create clearance items
- **Fix**: In `useUpdateResignation`, when status changes to "accepted", auto-initiate clearance items for that employee

### C. Duty Roster
- **Working**: Weekly view, department filter, shift assignment dialog, color-coded shifts
- **Gap 1**: No drag-drop (documented but not implemented) — acceptable, assignment dialog works
- **Gap 2**: No publish/notify flow — roster changes aren't communicated to employees
- **Fix**: Add "Publish Roster" button that sets a `published_at` timestamp and shows confirmation

### D. Attendance
- **Working**: Attendance sheet, corrections with approval, biometric devices page, overtime tracking
- **No critical gaps found**

### E. Leave Management
- **Working**: Two-level approval (dept head → HR), leave balances, calendar view
- **No critical gaps found**

### F. Recruitment
- **Working**: Job openings CRUD, applications with Kanban pipeline
- **Gap**: No auto-conversion of hired candidate to employee record
- **Fix**: Add "Convert to Employee" button on application when status = "hired"

### G. Training
- **Working**: Training records, certifications, CME tracking
- **No critical gaps found**

### H. Compliance
- **Working**: Medical fitness, vaccinations, disciplinary, licenses, documents, expiry tracker
- **No critical gaps found**

### I. Payroll (beyond approval)
- **Working**: Salary components, structures, employee salary assignment, payroll processing with wallet integration, loans, payslips
- **Gap**: Bank sheet / WPS generation page exists but may lack download
- **Fix**: Verify BankSheetPage has proper export

### J. Employee Management
- **Working**: CRUD, categories, department/designation assignment, profile tabs
- **No critical gaps found**

---

## 3. Translations (en/ar/ur)
Add keys for: `pendingApproval`, `approvePayroll`, `rejectPayroll`, `approvedBy`, `payrollApprovalRequired`, `convertToEmployee`, `publishRoster`, `initiateOffboarding`

## Files Changed
- 1 migration — extend `payroll_run_status` enum
- `src/pages/app/hr/payroll/PayrollRunDetailPage.tsx` — approval flow UI
- `src/hooks/usePayroll.ts` — approve mutation
- `src/pages/app/hr/payroll/PayrollPage.tsx` — pending approval filter
- `src/hooks/useExitManagement.ts` — auto-create clearance on resignation acceptance
- `src/pages/app/hr/OnboardingPage.tsx` — offboarding link banner
- `src/pages/app/hr/recruitment/ApplicationsPage.tsx` — convert-to-employee button
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

## Flow Summary (Post-Fix)

```text
PAYROLL FLOW:
  HR creates run (draft)
  → HR processes salaries (processing)
  → HR submits for approval (pending_approval)
  → Admin/Finance approves (approved) [sets approved_by]
  → HR marks completed (completed) [posts journal entry]

HIRE-TO-RETIRE FLOW:
  Recruitment: Job Opening → Applications → Interview → Hired → [Convert to Employee]
  Onboarding: Select employee → Checklist auto-created → Track progress → Complete
  Employment: Profile, salary, attendance, leaves, training, compliance
  Exit: Resignation → Accepted → [Auto-create clearance] → Clearance → Settlement → Exit Interview
```


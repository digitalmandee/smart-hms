

## Leave Approval Hierarchy: Department Head → HR Manager

### Current State
- The `leave_requests` table **already has** `approver_1_id`, `approver_1_action`, `approver_1_at`, `approver_1_remarks` and matching `approver_2_*` columns
- Departments have `head_employee_id` linking to the department head
- Current code ignores these columns entirely — approval just sets `status` directly to approved/rejected
- No hierarchy enforcement exists

### How It Will Work

```text
Employee submits leave
       ↓
  Status: "pending"
  approver_1_id = department head (auto-set)
       ↓
  Department Head approves
  approver_1_action = "approved", status stays "pending"
       ↓
  HR Manager/Admin approves
  approver_2_action = "approved", status → "approved"
       ↓
  If either rejects → status = "rejected"
```

### Changes Required

**1. Auto-assign department head on leave creation**
- Modify `useCreateLeaveRequest` in `src/hooks/useLeaves.ts` to look up the employee's department → `head_employee_id` → that employee's `profile_id`, and set `approver_1_id` automatically
- When employee self-applies in `MyLeavesPage.tsx`, same logic applies

**2. Two-level approval logic in `useLeaves.ts`**
- New `useLevel1ApproveLeave()` hook: department head approves/rejects → updates `approver_1_action`, `approver_1_at`, `approver_1_remarks`. If rejected, sets overall `status = 'rejected'`
- New `useLevel2ApproveLeave()` hook: HR manager approves/rejects → updates `approver_2_action`, `approver_2_at`, `approver_2_remarks`, and sets final `status`
- Keep existing `useApproveLeaveRequest` as a fallback for super_admin/org_admin who can do direct approval

**3. Update LeavesPage.tsx (HR Admin view)**
- Add "Approval Stage" column showing: "Awaiting Dept Head" / "Awaiting HR" / "Approved" / "Rejected"
- Show approver_1 and approver_2 details in the table
- HR managers see Level 2 approve/reject buttons only after Level 1 is done
- Department heads see Level 1 approve/reject buttons for their department's requests

**4. Update MyLeavesPage.tsx (Employee self-service)**
- Show approval progress: "Step 1: Department Head — Pending/Approved" → "Step 2: HR Manager — Pending/Approved"
- Display approver remarks when available

**5. Create a "My Approvals" page** (`src/pages/app/MyApprovalsPage.tsx`)
- Department heads see leave requests from their department employees that need Level 1 approval
- Route: `/app/my-approvals`

### Files to Create
- `src/pages/app/MyApprovalsPage.tsx` — department head approval queue

### Files to Modify
- `src/hooks/useLeaves.ts` — add Level 1/Level 2 approval hooks, auto-assign approver on creation
- `src/pages/app/hr/leaves/LeavesPage.tsx` — show approval hierarchy stages, level-appropriate buttons
- `src/pages/app/MyLeavesPage.tsx` — show two-step approval progress to employee
- `src/App.tsx` — add `/app/my-approvals` route

### No Database Changes Needed
The `leave_requests` table already has all required columns (`approver_1_id`, `approver_1_action`, `approver_1_at`, `approver_1_remarks`, `approver_2_id`, `approver_2_action`, `approver_2_at`, `approver_2_remarks`). Departments already have `head_employee_id`.


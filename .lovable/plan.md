

# Dedicated Commissions Page with Edit Capability

## Current State
- Commission data lives in the `doctor_earnings` table
- Existing pages are scattered: Doctor Earnings (record/view), Daily Commissions (date-based report), Wallet Balances (aggregated), Doctor Compensation (plans)
- **No edit mutation exists** for individual earnings — only create and mark-as-paid
- No single unified "Commissions" page

## Plan

### 1. Create `useUpdateDoctorEarning` mutation
**File: `src/hooks/useDoctorCompensation.ts`**
- Add mutation to update an existing earning record (doctor_share_percent, doctor_share_amount, gross_amount, source_type, notes, earning_date)
- Recalculate hospital_share_amount on edit

### 2. Create dedicated Commissions page
**New file: `src/pages/app/hr/payroll/CommissionsPage.tsx`**

A unified page showing:
- **Summary cards**: Total commissions, paid, unpaid, this month vs last month
- **Filters**: Doctor, date range (from/to), source type, paid/unpaid status
- **Table**: All commission records with columns — Date, Doctor, Patient, Source Type, Reference, Gross Amount, Share %, Doctor Share, Hospital Share, Status, Actions
- **Actions per row**: Edit (opens dialog to modify share %, amounts, source type, notes), Mark as Paid
- **Bulk actions**: Select multiple → Mark as Paid, Export CSV
- **Edit dialog**: Pre-filled form with earning details, auto-recalculates shares when % or gross changes

### 3. Add route and sidebar entry
**File: `src/App.tsx`** — Add route `/app/hr/payroll/commissions`
**File: `src/config/role-sidebars.ts`** — Add "Commissions" to HR admin, branch_admin, and accountant sidebars under Payroll section

### 4. i18n updates
**Files: `en.ts`, `ar.ts`, `ur.ts`**
- Keys: "Commissions", "Edit Commission", "Commission Details", "Date Range", "This Month", "Last Month", "Update Commission"

## Files Changed
- `src/hooks/useDoctorCompensation.ts` — add `useUpdateDoctorEarning` mutation
- `src/pages/app/hr/payroll/CommissionsPage.tsx` — new dedicated page
- `src/App.tsx` — add route
- `src/config/role-sidebars.ts` — add sidebar entry
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys


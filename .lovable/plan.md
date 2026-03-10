

## HR Module Gap Analysis for Hospital Operations

### What's Fully Built and Working (53 pages)

| Area | Pages | Status |
|------|-------|--------|
| **Employee Management** | Directory, Detail, Form, Doctors, Nurses, Paramedical, Support, Visiting | Functional |
| **Attendance** | Daily, Sheet, Corrections, Reports, Duty Roster, OT Roster, Emergency Roster, On-Call, Overtime, Publish, Biometric Devices, Shift Handover | Functional |
| **Leaves** | Types Setup, Balances, Requests/Approvals, Calendar | Functional |
| **Payroll** | Runs, Process, Payslips, Salaries, Doctor Compensation, Doctor Wallet, Earnings, Loans/Advances, Bank Sheet, Commission, Reports | Functional |
| **Compliance** | Dashboard, Medical Licenses, Expiry Tracker, Documents, Fitness, Vaccinations, Disciplinary | Functional |
| **Recruitment** | Job Openings, Applications (with pipeline: received → screening → interview → offer → hired) | Functional |
| **Training** | Programs, Enrollments | Functional |
| **Exit Management** | Resignations, Clearance, Settlements, Exit Interviews | Functional |
| **Contracts** | Contract management with types, probation tracking | Functional |
| **Onboarding** | Checklist-based pipeline | Functional |
| **Letters** | Template-based HR letter generation | Functional |
| **Setup** | Departments, Designations, Categories, Holidays, Leave Types, Salary Components, Shifts, Tax Slabs | Functional |
| **Self-Service** | My Leaves, My Attendance | Functional |
| **Reports** | Employee Performance Report | Functional |

### Gaps Identified — Missing for Hospital HR

| # | Gap | Priority | Why Hospitals Need It |
|---|-----|----------|----------------------|
| 1 | **Employee Transfer / Rotation** | High | Hospital staff rotate between branches, wards, departments. No transfer request → approval → execution workflow exists. |
| 2 | **Promotion Management** | High | No formal promotion history tracking (designation change, grade change, salary revision with effective date). |
| 3 | **Grievance Management** | High | No employee grievance submission → investigation → resolution tracking. Required for CBAHI/JCI accreditation. |
| 4 | **Org Chart Visualization** | Medium | Documentation mentions it, but no actual visual org chart page exists. |
| 5 | **Warning / Show Cause Letters** | Medium | Disciplinary page tracks actions but doesn't generate formal warning letters or show-cause notices (should integrate with Letters module). |
| 6 | **Employee Self-Service Portal** | Medium | Only My Leaves and My Attendance exist. Missing: My Payslips, My Documents, My Training, My Profile Edit. |
| 7 | **Overtime Approval Workflow** | Medium | OvertimePage exists but lacks a formal request → manager approval → payroll integration flow. |
| 8 | **End-of-Service Benefit (ESB) Calculator** | Medium | Settlements page exists but no automated ESB calculation per labor law rules. |
| 9 | **Manpower Planning / Headcount Budget** | Low | No department-level headcount budgeting vs actual tracking. |
| 10 | **Employee Insurance Management** | Low | No tracking of employee health insurance cards, dependents, coverage details. |

### Implementation Plan

**Phase 1 — High Priority (3 items)**

**1. Employee Transfer Page** (`src/pages/app/hr/TransferPage.tsx`)
- New hook `useTransfers` with CRUD against new `employee_transfers` table
- Form: employee, from department/branch, to department/branch, transfer date, reason, status (requested/approved/executed)
- Auto-update employee record on execution
- Migration to create `employee_transfers` table

**2. Promotion History Page** (`src/pages/app/hr/PromotionsPage.tsx`)
- New hook `usePromotions` with CRUD against new `employee_promotions` table
- Form: employee, old/new designation, old/new grade, old/new salary, effective date, reason, approved by
- Timeline view of promotion history per employee
- Migration to create `employee_promotions` table

**3. Grievance Management Page** (`src/pages/app/hr/GrievancesPage.tsx`)
- New hook `useGrievances` with CRUD against new `employee_grievances` table
- Form: employee, category (workplace safety, harassment, discrimination, compensation, management, facilities, other), description, filed date
- Status flow: filed → under_review → investigation → resolved → closed
- Resolution notes, action taken, escalation tracking
- Migration to create `employee_grievances` table

**Phase 2 — Medium Priority (4 items)**

**4. Org Chart Page** (`src/pages/app/hr/OrgChartPage.tsx`)
- Visual tree built from departments + employees + reporting_manager relationships
- Uses existing data, no new tables needed

**5. Self-Service Expansion** — Add 3 new pages:
- `MyPayslipsPage.tsx` — employee views own payslips
- `MyDocumentsPage.tsx` — employee views/uploads own documents
- `MyTrainingPage.tsx` — employee views enrolled trainings

**6. ESB Calculator** — Add to SettlementsPage
- Auto-calculate based on join date, last working date, basic salary, labor law rules
- No new table, enhances existing settlements form

**7. Warning Letter Integration** — Add to DisciplinaryPage
- "Generate Letter" button that creates an HR letter from disciplinary action data
- Uses existing `hr_letter_templates` system

### Database Migrations Needed

```sql
-- employee_transfers
CREATE TABLE employee_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  employee_id UUID REFERENCES employees(id) NOT NULL,
  from_department_id UUID REFERENCES departments(id),
  to_department_id UUID REFERENCES departments(id),
  from_branch_id UUID REFERENCES branches(id),
  to_branch_id UUID REFERENCES branches(id),
  transfer_date DATE NOT NULL,
  effective_date DATE,
  reason TEXT,
  status TEXT DEFAULT 'requested', -- requested, approved, rejected, executed
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- employee_promotions
CREATE TABLE employee_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  employee_id UUID REFERENCES employees(id) NOT NULL,
  old_designation_id UUID REFERENCES designations(id),
  new_designation_id UUID REFERENCES designations(id),
  old_salary NUMERIC(12,2),
  new_salary NUMERIC(12,2),
  effective_date DATE NOT NULL,
  reason TEXT,
  approved_by UUID REFERENCES profiles(id),
  letter_issued BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- employee_grievances
CREATE TABLE employee_grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  employee_id UUID REFERENCES employees(id) NOT NULL,
  grievance_number TEXT,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  filed_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'filed',
  assigned_to UUID REFERENCES profiles(id),
  resolution_notes TEXT,
  resolved_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Files to Create
- `supabase/migrations/xxx_employee_transfers_promotions_grievances.sql`
- `src/hooks/useTransfers.ts`
- `src/hooks/usePromotions.ts`
- `src/hooks/useGrievances.ts`
- `src/pages/app/hr/TransfersPage.tsx`
- `src/pages/app/hr/PromotionsPage.tsx`
- `src/pages/app/hr/GrievancesPage.tsx`
- `src/pages/app/hr/OrgChartPage.tsx`
- `src/pages/app/MyPayslipsPage.tsx`
- `src/pages/app/MyDocumentsPage.tsx`
- `src/pages/app/MyTrainingPage.tsx`

### Files to Modify
- `src/App.tsx` — Add routes for new pages
- `src/pages/app/hr/exit/SettlementsPage.tsx` — Add ESB auto-calculation
- `src/pages/app/hr/compliance/DisciplinaryPage.tsx` — Add "Generate Warning Letter" button

### What Won't Change
- All existing 53 working pages remain untouched
- No changes to existing hooks or database tables
- Existing seed data unaffected


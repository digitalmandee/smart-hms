

## HR Module: Missing Icons + Documentation Overhaul

### Problem 1: Missing Sidebar Icons

Several HR features have routes in `App.tsx` but **no `menu_items` entries** in the database, so they're invisible in the sidebar. Additionally, some features that DO have pages are only accessible by direct URL.

**Missing from sidebar (routes exist, no menu_items):**

| Feature | Route | Suggested Parent |
|---------|-------|-----------------|
| Onboarding | `/app/hr/onboarding` | Employees |
| HR Letters | `/app/hr/letters` | HR & Staff (top-level) |
| Contracts | `/app/hr/contracts` | HR & Staff (top-level) |
| Training | `/app/hr/training` | HR & Staff (top-level) |
| Expiry Tracker | `/app/hr/compliance/expiry-tracker` | Compliance |
| Compliance Dashboard | `/app/hr/compliance` | Compliance |
| Paramedical Staff | `/app/hr/paramedical` | Employees |
| Support Staff | `/app/hr/support-staff` | Employees |
| Visiting Doctors | `/app/hr/visiting-doctors` | Employees |
| Job Openings | `/app/hr/recruitment/jobs` | new "Recruitment" group |
| Applications | `/app/hr/recruitment/applications` | new "Recruitment" group |
| Resignations | `/app/hr/exit/resignations` | new "Exit Management" group |
| Clearance | `/app/hr/exit/clearance` | Exit Management |
| Final Settlements | `/app/hr/exit/settlements` | Exit Management |
| Exit Interviews | `/app/hr/exit/interviews` | Exit Management |
| Duty Roster | `/app/hr/attendance/roster` | Attendance |
| On-Call Schedule | `/app/hr/attendance/on-call` | Attendance |
| Overtime | `/app/hr/attendance/overtime` | Attendance |
| OT Duty Roster | `/app/hr/attendance/ot-roster` | Attendance |
| Disciplinary | (if exists) | Compliance |

**Fix:** Insert ~25 `menu_items` rows via migration, adding new parent groups (Recruitment, Exit Management) and child items. All icons used already exist in `iconMap` (e.g., `GraduationCap`, `DoorOpen`, `Briefcase`, `ScrollText`, `Megaphone`, `Award`, etc.) — some new icons like `FileCheck`, `UserCog`, `Briefcase` need to be added to the `iconMap` and `SIDEBAR_NAME_TO_KEY` in `DynamicSidebar.tsx` and `MobileSideMenu.tsx`.

### Problem 2: Documentation is Incomplete

Current HR documentation has 7 pages covering only 5 topics: Employee Management, Attendance & Leave, Payroll, Recruitment. The actual module has **12+ functional areas**. Missing documentation sections:

1. **Compliance & Licenses** — Medical licenses, employee documents, vaccinations, medical fitness, expiry tracker
2. **Doctor/Nurse Management** — Doctor onboarding, compensation plans, wallet/earnings, nurse specialization
3. **Exit Management** — Resignations, clearance, final settlements, exit interviews
4. **Training & Development** — Clinical certifications, training records
5. **HR Letters & Contracts** — Offer letters, NOC, contract management, renewals
6. **Safety & Incidents** — Workplace safety incident reporting
7. **Advanced Attendance** — Duty rosters, on-call, overtime, OT roster, shift handover

**Fix:** Expand documentation from 7 pages to 14 pages:

| Page | Section |
|------|---------|
| 1 | Cover (updated features list) |
| 2 | Table of Contents (expanded) |
| 3 | Process Flow (updated with full lifecycle) |
| 4 | Employee Management (existing) |
| 5 | Doctor & Nurse Management (NEW) |
| 6 | Attendance & Leave (existing, expanded with roster/OT) |
| 7 | Payroll Processing (existing, expanded with doctor wallet) |
| 8 | Recruitment & Onboarding (existing, expanded) |
| 9 | Compliance & Licenses (NEW) |
| 10 | HR Letters & Contracts (NEW) |
| 11 | Training & Development (NEW) |
| 12 | Exit Management (NEW) |
| 13 | Safety & Incidents (NEW) |
| 14 | Reports & Analytics (NEW) |

### Implementation Plan

1. **Migration**: Insert all missing `menu_items` rows with correct icons, parent IDs, sort orders, and organization_id
2. **DynamicSidebar.tsx + MobileSideMenu.tsx**: Add any missing icon imports to `iconMap` and translation keys to `SIDEBAR_NAME_TO_KEY`
3. **New doc components**: Create 7 new files in `src/components/hr-docs/`:
   - `HrDocDoctorNurse.tsx`
   - `HrDocCompliance.tsx`
   - `HrDocLettersContracts.tsx`
   - `HrDocTraining.tsx`
   - `HrDocExit.tsx`
   - `HrDocSafety.tsx`
   - `HrDocReports.tsx`
4. **Update existing docs**:
   - `HrDocCover.tsx` — update feature list
   - `HrDocToc.tsx` — expand to 14 pages
   - `HrDocFlow.tsx` — add compliance/exit steps
   - `HrDocAttendance.tsx` — add roster/OT/on-call
   - `HrDocPayroll.tsx` — add doctor wallet/earnings
   - `HrDocRecruitment.tsx` — expand onboarding section
5. **HrDocumentation.tsx**: Add all new page components to the pages array, update total pages

### Document/License Flow for Doctors

Currently, when adding a doctor via Employee Form:
- **Documents tab** exists with `DocumentUploadSection` (CNIC, certificates, contracts with expiry dates)
- **Doctor Details tab** captures license number, qualification, specialization
- **Compliance section** has Medical Licenses page, Employee Documents page, Expiry Tracker

The flow is: Add Employee → Fill Doctor Details (license #) → Upload Documents → Compliance tracks expiry. The documentation will explicitly document this workflow in the new "Doctor & Nurse Management" section.


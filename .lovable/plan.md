

## HR Module Audit — Current State & Gaps

### What's Already Built (Comprehensive)

| Area | Pages | Status |
|------|-------|--------|
| **Employee Management** | Employee List, Detail, Form, Directory | Built |
| **Staff Types** | Doctors, Nurses, Paramedical, Support, Visiting Doctors | Built |
| **Attendance** | Attendance Sheet, Corrections, Reports, Biometric Devices, Overtime | Built |
| **Duty Rosters** | Weekly Roster, OT Duty Roster, Emergency Roster, On-Call Schedule, Publish Roster, Shift Handover, Roster Reports | Built |
| **Leaves** | Leave Requests, Approvals, Balances, Calendar | Built |
| **Payroll** | Payroll Run, Payslips, Salaries, Loans/Advances, Bank Sheet, Doctor Compensation/Earnings/Wallet, Reports | Built |
| **Recruitment** | Job Openings, Applications | Built |
| **Exit/Offboarding** | Resignations, Exit Interviews, Clearance Checklists, Final Settlements | Built |
| **Compliance** | Medical Licenses (with expiry tracking), Employee Documents, Medical Fitness, Vaccinations, Disciplinary (placeholder) | Built |
| **Setup** | Departments, Designations, Categories, Holidays, Leave Types, Salary Components, Shifts, Tax Slabs | Built |
| **Reports** | Employee Performance Report, HR Reports, Attendance Reports, Payroll Reports, Roster Reports | Built |

### What's Missing — Proposed New Features

1. **Employee Onboarding Workflow** — No onboarding module exists. Need a checklist-based onboarding flow: document collection, orientation scheduling, IT setup, uniform issuance, training assignments, probation tracking with milestones.

2. **Dedicated Expiry Tracker Page** — The Medical Licenses page tracks license expiry, but there's no unified expiry dashboard for ALL expiring items (licenses, contracts, visas, insurance, medical fitness certificates). A single page with filters by expiry type, color-coded urgency, and email/notification alerts.

3. **Document Upload for Doctors/Staff Licenses** — The compliance section tracks license data but lacks a direct file upload flow from the employee profile or doctor card. Need an "Upload License" button with file attachment, auto-extraction of expiry dates, and verification workflow.

4. **Training & Development Module** — No training management exists. Need: training programs catalog, enrollment, attendance tracking, certification tracking with expiry, mandatory training compliance reports.

5. **HR Letters & Templates** — No system for generating offer letters, experience certificates, salary certificates, warning letters, NOC letters. Need template management with variable substitution and PDF generation.

6. **Contract Management** — No contract tracking. Need: contract start/end dates, renewal alerts, probation-to-permanent conversion tracking, contract type management.

7. **Employee Self-Service Portal** — No self-service for employees to view their own payslips, leave balances, request documents, update personal info, or view attendance summary.

### Implementation Plan (Priority Order)

#### Phase 1: Onboarding + Expiry Tracker (High Impact)

**1. Employee Onboarding Page** (`src/pages/app/hr/OnboardingPage.tsx`)
- Checklist-based onboarding with configurable steps per category (doctor, nurse, admin)
- Status tracking: Pending → In Progress → Completed
- Auto-created when a new employee is added
- Dashboard showing all employees in onboarding pipeline
- DB: `employee_onboarding` table with `employee_id`, `step_name`, `category`, `is_completed`, `completed_at`, `completed_by`

**2. Unified Expiry Tracker** (`src/pages/app/hr/compliance/ExpiryTrackerPage.tsx`)
- Single dashboard for ALL expiring documents: licenses, contracts, visas, work permits, insurance, fitness certificates
- Color-coded: Red (expired), Amber (30 days), Yellow (90 days), Green (valid)
- Filter by type, department, urgency
- Export to CSV
- Pulls from existing `employee_documents` table, filtered by `expiry_date`

#### Phase 2: Document Upload + Letters

**3. License Upload Enhancement** — Add file upload to the existing Medical Licenses and Employee Documents pages with Supabase Storage integration

**4. HR Letters Module** (`src/pages/app/hr/LettersPage.tsx`)
- Template library: Offer, Experience, Salary Certificate, Warning, NOC
- Variable substitution from employee data
- PDF generation and download
- DB: `hr_letter_templates` and `hr_issued_letters` tables

#### Phase 3: Training + Contracts

**5. Training Module** (`src/pages/app/hr/training/`)
- Training programs, sessions, enrollment, completion tracking
- DB: `training_programs`, `training_sessions`, `training_enrollments`

**6. Contract Management** (`src/pages/app/hr/ContractsPage.tsx`)
- Contract tracking with renewal alerts
- Probation tracking and conversion

### Technical Notes
- New routes added to `App.tsx` under `/app/hr/`
- New nav items in HR sidebar
- DB migrations for new tables with RLS policies
- Supabase Storage bucket for document/license uploads
- All pages follow existing patterns (PageHeader, Card-based layouts, table/grid views)


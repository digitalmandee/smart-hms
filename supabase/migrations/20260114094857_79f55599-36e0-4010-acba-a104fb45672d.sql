
-- =============================================
-- PHASE 1: HR & STAFF MANAGEMENT MODULE
-- =============================================

-- 1. New Enums for HR Module
CREATE TYPE employee_type AS ENUM ('permanent', 'contractual', 'part_time', 'intern', 'consultant');
CREATE TYPE employment_status AS ENUM ('active', 'resigned', 'terminated', 'retired', 'on_leave', 'absconding');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'half_day', 'late', 'on_leave', 'holiday', 'weekend', 'work_from_home');
CREATE TYPE leave_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE payroll_run_status AS ENUM ('draft', 'processing', 'completed', 'cancelled');
CREATE TYPE shift_type AS ENUM ('morning', 'evening', 'night', 'rotational', 'flexible', 'general');
CREATE TYPE document_category AS ENUM ('identity', 'education', 'employment', 'medical', 'legal', 'other');
CREATE TYPE salary_component_type AS ENUM ('earning', 'deduction');
CREATE TYPE loan_status AS ENUM ('active', 'completed', 'cancelled', 'defaulted');

-- 2. Add new roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'hr_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'hr_officer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'store_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'finance_manager';

-- 3. Departments (with hierarchy for sub-departments)
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  head_employee_id UUID,
  description TEXT,
  cost_center_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- 4. Designations (Job Titles)
CREATE TABLE public.designations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  min_salary NUMERIC(12,2),
  max_salary NUMERIC(12,2),
  job_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- 5. Employee Categories
CREATE TABLE public.employee_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  requires_license BOOLEAN DEFAULT false,
  default_working_hours NUMERIC(4,2) DEFAULT 8,
  overtime_eligible BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- 6. Shifts
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  shift_type shift_type DEFAULT 'general',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 60,
  grace_period_minutes INTEGER DEFAULT 15,
  half_day_hours NUMERIC(4,2) DEFAULT 4,
  is_night_shift BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- 7. Employees (Core Employee Table)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  employee_number TEXT NOT NULL,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT,
  father_husband_name TEXT,
  date_of_birth DATE,
  gender gender,
  marital_status marital_status,
  nationality TEXT DEFAULT 'Pakistani',
  religion TEXT,
  blood_group TEXT,
  
  -- Contact Information
  personal_email TEXT,
  work_email TEXT,
  personal_phone TEXT,
  work_phone TEXT,
  permanent_address TEXT,
  current_address TEXT,
  city TEXT,
  postal_code TEXT,
  
  -- Identity Documents
  national_id TEXT,
  passport_number TEXT,
  passport_expiry DATE,
  driving_license TEXT,
  
  -- Employment Information
  category_id UUID REFERENCES public.employee_categories(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  designation_id UUID REFERENCES public.designations(id) ON DELETE SET NULL,
  reporting_manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_type employee_type DEFAULT 'permanent',
  employment_status employment_status DEFAULT 'active',
  
  -- Important Dates
  join_date DATE NOT NULL,
  confirmation_date DATE,
  resignation_date DATE,
  last_working_date DATE,
  probation_period_months INTEGER DEFAULT 3,
  
  -- Work Details
  shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  work_location TEXT,
  working_hours NUMERIC(4,2) DEFAULT 8,
  
  -- Bank Details
  bank_name TEXT,
  bank_branch TEXT,
  account_number TEXT,
  account_title TEXT,
  iban TEXT,
  
  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  
  -- Photos & Notes
  profile_photo_url TEXT,
  notes TEXT,
  
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, employee_number)
);

-- Add foreign key for department head after employees table exists
ALTER TABLE public.departments 
ADD CONSTRAINT departments_head_employee_id_fkey 
FOREIGN KEY (head_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;

-- 8. Employee Documents
CREATE TABLE public.employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  document_category document_category DEFAULT 'other',
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  document_number TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Employee Qualifications
CREATE TABLE public.employee_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  degree_name TEXT NOT NULL,
  institution TEXT,
  field_of_study TEXT,
  start_year INTEGER,
  completion_year INTEGER,
  grade TEXT,
  certificate_url TEXT,
  is_highest_qualification BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Employee Work History
CREATE TABLE public.employee_work_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  designation TEXT,
  start_date DATE,
  end_date DATE,
  leaving_reason TEXT,
  last_salary NUMERIC(12,2),
  reference_contact TEXT,
  duties TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Employee Dependents
CREATE TABLE public.employee_dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  date_of_birth DATE,
  national_id TEXT,
  is_emergency_contact BOOLEAN DEFAULT false,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Employee Licenses (for medical professionals)
CREATE TABLE public.employee_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  license_type TEXT NOT NULL,
  license_number TEXT NOT NULL,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE,
  document_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Shift Assignments
CREATE TABLE public.shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Weekly Offs
CREATE TABLE public.weekly_offs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  effective_from DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Holidays
CREATE TABLE public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  holiday_date DATE NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  applies_to_categories UUID[],
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, holiday_date)
);

-- 16. Biometric Devices
CREATE TABLE public.biometric_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_serial TEXT,
  device_type TEXT DEFAULT 'zkteco',
  ip_address TEXT,
  port INTEGER DEFAULT 4370,
  location TEXT,
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, device_serial)
);

-- 17. Attendance Records
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  
  -- Punches
  check_in TIME,
  check_out TIME,
  check_in_source TEXT DEFAULT 'manual',
  check_out_source TEXT,
  
  -- Device Info
  device_id UUID REFERENCES public.biometric_devices(id),
  check_in_location TEXT,
  check_out_location TEXT,
  
  -- Calculations
  working_hours NUMERIC(5,2),
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  late_minutes INTEGER DEFAULT 0,
  early_leave_minutes INTEGER DEFAULT 0,
  
  -- Status
  status attendance_status DEFAULT 'present',
  is_half_day BOOLEAN DEFAULT false,
  
  -- Adjustments
  remarks TEXT,
  adjusted_by UUID REFERENCES public.profiles(id),
  adjusted_at TIMESTAMPTZ,
  adjustment_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, attendance_date)
);

-- 18. Attendance Corrections
CREATE TABLE public.attendance_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID REFERENCES public.attendance_records(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  correction_date DATE NOT NULL,
  original_check_in TIME,
  original_check_out TIME,
  corrected_check_in TIME,
  corrected_check_out TIME,
  reason TEXT NOT NULL,
  status leave_request_status DEFAULT 'pending',
  requested_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. Leave Types
CREATE TABLE public.leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  annual_quota NUMERIC(5,2) DEFAULT 0,
  carry_forward_limit NUMERIC(5,2) DEFAULT 0,
  carry_forward_expiry_months INTEGER,
  is_paid BOOLEAN DEFAULT true,
  is_encashable BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT true,
  requires_document BOOLEAN DEFAULT false,
  min_days_notice INTEGER DEFAULT 1,
  max_consecutive_days INTEGER,
  applicable_genders TEXT[],
  applicable_categories UUID[],
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- 20. Leave Balances
CREATE TABLE public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  entitled NUMERIC(5,2) DEFAULT 0,
  carried_forward NUMERIC(5,2) DEFAULT 0,
  adjustment NUMERIC(5,2) DEFAULT 0,
  used NUMERIC(5,2) DEFAULT 0,
  pending NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- 21. Leave Requests
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC(5,2) NOT NULL,
  
  is_half_day BOOLEAN DEFAULT false,
  half_day_type TEXT,
  
  reason TEXT,
  document_url TEXT,
  
  contact_address TEXT,
  contact_phone TEXT,
  
  status leave_request_status DEFAULT 'pending',
  
  applied_at TIMESTAMPTZ DEFAULT now(),
  
  approver_1_id UUID REFERENCES public.profiles(id),
  approver_1_action leave_request_status,
  approver_1_at TIMESTAMPTZ,
  approver_1_remarks TEXT,
  
  approver_2_id UUID REFERENCES public.profiles(id),
  approver_2_action leave_request_status,
  approver_2_at TIMESTAMPTZ,
  approver_2_remarks TEXT,
  
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 22. Leave Encashments
CREATE TABLE public.leave_encashments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  days_encashed NUMERIC(5,2) NOT NULL,
  amount_per_day NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  status leave_request_status DEFAULT 'pending',
  processed_in_payroll_id UUID,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 23. Salary Components
CREATE TABLE public.salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  component_type salary_component_type NOT NULL,
  calculation_type TEXT DEFAULT 'fixed',
  percentage_of TEXT,
  percentage_value NUMERIC(5,2),
  is_taxable BOOLEAN DEFAULT true,
  is_statutory BOOLEAN DEFAULT false,
  affects_overtime BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- 24. Salary Structures
CREATE TABLE public.salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_salary_min NUMERIC(12,2),
  base_salary_max NUMERIC(12,2),
  components JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 25. Employee Salaries
CREATE TABLE public.employee_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  salary_structure_id UUID REFERENCES public.salary_structures(id),
  basic_salary NUMERIC(12,2) NOT NULL,
  component_overrides JSONB DEFAULT '{}',
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_current BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 26. Payroll Runs
CREATE TABLE public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  run_date DATE NOT NULL,
  pay_date DATE,
  status payroll_run_status DEFAULT 'draft',
  total_employees INTEGER DEFAULT 0,
  total_gross NUMERIC(14,2) DEFAULT 0,
  total_deductions NUMERIC(14,2) DEFAULT 0,
  total_net NUMERIC(14,2) DEFAULT 0,
  processed_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, branch_id, month, year)
);

-- 27. Payroll Entries (Individual Payslips)
CREATE TABLE public.payroll_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  
  -- Attendance Summary
  total_working_days NUMERIC(5,2),
  present_days NUMERIC(5,2),
  absent_days NUMERIC(5,2),
  leave_days NUMERIC(5,2),
  half_days NUMERIC(5,2),
  late_days NUMERIC(5,2),
  overtime_hours NUMERIC(6,2),
  
  -- Salary Breakdown
  basic_salary NUMERIC(12,2),
  earnings JSONB DEFAULT '[]',
  deductions JSONB DEFAULT '[]',
  
  -- Totals
  gross_salary NUMERIC(12,2),
  total_deductions NUMERIC(12,2),
  net_salary NUMERIC(12,2),
  
  -- Tax
  tax_amount NUMERIC(12,2) DEFAULT 0,
  
  -- Loans
  loan_deduction NUMERIC(12,2) DEFAULT 0,
  advance_deduction NUMERIC(12,2) DEFAULT 0,
  
  -- Bank Details (snapshot)
  bank_name TEXT,
  account_number TEXT,
  
  is_paid BOOLEAN DEFAULT false,
  payment_date DATE,
  payment_reference TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(payroll_run_id, employee_id)
);

-- 28. Employee Loans
CREATE TABLE public.employee_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL,
  loan_amount NUMERIC(12,2) NOT NULL,
  interest_rate NUMERIC(5,2) DEFAULT 0,
  total_installments INTEGER NOT NULL,
  installment_amount NUMERIC(12,2) NOT NULL,
  start_month INTEGER,
  start_year INTEGER,
  paid_installments INTEGER DEFAULT 0,
  remaining_amount NUMERIC(12,2),
  status loan_status DEFAULT 'active',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 29. Loan Deductions
CREATE TABLE public.loan_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES public.employee_loans(id) ON DELETE CASCADE,
  payroll_entry_id UUID REFERENCES public.payroll_entries(id),
  month INTEGER,
  year INTEGER,
  amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 30. Tax Slabs
CREATE TABLE public.tax_slabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  fiscal_year TEXT NOT NULL,
  min_income NUMERIC(14,2) NOT NULL,
  max_income NUMERIC(14,2),
  fixed_tax NUMERIC(14,2) DEFAULT 0,
  tax_percentage NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_offs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_encashments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_slabs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization-scoped tables
CREATE POLICY "Users can view departments in their org" ON public.departments
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.departments.manage')));

CREATE POLICY "Users can view designations in their org" ON public.designations
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage designations" ON public.designations
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.designations.manage')));

CREATE POLICY "Users can view employee categories in their org" ON public.employee_categories
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage employee categories" ON public.employee_categories
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.categories.manage')));

CREATE POLICY "Users can view shifts in their org" ON public.shifts
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage shifts" ON public.shifts
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.shifts.manage')));

CREATE POLICY "Users can view employees in their org" ON public.employees
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "HR can manage employees" ON public.employees
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.employees.create') OR has_permission('hr.employees.edit')));

CREATE POLICY "Users can view holidays in their org" ON public.holidays
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage holidays" ON public.holidays
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.holidays.manage')));

CREATE POLICY "Users can view biometric devices in their org" ON public.biometric_devices
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage biometric devices" ON public.biometric_devices
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.biometric.manage')));

CREATE POLICY "Users can view attendance in their org" ON public.attendance_records
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "HR can manage attendance" ON public.attendance_records
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.attendance.edit')));

CREATE POLICY "Users can view leave types in their org" ON public.leave_types
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage leave types" ON public.leave_types
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.leaves.manage_types')));

CREATE POLICY "Users can view leave requests in their org" ON public.leave_requests
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "HR can manage leave requests" ON public.leave_requests
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.leaves.approve')));

CREATE POLICY "Users can view salary components in their org" ON public.salary_components
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "HR can manage salary components" ON public.salary_components
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.salary.manage')));

CREATE POLICY "Users can view salary structures in their org" ON public.salary_structures
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "HR can manage salary structures" ON public.salary_structures
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.salary.manage')));

CREATE POLICY "Users can view payroll runs in their org" ON public.payroll_runs
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "HR can manage payroll runs" ON public.payroll_runs
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.payroll.process')));

CREATE POLICY "Users can view employee loans in their org" ON public.employee_loans
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "HR can manage employee loans" ON public.employee_loans
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.loans.manage')));

-- Policies for employee-related tables (via employee)
CREATE POLICY "View employee documents" ON public.employee_documents
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()));

CREATE POLICY "Manage employee documents" ON public.employee_documents
  FOR ALL USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.employees.edit')));

CREATE POLICY "View employee qualifications" ON public.employee_qualifications
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()));

CREATE POLICY "Manage employee qualifications" ON public.employee_qualifications
  FOR ALL USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.employees.edit')));

CREATE POLICY "View employee work history" ON public.employee_work_history
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()));

CREATE POLICY "Manage employee work history" ON public.employee_work_history
  FOR ALL USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.employees.edit')));

CREATE POLICY "View employee dependents" ON public.employee_dependents
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()));

CREATE POLICY "Manage employee dependents" ON public.employee_dependents
  FOR ALL USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.employees.edit')));

CREATE POLICY "View employee licenses" ON public.employee_licenses
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()));

CREATE POLICY "Manage employee licenses" ON public.employee_licenses
  FOR ALL USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.employees.edit')));

CREATE POLICY "View shift assignments" ON public.shift_assignments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()));

CREATE POLICY "Manage shift assignments" ON public.shift_assignments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.shifts.manage')));

CREATE POLICY "View weekly offs" ON public.weekly_offs
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()));

CREATE POLICY "Manage weekly offs" ON public.weekly_offs
  FOR ALL USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.shifts.manage')));

CREATE POLICY "View leave balances" ON public.leave_balances
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()));

CREATE POLICY "Manage leave balances" ON public.leave_balances
  FOR ALL USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.leaves.manage_types')));

CREATE POLICY "View leave encashments" ON public.leave_encashments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()));

CREATE POLICY "Manage leave encashments" ON public.leave_encashments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.payroll.process')));

CREATE POLICY "View employee salaries" ON public.employee_salaries
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.salary.view')));

CREATE POLICY "Manage employee salaries" ON public.employee_salaries
  FOR ALL USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.salary.manage')));

CREATE POLICY "View payroll entries" ON public.payroll_entries
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.payroll_runs pr WHERE pr.id = payroll_run_id AND pr.organization_id = get_user_organization_id()));

CREATE POLICY "Manage payroll entries" ON public.payroll_entries
  FOR ALL USING (EXISTS (SELECT 1 FROM public.payroll_runs pr WHERE pr.id = payroll_run_id AND pr.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.payroll.process')));

CREATE POLICY "View loan deductions" ON public.loan_deductions
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employee_loans el JOIN public.employees e ON e.id = el.employee_id WHERE el.id = loan_id AND e.organization_id = get_user_organization_id()));

CREATE POLICY "Manage loan deductions" ON public.loan_deductions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.employee_loans el JOIN public.employees e ON e.id = el.employee_id WHERE el.id = loan_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.payroll.process')));

CREATE POLICY "View attendance corrections" ON public.attendance_corrections
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()));

CREATE POLICY "Manage attendance corrections" ON public.attendance_corrections
  FOR ALL USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('hr.attendance.edit')));

CREATE POLICY "View tax slabs" ON public.tax_slabs
  FOR SELECT USING (organization_id IS NULL OR organization_id = get_user_organization_id());

CREATE POLICY "Manage tax slabs" ON public.tax_slabs
  FOR ALL USING ((organization_id IS NULL AND is_super_admin()) OR (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('hr.salary.manage'))));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_designations_updated_at
  BEFORE UPDATE ON public.designations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at
  BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INSERT HR PERMISSIONS
-- =============================================

INSERT INTO public.permissions (code, name, module, description) VALUES
('hr.view', 'View HR Module', 'hr', 'Access to HR module'),
('hr.dashboard', 'HR Dashboard', 'hr', 'View HR dashboard'),
('hr.employees.view', 'View Employees', 'hr', 'View employee list'),
('hr.employees.create', 'Create Employees', 'hr', 'Create new employees'),
('hr.employees.edit', 'Edit Employees', 'hr', 'Edit employee details'),
('hr.employees.delete', 'Delete Employees', 'hr', 'Delete employees'),
('hr.departments.manage', 'Manage Departments', 'hr', 'Manage departments and sub-departments'),
('hr.designations.manage', 'Manage Designations', 'hr', 'Manage job designations'),
('hr.categories.manage', 'Manage Categories', 'hr', 'Manage employee categories'),
('hr.shifts.manage', 'Manage Shifts', 'hr', 'Manage work shifts'),
('hr.holidays.manage', 'Manage Holidays', 'hr', 'Manage holidays'),
('hr.attendance.view', 'View Attendance', 'hr', 'View attendance records'),
('hr.attendance.edit', 'Edit Attendance', 'hr', 'Edit attendance records'),
('hr.attendance.reports', 'Attendance Reports', 'hr', 'View attendance reports'),
('hr.biometric.manage', 'Manage Biometric', 'hr', 'Manage biometric devices'),
('hr.leaves.view', 'View Leaves', 'hr', 'View leave requests'),
('hr.leaves.approve', 'Approve Leaves', 'hr', 'Approve/reject leave requests'),
('hr.leaves.manage_types', 'Manage Leave Types', 'hr', 'Manage leave type configurations'),
('hr.salary.view', 'View Salaries', 'hr', 'View salary information'),
('hr.salary.manage', 'Manage Salaries', 'hr', 'Manage salary structures and assignments'),
('hr.payroll.view', 'View Payroll', 'hr', 'View payroll information'),
('hr.payroll.process', 'Process Payroll', 'hr', 'Process monthly payroll'),
('hr.payroll.approve', 'Approve Payroll', 'hr', 'Approve processed payroll'),
('hr.loans.manage', 'Manage Loans', 'hr', 'Manage employee loans and advances'),
('hr.reports.view', 'HR Reports', 'hr', 'View HR reports')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- INSERT HR MENU ITEMS
-- =============================================

-- Parent HR Menu
INSERT INTO public.menu_items (code, name, icon, path, sort_order, required_permission, required_module, is_active) VALUES
('hr', 'HR & Staff', 'Users', NULL, 50, 'hr.view', 'hr', true);

-- Get parent ID for submenus
DO $$
DECLARE
  hr_parent_id UUID;
  emp_parent_id UUID;
  att_parent_id UUID;
  leave_parent_id UUID;
  payroll_parent_id UUID;
  setup_parent_id UUID;
BEGIN
  SELECT id INTO hr_parent_id FROM public.menu_items WHERE code = 'hr';
  
  -- HR Dashboard
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (hr_parent_id, 'hr.dashboard', 'HR Dashboard', 'LayoutDashboard', '/app/hr', 1, 'hr.dashboard', true);
  
  -- Employees Submenu
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (hr_parent_id, 'hr.employees', 'Employees', 'UserCircle', NULL, 2, 'hr.employees.view', true)
  RETURNING id INTO emp_parent_id;
  
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (emp_parent_id, 'hr.employees.list', 'All Employees', 'Users', '/app/hr/employees', 1, 'hr.employees.view', true),
  (emp_parent_id, 'hr.employees.onboard', 'New Onboarding', 'UserPlus', '/app/hr/employees/new', 2, 'hr.employees.create', true),
  (emp_parent_id, 'hr.employees.directory', 'Directory', 'Book', '/app/hr/employees/directory', 3, 'hr.employees.view', true);
  
  -- Attendance Submenu
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (hr_parent_id, 'hr.attendance', 'Attendance', 'Clock', NULL, 3, 'hr.attendance.view', true)
  RETURNING id INTO att_parent_id;
  
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (att_parent_id, 'hr.attendance.daily', 'Daily Attendance', 'Calendar', '/app/hr/attendance', 1, 'hr.attendance.view', true),
  (att_parent_id, 'hr.attendance.sheet', 'Attendance Sheet', 'Table2', '/app/hr/attendance/sheet', 2, 'hr.attendance.view', true),
  (att_parent_id, 'hr.attendance.corrections', 'Corrections', 'Edit', '/app/hr/attendance/corrections', 3, 'hr.attendance.edit', true),
  (att_parent_id, 'hr.attendance.biometric', 'Biometric Devices', 'Fingerprint', '/app/hr/attendance/biometric', 4, 'hr.biometric.manage', true),
  (att_parent_id, 'hr.attendance.reports', 'Reports', 'BarChart3', '/app/hr/attendance/reports', 5, 'hr.attendance.reports', true);
  
  -- Leave Management Submenu
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (hr_parent_id, 'hr.leaves', 'Leave Management', 'CalendarOff', NULL, 4, 'hr.leaves.view', true)
  RETURNING id INTO leave_parent_id;
  
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (leave_parent_id, 'hr.leaves.requests', 'Leave Requests', 'Inbox', '/app/hr/leaves', 1, 'hr.leaves.view', true),
  (leave_parent_id, 'hr.leaves.calendar', 'Leave Calendar', 'Calendar', '/app/hr/leaves/calendar', 2, 'hr.leaves.view', true),
  (leave_parent_id, 'hr.leaves.balances', 'Leave Balances', 'Scale', '/app/hr/leaves/balances', 3, 'hr.leaves.view', true),
  (leave_parent_id, 'hr.leaves.approvals', 'Pending Approvals', 'CheckSquare', '/app/hr/leaves/approvals', 4, 'hr.leaves.approve', true);
  
  -- Payroll Submenu
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (hr_parent_id, 'hr.payroll', 'Payroll', 'Wallet', NULL, 5, 'hr.payroll.view', true)
  RETURNING id INTO payroll_parent_id;
  
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (payroll_parent_id, 'hr.payroll.runs', 'Payroll Runs', 'PlayCircle', '/app/hr/payroll', 1, 'hr.payroll.view', true),
  (payroll_parent_id, 'hr.payroll.process', 'Process Payroll', 'Calculator', '/app/hr/payroll/process', 2, 'hr.payroll.process', true),
  (payroll_parent_id, 'hr.payroll.salaries', 'Employee Salaries', 'DollarSign', '/app/hr/payroll/salaries', 3, 'hr.salary.view', true),
  (payroll_parent_id, 'hr.payroll.loans', 'Loans & Advances', 'Landmark', '/app/hr/payroll/loans', 4, 'hr.loans.manage', true),
  (payroll_parent_id, 'hr.payroll.slips', 'Payslips', 'FileText', '/app/hr/payroll/slips', 5, 'hr.payroll.view', true),
  (payroll_parent_id, 'hr.payroll.reports', 'Reports', 'PieChart', '/app/hr/payroll/reports', 6, 'hr.payroll.view', true);
  
  -- HR Setup Submenu
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (hr_parent_id, 'hr.setup', 'HR Setup', 'Settings2', NULL, 6, 'hr.departments.manage', true)
  RETURNING id INTO setup_parent_id;
  
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (setup_parent_id, 'hr.setup.departments', 'Departments', 'Building2', '/app/hr/setup/departments', 1, 'hr.departments.manage', true),
  (setup_parent_id, 'hr.setup.designations', 'Designations', 'BadgeCheck', '/app/hr/setup/designations', 2, 'hr.designations.manage', true),
  (setup_parent_id, 'hr.setup.categories', 'Employee Categories', 'Tag', '/app/hr/setup/categories', 3, 'hr.categories.manage', true),
  (setup_parent_id, 'hr.setup.shifts', 'Shifts', 'Clock', '/app/hr/setup/shifts', 4, 'hr.shifts.manage', true),
  (setup_parent_id, 'hr.setup.holidays', 'Holidays', 'CalendarDays', '/app/hr/setup/holidays', 5, 'hr.holidays.manage', true),
  (setup_parent_id, 'hr.setup.leave_types', 'Leave Types', 'CalendarX', '/app/hr/setup/leave-types', 6, 'hr.leaves.manage_types', true),
  (setup_parent_id, 'hr.setup.salary_components', 'Salary Components', 'ListOrdered', '/app/hr/setup/salary-components', 7, 'hr.salary.manage', true),
  (setup_parent_id, 'hr.setup.tax_slabs', 'Tax Slabs', 'Percent', '/app/hr/setup/tax-slabs', 8, 'hr.salary.manage', true);
END $$;

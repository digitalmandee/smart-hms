-- =====================================================
-- HRM ENHANCEMENT MIGRATION
-- Phase 3: Doctor Revenue Share
-- Phase 5: Recruitment & Onboarding  
-- Phase 7: Enhanced Compliance
-- Phase 8: Exit Management
-- =====================================================

-- =====================================================
-- PHASE 3: DOCTOR REVENUE SHARE PAYROLL
-- =====================================================

-- Doctor Compensation Plans
CREATE TABLE public.doctor_compensation_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  plan_type VARCHAR NOT NULL CHECK (plan_type IN ('fixed_salary', 'per_consultation', 'per_procedure', 'revenue_share', 'hybrid')),
  base_salary NUMERIC(12,2) DEFAULT 0,
  consultation_share_percent NUMERIC(5,2) DEFAULT 0,
  procedure_share_percent NUMERIC(5,2) DEFAULT 0,
  surgery_share_percent NUMERIC(5,2) DEFAULT 0,
  lab_referral_percent NUMERIC(5,2) DEFAULT 0,
  minimum_guarantee NUMERIC(12,2) DEFAULT 0,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  UNIQUE(doctor_id, effective_from)
);

-- Doctor Earnings (tracks individual earning events)
CREATE TABLE public.doctor_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  compensation_plan_id UUID REFERENCES doctor_compensation_plans(id),
  earning_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source_type VARCHAR NOT NULL CHECK (source_type IN ('consultation', 'procedure', 'surgery', 'lab_referral', 'radiology_referral', 'pharmacy_referral', 'ipd_visit', 'other')),
  source_id UUID, -- Reference to consultation_id, surgery_id, etc.
  source_reference VARCHAR, -- Human-readable reference
  patient_id UUID REFERENCES patients(id),
  gross_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  doctor_share_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  doctor_share_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  hospital_share_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  paid_in_payroll_id UUID, -- Reference to payroll run when paid
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- On-Call Schedules
CREATE TABLE public.on_call_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  on_call_type VARCHAR DEFAULT 'primary' CHECK (on_call_type IN ('primary', 'backup', 'emergency')),
  department_id UUID REFERENCES departments(id),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Overtime Records
CREATE TABLE public.overtime_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  regular_hours NUMERIC(4,2) DEFAULT 0,
  overtime_hours NUMERIC(4,2) NOT NULL,
  duty_type VARCHAR DEFAULT 'regular' CHECK (duty_type IN ('regular', 'night', 'emergency', 'ot_procedure', 'holiday')),
  hourly_rate NUMERIC(10,2),
  total_amount NUMERIC(12,2),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- PHASE 5: RECRUITMENT & ONBOARDING
-- =====================================================

-- Job Openings
CREATE TABLE public.job_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  title VARCHAR NOT NULL,
  department_id UUID REFERENCES departments(id),
  designation_id UUID REFERENCES designations(id),
  positions_available INT DEFAULT 1,
  employment_type VARCHAR DEFAULT 'permanent' CHECK (employment_type IN ('permanent', 'contract', 'temporary', 'internship')),
  experience_required VARCHAR,
  qualification_required VARCHAR,
  skills_required TEXT[],
  job_description TEXT,
  requirements TEXT,
  salary_range_min NUMERIC(12,2),
  salary_range_max NUMERIC(12,2),
  benefits TEXT,
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'on_hold', 'closed', 'filled', 'cancelled')),
  published_at TIMESTAMPTZ,
  closes_at DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Job Applications
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_opening_id UUID NOT NULL REFERENCES job_openings(id) ON DELETE CASCADE,
  applicant_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  cnic VARCHAR,
  current_employer VARCHAR,
  current_designation VARCHAR,
  experience_years NUMERIC(4,1),
  expected_salary NUMERIC(12,2),
  notice_period_days INT,
  resume_url VARCHAR,
  cover_letter TEXT,
  source VARCHAR, -- 'website', 'referral', 'linkedin', 'newspaper', 'walk_in'
  referred_by UUID REFERENCES employees(id),
  status VARCHAR DEFAULT 'received' CHECK (status IN ('received', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
  rejection_reason TEXT,
  notes TEXT,
  applied_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Interviews
CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  interview_round INT DEFAULT 1,
  interview_type VARCHAR DEFAULT 'in_person' CHECK (interview_type IN ('phone', 'video', 'in_person', 'technical', 'hr', 'panel')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 30,
  location VARCHAR,
  meeting_link VARCHAR,
  interviewer_ids UUID[], -- Array of employee/profile IDs
  status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')),
  feedback TEXT,
  strengths TEXT,
  weaknesses TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  recommendation VARCHAR CHECK (recommendation IN ('strongly_hire', 'hire', 'maybe', 'no_hire', 'strongly_no_hire')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Offer Letters
CREATE TABLE public.offer_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  offered_salary NUMERIC(12,2) NOT NULL,
  offered_designation_id UUID REFERENCES designations(id),
  offered_department_id UUID REFERENCES departments(id),
  joining_date DATE,
  probation_months INT DEFAULT 3,
  benefits TEXT,
  terms_conditions TEXT,
  offer_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'rejected', 'expired', 'withdrawn')),
  accepted_at TIMESTAMPTZ,
  rejected_reason TEXT,
  document_url VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Onboarding Checklist Templates
CREATE TABLE public.onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  applies_to_categories UUID[], -- employee category IDs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Onboarding Checklist Items Template
CREATE TABLE public.onboarding_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  item_name VARCHAR NOT NULL,
  description TEXT,
  responsible_department VARCHAR,
  due_days_from_joining INT DEFAULT 7,
  is_mandatory BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- Employee Onboarding Progress
CREATE TABLE public.employee_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  template_id UUID REFERENCES onboarding_templates(id),
  item_name VARCHAR NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- PHASE 7: ENHANCED COMPLIANCE
-- =====================================================

-- Medical Fitness Records
CREATE TABLE public.medical_fitness_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  examination_date DATE NOT NULL,
  examination_type VARCHAR DEFAULT 'annual' CHECK (examination_type IN ('pre_employment', 'annual', 'return_to_work', 'special')),
  examiner_name VARCHAR,
  examiner_facility VARCHAR,
  fitness_status VARCHAR NOT NULL CHECK (fitness_status IN ('fit', 'fit_with_restrictions', 'temporarily_unfit', 'permanently_unfit')),
  restrictions TEXT,
  conditions_noted TEXT,
  recommendations TEXT,
  next_examination_date DATE,
  report_url VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Vaccination Records
CREATE TABLE public.vaccination_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  vaccine_name VARCHAR NOT NULL,
  vaccine_type VARCHAR, -- 'hepatitis_b', 'hepatitis_a', 'flu', 'covid', 'typhoid', 'tetanus', 'mmr'
  dose_number INT DEFAULT 1,
  administered_date DATE NOT NULL,
  administered_by VARCHAR,
  administered_at VARCHAR, -- facility name
  batch_number VARCHAR,
  next_due_date DATE,
  certificate_url VARCHAR,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disciplinary Actions
CREATE TABLE public.disciplinary_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  action_type VARCHAR NOT NULL CHECK (action_type IN ('verbal_warning', 'written_warning', 'final_warning', 'suspension', 'demotion', 'termination')),
  incident_date DATE NOT NULL,
  incident_description TEXT NOT NULL,
  policy_violated VARCHAR,
  investigation_details TEXT,
  action_taken TEXT NOT NULL,
  suspension_days INT,
  issued_date DATE DEFAULT CURRENT_DATE,
  issued_by UUID NOT NULL REFERENCES profiles(id),
  witness_ids UUID[],
  employee_response TEXT,
  employee_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  appeal_submitted BOOLEAN DEFAULT false,
  appeal_details TEXT,
  appeal_outcome TEXT,
  document_url VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Incident Reports
CREATE TABLE public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  incident_number VARCHAR,
  reported_by UUID NOT NULL REFERENCES profiles(id),
  incident_date DATE NOT NULL,
  incident_time TIME,
  location VARCHAR NOT NULL,
  incident_type VARCHAR CHECK (incident_type IN ('workplace_injury', 'near_miss', 'property_damage', 'violence', 'harassment', 'theft', 'policy_violation', 'patient_complaint', 'other')),
  description TEXT NOT NULL,
  involved_employee_ids UUID[],
  involved_patient_ids UUID[],
  witness_ids UUID[],
  severity VARCHAR DEFAULT 'minor' CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
  immediate_action_taken TEXT,
  investigation_status VARCHAR DEFAULT 'reported' CHECK (investigation_status IN ('reported', 'under_investigation', 'investigation_complete', 'closed')),
  investigator_id UUID REFERENCES profiles(id),
  investigation_findings TEXT,
  root_cause TEXT,
  corrective_actions TEXT,
  preventive_measures TEXT,
  resolution TEXT,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- PHASE 8: EXIT MANAGEMENT
-- =====================================================

-- Resignations
CREATE TABLE public.resignations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  resignation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_working_date DATE NOT NULL,
  notice_period_days INT,
  notice_period_served INT,
  notice_period_shortage INT,
  reason_category VARCHAR CHECK (reason_category IN ('better_opportunity', 'personal', 'relocation', 'health', 'education', 'retirement', 'dissatisfaction', 'other')),
  reason_details TEXT,
  is_notice_buyout BOOLEAN DEFAULT false,
  buyout_amount NUMERIC(12,2),
  status VARCHAR DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'accepted', 'withdrawn', 'on_hold', 'completed')),
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  resignation_letter_url VARCHAR,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clearance Templates
CREATE TABLE public.clearance_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clearance Template Items
CREATE TABLE public.clearance_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES clearance_templates(id) ON DELETE CASCADE,
  department VARCHAR NOT NULL, -- 'IT', 'Finance', 'HR', 'Admin', 'Department Head', 'Library', 'Security'
  item_description VARCHAR NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- Employee Clearance Items
CREATE TABLE public.employee_clearance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resignation_id UUID NOT NULL REFERENCES resignations(id) ON DELETE CASCADE,
  department VARCHAR NOT NULL,
  item_description VARCHAR NOT NULL,
  is_cleared BOOLEAN DEFAULT false,
  cleared_by UUID REFERENCES profiles(id),
  cleared_at TIMESTAMPTZ,
  remarks TEXT,
  pending_items TEXT,
  recovery_amount NUMERIC(12,2) DEFAULT 0
);

-- Final Settlements
CREATE TABLE public.final_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resignation_id UUID NOT NULL REFERENCES resignations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  
  -- Earnings
  basic_salary_days INT DEFAULT 0,
  basic_salary_amount NUMERIC(12,2) DEFAULT 0,
  leave_encashment_days INT DEFAULT 0,
  leave_encashment_amount NUMERIC(12,2) DEFAULT 0,
  bonus_amount NUMERIC(12,2) DEFAULT 0,
  gratuity_amount NUMERIC(12,2) DEFAULT 0,
  other_earnings NUMERIC(12,2) DEFAULT 0,
  other_earnings_details TEXT,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  
  -- Deductions
  notice_period_shortage_amount NUMERIC(12,2) DEFAULT 0,
  loan_recovery NUMERIC(12,2) DEFAULT 0,
  advance_recovery NUMERIC(12,2) DEFAULT 0,
  tax_deduction NUMERIC(12,2) DEFAULT 0,
  other_deductions NUMERIC(12,2) DEFAULT 0,
  other_deductions_details TEXT,
  total_deductions NUMERIC(12,2) DEFAULT 0,
  
  -- Final
  net_payable NUMERIC(12,2) DEFAULT 0,
  
  -- Payment
  payment_date DATE,
  payment_mode VARCHAR CHECK (payment_mode IN ('bank_transfer', 'cheque', 'cash')),
  payment_reference VARCHAR,
  
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'paid', 'on_hold')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Exit Interviews
CREATE TABLE public.exit_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resignation_id UUID NOT NULL REFERENCES resignations(id) ON DELETE CASCADE,
  interview_date DATE,
  interviewer_id UUID REFERENCES profiles(id),
  
  -- Feedback categories (1-5 rating)
  rating_management INT CHECK (rating_management >= 1 AND rating_management <= 5),
  rating_work_environment INT CHECK (rating_work_environment >= 1 AND rating_work_environment <= 5),
  rating_compensation INT CHECK (rating_compensation >= 1 AND rating_compensation <= 5),
  rating_growth_opportunities INT CHECK (rating_growth_opportunities >= 1 AND rating_growth_opportunities <= 5),
  rating_work_life_balance INT CHECK (rating_work_life_balance >= 1 AND rating_work_life_balance <= 5),
  
  primary_reason_leaving TEXT,
  what_liked_most TEXT,
  what_could_improve TEXT,
  would_recommend BOOLEAN,
  would_rejoin BOOLEAN,
  suggestions TEXT,
  additional_comments TEXT,
  
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Compensatory Offs
CREATE TABLE public.compensatory_offs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  earned_date DATE NOT NULL,
  reason VARCHAR NOT NULL, -- 'worked_holiday', 'extra_shift', 'emergency_duty', 'ot_coverage'
  hours_earned NUMERIC(4,2) DEFAULT 8,
  reference_id UUID, -- attendance_id or overtime_id
  used_date DATE,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'used', 'expired', 'rejected')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  expires_on DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ENABLE RLS ON ALL NEW TABLES
-- =====================================================

ALTER TABLE doctor_compensation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE on_call_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_fitness_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinary_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE resignations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clearance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE clearance_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_clearance ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE compensatory_offs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (Organization-based access)
-- =====================================================

-- Doctor Compensation Plans
CREATE POLICY "Users can view their org compensation plans" ON doctor_compensation_plans
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org compensation plans" ON doctor_compensation_plans
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Doctor Earnings
CREATE POLICY "Users can view their org doctor earnings" ON doctor_earnings
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org doctor earnings" ON doctor_earnings
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- On Call Schedules
CREATE POLICY "Users can view their org on-call schedules" ON on_call_schedules
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org on-call schedules" ON on_call_schedules
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Overtime Records
CREATE POLICY "Users can view their org overtime records" ON overtime_records
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org overtime records" ON overtime_records
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Job Openings
CREATE POLICY "Users can view their org job openings" ON job_openings
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org job openings" ON job_openings
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Job Applications
CREATE POLICY "Users can view their org applications" ON job_applications
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org applications" ON job_applications
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Interviews
CREATE POLICY "Users can view their org interviews" ON interviews
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org interviews" ON interviews
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Offer Letters
CREATE POLICY "Users can view their org offer letters" ON offer_letters
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org offer letters" ON offer_letters
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Onboarding Templates
CREATE POLICY "Users can view their org onboarding templates" ON onboarding_templates
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org onboarding templates" ON onboarding_templates
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Onboarding Template Items (access via template)
CREATE POLICY "Users can view template items" ON onboarding_template_items
  FOR SELECT USING (template_id IN (SELECT id FROM onboarding_templates WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can manage template items" ON onboarding_template_items
  FOR ALL USING (template_id IN (SELECT id FROM onboarding_templates WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

-- Employee Onboarding
CREATE POLICY "Users can view their org employee onboarding" ON employee_onboarding
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org employee onboarding" ON employee_onboarding
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Medical Fitness Records
CREATE POLICY "Users can view their org medical fitness" ON medical_fitness_records
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org medical fitness" ON medical_fitness_records
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Vaccination Records
CREATE POLICY "Users can view their org vaccinations" ON vaccination_records
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org vaccinations" ON vaccination_records
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Disciplinary Actions
CREATE POLICY "Users can view their org disciplinary actions" ON disciplinary_actions
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org disciplinary actions" ON disciplinary_actions
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Incident Reports
CREATE POLICY "Users can view their org incidents" ON incident_reports
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org incidents" ON incident_reports
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Resignations
CREATE POLICY "Users can view their org resignations" ON resignations
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org resignations" ON resignations
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Clearance Templates
CREATE POLICY "Users can view their org clearance templates" ON clearance_templates
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org clearance templates" ON clearance_templates
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Clearance Template Items
CREATE POLICY "Users can view clearance template items" ON clearance_template_items
  FOR SELECT USING (template_id IN (SELECT id FROM clearance_templates WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can manage clearance template items" ON clearance_template_items
  FOR ALL USING (template_id IN (SELECT id FROM clearance_templates WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

-- Employee Clearance
CREATE POLICY "Users can view their org employee clearance" ON employee_clearance
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org employee clearance" ON employee_clearance
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Final Settlements
CREATE POLICY "Users can view their org final settlements" ON final_settlements
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org final settlements" ON final_settlements
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Exit Interviews
CREATE POLICY "Users can view their org exit interviews" ON exit_interviews
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org exit interviews" ON exit_interviews
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Compensatory Offs
CREATE POLICY "Users can view their org comp offs" ON compensatory_offs
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org comp offs" ON compensatory_offs
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_doctor_earnings_doctor_date ON doctor_earnings(doctor_id, earning_date);
CREATE INDEX idx_doctor_earnings_paid ON doctor_earnings(is_paid, earning_date);
CREATE INDEX idx_on_call_schedules_date ON on_call_schedules(schedule_date, employee_id);
CREATE INDEX idx_overtime_records_date ON overtime_records(work_date, employee_id);
CREATE INDEX idx_job_openings_status ON job_openings(status, organization_id);
CREATE INDEX idx_job_applications_status ON job_applications(status, job_opening_id);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at, status);
CREATE INDEX idx_resignations_status ON resignations(status, organization_id);
CREATE INDEX idx_final_settlements_status ON final_settlements(status, organization_id);
CREATE INDEX idx_incident_reports_status ON incident_reports(investigation_status, organization_id);
CREATE INDEX idx_vaccinations_employee ON vaccination_records(employee_id, vaccine_type);
CREATE INDEX idx_medical_fitness_employee ON medical_fitness_records(employee_id, next_examination_date);
-- Seed Insurance Companies
INSERT INTO public.insurance_companies (organization_id, name, code, contact_person, email, phone, address, city, is_active)
SELECT 
  o.id,
  company.name,
  company.code,
  company.contact_person,
  company.email,
  company.phone,
  company.address,
  company.city,
  true
FROM public.organizations o
CROSS JOIN (VALUES
  ('State Life Insurance', 'SLI', 'Ahmed Khan', 'claims@statelife.pk', '042-111-785-333', '25 Davis Road', 'Lahore'),
  ('EFU Health Insurance', 'EFU', 'Sara Ahmed', 'health@efu.com.pk', '021-111-338-338', 'EFU House, M.A. Jinnah Road', 'Karachi'),
  ('Jubilee Health Insurance', 'JHI', 'Ali Hassan', 'claims@jubileelife.com', '051-111-112-112', 'Jubilee Tower, Blue Area', 'Islamabad')
) AS company(name, code, contact_person, email, phone, address, city)
WHERE o.name = 'Shifa Medical Center'
ON CONFLICT DO NOTHING;

-- Seed Insurance Plans
INSERT INTO public.insurance_plans (insurance_company_id, name, plan_code, plan_type, coverage_percentage, max_coverage_amount, copay_amount, copay_percentage, deductible_amount, annual_limit, waiting_period_days, pre_auth_required, is_active)
SELECT 
  ic.id,
  plan.name,
  plan.plan_code,
  plan.plan_type,
  plan.coverage_percentage,
  plan.max_coverage_amount,
  plan.copay_amount,
  plan.copay_percentage,
  plan.deductible_amount,
  plan.annual_limit,
  plan.waiting_period_days,
  plan.pre_auth_required,
  true
FROM public.insurance_companies ic
CROSS JOIN (VALUES
  ('State Life Insurance', 'Basic Health Plan', 'SLI-BASIC', 'individual', 70, 500000, 500, 0, 5000, 500000, 30, false),
  ('State Life Insurance', 'Premium Health Plan', 'SLI-PREMIUM', 'family', 85, 1500000, 300, 0, 2000, 1500000, 15, true),
  ('State Life Insurance', 'Corporate Plan', 'SLI-CORP', 'corporate', 90, 2000000, 0, 10, 0, 2000000, 0, true),
  ('EFU Health Insurance', 'EFU Silver', 'EFU-SIL', 'individual', 65, 400000, 750, 0, 7500, 400000, 45, false),
  ('EFU Health Insurance', 'EFU Gold', 'EFU-GLD', 'family', 80, 1000000, 500, 0, 3000, 1000000, 30, true),
  ('EFU Health Insurance', 'EFU Platinum', 'EFU-PLT', 'corporate', 95, 3000000, 0, 5, 0, 3000000, 0, true),
  ('Jubilee Health Insurance', 'Jubilee Care Basic', 'JHI-BASIC', 'individual', 60, 300000, 1000, 0, 10000, 300000, 60, false),
  ('Jubilee Health Insurance', 'Jubilee Care Plus', 'JHI-PLUS', 'family', 75, 800000, 500, 0, 5000, 800000, 30, false),
  ('Jubilee Health Insurance', 'Jubilee Executive', 'JHI-EXEC', 'corporate', 90, 2500000, 0, 8, 0, 2500000, 0, true)
) AS plan(company_name, name, plan_code, plan_type, coverage_percentage, max_coverage_amount, copay_amount, copay_percentage, deductible_amount, annual_limit, waiting_period_days, pre_auth_required)
WHERE ic.name = plan.company_name
ON CONFLICT DO NOTHING;

-- Link first 5 patients to insurance plans  
INSERT INTO public.patient_insurance (patient_id, insurance_plan_id, policy_number, member_id, subscriber_name, subscriber_relationship, start_date, end_date, is_primary, is_active)
SELECT 
  p.id,
  ip.id,
  'POL-' || SUBSTRING(p.id::text, 1, 8),
  'MEM-' || SUBSTRING(p.id::text, 1, 8),
  p.first_name || ' ' || p.last_name,
  'self',
  CURRENT_DATE - INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '6 months',
  true,
  true
FROM (SELECT id, first_name, last_name FROM public.patients LIMIT 5) p
CROSS JOIN (SELECT id FROM public.insurance_plans WHERE plan_code = 'SLI-PREMIUM' LIMIT 1) ip
WHERE NOT EXISTS (
  SELECT 1 FROM public.patient_insurance pi WHERE pi.patient_id = p.id
)
ON CONFLICT DO NOTHING;

-- Create sample insurance claims from existing invoices
INSERT INTO public.insurance_claims (organization_id, branch_id, patient_insurance_id, invoice_id, claim_number, claim_date, total_amount, approved_amount, copay_amount, patient_responsibility, status)
SELECT 
  i.organization_id,
  i.branch_id,
  pi.id,
  i.id,
  'CLM-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || SUBSTRING(i.id::text, 1, 4),
  i.invoice_date,
  i.total_amount,
  i.total_amount * 0.85,
  i.total_amount * 0.1,
  i.total_amount * 0.15,
  'submitted'
FROM public.invoices i
JOIN public.patient_insurance pi ON pi.patient_id = i.patient_id AND pi.is_active = true
WHERE NOT EXISTS (
  SELECT 1 FROM public.insurance_claims ic WHERE ic.invoice_id = i.id
)
LIMIT 4
ON CONFLICT DO NOTHING;
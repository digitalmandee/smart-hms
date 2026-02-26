
-- Add donor_photo_url column
ALTER TABLE public.financial_donors ADD COLUMN IF NOT EXISTS donor_photo_url TEXT;

-- Seed 12 donors
INSERT INTO public.financial_donors (organization_id, donor_type, name, name_ar, contact_person, phone, email, cnic_passport, address, city, country, notes, is_active, total_donated, total_donations_count)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'individual', 'Ahmad Rashid', 'احمد راشد', NULL, '+92-321-1234567', 'ahmad.rashid@email.com', '35201-1234567-1', 'House 45, Block G, Model Town', 'Lahore', 'Pakistan', 'Regular monthly donor since 2023', true, 175000, 5),
  ('b1111111-1111-1111-1111-111111111111', 'individual', 'Fatima Zahra', 'فاطمة زہراء', NULL, '+92-300-9876543', 'fatima.z@email.com', '42101-9876543-2', 'Flat 12, Sea View Apartments, Clifton', 'Karachi', 'Pakistan', 'Prefers zakat donations', true, 250000, 4),
  ('b1111111-1111-1111-1111-111111111111', 'foundation', 'Al-Shifa Foundation', 'الشفاء فاؤنڈیشن', 'Dr. Imran Shah', '+92-51-2345678', 'info@alshifa.org', NULL, '7th Floor, Blue Area', 'Islamabad', 'Pakistan', 'Annual grant for patient welfare', true, 500000, 2),
  ('b1111111-1111-1111-1111-111111111111', 'corporate', 'Crescent Pharma Ltd', 'کریسنٹ فارما', 'Ali Hassan', '+92-51-8765432', 'csr@crescentpharma.pk', NULL, 'Plot 23, Industrial Estate', 'Rawalpindi', 'Pakistan', 'Quarterly CSR contributions', true, 400000, 4),
  ('b1111111-1111-1111-1111-111111111111', 'individual', 'Haji Muhammad Yousuf', 'حاجی محمد یوسف', NULL, '+92-333-5551234', NULL, '17301-5551234-5', 'Qissa Khwani Bazaar', 'Peshawar', 'Pakistan', 'Generous elder, prefers cash', true, 120000, 3),
  ('b1111111-1111-1111-1111-111111111111', 'foundation', 'Noor Medical Trust', 'نور میڈیکل ٹرسٹ', 'Amina Bibi', '+92-61-4567890', 'contact@noormedical.org', NULL, 'Trust Road, Near GPO', 'Multan', 'Pakistan', 'Supports equipment purchases', true, 350000, 3),
  ('b1111111-1111-1111-1111-111111111111', 'anonymous', 'Anonymous Donor', 'گمنام عطیہ دہندہ', NULL, NULL, NULL, NULL, NULL, NULL, 'Pakistan', 'Wishes to remain anonymous', true, 75000, 2),
  ('b1111111-1111-1111-1111-111111111111', 'individual', 'Zainab Bibi', 'زینب بی بی', NULL, '+92-345-6789012', 'zainab.b@email.com', '33100-6789012-8', '15-A, Civil Lines', 'Faisalabad', 'Pakistan', NULL, true, 45000, 2),
  ('b1111111-1111-1111-1111-111111111111', 'corporate', 'Pakistan Steel Corp', 'پاکستان اسٹیل', 'Naveed Akhtar', '+92-21-1112233', 'welfare@paksteel.pk', NULL, 'Steel Mill Road, Bin Qasim', 'Karachi', 'Pakistan', 'Employee welfare matching program', true, 200000, 2),
  ('b1111111-1111-1111-1111-111111111111', 'individual', 'Dr. Khalid Mehmood', 'ڈاکٹر خالد محمود', NULL, '+92-302-4443322', 'dr.khalid@hospital.pk', '35202-4443322-3', '22-B, Gulberg III', 'Lahore', 'Pakistan', 'Fellow physician, monthly supporter', true, 90000, 3),
  ('b1111111-1111-1111-1111-111111111111', 'government', 'Baitul Maal Welfare', 'بیت المال ویلفیئر', 'Tariq Hussain', '+92-51-9203344', 'grants@baitulmaal.gov.pk', NULL, 'Sector G-9, Markaz', 'Islamabad', 'Pakistan', 'Government welfare grants', true, 300000, 1),
  ('b1111111-1111-1111-1111-111111111111', 'foundation', 'Khadija Hospital Trust', 'خدیجہ ہسپتال ٹرسٹ', 'Saira Malik', '+92-81-2233445', 'trust@khadijahospital.pk', NULL, 'Zarghoon Road', 'Quetta', 'Pakistan', 'Sister hospital trust fund', true, 150000, 2);

-- Seed donations
DO $$
DECLARE
  d_ahmad UUID; d_fatima UUID; d_alshifa UUID; d_crescent UUID;
  d_haji UUID; d_noor UUID; d_anon UUID; d_zainab UUID;
  d_steel UUID; d_khalid UUID; d_baitul UUID; d_khadija UUID;
  org_id UUID := 'b1111111-1111-1111-1111-111111111111';
BEGIN
  SELECT id INTO d_ahmad FROM financial_donors WHERE organization_id = org_id AND name = 'Ahmad Rashid' LIMIT 1;
  SELECT id INTO d_fatima FROM financial_donors WHERE organization_id = org_id AND name = 'Fatima Zahra' LIMIT 1;
  SELECT id INTO d_alshifa FROM financial_donors WHERE organization_id = org_id AND name = 'Al-Shifa Foundation' LIMIT 1;
  SELECT id INTO d_crescent FROM financial_donors WHERE organization_id = org_id AND name = 'Crescent Pharma Ltd' LIMIT 1;
  SELECT id INTO d_haji FROM financial_donors WHERE organization_id = org_id AND name = 'Haji Muhammad Yousuf' LIMIT 1;
  SELECT id INTO d_noor FROM financial_donors WHERE organization_id = org_id AND name = 'Noor Medical Trust' LIMIT 1;
  SELECT id INTO d_anon FROM financial_donors WHERE organization_id = org_id AND name = 'Anonymous Donor' LIMIT 1;
  SELECT id INTO d_zainab FROM financial_donors WHERE organization_id = org_id AND name = 'Zainab Bibi' LIMIT 1;
  SELECT id INTO d_steel FROM financial_donors WHERE organization_id = org_id AND name = 'Pakistan Steel Corp' LIMIT 1;
  SELECT id INTO d_khalid FROM financial_donors WHERE organization_id = org_id AND name = 'Dr. Khalid Mehmood' LIMIT 1;
  SELECT id INTO d_baitul FROM financial_donors WHERE organization_id = org_id AND name = 'Baitul Maal Welfare' LIMIT 1;
  SELECT id INTO d_khadija FROM financial_donors WHERE organization_id = org_id AND name = 'Khadija Hospital Trust' LIMIT 1;

  -- 25 donations
  INSERT INTO financial_donations (organization_id, donor_id, amount, currency, donation_date, donation_type, payment_method, purpose, status, receipt_issued) VALUES
    (org_id, d_ahmad, 25000, 'PKR', '2025-09-15', 'one_time', 'cash', 'zakat', 'received', true),
    (org_id, d_ahmad, 25000, 'PKR', '2025-10-15', 'recurring', 'bank_transfer', 'zakat', 'received', true),
    (org_id, d_ahmad, 25000, 'PKR', '2025-11-15', 'recurring', 'bank_transfer', 'zakat', 'received', true),
    (org_id, d_ahmad, 50000, 'PKR', '2025-12-20', 'one_time', 'cash', 'sadaqah', 'received', true),
    (org_id, d_ahmad, 50000, 'PKR', '2026-01-15', 'recurring', 'bank_transfer', 'zakat', 'received', true),
    (org_id, d_fatima, 100000, 'PKR', '2025-10-01', 'one_time', 'bank_transfer', 'zakat', 'received', true),
    (org_id, d_fatima, 50000, 'PKR', '2025-11-20', 'one_time', 'cheque', 'patient_welfare', 'received', true),
    (org_id, d_fatima, 50000, 'PKR', '2026-01-10', 'one_time', 'bank_transfer', 'zakat', 'received', true),
    (org_id, d_fatima, 50000, 'PKR', '2026-03-01', 'pledge', 'bank_transfer', 'sadaqah', 'pledged', false),
    (org_id, d_alshifa, 300000, 'PKR', '2025-08-01', 'one_time', 'bank_transfer', 'patient_welfare', 'received', true),
    (org_id, d_alshifa, 200000, 'PKR', '2026-02-01', 'one_time', 'bank_transfer', 'equipment', 'received', true),
    (org_id, d_crescent, 100000, 'PKR', '2025-09-01', 'recurring', 'bank_transfer', 'general', 'received', true),
    (org_id, d_crescent, 100000, 'PKR', '2025-12-01', 'recurring', 'bank_transfer', 'general', 'received', true),
    (org_id, d_crescent, 100000, 'PKR', '2026-01-01', 'recurring', 'bank_transfer', 'building_fund', 'received', true),
    (org_id, d_crescent, 100000, 'PKR', '2026-03-15', 'pledge', 'bank_transfer', 'general', 'pledged', false),
    (org_id, d_haji, 50000, 'PKR', '2025-10-10', 'one_time', 'cash', 'sadaqah', 'received', true),
    (org_id, d_haji, 20000, 'PKR', '2025-12-25', 'one_time', 'cash', 'fitrana', 'received', true),
    (org_id, d_haji, 50000, 'PKR', '2026-02-14', 'one_time', 'cash', 'zakat', 'received', true),
    (org_id, d_noor, 200000, 'PKR', '2025-11-01', 'one_time', 'bank_transfer', 'equipment', 'received', true),
    (org_id, d_noor, 100000, 'PKR', '2026-01-15', 'one_time', 'cheque', 'patient_welfare', 'received', true),
    (org_id, d_noor, 50000, 'PKR', '2026-03-01', 'pledge', 'bank_transfer', 'equipment', 'pledged', false),
    (org_id, d_anon, 50000, 'PKR', '2025-12-01', 'one_time', 'cash', 'sadaqah', 'received', true),
    (org_id, d_anon, 25000, 'PKR', '2026-02-10', 'one_time', 'cash', 'general', 'received', true),
    (org_id, d_zainab, 25000, 'PKR', '2025-11-15', 'one_time', 'cash', 'zakat', 'received', true),
    (org_id, d_zainab, 20000, 'PKR', '2026-01-20', 'one_time', 'cash', 'sadaqah', 'received', true);

  -- 3 recurring schedules
  INSERT INTO donation_recurring_schedules (organization_id, donor_id, amount, frequency, purpose, start_date, next_due_date, is_active, total_collected, installments_paid) VALUES
    (org_id, d_ahmad, 25000, 'monthly', 'zakat', '2025-09-15', '2026-03-15', true, 125000, 5),
    (org_id, d_crescent, 100000, 'quarterly', 'general', '2025-09-01', '2026-03-01', true, 300000, 3),
    (org_id, d_alshifa, 500000, 'annually', 'patient_welfare', '2025-08-01', '2026-08-01', true, 500000, 1);
END $$;

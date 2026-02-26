
-- Step 1: Insert 8 new financial donors
INSERT INTO financial_donors (organization_id, donor_type, name, name_ar, phone, cnic_passport, city, country, notes)
VALUES
('b1111111-1111-1111-1111-111111111111', 'individual', 'Haji Muhammad Tariq', 'حاجی محمد طارق', '+92-321-4567890', '35201-1234567-1', 'Lahore', 'Pakistan', 'Regular monthly donor'),
('b1111111-1111-1111-1111-111111111111', 'trust', 'Al-Noor Foundation', 'مؤسسة النور', '+92-21-35678901', NULL, 'Karachi', 'Pakistan', 'Charitable trust for healthcare'),
('b1111111-1111-1111-1111-111111111111', 'individual', 'Fatima Bibi', 'فاطمہ بی بی', '+92-51-2345678', '61101-9876543-2', 'Islamabad', 'Pakistan', NULL),
('b1111111-1111-1111-1111-111111111111', 'corporate', 'Pak-Med Industries', 'باک میڈ انڈسٹریز', '+92-41-8765432', NULL, 'Faisalabad', 'Pakistan', 'Medical equipment manufacturer'),
('b1111111-1111-1111-1111-111111111111', 'individual', 'Sheikh Abdullah Al-Rashidi', 'الشيخ عبدالله الراشدي', '+966-50-1234567', NULL, 'Riyadh', 'Saudi Arabia', 'Annual zakat contributor'),
('b1111111-1111-1111-1111-111111111111', 'trust', 'Crescent Welfare Society', 'کریسنٹ ویلفیئر سوسائٹی', '+92-61-4567890', NULL, 'Multan', 'Pakistan', 'Community welfare organization'),
('b1111111-1111-1111-1111-111111111111', 'individual', 'Bilal Ahmed Khan', 'بلال احمد خان', '+92-51-7654321', '37405-2345678-3', 'Rawalpindi', 'Pakistan', 'Referred by Haji Tariq'),
('b1111111-1111-1111-1111-111111111111', 'corporate', 'Gulf Medical Supplies', 'شركة الخليج للمستلزمات الطبية', '+971-4-3456789', NULL, 'Dubai', 'UAE', 'Medical supplies donor');

-- Step 2: Insert 15 new donations using subqueries for donor IDs
INSERT INTO financial_donations (organization_id, donor_id, amount, currency, donation_date, donation_type, payment_method, purpose, purpose_detail, status, campaign_id, notes)
VALUES
-- Donations from new donors
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Haji Muhammad Tariq' LIMIT 1), 50000, 'PKR', '2026-02-20', 'one_time', 'cash', 'general', 'Monthly contribution', 'received', NULL, NULL),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Haji Muhammad Tariq' LIMIT 1), 75000, 'PKR', '2026-01-15', 'one_time', 'bank_transfer', 'zakat', 'Zakat payment', 'received', NULL, NULL),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Al-Noor Foundation' LIMIT 1), 500000, 'PKR', '2026-02-10', 'one_time', 'bank_transfer', 'building_fund', 'Hospital wing expansion', 'received', '08b4f6e8-b7d8-4b65-9f2a-c02411520e45', NULL),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Al-Noor Foundation' LIMIT 1), 250000, 'PKR', '2026-01-05', 'one_time', 'bank_transfer', 'general', 'Equipment fund', 'received', NULL, NULL),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Fatima Bibi' LIMIT 1), 10000, 'PKR', '2026-02-18', 'one_time', 'cash', 'sadaqah', 'Sadaqah for poor patients', 'received', NULL, NULL),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Pak-Med Industries' LIMIT 1), 200000, 'PKR', '2026-02-01', 'one_time', 'bank_transfer', 'general', 'CSR contribution', 'received', 'c8462f3e-db62-4150-b368-fb063e060b4c', 'Annual CSR donation'),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Sheikh Abdullah Al-Rashidi' LIMIT 1), 300000, 'PKR', '2026-02-15', 'one_time', 'online', 'zakat', 'Annual zakat', 'received', NULL, NULL),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Sheikh Abdullah Al-Rashidi' LIMIT 1), 150000, 'PKR', '2026-01-20', 'one_time', 'online', 'sadaqah', 'Sadaqah jariyah', 'received', 'faacf1e6-6355-4e65-a134-c15ca0b35f66', NULL),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Crescent Welfare Society' LIMIT 1), 100000, 'PKR', '2026-02-05', 'one_time', 'bank_transfer', 'general', 'Patient welfare fund', 'received', NULL, NULL),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Bilal Ahmed Khan' LIMIT 1), 25000, 'PKR', '2026-02-22', 'one_time', 'cash', 'zakat', 'Zakat contribution', 'received', NULL, NULL),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Bilal Ahmed Khan' LIMIT 1), 15000, 'PKR', '2026-01-28', 'one_time', 'cash', 'sadaqah', NULL, 'received', NULL, NULL),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Gulf Medical Supplies' LIMIT 1), 450000, 'PKR', '2026-02-12', 'one_time', 'bank_transfer', 'building_fund', 'Equipment donation fund', 'received', '08b4f6e8-b7d8-4b65-9f2a-c02411520e45', NULL),
-- Pledged donations
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Pak-Med Industries' LIMIT 1), 350000, 'PKR', '2026-03-01', 'one_time', 'bank_transfer', 'building_fund', 'Pledged for next quarter', 'pledged', '08b4f6e8-b7d8-4b65-9f2a-c02411520e45', 'Committed for Q2'),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Gulf Medical Supplies' LIMIT 1), 200000, 'PKR', '2026-03-15', 'one_time', 'bank_transfer', 'general', 'Pledged annual contribution', 'pledged', NULL, NULL),
('b1111111-1111-1111-1111-111111111111', (SELECT id FROM financial_donors WHERE name = 'Fatima Bibi' LIMIT 1), 5000, 'PKR', '2026-01-10', 'one_time', 'cash', 'general', 'Small monthly gift', 'received', NULL, NULL);

-- Step 3: Update appointments with chief complaints
UPDATE appointments SET chief_complaint = 'Fever and body aches for 3 days' WHERE id = 'b1bb2008-31fd-41fb-ae4f-f751038c5e56';
UPDATE appointments SET chief_complaint = 'Follow-up for diabetes management' WHERE id = 'c342cc45-e6d3-43af-bc12-74a4ddb721a1';
UPDATE appointments SET chief_complaint = 'Routine checkup and blood pressure monitoring' WHERE id = '01664267-b2df-44bd-860b-39c6495c230d';
UPDATE appointments SET chief_complaint = 'Sore throat and difficulty swallowing for 2 days' WHERE id = '22200001-0001-0001-0001-000000000003';
UPDATE appointments SET chief_complaint = 'Persistent headache and dizziness for 1 week' WHERE id = '9774e349-ea92-4a7e-ac7b-38a1c5c9ace6';
UPDATE appointments SET chief_complaint = 'Chest tightness and shortness of breath' WHERE id = '22200001-0001-0001-0001-000000000002';
UPDATE appointments SET chief_complaint = 'Follow-up for hypertension management' WHERE id = '22200001-0001-0001-0001-000000000001';
UPDATE appointments SET chief_complaint = 'Chronic lower back pain radiating to left leg' WHERE id = '0216fa87-65a9-4e8b-99e6-54c46543bde1';
UPDATE appointments SET chief_complaint = 'Shortness of breath on exertion' WHERE id = '259b49fa-0f97-48f5-9278-1e7675fd7cd7';
UPDATE appointments SET chief_complaint = 'Abdominal pain and nausea since yesterday' WHERE id = '52e87056-880f-4943-9419-d4079efd5774';
UPDATE appointments SET chief_complaint = 'Skin rash on arms and legs, itching' WHERE id = 'd4087a6f-092a-4db4-b25e-1231becf69c6';
UPDATE appointments SET chief_complaint = 'Joint pain in both knees, worsening over 2 weeks' WHERE id = '333113dc-11ce-4c47-865e-0b95ac2e5130';

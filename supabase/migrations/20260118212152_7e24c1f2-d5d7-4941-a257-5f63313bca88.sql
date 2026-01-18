-- Move all grandchildren (level 3) directly under IPD parent root
UPDATE menu_items 
SET parent_id = '9b1253a5-d6c4-495e-857a-b64d2bca9120'
WHERE parent_id IN (
  '507a300b-8b07-4996-86ca-464be762120d', -- Patient Care
  '15b37514-9881-4224-85a6-e5a3040a7977', -- Discharge
  '8ce0a5f6-9c38-40f8-b3b0-320ff574a5fd', -- IPD Setup
  'd3b4d0dd-d1ed-4817-8b01-f6524601581f', -- Admissions
  'e38943d2-fba4-4cc2-9f12-9e8b1cd99d3c'  -- Bed Management
);

-- Deactivate the now-empty section items (they had no paths anyway)
UPDATE menu_items SET is_active = false 
WHERE id IN (
  '507a300b-8b07-4996-86ca-464be762120d', -- Patient Care
  '15b37514-9881-4224-85a6-e5a3040a7977', -- Discharge
  '8ce0a5f6-9c38-40f8-b3b0-320ff574a5fd', -- IPD Setup
  'd3b4d0dd-d1ed-4817-8b01-f6524601581f', -- Admissions
  'e38943d2-fba4-4cc2-9f12-9e8b1cd99d3c'  -- Bed Management
);

-- Update demo user profiles with proper Pakistani names
UPDATE profiles SET full_name = 'Bilal Ahmed Khan' WHERE email = 'superadmin@healthos.demo';
UPDATE profiles SET full_name = 'Fatima Zahra Malik' WHERE email = 'orgadmin@healthos.demo';
UPDATE profiles SET full_name = 'Usman Ali Shah' WHERE email = 'branchadmin@healthos.demo';
UPDATE profiles SET full_name = 'Dr. Ayesha Nawaz' WHERE email = 'doctor@healthos.demo';
UPDATE profiles SET full_name = 'Sana Bibi' WHERE email = 'nurse@healthos.demo';
UPDATE profiles SET full_name = 'Imran Hussain' WHERE email = 'receptionist@healthos.demo';
UPDATE profiles SET full_name = 'Tariq Mahmood' WHERE email = 'pharmacist@healthos.demo';
UPDATE profiles SET full_name = 'Rashid Khan' WHERE email = 'labtechnician@healthos.demo';
UPDATE profiles SET full_name = 'Asim Raza' WHERE email = 'accountant@healthos.demo';
UPDATE profiles SET full_name = 'Kamran Yousaf' WHERE email = 'storemanager@healthos.demo';
UPDATE profiles SET full_name = 'Nasir Ahmed' WHERE email = 'hrmanager@healthos.demo';
UPDATE profiles SET full_name = 'Zainab Fatima' WHERE email = 'hrofficer@healthos.demo';
UPDATE profiles SET full_name = 'Hamza Sheikh' WHERE email = 'financemanager@healthos.demo';
UPDATE profiles SET full_name = 'Saima Batool' WHERE email = 'bloodbanktechnician@healthos.demo';
UPDATE profiles SET full_name = 'Dr. Naveed Iqbal' WHERE email = 'radiologist@healthos.demo';
UPDATE profiles SET full_name = 'Adeel Aslam' WHERE email = 'radiologytechnician@healthos.demo';
UPDATE profiles SET full_name = 'Nadia Perveen' WHERE email = 'ipdnurse@healthos.demo';
UPDATE profiles SET full_name = 'Waqar Hassan' WHERE email = 'ottechnician@healthos.demo';
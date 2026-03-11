
-- =====================================================
-- FINANCE MODULE SEED DATA
-- Org: b1111111-1111-1111-1111-111111111111
-- Branch: c1111111-1111-1111-1111-111111111111
-- =====================================================

-- 1. Missing GL Accounts (1500, 2400, 5600)
INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
VALUES 
  ('b1111111-1111-1111-1111-111111111111', '1500', 'Accumulated Depreciation', 'cafb9e3a-0a29-4037-beb0-6d22ca785111', true, 4, false, 'ea9263be-95e3-4137-abde-070e2bb84c7a'),
  ('b1111111-1111-1111-1111-111111111111', '2400', 'Patient Deposits', 'c983a61b-2332-422d-bb5f-56f78035a16e', true, 4, false, 'eedfb544-68dd-4af9-97cd-aa71e4393a88'),
  ('b1111111-1111-1111-1111-111111111111', '5600', 'Depreciation Expense', 'd72a3943-362f-4635-804e-82b0c5433bbc', true, 4, false, 'f7fa7e67-b857-4591-8230-bd998945971d')
ON CONFLICT DO NOTHING;

-- 2. Cost Centers (5 records)
INSERT INTO cost_centers (organization_id, code, name, is_active)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'CC-OPD', 'OPD Department', true),
  ('b1111111-1111-1111-1111-111111111111', 'CC-LAB', 'Laboratory', true),
  ('b1111111-1111-1111-1111-111111111111', 'CC-PHRM', 'Pharmacy', true),
  ('b1111111-1111-1111-1111-111111111111', 'CC-ADMIN', 'Administration', true),
  ('b1111111-1111-1111-1111-111111111111', 'CC-NUR', 'Nursing', true)
ON CONFLICT DO NOTHING;

-- 3. Fixed Assets (5 records)
INSERT INTO fixed_assets (organization_id, branch_id, asset_code, name, category, description, location, purchase_date, purchase_cost, useful_life_months, depreciation_method, salvage_value, accumulated_depreciation, net_book_value, status)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'FA-001', 'MRI Machine - Siemens Magnetom', 'medical_equipment', '1.5T MRI Scanner for diagnostic imaging', 'Radiology Wing - Room 101', '2024-06-15', 2500000, 120, 'straight_line', 250000, 375000, 2125000, 'active'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'FA-002', 'CT Scanner - GE Revolution', 'medical_equipment', '128-slice CT Scanner', 'Radiology Wing - Room 102', '2024-09-01', 1800000, 96, 'straight_line', 180000, 303750, 1496250, 'active'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'FA-003', 'Ultrasound Machine - Philips', 'medical_equipment', 'High-end ultrasound for OB/GYN', 'OPD Wing - Room 205', '2025-01-10', 350000, 60, 'reducing_balance', 35000, 87500, 262500, 'active'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'FA-004', 'Ventilators (10 Units)', 'medical_equipment', 'Hamilton C6 ICU ventilators', 'ICU Ward', '2025-03-20', 500000, 84, 'straight_line', 50000, 53571, 446429, 'active'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'FA-005', 'Pharmacy Dispensing System', 'it_equipment', 'Automated medication dispensing cabinets', 'Pharmacy', '2025-06-01', 120000, 60, 'straight_line', 12000, 16200, 103800, 'active')
ON CONFLICT DO NOTHING;

-- 4. Bank Accounts (2 records)
INSERT INTO bank_accounts (organization_id, bank_name, account_number, account_type, account_holder_name, opening_balance, current_balance, is_active, is_default, branch_id)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'HBL - Habib Bank Limited', '0012-34567890-01', 'current', 'Smart HMS Hospital', 725000, 725000, true, true, 'c1111111-1111-1111-1111-111111111111'),
  ('b1111111-1111-1111-1111-111111111111', 'MCB Bank', '0098-76543210-01', 'savings', 'Smart HMS Payroll Account', 150000, 150000, true, false, 'c1111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

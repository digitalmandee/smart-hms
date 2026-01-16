-- Move Account Types to direct submenu
UPDATE menu_items 
SET name = 'Account Types', path = '/app/accounts/types', icon = 'Folders', sort_order = 25,
  parent_id = (SELECT id FROM menu_items WHERE code = 'accounts' LIMIT 1)
WHERE code = 'account_settings';

-- Fix IPD discharge path
UPDATE menu_items SET path = '/app/ipd/discharges' WHERE path = '/app/ipd/discharge';

-- Add missing IPD menu items
DO $$
DECLARE ipd_parent_id UUID;
BEGIN
  SELECT id INTO ipd_parent_id FROM menu_items WHERE code = 'ipd' LIMIT 1;
  
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  SELECT 'ipd_charges', 'IPD Charges', 'Receipt', '/app/ipd/charges', ipd_parent_id, 55, 'manage_ipd', true
  WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'ipd_charges');
  
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  SELECT 'bed_transfers', 'Bed Transfers', 'ArrowRightLeft', '/app/ipd/beds/transfers', ipd_parent_id, 35, 'manage_ipd', true
  WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'bed_transfers');
  
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  SELECT 'medication_chart', 'Medication Chart', 'Pill', '/app/ipd/care/medications', ipd_parent_id, 45, 'manage_ipd', true
  WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'medication_chart');
  
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  SELECT 'ipd_reports', 'IPD Reports', 'BarChart3', '/app/ipd/reports', ipd_parent_id, 90, 'view_reports', true
  WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'ipd_reports');
END $$;

-- Seed Sample Appointments and Invoices
DO $$
DECLARE
  v_org_id UUID; v_branch_id UUID; v_patient_ids UUID[]; v_doctor_id UUID; v_current_date DATE := CURRENT_DATE;
BEGIN
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  SELECT id INTO v_branch_id FROM branches WHERE organization_id = v_org_id LIMIT 1;
  SELECT array_agg(id) INTO v_patient_ids FROM (SELECT id FROM patients WHERE organization_id = v_org_id ORDER BY created_at DESC LIMIT 20) sub;
  SELECT id INTO v_doctor_id FROM doctors WHERE organization_id = v_org_id LIMIT 1;
  
  IF v_org_id IS NOT NULL AND v_branch_id IS NOT NULL AND array_length(v_patient_ids, 1) > 0 AND v_doctor_id IS NOT NULL THEN
    INSERT INTO appointments (organization_id, branch_id, patient_id, doctor_id, appointment_date, appointment_time, status, appointment_type, priority, chief_complaint)
    SELECT v_org_id, v_branch_id, v_patient_ids[i], v_doctor_id, v_current_date, ('08:' || LPAD((i * 10)::TEXT, 2, '0'))::TIME,
      CASE WHEN i <= 3 THEN 'completed'::appointment_status WHEN i <= 6 THEN 'checked_in'::appointment_status ELSE 'scheduled'::appointment_status END,
      'follow_up'::appointment_type, CASE WHEN i = 5 THEN 2 WHEN i = 8 THEN 1 ELSE 0 END,
      CASE i WHEN 1 THEN 'Routine checkup' WHEN 2 THEN 'Fever and cough' WHEN 3 THEN 'Abdominal pain' ELSE 'Follow-up visit' END
    FROM generate_series(1, 10) AS i ON CONFLICT DO NOTHING;

    INSERT INTO invoices (organization_id, branch_id, patient_id, invoice_number, invoice_date, subtotal, discount_amount, tax_amount, total_amount, paid_amount, status, payment_status, invoice_type)
    SELECT v_org_id, v_branch_id, v_patient_ids[i],
      'INV-' || TO_CHAR(v_current_date, 'YYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
      v_current_date - (i || ' days')::INTERVAL, (1000 + i * 500)::DECIMAL, (50 + i * 10)::DECIMAL, ((1000 + i * 500) * 0.05)::DECIMAL,
      ((1000 + i * 500) - (50 + i * 10) + ((1000 + i * 500) * 0.05))::DECIMAL,
      CASE WHEN i <= 4 THEN ((1000 + i * 500) - (50 + i * 10) + ((1000 + i * 500) * 0.05))::DECIMAL WHEN i <= 7 THEN ((1000 + i * 500) * 0.5)::DECIMAL ELSE 0::DECIMAL END,
      'final', CASE WHEN i <= 4 THEN 'paid' WHEN i <= 7 THEN 'partial' ELSE 'pending' END, 'opd'
    FROM generate_series(1, 10) AS i ON CONFLICT DO NOTHING;
  END IF;
END $$;
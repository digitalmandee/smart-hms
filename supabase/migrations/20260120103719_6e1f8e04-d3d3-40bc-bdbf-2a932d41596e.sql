-- FINAL: Seed test data for Shifa Medical only

-- Appointments for TODAY
INSERT INTO appointments (organization_id, branch_id, patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status, chief_complaint, priority)
VALUES 
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e1a11111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', CURRENT_DATE, '09:00', 'walk_in', 'scheduled', 'Fever and body aches', 0),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e2a22222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', CURRENT_DATE, '09:15', 'walk_in', 'checked_in', 'Persistent headache', 0),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e3a33333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', CURRENT_DATE, '09:30', 'scheduled', 'checked_in', 'Chest pain', 1),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e4a44444-4444-4444-4444-444444444444', 'd3333333-3333-3333-3333-333333333333', CURRENT_DATE, '09:45', 'walk_in', 'in_progress', 'Child vaccination', 0),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e5a55555-5555-5555-5555-555555555555', 'd1111111-1111-1111-1111-111111111111', CURRENT_DATE, '10:00', 'follow_up', 'completed', 'Follow-up review', 0),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e1a11111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', CURRENT_DATE, '10:30', 'scheduled', 'scheduled', 'Heart checkup', 0),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e2a22222-2222-2222-2222-222222222222', 'd3333333-3333-3333-3333-333333333333', CURRENT_DATE, '11:00', 'walk_in', 'scheduled', 'Ear infection', 0),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e3a33333-3333-3333-3333-333333333333', 'd1111111-1111-1111-1111-111111111111', CURRENT_DATE, '11:30', 'walk_in', 'checked_in', 'Stomach pain', 1);

-- Invoices
INSERT INTO invoices (organization_id, branch_id, patient_id, invoice_date, subtotal, tax_amount, discount_amount, total_amount, paid_amount, status, notes)
VALUES 
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e1a11111-1111-1111-1111-111111111111', CURRENT_DATE, 1000, 0, 0, 1000, 1000, 'paid', 'Muhammad Ali consult'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e2a22222-2222-2222-2222-222222222222', CURRENT_DATE, 3500, 0, 0, 3500, 3500, 'paid', 'Fatima Bibi lab'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e3a33333-3333-3333-3333-333333333333', CURRENT_DATE, 5500, 0, 0, 5500, 3000, 'partially_paid', 'Ahmed Hassan cardio'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e4a44444-4444-4444-4444-444444444444', CURRENT_DATE, 2500, 0, 0, 2500, 0, 'pending', 'Ayesha Khan peds');

-- Invoice items
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, discount_percent, total_price)
SELECT i.id, 'Consultation', 1, i.total_amount, 0, i.total_amount
FROM invoices i WHERE i.invoice_date = CURRENT_DATE AND NOT EXISTS (SELECT 1 FROM invoice_items ii WHERE ii.invoice_id = i.id);

-- Payments for paid invoices
INSERT INTO payments (invoice_id, payment_method_id, amount, payment_date, reference_number, notes)
SELECT i.id, 'f1a11111-1111-1111-1111-111111111111', i.paid_amount, CURRENT_DATE, 'CASH-' || LPAD(FLOOR(RANDOM()*1000)::TEXT,4,'0'), 'Payment'
FROM invoices i WHERE i.status IN ('paid', 'partially_paid') AND i.invoice_date = CURRENT_DATE 
AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id);
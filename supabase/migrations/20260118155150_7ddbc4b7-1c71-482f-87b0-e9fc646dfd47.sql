-- Seed Payment Methods for Al-Noor Family Clinic
INSERT INTO payment_methods (id, organization_id, name, code, is_active)
VALUES 
  ('f6a66666-6666-6666-6666-666666666666', 'b2222222-2222-2222-2222-222222222222', 'Cash', 'CASH', true),
  ('f7a77777-7777-7777-7777-777777777777', 'b2222222-2222-2222-2222-222222222222', 'JazzCash', 'JAZZCASH', true),
  ('f8a88888-8888-8888-8888-888888888888', 'b2222222-2222-2222-2222-222222222222', 'EasyPaisa', 'EASYPAISA', true),
  ('f9a99999-9999-9999-9999-999999999999', 'b2222222-2222-2222-2222-222222222222', 'Credit Card', 'CARD', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Service Types for Clinic Consultations (use lowercase category enum)
INSERT INTO service_types (id, organization_id, name, category, default_price, is_active)
VALUES
  ('56666666-6666-6666-6666-666666666666', 'b2222222-2222-2222-2222-222222222222', 'General Consultation', 'consultation', 1000.00, true),
  ('57777777-7777-7777-7777-777777777777', 'b2222222-2222-2222-2222-222222222222', 'Specialist Consultation', 'consultation', 2000.00, true),
  ('58888888-8888-8888-8888-888888888888', 'b2222222-2222-2222-2222-222222222222', 'Follow-up Visit', 'consultation', 500.00, true)
ON CONFLICT (id) DO NOTHING;
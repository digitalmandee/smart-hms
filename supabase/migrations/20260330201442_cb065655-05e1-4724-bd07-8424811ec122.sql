-- Seed 6 dialysis machines
INSERT INTO dialysis_machines (organization_id, branch_id, machine_number, serial_number, model, manufacturer, chair_number, status, is_active)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Machine-01', 'SN-DM-001', 'Fresenius 5008S', 'Fresenius', '1', 'available', true),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Machine-02', 'SN-DM-002', 'Fresenius 5008S', 'Fresenius', '2', 'available', true),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Machine-03', 'SN-DM-003', 'Fresenius 4008S', 'Fresenius', '3', 'available', true),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Machine-04', 'SN-DM-004', 'Nipro Surdial X', 'Nipro', '4', 'available', true),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Machine-05', 'SN-DM-005', 'Nipro Surdial X', 'Nipro', '5', 'available', true),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Machine-06', 'SN-DM-006', 'B.Braun Dialog+', 'B.Braun', '6', 'available', true);
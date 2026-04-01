
DO $$
DECLARE
  v_org_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
  INSERT INTO public.medicines (organization_id, name, generic_name, strength, unit, cost_price, sale_price, is_active)
  VALUES
    (v_org_id, 'AIRTAL 100MG TAB', 'Aceclofenac', '100mg', 'tablet', 308.55, 363.00, true),
    (v_org_id, 'COMBIVAIR 400MG CAP', 'Theophylline', '400mg', 'capsule', 408.00, 480.00, true),
    (v_org_id, 'HERBESSER TAB 30MG', 'Diltiazem', '30mg', 'tablet', 334.90, 394.00, true),
    (v_org_id, 'KESTINE 10MG', 'Ebastine', '10mg', 'tablet', 252.71, 297.30, true),
    (v_org_id, 'LOPRIN 75MG TAB', 'Aspirin', '75mg', 'tablet', 60.61, 71.31, true),
    (v_org_id, 'NEBIX 2.5MG', 'Nebivolol', '2.5mg', 'tablet', 274.55, 323.00, true),
    (v_org_id, 'SKILAX DROPS 30ML', 'Sodium Picosulfate', '30ml', 'drops', 110.50, 130.00, true),
    (v_org_id, 'PULMONOL LOZENGES', 'Ambroxol', NULL, 'tablet', 88.15, 118.00, true);
END;
$$;

-- Seed sample surgeon fee templates for Dr. Ahmed Raza (Shifa Medical Center)
INSERT INTO surgeon_fee_templates (
  surgeon_id, procedure_name, procedure_code, surgeon_fee, 
  default_anesthesia_type, default_anesthesia_fee, 
  nursing_fee, ot_room_fee, consumables_fee, recovery_fee,
  notes, organization_id
)
VALUES 
  -- Template 1: Appendectomy
  (
    'd0300000-0000-0000-0000-000000000030',
    'Laparoscopic Appendectomy',
    'LAP-APP-001',
    50000,
    'general',
    20000,
    5000,
    10000,
    8000,
    5000,
    'Standard laparoscopic appendectomy package',
    'b1111111-1111-1111-1111-111111111111'
  ),
  -- Template 2: Cholecystectomy
  (
    'd0300000-0000-0000-0000-000000000030',
    'Laparoscopic Cholecystectomy',
    'LAP-CHOL-001',
    60000,
    'general',
    25000,
    6000,
    12000,
    10000,
    6000,
    'Standard laparoscopic gallbladder removal',
    'b1111111-1111-1111-1111-111111111111'
  ),
  -- Template 3: Hernia Repair
  (
    'd0300000-0000-0000-0000-000000000030',
    'Inguinal Hernia Repair',
    'HER-ING-001',
    40000,
    'spinal',
    15000,
    4000,
    8000,
    12000,
    4000,
    'Mesh hernioplasty with spinal anesthesia',
    'b1111111-1111-1111-1111-111111111111'
  ),
  -- Template 4: Minor Surgery
  (
    'd0300000-0000-0000-0000-000000000030',
    'Minor Surgical Procedure',
    'MIN-SURG-001',
    15000,
    'local',
    5000,
    2000,
    5000,
    3000,
    2000,
    'General minor surgery under local anesthesia',
    'b1111111-1111-1111-1111-111111111111'
  )
ON CONFLICT (surgeon_id, procedure_name, organization_id) DO NOTHING;
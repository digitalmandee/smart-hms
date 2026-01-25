-- Add billing status columns to surgery_medications for Reception approval workflow
ALTER TABLE surgery_medications 
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'pending' 
  CHECK (billing_status IN ('pending', 'approved', 'rejected', 'posted')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add index for efficient queries on pending charges
CREATE INDEX IF NOT EXISTS idx_surgery_medications_billing_status 
ON surgery_medications(billing_status) 
WHERE pharmacy_status = 'dispensed';

-- Insert menu items for OT Nurse dedicated pages
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
SELECT 'ot_nursing_notes', 'Nursing Notes', 'FileText', '/app/ot/nursing-notes', parent.id, 25, 'ot.nurse', 'ot', true
FROM menu_items parent WHERE parent.code = 'ot' AND parent.parent_id IS NULL
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
SELECT 'ot_instruments', 'Instrument Count', 'ClipboardCheck', '/app/ot/instruments', parent.id, 26, 'ot.nurse', 'ot', true
FROM menu_items parent WHERE parent.code = 'ot' AND parent.parent_id IS NULL
ON CONFLICT (code) DO NOTHING;

-- Insert menu item for Reception OT Charges
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
SELECT 'reception_ot_charges', 'OT Medication Charges', 'Pill', '/app/reception/ot-charges', parent.id, 15, 'reception.manage', 'ot', true
FROM menu_items parent WHERE parent.code = 'reception' AND parent.parent_id IS NULL
ON CONFLICT (code) DO NOTHING;
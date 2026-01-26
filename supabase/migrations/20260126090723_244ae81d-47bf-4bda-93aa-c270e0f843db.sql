-- Phase 1: Fix Critical Database Linking Issues

-- 1.1 Add vendor_id FK to medicine_inventory (replacing text-based supplier_name)
ALTER TABLE medicine_inventory 
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id);

-- Create index for vendor lookups
CREATE INDEX IF NOT EXISTS idx_medicine_inventory_vendor ON medicine_inventory(vendor_id);

-- 1.2 Fix grn_items.item_id to allow NULL for medicine items
ALTER TABLE grn_items ALTER COLUMN item_id DROP NOT NULL;

-- 1.3 Add vendor categorization to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS vendor_type TEXT DEFAULT 'general';
-- Types: 'pharmaceutical', 'equipment', 'consumables', 'surgical', 'services', 'general'

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_preferred BOOLEAN DEFAULT false;

-- Add ledger account link for AP sub-ledger integration
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS ledger_account_id UUID REFERENCES accounts(id);

-- 1.4 Create item-vendor mapping table for preferred vendors
CREATE TABLE IF NOT EXISTS item_vendor_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  item_id UUID REFERENCES inventory_items(id),
  medicine_id UUID REFERENCES medicines(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  is_preferred BOOLEAN DEFAULT false,
  last_purchase_price NUMERIC(12,2),
  last_purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_item_or_medicine CHECK (item_id IS NOT NULL OR medicine_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE item_vendor_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policy for item_vendor_mapping
CREATE POLICY "Organization members can manage item-vendor mappings"
ON item_vendor_mapping FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
));

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_item_vendor_item ON item_vendor_mapping(item_id);
CREATE INDEX IF NOT EXISTS idx_item_vendor_medicine ON item_vendor_mapping(medicine_id);
CREATE INDEX IF NOT EXISTS idx_item_vendor_vendor ON item_vendor_mapping(vendor_id);

-- 1.5 Seed Inventory Categories
INSERT INTO inventory_categories (organization_id, name, description, parent_id, is_active)
SELECT o.id, cat.name, cat.description, NULL, true
FROM organizations o
CROSS JOIN (VALUES
  ('Medical Equipment', 'Diagnostic and treatment equipment'),
  ('Surgical Supplies', 'Consumables used in surgeries'),
  ('Laboratory Supplies', 'Lab testing materials and reagents'),
  ('Housekeeping', 'Cleaning and maintenance supplies'),
  ('Office Supplies', 'Administrative and office materials'),
  ('Linens & Textiles', 'Bedding, uniforms, and textiles'),
  ('Furniture', 'Hospital furniture and fixtures'),
  ('IT Equipment', 'Computers, printers, and accessories'),
  ('Safety & PPE', 'Personal protective equipment'),
  ('Maintenance Parts', 'Spare parts and maintenance supplies')
) AS cat(name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_categories ic 
  WHERE ic.organization_id = o.id AND ic.name = cat.name
);

-- 1.6 Seed Sample Vendors
INSERT INTO vendors (organization_id, vendor_code, name, vendor_type, contact_person, phone, city, country, payment_terms, rating, is_active)
SELECT 
  o.id, 
  v.code,
  v.name, v.type, v.contact, v.phone, v.city, 'Pakistan', v.terms, v.rating, true
FROM organizations o
CROSS JOIN (VALUES
  ('VND-0001', 'PharmaCare Distributors', 'pharmaceutical', 'Ahmed Khan', '+92-321-1234567', 'Karachi', 'Net 30', 4),
  ('VND-0002', 'MedEquip Solutions', 'equipment', 'Sara Ali', '+92-333-9876543', 'Lahore', 'Net 45', 5),
  ('VND-0003', 'LabSupply Pakistan', 'consumables', 'Hassan Raza', '+92-300-5555555', 'Islamabad', 'Net 30', 3),
  ('VND-0004', 'SurgiCare Industries', 'surgical', 'Fatima Noor', '+92-345-1112223', 'Karachi', 'Net 60', 4),
  ('VND-0005', 'CleanTech Services', 'services', 'Usman Ahmed', '+92-311-7778889', 'Lahore', 'Net 15', 4),
  ('VND-0006', 'OfficeMax Pakistan', 'general', 'Ayesha Malik', '+92-322-3334445', 'Islamabad', 'Net 30', 3)
) AS v(code, name, type, contact, phone, city, terms, rating)
WHERE NOT EXISTS (
  SELECT 1 FROM vendors vnd 
  WHERE vnd.organization_id = o.id AND vnd.vendor_code = v.code
);

-- 1.7 Update trigger for item_vendor_mapping
CREATE OR REPLACE FUNCTION update_item_vendor_mapping_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_item_vendor_mapping_updated ON item_vendor_mapping;
CREATE TRIGGER trg_item_vendor_mapping_updated
BEFORE UPDATE ON item_vendor_mapping
FOR EACH ROW EXECUTE FUNCTION update_item_vendor_mapping_timestamp();
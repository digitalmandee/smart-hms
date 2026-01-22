-- =====================================================
-- UNIFIED SERVICES ARCHITECTURE - FIXED
-- Link specialized tables to service_types as single source of truth
-- =====================================================

-- 1. Add service_type_id foreign key columns (these may already exist from prior attempt)
ALTER TABLE imaging_procedures 
ADD COLUMN IF NOT EXISTS service_type_id UUID REFERENCES service_types(id);

ALTER TABLE ipd_bed_types 
ADD COLUMN IF NOT EXISTS service_type_id UUID REFERENCES service_types(id);

ALTER TABLE lab_test_templates 
ADD COLUMN IF NOT EXISTS service_type_id UUID REFERENCES service_types(id);

-- 2. Add price column to lab_test_templates if not exists
ALTER TABLE lab_test_templates 
ADD COLUMN IF NOT EXISTS price DECIMAL(12,2) DEFAULT 0;

-- 3. Create indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_imaging_procedures_service_type 
ON imaging_procedures(service_type_id);

CREATE INDEX IF NOT EXISTS idx_ipd_bed_types_service_type 
ON ipd_bed_types(service_type_id);

CREATE INDEX IF NOT EXISTS idx_lab_test_templates_service_type 
ON lab_test_templates(service_type_id);

-- 4. Backfill imaging_procedures -> service_types (only with valid organization_id)
INSERT INTO service_types (organization_id, name, category, default_price, is_active)
SELECT DISTINCT 
  ip.organization_id,
  ip.name,
  'radiology'::service_category,
  COALESCE(ip.base_price, 0),
  COALESCE(ip.is_active, true)
FROM imaging_procedures ip
WHERE ip.service_type_id IS NULL
  AND ip.organization_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM service_types st 
    WHERE st.organization_id = ip.organization_id 
    AND st.name = ip.name 
    AND st.category = 'radiology'
  );

-- Link imaging_procedures to their service_types
UPDATE imaging_procedures ip
SET service_type_id = st.id
FROM service_types st
WHERE st.organization_id = ip.organization_id
  AND st.name = ip.name
  AND st.category = 'radiology'
  AND ip.service_type_id IS NULL;

-- 5. Backfill ipd_bed_types -> service_types
INSERT INTO service_types (organization_id, name, category, default_price, is_active)
SELECT DISTINCT 
  bt.organization_id,
  bt.name || ' (Daily Rate)',
  'room'::service_category,
  COALESCE(bt.daily_rate, 0),
  COALESCE(bt.is_active, true)
FROM ipd_bed_types bt
WHERE bt.service_type_id IS NULL
  AND bt.organization_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM service_types st 
    WHERE st.organization_id = bt.organization_id 
    AND st.name = bt.name || ' (Daily Rate)'
    AND st.category = 'room'
  );

-- Link ipd_bed_types to their service_types
UPDATE ipd_bed_types bt
SET service_type_id = st.id
FROM service_types st
WHERE st.organization_id = bt.organization_id
  AND st.name = bt.name || ' (Daily Rate)'
  AND st.category = 'room'
  AND bt.service_type_id IS NULL;

-- 6. Backfill lab_test_templates -> service_types (only with valid organization_id)
INSERT INTO service_types (organization_id, name, category, default_price, is_active)
SELECT DISTINCT 
  lt.organization_id,
  lt.test_name,
  'lab'::service_category,
  COALESCE(lt.price, 0),
  COALESCE(lt.is_active, true)
FROM lab_test_templates lt
WHERE lt.service_type_id IS NULL
  AND lt.organization_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM service_types st 
    WHERE st.organization_id = lt.organization_id 
    AND st.name = lt.test_name 
    AND st.category = 'lab'
  );

-- Link lab_test_templates to their service_types
UPDATE lab_test_templates lt
SET service_type_id = st.id
FROM service_types st
WHERE st.organization_id = lt.organization_id
  AND st.name = lt.test_name
  AND st.category = 'lab'
  AND lt.service_type_id IS NULL;

-- 7. Create function to sync price changes from service_types to linked tables
CREATE OR REPLACE FUNCTION sync_service_type_price()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync to imaging_procedures
  IF NEW.category = 'radiology' THEN
    UPDATE imaging_procedures 
    SET base_price = NEW.default_price
    WHERE service_type_id = NEW.id;
  END IF;
  
  -- Sync to ipd_bed_types
  IF NEW.category = 'room' THEN
    UPDATE ipd_bed_types 
    SET daily_rate = NEW.default_price
    WHERE service_type_id = NEW.id;
  END IF;
  
  -- Sync to lab_test_templates
  IF NEW.category = 'lab' THEN
    UPDATE lab_test_templates 
    SET price = NEW.default_price
    WHERE service_type_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for price sync
DROP TRIGGER IF EXISTS trigger_sync_service_type_price ON service_types;
CREATE TRIGGER trigger_sync_service_type_price
AFTER UPDATE OF default_price ON service_types
FOR EACH ROW
EXECUTE FUNCTION sync_service_type_price();

-- 8. Add price tracking columns to service_types for audit
ALTER TABLE service_types 
ADD COLUMN IF NOT EXISTS price_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS price_updated_by UUID REFERENCES profiles(id);

-- 9. Create service_price_history table for tracking changes
CREATE TABLE IF NOT EXISTS service_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type_id UUID NOT NULL REFERENCES service_types(id) ON DELETE CASCADE,
  old_price DECIMAL(12,2),
  new_price DECIMAL(12,2) NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT
);

-- Enable RLS on price history
ALTER TABLE service_price_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service_price_history
CREATE POLICY "Users can view price history for their org" ON service_price_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM service_types st
    JOIN profiles p ON p.organization_id = st.organization_id
    WHERE st.id = service_price_history.service_type_id
    AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can insert price history for their org" ON service_price_history
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM service_types st
    JOIN profiles p ON p.organization_id = st.organization_id
    WHERE st.id = service_price_history.service_type_id
    AND p.id = auth.uid()
  )
);

-- Create indexes on price history
CREATE INDEX IF NOT EXISTS idx_price_history_service ON service_price_history(service_type_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON service_price_history(changed_at DESC);
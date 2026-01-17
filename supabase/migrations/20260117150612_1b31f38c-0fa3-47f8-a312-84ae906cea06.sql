-- =============================================
-- LAB MODULE ENHANCEMENT: Publishing Columns & Templates
-- =============================================

-- PHASE 1: Add publishing columns to lab_orders
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS access_code TEXT;
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS patient_notified BOOLEAN DEFAULT false;
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ;

-- Create unique constraint on lab_test_templates for upsert
CREATE UNIQUE INDEX IF NOT EXISTS lab_test_templates_org_name_unique 
ON lab_test_templates(organization_id, test_name);

-- PHASE 2: Add RLS policies for public access to published reports
DROP POLICY IF EXISTS "Public can view published lab reports" ON lab_orders;
DROP POLICY IF EXISTS "Public can view items of published orders" ON lab_order_items;

CREATE POLICY "Public can view published lab reports"
ON lab_orders FOR SELECT TO anon
USING (is_published = true);

CREATE POLICY "Public can view items of published orders"
ON lab_order_items FOR SELECT TO anon
USING (EXISTS (
  SELECT 1 FROM lab_orders lo 
  WHERE lo.id = lab_order_items.lab_order_id 
  AND lo.is_published = true
));
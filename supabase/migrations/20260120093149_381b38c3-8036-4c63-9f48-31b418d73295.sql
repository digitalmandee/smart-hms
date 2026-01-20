-- Fix Menu Hierarchy Issues
-- 1. Remove path from parent menus that have children (they should only expand/collapse)
UPDATE menu_items 
SET path = NULL 
WHERE code IN ('radiology', 'laboratory', 'pharmacy', 'hr', 'accounts', 'emergency', 'ipd', 'opd', 'appointments', 'settings')
AND path IS NOT NULL;

-- 2. Deactivate duplicate/orphan menu items
UPDATE menu_items 
SET is_active = false 
WHERE code IN (
  'bed_transfers',      -- Duplicate of ipd.beds.transfers
  'ipd.reports',        -- Orphan at wrong level
  'ipd.charges',        -- Duplicate of ipd.discharge.billing
  'medication_chart',   -- Duplicate of ipd.care.medications
  'ipd.patient-care'    -- Duplicate of ipd.care
);

-- 3. Move Lab Reports under Laboratory if it exists as orphan
UPDATE menu_items 
SET parent_id = (SELECT id FROM menu_items WHERE code = 'laboratory'),
    sort_order = 50
WHERE code = 'lab-reports' 
AND parent_id IS NULL;

-- 4. Ensure all parent containers with children have NULL paths
UPDATE menu_items p
SET path = NULL
FROM menu_items c
WHERE c.parent_id = p.id
AND p.path IS NOT NULL
AND p.is_active = true;
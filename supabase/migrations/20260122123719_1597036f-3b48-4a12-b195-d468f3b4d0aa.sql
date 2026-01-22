-- Fix: Switch from category ENUM to category_id FK for dynamic categories

-- 1. First ensure all service_types have a category_id set
UPDATE service_types st
SET category_id = sc.id
FROM service_categories sc
WHERE sc.organization_id = st.organization_id
  AND sc.code = st.category::text
  AND st.category_id IS NULL;

-- 2. For any remaining NULL category_id, link to "other" category
UPDATE service_types st
SET category_id = sc.id
FROM service_categories sc
WHERE sc.organization_id = st.organization_id
  AND sc.code = 'other'
  AND st.category_id IS NULL;

-- 3. Fix the menu item permission for categories (make it visible to more roles)
UPDATE menu_items 
SET required_permission = NULL
WHERE code = 'services.categories';
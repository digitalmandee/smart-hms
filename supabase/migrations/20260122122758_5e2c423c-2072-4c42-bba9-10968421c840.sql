-- 1. Add Categories menu item under Services (parent: 4b7a4e73-46e6-474c-91e1-49d64acaceea)
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
VALUES (
  'services.categories',
  'Categories',
  'FolderTree',
  '/app/services/categories',
  '4b7a4e73-46e6-474c-91e1-49d64acaceea',
  0,
  'settings.view',
  true
);

-- 2. Deactivate duplicate Doctor Fees in Settings menu
UPDATE menu_items 
SET is_active = false 
WHERE id = '3994d8b1-9e9d-4991-ab94-e5d24663f089';
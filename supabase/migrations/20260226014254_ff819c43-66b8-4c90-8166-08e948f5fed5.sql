
-- Insert donations module into available_modules
INSERT INTO public.available_modules (code, name, description, category, icon, is_core, is_hospital_only, sort_order)
VALUES ('donations', 'Donation Management', 'Manage financial donors, donations, receipts, and recurring schedules for NGO hospitals', 'finance', 'Heart', false, false, 12);

-- Insert parent menu item for Donations
INSERT INTO public.menu_items (id, code, name, icon, path, parent_id, sort_order, required_module, is_active)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'donations', 'Donation Management', 'Heart', NULL, NULL, 55, 'donations', true);

-- Insert child menu items
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_module, is_active)
VALUES 
  ('donations-dashboard', 'Dashboard', 'LayoutDashboard', '/app/donations', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'donations', true),
  ('donations-donors', 'Donors', 'Users', '/app/donations/donors', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, 'donations', true),
  ('donations-record', 'Record Donation', 'FilePlus', '/app/donations/record', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, 'donations', true),
  ('donations-recurring', 'Recurring Schedules', 'CalendarClock', '/app/donations/recurring', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4, 'donations', true);

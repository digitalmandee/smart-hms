
-- Insert missing menu items for warehouse navigation
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_module, is_active)
VALUES
  ('hr.attendance.shiftHandover', 'Shift Handover', 'ClipboardCheck', '/app/hr/attendance/shift-handover', '53078cd3-685c-45fa-b8e5-c08fbe6d932e', 60, 'warehouse', true),
  ('hr.safetyIncidents', 'Safety Incidents', 'ShieldAlert', '/app/hr/safety-incidents', '720b3ed9-16d0-4dbf-bfec-ffe859430a37', 90, 'warehouse', true),
  ('inventory.warehouseOrders', 'Warehouse Orders', 'ShoppingCart', '/app/inventory/warehouse-orders', '8f02912c-ea19-4358-be76-16ec5765a561', 80, 'warehouse', true),
  ('inventory.dockSchedule', 'Dock Schedule', 'Anchor', '/app/inventory/dock-schedule', '8f02912c-ea19-4358-be76-16ec5765a561', 81, 'warehouse', true),
  ('inventory.gateLog', 'Gate Log', 'DoorOpen', '/app/inventory/gate-log', '8f02912c-ea19-4358-be76-16ec5765a561', 82, 'warehouse', true);

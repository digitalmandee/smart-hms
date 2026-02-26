
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
VALUES 
  ('opd.vitals', 'Vitals', 'HeartPulse', '/app/opd/vitals', '1988dc16-98fc-4cb6-9146-c05fe8abaf36', 3.5, NULL, 'opd', true),
  ('opd.pending_checkout', 'Pending Checkout', 'ClipboardCheck', '/app/opd/pending-checkout', '1988dc16-98fc-4cb6-9146-c05fe8abaf36', 7.5, NULL, 'opd', true),
  ('opd.gynecology', 'Gynecology', 'Baby', '/app/opd/gynecology', '1988dc16-98fc-4cb6-9146-c05fe8abaf36', 6, NULL, 'opd', true);

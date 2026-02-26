INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
VALUES (
  'billing.closing-history',
  'Closing History',
  'History',
  '/app/billing/daily-closing/history',
  '778ba27e-7311-458e-baf8-187197fddb49',
  21,
  'billing.view',
  'billing',
  true
);
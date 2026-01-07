-- Insert Service Types menu item under Settings
INSERT INTO menu_items (id, code, name, icon, path, parent_id, sort_order, required_permission, is_active)
VALUES (
  gen_random_uuid(),
  'settings.services',
  'Service Types',
  'FileText',
  '/app/settings/services',
  '3e939b73-9ede-4cf3-9c3b-8e13df3cf6dc',
  5,
  'settings.view',
  true
);

-- Insert Payment Methods menu item under Settings
INSERT INTO menu_items (id, code, name, icon, path, parent_id, sort_order, required_permission, is_active)
VALUES (
  gen_random_uuid(),
  'settings.payment_methods',
  'Payment Methods',
  'CreditCard',
  '/app/settings/payment-methods',
  '3e939b73-9ede-4cf3-9c3b-8e13df3cf6dc',
  6,
  'settings.view',
  true
);

-- Insert Reports menu item under Billing
INSERT INTO menu_items (id, code, name, icon, path, parent_id, sort_order, required_permission, is_active)
VALUES (
  gen_random_uuid(),
  'billing.reports',
  'Reports',
  'TrendingUp',
  '/app/billing/reports',
  '778ba27e-7311-458e-baf8-187197fddb49',
  4,
  'billing.view',
  true
);

-- Fix New Invoice path
UPDATE menu_items 
SET path = '/app/billing/invoices/new' 
WHERE code = 'billing.new';
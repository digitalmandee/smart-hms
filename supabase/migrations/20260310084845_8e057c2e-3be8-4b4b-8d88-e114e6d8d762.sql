-- Add Transfers, Promotions, Grievances, Org Chart to HR sidebar
INSERT INTO menu_items (id, code, name, icon, path, parent_id, sort_order, is_active)
VALUES 
  ('a1b2c3d4-1111-4aaa-bbbb-111111111111', 'hr_transfers', 'Transfers', 'ArrowLeftRight', '/app/hr/transfers', '720b3ed9-16d0-4dbf-bfec-ffe859430a37', 35, true),
  ('a1b2c3d4-2222-4aaa-bbbb-222222222222', 'hr_promotions', 'Promotions', 'TrendingUp', '/app/hr/promotions', '720b3ed9-16d0-4dbf-bfec-ffe859430a37', 36, true),
  ('a1b2c3d4-3333-4aaa-bbbb-333333333333', 'hr_grievances', 'Grievances', 'MessageSquare', '/app/hr/grievances', '720b3ed9-16d0-4dbf-bfec-ffe859430a37', 37, true),
  ('a1b2c3d4-4444-4aaa-bbbb-444444444444', 'hr_org_chart', 'Org Chart', 'Network', '/app/hr/org-chart', '720b3ed9-16d0-4dbf-bfec-ffe859430a37', 38, true);
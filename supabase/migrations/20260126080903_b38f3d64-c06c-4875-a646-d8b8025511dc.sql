-- Add menu items for wallet/compensation pages under HR Payroll parent
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
VALUES 
  ('hr.payroll.compensation', 'Doctor Compensation', 'Settings', '/app/hr/payroll/doctor-compensation', 
   '6497e8ca-e708-470e-ad42-e83fb7720a5a', 15, 'payroll.view', 'hr', true),
  ('hr.payroll.earnings', 'Doctor Earnings', 'TrendingUp', '/app/hr/payroll/doctor-earnings', 
   '6497e8ca-e708-470e-ad42-e83fb7720a5a', 16, 'payroll.view', 'hr', true),
  ('hr.payroll.wallets', 'Wallet Balances', 'Wallet', '/app/hr/payroll/wallet-balances', 
   '6497e8ca-e708-470e-ad42-e83fb7720a5a', 17, 'payroll.view', 'hr', true)
ON CONFLICT (code) DO UPDATE SET
  is_active = true,
  path = EXCLUDED.path;

-- Link doctors to their matching employee records
UPDATE doctors d
SET employee_id = e.id
FROM employees e
WHERE e.profile_id = d.profile_id
  AND d.employee_id IS NULL;
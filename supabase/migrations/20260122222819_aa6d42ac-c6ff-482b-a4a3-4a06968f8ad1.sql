-- Seed default leave types for organizations that don't have any
INSERT INTO leave_types (organization_id, name, code, annual_quota, is_paid, is_active, color)
SELECT 
  o.id,
  lt.name,
  lt.code,
  lt.quota,
  lt.is_paid,
  true,
  lt.color
FROM organizations o
CROSS JOIN (VALUES
  ('Annual Leave', 'AL', 14, true, '#22c55e'),
  ('Sick Leave', 'SL', 10, true, '#f97316'),
  ('Casual Leave', 'CL', 7, true, '#0ea5e9'),
  ('Maternity Leave', 'ML', 90, true, '#ec4899'),
  ('Paternity Leave', 'PL', 7, true, '#6366f1'),
  ('Unpaid Leave', 'UL', 30, false, '#64748b')
) AS lt(name, code, quota, is_paid, color)
WHERE NOT EXISTS (
  SELECT 1 FROM leave_types WHERE organization_id = o.id
);

-- Insert Exit Management parent under HR & Staff
DO $$
DECLARE
  v_exit_parent_id UUID;
BEGIN
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
  VALUES ('hr_exit_management', 'Exit Management', 'DoorOpen', NULL, '720b3ed9-16d0-4dbf-bfec-ffe859430a37', 95, 'hr.exit.view', 'hr', true)
  RETURNING id INTO v_exit_parent_id;

  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
  VALUES
    ('hr_exit_resignations', 'Resignations', 'FileText', '/app/hr/exit/resignations', v_exit_parent_id, 10, 'hr.exit.view', 'hr', true),
    ('hr_exit_clearance', 'Clearance', 'ClipboardCheck', '/app/hr/exit/clearance', v_exit_parent_id, 20, 'hr.exit.view', 'hr', true),
    ('hr_exit_settlements', 'Final Settlements', 'DollarSign', '/app/hr/exit/settlements', v_exit_parent_id, 30, 'hr.exit.view', 'hr', true),
    ('hr_exit_interviews', 'Exit Interviews', 'MessageSquare', '/app/hr/exit/interviews', v_exit_parent_id, 40, 'hr.exit.view', 'hr', true);
END $$;

-- Insert missing Attendance children
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
VALUES
  ('hr_duty_roster', 'Duty Roster', 'CalendarDays', '/app/hr/attendance/roster', '53078cd3-685c-45fa-b8e5-c08fbe6d932e', 70, 'hr.attendance.view', 'hr', true),
  ('hr_on_call', 'On-Call Schedule', 'Headphones', '/app/hr/attendance/on-call', '53078cd3-685c-45fa-b8e5-c08fbe6d932e', 80, 'hr.attendance.view', 'hr', true),
  ('hr_ot_roster', 'OT Duty Roster', 'Scissors', '/app/hr/attendance/ot-roster', '53078cd3-685c-45fa-b8e5-c08fbe6d932e', 90, 'hr.attendance.view', 'hr', true),
  ('hr_overtime', 'Overtime', 'Clock', '/app/hr/attendance/overtime', '53078cd3-685c-45fa-b8e5-c08fbe6d932e', 100, 'hr.attendance.view', 'hr', true),
  ('hr_publish_roster', 'Publish Roster', 'PlayCircle', '/app/hr/attendance/publish-roster', '53078cd3-685c-45fa-b8e5-c08fbe6d932e', 110, 'hr.attendance.view', 'hr', true),
  ('hr_roster_reports', 'Roster Reports', 'BarChart', '/app/hr/attendance/roster-reports', '53078cd3-685c-45fa-b8e5-c08fbe6d932e', 120, 'hr.attendance.view', 'hr', true);

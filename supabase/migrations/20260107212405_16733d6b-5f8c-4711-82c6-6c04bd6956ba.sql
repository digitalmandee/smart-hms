-- Add Reception child menu items
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'reception.walk_in', 'Walk-in Patient', 'UserPlus', '/app/appointments/new?type=walk-in', 
       id, 2, 'appointments.create', true FROM menu_items WHERE code = 'reception'
UNION ALL
SELECT 'reception.todays_appointments', 'Today''s Appointments', 'CalendarClock', '/app/appointments/queue',
       id, 3, 'appointments.view', true FROM menu_items WHERE code = 'reception'
UNION ALL
SELECT 'reception.schedule', 'Schedule Appointment', 'CalendarPlus', '/app/appointments/new',
       id, 4, 'appointments.create', true FROM menu_items WHERE code = 'reception'
UNION ALL
SELECT 'reception.patients', 'Patient Directory', 'Users', '/app/patients',
       id, 5, 'patients.view', true FROM menu_items WHERE code = 'reception';

-- Fix OPD menu items
-- Update existing consultations to be History
UPDATE menu_items SET path = '/app/opd/history', name = 'History', sort_order = 4 
WHERE code = 'opd.consultations';

-- Delete broken my_queue if it exists
DELETE FROM menu_items WHERE code = 'opd.my_queue';

-- Add Doctor Dashboard
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'opd.doctor_dashboard', 'Doctor Dashboard', 'Stethoscope', '/app/opd',
       id, 1, 'consultations.create', true FROM menu_items WHERE code = 'opd';

-- Add Nurse Station
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'opd.nurse_station', 'Nurse Station', 'HeartPulse', '/app/opd/nursing',
       id, 2, 'consultations.view', true FROM menu_items WHERE code = 'opd';

-- Update Patient Queue to have proper sort order
UPDATE menu_items SET sort_order = 3 WHERE code = 'opd.queue';
-- Deactivate duplicate menu paths (keep only one canonical entry per path)
-- This fixes multiple items highlighting when clicking on a menu item

-- /app/appointments/queue duplicates
UPDATE menu_items SET is_active = false WHERE code = 'opd_token_printer' AND path = '/app/appointments/queue';
UPDATE menu_items SET is_active = false WHERE code = 'reception.todays_appointments' AND path = '/app/appointments/queue';

-- /app/billing/reports duplicates
UPDATE menu_items SET is_active = false WHERE code = 'reports.billing' AND path = '/app/billing/reports';

-- /app/emergency/reports duplicates
UPDATE menu_items SET is_active = false WHERE code = 'reports.emergency' AND path = '/app/emergency/reports';

-- /app/appointments/reports duplicates
UPDATE menu_items SET is_active = false WHERE code = 'reports.appointments' AND path = '/app/appointments/reports';

-- /app/patients duplicates
UPDATE menu_items SET is_active = false WHERE code = 'reception.patients' AND path = '/app/patients';

-- /app/opd/reports duplicates
UPDATE menu_items SET is_active = false WHERE code = 'reports.doctors' AND path = '/app/opd/reports';

-- /app/ipd/wards duplicates (keep ipd.setup.wards)
UPDATE menu_items SET is_active = false WHERE code = 'ipd.beds.wards' AND path = '/app/ipd/wards';

-- /app/clinic/reports duplicates
UPDATE menu_items SET is_active = false WHERE code = 'reports.clinic' AND path = '/app/clinic/reports';

-- /app/inventory/reports duplicates
UPDATE menu_items SET is_active = false WHERE code = 'reports.inventory' AND path = '/app/inventory/reports';

-- /app/lab/reports duplicates
UPDATE menu_items SET is_active = false WHERE code = 'reports.lab' AND path = '/app/lab/reports';

-- /app/accounts/reports duplicates
UPDATE menu_items SET is_active = false WHERE code = 'reports.financial' AND path = '/app/accounts/reports';

-- /app/patients/reports duplicates
UPDATE menu_items SET is_active = false WHERE code = 'reports.patients' AND path = '/app/patients/reports';

-- /app/appointments/kiosk-setup duplicates
UPDATE menu_items SET is_active = false WHERE code = 'token_kiosk_setup' AND path = '/app/appointments/kiosk-setup';

-- /app/hr/attendance/reports duplicates
UPDATE menu_items SET is_active = false WHERE code = 'hr.attendance.reports_menu' AND path = '/app/hr/attendance/reports';

-- /app/lab/queue duplicates
UPDATE menu_items SET is_active = false WHERE code = 'lab_results' AND path = '/app/lab/queue';

-- /app/emergency/queue duplicates
UPDATE menu_items SET is_active = false WHERE code = 'er_token_queue' AND path = '/app/emergency/queue';

-- /app/ipd/beds duplicates (keep ipd.beds.map)
UPDATE menu_items SET is_active = false WHERE code = 'ipd.setup.beds' AND path = '/app/ipd/beds';
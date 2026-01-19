-- Fix Menu Order and Structure for All Modules
-- Phase 1: Update Parent Menu Sort Orders (Logical grouping)

-- Core Operations (1-20)
UPDATE menu_items SET sort_order = 1 WHERE code = 'dashboard' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 5 WHERE code = 'reception' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 10 WHERE code = 'patients' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 15 WHERE code = 'appointments' AND parent_id IS NULL;

-- Clinical Modules (20-50)
UPDATE menu_items SET sort_order = 20 WHERE code = 'opd' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 25 WHERE code = 'clinic' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 30 WHERE code = 'ipd' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 35 WHERE code = 'emergency' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 40 WHERE code = 'ot' AND parent_id IS NULL;

-- Diagnostics (45-55)
UPDATE menu_items SET sort_order = 45 WHERE code = 'laboratory' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 50 WHERE code = 'radiology' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 55 WHERE code = 'blood_bank' AND parent_id IS NULL;

-- Supply Chain (60-70)
UPDATE menu_items SET sort_order = 60 WHERE code = 'pharmacy' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 65 WHERE code = 'inventory' AND parent_id IS NULL;

-- Finance & Admin (75-90)
UPDATE menu_items SET sort_order = 75 WHERE code = 'billing' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 80 WHERE code = 'accounts' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 85 WHERE code = 'hr' AND parent_id IS NULL;
UPDATE menu_items SET sort_order = 90 WHERE code = 'reports' AND parent_id IS NULL;

-- Settings ALWAYS LAST for regular admins
UPDATE menu_items SET sort_order = 100 WHERE code = 'settings' AND parent_id IS NULL;

-- Super Admin (Platform level - only visible to super admins)
UPDATE menu_items SET sort_order = 101 WHERE code = 'super_admin' AND parent_id IS NULL;

-- Phase 2: Deactivate Duplicate Menu Entries
-- Keep the primary entry, deactivate duplicates

-- IPD duplicates - keep ipd.* prefixed ones
UPDATE menu_items SET is_active = false WHERE code = 'ipd_reports' AND path = '/app/ipd/reports';
UPDATE menu_items SET is_active = false WHERE code = 'ipd_charges' AND path = '/app/ipd/charges';
UPDATE menu_items SET is_active = false WHERE code = 'ipd_wards' AND path = '/app/ipd/wards';
UPDATE menu_items SET is_active = false WHERE code = 'ipd_beds' AND path = '/app/ipd/beds';
UPDATE menu_items SET is_active = false WHERE code = 'ipd_admissions' AND path = '/app/ipd/admissions';
UPDATE menu_items SET is_active = false WHERE code = 'ipd_discharges' AND path = '/app/ipd/discharges';

-- Pharmacy duplicates - keep pharmacy.* prefixed ones
UPDATE menu_items SET is_active = false WHERE code = 'pharmacy-stock-movements';
UPDATE menu_items SET is_active = false WHERE code = 'pharmacy-alerts';
UPDATE menu_items SET is_active = false WHERE code = 'pharmacy-expiry-tracking';

-- Reports duplicates - keep module.reports pattern
UPDATE menu_items SET is_active = false WHERE code = 'reports.ipd';
UPDATE menu_items SET is_active = false WHERE code = 'reports.opd';
UPDATE menu_items SET is_active = false WHERE code = 'reports.pharmacy';
UPDATE menu_items SET is_active = false WHERE code = 'reports.laboratory';
UPDATE menu_items SET is_active = false WHERE code = 'reports.radiology';

-- Phase 3: Fix Submenu Sort Orders Within Each Module

-- Dashboard submenus (if any)
UPDATE menu_items SET sort_order = 1 WHERE code = 'dashboard.overview';

-- Reception submenus
UPDATE menu_items SET sort_order = 1 WHERE code = 'reception.dashboard';
UPDATE menu_items SET sort_order = 2 WHERE code = 'reception.check_in';
UPDATE menu_items SET sort_order = 3 WHERE code = 'reception.todays_appointments';
UPDATE menu_items SET sort_order = 4 WHERE code = 'reception.walk_in';
UPDATE menu_items SET sort_order = 5 WHERE code = 'reception.token_display';

-- Patients submenus
UPDATE menu_items SET sort_order = 1 WHERE code = 'patients.list';
UPDATE menu_items SET sort_order = 2 WHERE code = 'patients.register';
UPDATE menu_items SET sort_order = 3 WHERE code = 'patients.search';

-- Appointments submenus
UPDATE menu_items SET sort_order = 1 WHERE code = 'appointments.calendar';
UPDATE menu_items SET sort_order = 2 WHERE code = 'appointments.list';
UPDATE menu_items SET sort_order = 3 WHERE code = 'appointments.queue';
UPDATE menu_items SET sort_order = 4 WHERE code = 'appointments.schedules';
UPDATE menu_items SET sort_order = 5 WHERE code = 'appointments.schedule';
UPDATE menu_items SET sort_order = 10 WHERE code = 'appointments.reports';

-- OPD submenus (clinical flow order)
UPDATE menu_items SET sort_order = 1 WHERE code = 'opd.dashboard';
UPDATE menu_items SET sort_order = 2 WHERE code = 'opd.doctor_dashboard';
UPDATE menu_items SET sort_order = 3 WHERE code = 'opd.nurse_station';
UPDATE menu_items SET sort_order = 4 WHERE code = 'opd.consultations';
UPDATE menu_items SET sort_order = 5 WHERE code = 'opd.token_queue';
UPDATE menu_items SET sort_order = 6 WHERE code = 'opd.history';
UPDATE menu_items SET sort_order = 10 WHERE code = 'opd.reports';

-- IPD submenus (admission → care → discharge flow)
UPDATE menu_items SET sort_order = 1 WHERE code = 'ipd.dashboard';
UPDATE menu_items SET sort_order = 2 WHERE code = 'ipd.nurse_dashboard';
UPDATE menu_items SET sort_order = 10 WHERE code = 'ipd.admissions';
UPDATE menu_items SET sort_order = 11 WHERE code = 'ipd.active_patients';
UPDATE menu_items SET sort_order = 20 WHERE code = 'ipd.wards';
UPDATE menu_items SET sort_order = 21 WHERE code = 'ipd.beds';
UPDATE menu_items SET sort_order = 22 WHERE code = 'ipd.bed_management';
UPDATE menu_items SET sort_order = 30 WHERE code = 'ipd.rounds';
UPDATE menu_items SET sort_order = 31 WHERE code = 'ipd.nursing_notes';
UPDATE menu_items SET sort_order = 32 WHERE code = 'ipd.vitals';
UPDATE menu_items SET sort_order = 33 WHERE code = 'ipd.medications';
UPDATE menu_items SET sort_order = 40 WHERE code = 'ipd.discharges';
UPDATE menu_items SET sort_order = 41 WHERE code = 'ipd.discharge_summary';
UPDATE menu_items SET sort_order = 50 WHERE code = 'ipd.charges';
UPDATE menu_items SET sort_order = 51 WHERE code = 'ipd.billing';
UPDATE menu_items SET sort_order = 60 WHERE code = 'ipd.reports';

-- Emergency submenus
UPDATE menu_items SET sort_order = 1 WHERE code = 'emergency.dashboard';
UPDATE menu_items SET sort_order = 2 WHERE code = 'emergency.triage';
UPDATE menu_items SET sort_order = 3 WHERE code = 'emergency.active_cases';
UPDATE menu_items SET sort_order = 4 WHERE code = 'emergency.ambulance';
UPDATE menu_items SET sort_order = 10 WHERE code = 'emergency.reports';

-- Operation Theatre submenus
UPDATE menu_items SET sort_order = 1 WHERE code = 'ot.dashboard';
UPDATE menu_items SET sort_order = 2 WHERE code = 'ot.schedule';
UPDATE menu_items SET sort_order = 3 WHERE code = 'ot.surgeries';
UPDATE menu_items SET sort_order = 4 WHERE code = 'ot.rooms';
UPDATE menu_items SET sort_order = 5 WHERE code = 'ot.anesthesia';
UPDATE menu_items SET sort_order = 10 WHERE code = 'ot.reports';

-- Laboratory submenus
UPDATE menu_items SET sort_order = 1 WHERE code = 'laboratory.dashboard';
UPDATE menu_items SET sort_order = 2 WHERE code = 'laboratory.orders';
UPDATE menu_items SET sort_order = 3 WHERE code = 'laboratory.samples';
UPDATE menu_items SET sort_order = 4 WHERE code = 'laboratory.results';
UPDATE menu_items SET sort_order = 5 WHERE code = 'laboratory.tests';
UPDATE menu_items SET sort_order = 6 WHERE code = 'laboratory.packages';
UPDATE menu_items SET sort_order = 10 WHERE code = 'laboratory.reports';

-- Radiology submenus
UPDATE menu_items SET sort_order = 1 WHERE code = 'radiology.dashboard';
UPDATE menu_items SET sort_order = 2 WHERE code = 'radiology.orders';
UPDATE menu_items SET sort_order = 3 WHERE code = 'radiology.worklist';
UPDATE menu_items SET sort_order = 4 WHERE code = 'radiology.results';
UPDATE menu_items SET sort_order = 5 WHERE code = 'radiology.modalities';
UPDATE menu_items SET sort_order = 10 WHERE code = 'radiology.reports';

-- Pharmacy submenus
UPDATE menu_items SET sort_order = 1 WHERE code = 'pharmacy.dashboard';
UPDATE menu_items SET sort_order = 2 WHERE code = 'pharmacy.pos';
UPDATE menu_items SET sort_order = 3 WHERE code = 'pharmacy.prescriptions';
UPDATE menu_items SET sort_order = 4 WHERE code = 'pharmacy.dispensing';
UPDATE menu_items SET sort_order = 10 WHERE code = 'pharmacy.inventory';
UPDATE menu_items SET sort_order = 11 WHERE code = 'pharmacy.stock';
UPDATE menu_items SET sort_order = 12 WHERE code = 'pharmacy.stock_movements';
UPDATE menu_items SET sort_order = 13 WHERE code = 'pharmacy.purchase_orders';
UPDATE menu_items SET sort_order = 14 WHERE code = 'pharmacy.grn';
UPDATE menu_items SET sort_order = 20 WHERE code = 'pharmacy.medicines';
UPDATE menu_items SET sort_order = 21 WHERE code = 'pharmacy.suppliers';
UPDATE menu_items SET sort_order = 30 WHERE code = 'pharmacy.alerts';
UPDATE menu_items SET sort_order = 31 WHERE code = 'pharmacy.expiry';
UPDATE menu_items SET sort_order = 40 WHERE code = 'pharmacy.reports';

-- Billing submenus
UPDATE menu_items SET sort_order = 1 WHERE code = 'billing.dashboard';
UPDATE menu_items SET sort_order = 2 WHERE code = 'billing.invoices';
UPDATE menu_items SET sort_order = 3 WHERE code = 'billing.payments';
UPDATE menu_items SET sort_order = 4 WHERE code = 'billing.receipts';
UPDATE menu_items SET sort_order = 10 WHERE code = 'billing.insurance';
UPDATE menu_items SET sort_order = 11 WHERE code = 'billing.claims';
UPDATE menu_items SET sort_order = 20 WHERE code = 'billing.price_list';
UPDATE menu_items SET sort_order = 21 WHERE code = 'billing.packages';
UPDATE menu_items SET sort_order = 30 WHERE code = 'billing.reports';

-- Accounts submenus
UPDATE menu_items SET sort_order = 1 WHERE code = 'accounts.dashboard';
UPDATE menu_items SET sort_order = 2 WHERE code = 'accounts.chart_of_accounts';
UPDATE menu_items SET sort_order = 3 WHERE code = 'accounts.journal';
UPDATE menu_items SET sort_order = 4 WHERE code = 'accounts.ledger';
UPDATE menu_items SET sort_order = 10 WHERE code = 'accounts.receivables';
UPDATE menu_items SET sort_order = 11 WHERE code = 'accounts.payables';
UPDATE menu_items SET sort_order = 20 WHERE code = 'accounts.bank';
UPDATE menu_items SET sort_order = 21 WHERE code = 'accounts.reconciliation';
UPDATE menu_items SET sort_order = 30 WHERE code = 'accounts.trial_balance';
UPDATE menu_items SET sort_order = 31 WHERE code = 'accounts.balance_sheet';
UPDATE menu_items SET sort_order = 32 WHERE code = 'accounts.income_statement';
UPDATE menu_items SET sort_order = 33 WHERE code = 'accounts.cash_flow';
UPDATE menu_items SET sort_order = 40 WHERE code = 'accounts.reports';

-- HR submenus
UPDATE menu_items SET sort_order = 1 WHERE code = 'hr.dashboard';
UPDATE menu_items SET sort_order = 2 WHERE code = 'hr.employees';
UPDATE menu_items SET sort_order = 3 WHERE code = 'hr.departments';
UPDATE menu_items SET sort_order = 10 WHERE code = 'hr.attendance';
UPDATE menu_items SET sort_order = 11 WHERE code = 'hr.leaves';
UPDATE menu_items SET sort_order = 12 WHERE code = 'hr.shifts';
UPDATE menu_items SET sort_order = 20 WHERE code = 'hr.payroll';
UPDATE menu_items SET sort_order = 21 WHERE code = 'hr.salary';
UPDATE menu_items SET sort_order = 30 WHERE code = 'hr.reports';

-- Settings submenus (grouped logically)
UPDATE menu_items SET sort_order = 1 WHERE code = 'settings.general';
UPDATE menu_items SET sort_order = 2 WHERE code = 'settings.organization';
UPDATE menu_items SET sort_order = 3 WHERE code = 'settings.branches';
UPDATE menu_items SET sort_order = 10 WHERE code = 'settings.users';
UPDATE menu_items SET sort_order = 11 WHERE code = 'settings.roles';
UPDATE menu_items SET sort_order = 12 WHERE code = 'settings.permissions';
UPDATE menu_items SET sort_order = 20 WHERE code = 'settings.doctors';
UPDATE menu_items SET sort_order = 21 WHERE code = 'settings.departments';
UPDATE menu_items SET sort_order = 22 WHERE code = 'settings.specializations';
UPDATE menu_items SET sort_order = 30 WHERE code = 'settings.services';
UPDATE menu_items SET sort_order = 31 WHERE code = 'settings.price_list';
UPDATE menu_items SET sort_order = 40 WHERE code = 'settings.kiosks';
UPDATE menu_items SET sort_order = 41 WHERE code = 'settings.queue_displays';
UPDATE menu_items SET sort_order = 50 WHERE code = 'settings.integrations';
UPDATE menu_items SET sort_order = 51 WHERE code = 'settings.notifications';
UPDATE menu_items SET sort_order = 60 WHERE code = 'settings.audit_logs';

-- Super Admin submenus
UPDATE menu_items SET sort_order = 1 WHERE code = 'super_admin.dashboard';
UPDATE menu_items SET sort_order = 2 WHERE code = 'super_admin.organizations';
UPDATE menu_items SET sort_order = 3 WHERE code = 'super_admin.branches';
UPDATE menu_items SET sort_order = 4 WHERE code = 'super_admin.users';
UPDATE menu_items SET sort_order = 5 WHERE code = 'super_admin.modules';
UPDATE menu_items SET sort_order = 10 WHERE code = 'super_admin.settings';
UPDATE menu_items SET sort_order = 11 WHERE code = 'super_admin.logs';
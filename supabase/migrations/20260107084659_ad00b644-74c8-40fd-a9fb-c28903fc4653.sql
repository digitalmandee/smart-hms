-- ================================================
-- SMART HMS DATABASE SEEDING
-- Permissions, Menu Items, and System Settings
-- ================================================

-- ================================================
-- 1. SEED PERMISSIONS (50+ permissions across modules)
-- ================================================

INSERT INTO public.permissions (code, name, module, description) VALUES
-- Dashboard
('dashboard.view', 'View Dashboard', 'dashboard', 'Access to view the main dashboard'),

-- Patients Module
('patients.view', 'View Patients', 'patients', 'View patient list and details'),
('patients.create', 'Create Patients', 'patients', 'Register new patients'),
('patients.edit', 'Edit Patients', 'patients', 'Edit patient information'),
('patients.delete', 'Delete Patients', 'patients', 'Delete patient records'),
('patients.medical_history', 'Manage Medical History', 'patients', 'View and edit patient medical history'),

-- Appointments Module
('appointments.view', 'View Appointments', 'appointments', 'View appointment list'),
('appointments.create', 'Create Appointments', 'appointments', 'Schedule new appointments'),
('appointments.edit', 'Edit Appointments', 'appointments', 'Modify appointment details'),
('appointments.cancel', 'Cancel Appointments', 'appointments', 'Cancel scheduled appointments'),
('appointments.queue', 'Manage Queue', 'appointments', 'Manage today''s patient queue'),

-- Consultations Module
('consultations.view', 'View Consultations', 'consultations', 'View consultation records'),
('consultations.create', 'Create Consultations', 'consultations', 'Start new consultations'),
('consultations.edit', 'Edit Consultations', 'consultations', 'Edit consultation details'),

-- Prescriptions Module
('prescriptions.view', 'View Prescriptions', 'prescriptions', 'View prescription records'),
('prescriptions.create', 'Create Prescriptions', 'prescriptions', 'Create new prescriptions'),

-- Pharmacy Module
('pharmacy.view', 'View Pharmacy', 'pharmacy', 'Access pharmacy module'),
('pharmacy.inventory', 'Manage Inventory', 'pharmacy', 'Manage medicine inventory'),
('pharmacy.dispense', 'Dispense Medicines', 'pharmacy', 'Dispense medicines to patients'),
('pharmacy.reports', 'Pharmacy Reports', 'pharmacy', 'View pharmacy reports'),
('pharmacy.categories', 'Manage Categories', 'pharmacy', 'Manage medicine categories'),

-- Billing Module
('billing.view', 'View Billing', 'billing', 'View invoices and billing'),
('billing.create', 'Create Invoices', 'billing', 'Create new invoices'),
('billing.edit', 'Edit Invoices', 'billing', 'Edit invoice details'),
('billing.delete', 'Delete Invoices', 'billing', 'Delete invoices'),
('billing.payments', 'Record Payments', 'billing', 'Record and manage payments'),
('billing.reports', 'Billing Reports', 'billing', 'View billing reports'),
('billing.discounts', 'Apply Discounts', 'billing', 'Apply discounts to invoices'),

-- Reports Module
('reports.view', 'View Reports', 'reports', 'Access reports module'),
('reports.export', 'Export Reports', 'reports', 'Export reports to file'),
('reports.financial', 'Financial Reports', 'reports', 'Access financial reports'),
('reports.patients', 'Patient Reports', 'reports', 'Access patient statistics'),
('reports.appointments', 'Appointment Reports', 'reports', 'Access appointment analytics'),

-- Settings Module
('settings.view', 'View Settings', 'settings', 'Access settings module'),
('settings.edit', 'Edit Settings', 'settings', 'Modify settings'),
('settings.users', 'Manage Users', 'settings', 'Manage user accounts'),
('settings.roles', 'Manage Roles', 'settings', 'Configure role permissions'),
('settings.organization', 'Organization Settings', 'settings', 'Manage organization settings'),
('settings.branches', 'Manage Branches', 'settings', 'Manage branch locations'),
('settings.services', 'Manage Services', 'settings', 'Configure service types'),
('settings.payment_methods', 'Payment Methods', 'settings', 'Configure payment methods'),
('settings.custom_fields', 'Custom Fields', 'settings', 'Configure custom fields'),
('settings.notifications', 'Notification Settings', 'settings', 'Configure notifications'),

-- Super Admin Module
('super_admin.organizations', 'Manage Organizations', 'super_admin', 'Manage all organizations'),
('super_admin.system_settings', 'System Settings', 'super_admin', 'Configure platform settings'),
('super_admin.users', 'All Users', 'super_admin', 'View all platform users'),
('super_admin.audit', 'Audit Logs', 'super_admin', 'View platform audit logs'),
('super_admin.analytics', 'Platform Analytics', 'super_admin', 'View platform-wide analytics');

-- ================================================
-- 2. SEED DEFAULT ROLE PERMISSIONS
-- ================================================

-- Super Admin gets ALL permissions (organization_id = NULL means default/global)
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'super_admin'::app_role, id, true, NULL
FROM public.permissions;

-- Org Admin gets all except super_admin permissions
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'org_admin'::app_role, id, true, NULL
FROM public.permissions
WHERE module != 'super_admin';

-- Branch Admin
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'branch_admin'::app_role, id, true, NULL
FROM public.permissions
WHERE module IN ('dashboard', 'patients', 'appointments', 'consultations', 'prescriptions', 'pharmacy', 'billing', 'reports')
   OR code IN ('settings.view', 'settings.users', 'settings.services');

-- Doctor
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'doctor'::app_role, id, true, NULL
FROM public.permissions
WHERE code IN (
  'dashboard.view',
  'patients.view', 'patients.medical_history',
  'appointments.view', 'appointments.queue',
  'consultations.view', 'consultations.create', 'consultations.edit',
  'prescriptions.view', 'prescriptions.create',
  'reports.view', 'reports.patients'
);

-- Nurse
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'nurse'::app_role, id, true, NULL
FROM public.permissions
WHERE code IN (
  'dashboard.view',
  'patients.view', 'patients.edit', 'patients.medical_history',
  'appointments.view', 'appointments.queue',
  'consultations.view',
  'prescriptions.view'
);

-- Receptionist
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'receptionist'::app_role, id, true, NULL
FROM public.permissions
WHERE code IN (
  'dashboard.view',
  'patients.view', 'patients.create', 'patients.edit',
  'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.cancel', 'appointments.queue',
  'billing.view', 'billing.create', 'billing.payments'
);

-- Pharmacist
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'pharmacist'::app_role, id, true, NULL
FROM public.permissions
WHERE code IN (
  'dashboard.view',
  'patients.view',
  'prescriptions.view',
  'pharmacy.view', 'pharmacy.inventory', 'pharmacy.dispense', 'pharmacy.reports', 'pharmacy.categories',
  'billing.view', 'billing.create', 'billing.payments'
);

-- Lab Technician
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'lab_technician'::app_role, id, true, NULL
FROM public.permissions
WHERE code IN (
  'dashboard.view',
  'patients.view',
  'appointments.view'
);

-- Accountant
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'accountant'::app_role, id, true, NULL
FROM public.permissions
WHERE code IN (
  'dashboard.view',
  'billing.view', 'billing.create', 'billing.edit', 'billing.payments', 'billing.reports', 'billing.discounts',
  'reports.view', 'reports.export', 'reports.financial'
);

-- ================================================
-- 3. SEED MENU ITEMS (Dynamic Navigation)
-- ================================================

-- Main Navigation Items (Parent Items)
INSERT INTO public.menu_items (code, name, icon, path, sort_order, required_permission, is_active) VALUES
('dashboard', 'Dashboard', 'LayoutDashboard', '/app/dashboard', 1, 'dashboard.view', true),
('patients', 'Patients', 'Users', NULL, 2, 'patients.view', true),
('appointments', 'Appointments', 'Calendar', NULL, 3, 'appointments.view', true),
('opd', 'OPD', 'Stethoscope', NULL, 4, 'consultations.view', true),
('pharmacy', 'Pharmacy', 'Pill', NULL, 5, 'pharmacy.view', true),
('billing', 'Billing', 'Receipt', NULL, 6, 'billing.view', true),
('reports', 'Reports', 'BarChart3', NULL, 7, 'reports.view', true),
('settings', 'Settings', 'Settings', NULL, 8, 'settings.view', true);

-- Patients Sub-menu
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'patients.list', 'All Patients', 'Users', '/app/patients', id, 1, 'patients.view', true
FROM public.menu_items WHERE code = 'patients';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'patients.new', 'Register New', 'UserPlus', '/app/patients/new', id, 2, 'patients.create', true
FROM public.menu_items WHERE code = 'patients';

-- Appointments Sub-menu
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'appointments.list', 'All Appointments', 'Calendar', '/app/appointments', id, 1, 'appointments.view', true
FROM public.menu_items WHERE code = 'appointments';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'appointments.queue', 'Today''s Queue', 'Users', '/app/appointments/queue', id, 2, 'appointments.queue', true
FROM public.menu_items WHERE code = 'appointments';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'appointments.schedule', 'Schedule', 'CalendarDays', '/app/appointments/schedule', id, 3, 'appointments.create', true
FROM public.menu_items WHERE code = 'appointments';

-- OPD Sub-menu
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'opd.consultations', 'Consultations', 'ClipboardList', '/app/opd/consultations', id, 1, 'consultations.view', true
FROM public.menu_items WHERE code = 'opd';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'opd.my_queue', 'My Queue', 'ListOrdered', '/app/opd/my-queue', id, 2, 'consultations.create', true
FROM public.menu_items WHERE code = 'opd';

-- Pharmacy Sub-menu
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'pharmacy.dispense', 'Dispense', 'Pill', '/app/pharmacy/dispense', id, 1, 'pharmacy.dispense', true
FROM public.menu_items WHERE code = 'pharmacy';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'pharmacy.inventory', 'Inventory', 'Package', '/app/pharmacy/inventory', id, 2, 'pharmacy.inventory', true
FROM public.menu_items WHERE code = 'pharmacy';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'pharmacy.alerts', 'Stock Alerts', 'AlertTriangle', '/app/pharmacy/alerts', id, 3, 'pharmacy.inventory', true
FROM public.menu_items WHERE code = 'pharmacy';

-- Billing Sub-menu
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'billing.invoices', 'Invoices', 'FileText', '/app/billing', id, 1, 'billing.view', true
FROM public.menu_items WHERE code = 'billing';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'billing.new', 'New Invoice', 'FilePlus', '/app/billing/new', id, 2, 'billing.create', true
FROM public.menu_items WHERE code = 'billing';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'billing.payments', 'Payments', 'CreditCard', '/app/billing/payments', id, 3, 'billing.payments', true
FROM public.menu_items WHERE code = 'billing';

-- Reports Sub-menu
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'reports.overview', 'Overview', 'BarChart3', '/app/reports', id, 1, 'reports.view', true
FROM public.menu_items WHERE code = 'reports';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'reports.financial', 'Financial', 'DollarSign', '/app/reports/financial', id, 2, 'reports.financial', true
FROM public.menu_items WHERE code = 'reports';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'reports.patients', 'Patient Stats', 'Activity', '/app/reports/patients', id, 3, 'reports.patients', true
FROM public.menu_items WHERE code = 'reports';

-- Settings Sub-menu
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'settings.general', 'General', 'Settings', '/app/settings/general', id, 1, 'settings.view', true
FROM public.menu_items WHERE code = 'settings';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'settings.users', 'Users & Roles', 'UserCog', '/app/settings/users', id, 2, 'settings.users', true
FROM public.menu_items WHERE code = 'settings';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'settings.branches', 'Branches', 'Building2', '/app/settings/branches', id, 3, 'settings.branches', true
FROM public.menu_items WHERE code = 'settings';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'settings.customize', 'Customize', 'Palette', '/app/settings/customize', id, 4, 'settings.custom_fields', true
FROM public.menu_items WHERE code = 'settings';

-- Super Admin Navigation (Separate Section)
INSERT INTO public.menu_items (code, name, icon, path, sort_order, required_permission, required_module, is_active) VALUES
('super_admin', 'Super Admin', 'Shield', NULL, 100, 'super_admin.organizations', 'super_admin', true);

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'super_admin.orgs', 'Organizations', 'Building', '/super-admin/organizations', id, 1, 'super_admin.organizations', true
FROM public.menu_items WHERE code = 'super_admin';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'super_admin.settings', 'System Settings', 'Cog', '/super-admin/settings', id, 2, 'super_admin.system_settings', true
FROM public.menu_items WHERE code = 'super_admin';

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'super_admin.analytics', 'Platform Stats', 'TrendingUp', '/super-admin/analytics', id, 3, 'super_admin.analytics', true
FROM public.menu_items WHERE code = 'super_admin';

-- ================================================
-- 4. SEED SYSTEM SETTINGS
-- ================================================

INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, is_editable) VALUES
('platform_name', 'Smart HMS', 'string', 'Platform display name', true),
('platform_logo_url', NULL, 'string', 'Platform logo URL', true),
('support_email', 'support@smarthms.com', 'string', 'Support email address', true),
('support_phone', NULL, 'string', 'Support phone number', true),
('default_currency', 'PKR', 'string', 'Default currency code', true),
('default_date_format', 'DD/MM/YYYY', 'string', 'Default date format', true),
('default_time_format', '12h', 'string', 'Time format (12h or 24h)', true),
('trial_duration_days', '14', 'number', 'Trial period duration in days', true),
('max_branches_basic', '1', 'number', 'Maximum branches for basic plan', false),
('max_branches_professional', '5', 'number', 'Maximum branches for professional plan', false),
('max_branches_enterprise', 'unlimited', 'string', 'Maximum branches for enterprise plan', false),
('maintenance_mode', 'false', 'boolean', 'Enable platform maintenance mode', true),
('allow_registration', 'true', 'boolean', 'Allow new organization registration', true),
('require_email_verification', 'true', 'boolean', 'Require email verification for new users', true),
('session_timeout_minutes', '60', 'number', 'Session timeout in minutes', true),
('password_min_length', '8', 'number', 'Minimum password length', true),
('enable_two_factor', 'false', 'boolean', 'Enable two-factor authentication option', true);
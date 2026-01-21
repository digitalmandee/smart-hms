// Role-based sidebar configurations
// Each role has a dedicated sidebar with only the menu items they need

export interface SidebarMenuItem {
  name: string;
  path: string;
  icon: string;
  children?: SidebarMenuItem[];
}

export interface SidebarConfig {
  items: SidebarMenuItem[];
}

// Admin roles get full dynamic menu access (handled separately)
// Note: super_admin and org_admin use static sidebar, not database-driven menus
export const ADMIN_ROLES = ['branch_admin'];

export const ROLE_SIDEBAR_CONFIG: Record<string, SidebarConfig> = {
  // ==================== SUPER ADMIN (Platform Level) ====================
  
  super_admin: {
    items: [
      { name: "Dashboard", path: "/super-admin/dashboard", icon: "LayoutDashboard" },
      { 
        name: "Organizations", 
        path: "", 
        icon: "Building2",
        children: [
          { name: "All Organizations", path: "/super-admin/organizations", icon: "List" },
          { name: "Add Organization", path: "/super-admin/organizations/new", icon: "Plus" },
        ]
      },
      { 
        name: "Branches", 
        path: "", 
        icon: "GitBranch",
        children: [
          { name: "All Branches", path: "/super-admin/branches", icon: "List" },
          { name: "Branch Analytics", path: "/super-admin/branches/analytics", icon: "BarChart3" },
        ]
      },
      { 
        name: "Platform Users", 
        path: "", 
        icon: "Users",
        children: [
          { name: "All Users", path: "/super-admin/users", icon: "Users" },
          { name: "Role Management", path: "/super-admin/roles", icon: "Shield" },
        ]
      },
      { 
        name: "Billing & Plans", 
        path: "", 
        icon: "CreditCard",
        children: [
          { name: "Subscription Plans", path: "/super-admin/plans", icon: "DollarSign" },
          { name: "Organization Billing", path: "/super-admin/billing", icon: "Receipt" },
        ]
      },
      { 
        name: "System", 
        path: "", 
        icon: "Settings",
        children: [
          { name: "Platform Settings", path: "/super-admin/settings", icon: "Cog" },
          { name: "Module Catalog", path: "/super-admin/modules", icon: "Puzzle" },
          { name: "Audit Logs", path: "/super-admin/audit-logs", icon: "ScrollText" },
          { name: "System Health", path: "/super-admin/health", icon: "Activity" },
        ]
      },
      { 
        name: "Support", 
        path: "", 
        icon: "Headphones",
        children: [
          { name: "Support Tickets", path: "/super-admin/support", icon: "Ticket" },
        ]
      },
    ]
  },

  // ==================== ORGANIZATION ADMIN (Organization Level) ====================
  
  org_admin: {
    items: [
      { name: "Dashboard", path: "/app/dashboard", icon: "LayoutDashboard" },
      { 
        name: "Branches", 
        path: "", 
        icon: "GitBranch",
        children: [
          { name: "All Branches", path: "/app/settings/branches", icon: "List" },
          { name: "Add Branch", path: "/app/settings/branches/new", icon: "Plus" },
          { name: "Branch Branding", path: "/app/settings/branch-branding", icon: "Palette" },
          { name: "Branch Roles", path: "/app/settings/branch-roles", icon: "Shield" },
        ]
      },
      { 
        name: "Users & Staff", 
        path: "", 
        icon: "Users",
        children: [
          { name: "All Users", path: "/app/settings/users", icon: "Users" },
          { name: "Roles & Permissions", path: "/app/settings/roles", icon: "Shield" },
          { name: "Invite Users", path: "/app/settings/users/invite", icon: "UserPlus" },
        ]
      },
      { 
        name: "Organization", 
        path: "", 
        icon: "Building2",
        children: [
          { name: "Profile", path: "/app/settings/organization", icon: "Building2" },
          { name: "Branding & Logo", path: "/app/settings/organization/branding", icon: "Palette" },
          { name: "Modules", path: "/app/settings/modules", icon: "Puzzle" },
          { name: "Billing", path: "/app/settings/billing", icon: "CreditCard" },
          { name: "Audit Logs", path: "/app/settings/audit-logs", icon: "ScrollText" },
        ]
      },
      { 
        name: "Configuration", 
        path: "", 
        icon: "Settings",
        children: [
          { name: "Services", path: "/app/settings/services", icon: "Stethoscope" },
          { name: "Payment Methods", path: "/app/settings/payment-methods", icon: "CreditCard" },
          { name: "Specializations", path: "/app/settings/specializations", icon: "Award" },
          { name: "Qualifications", path: "/app/settings/qualifications", icon: "GraduationCap" },
          { name: "Tax Settings", path: "/app/settings/tax", icon: "Percent" },
          { name: "Receipt Templates", path: "/app/settings/receipts", icon: "FileText" },
        ]
      },
      { 
        name: "Reports", 
        path: "", 
        icon: "BarChart3",
        children: [
          { name: "Organization Reports", path: "/app/reports/organization", icon: "PieChart" },
          { name: "Branch Comparison", path: "/app/reports/branches", icon: "BarChart3" },
        ]
      },
    ]
  },

  // ==================== CLINICAL ROLES ====================
  
  doctor: {
    items: [
      { name: "Dashboard", path: "/app/opd", icon: "LayoutDashboard" },
      { 
        name: "Appointments", 
        path: "", 
        icon: "Calendar",
        children: [
          { name: "Today's Queue", path: "/app/appointments/queue", icon: "ListOrdered" },
          { name: "My Schedule", path: "/app/appointments/calendar", icon: "CalendarDays" },
          { name: "All Appointments", path: "/app/appointments", icon: "Calendar" },
        ]
      },
      { 
        name: "Consultations", 
        path: "", 
        icon: "Stethoscope",
        children: [
          { name: "History", path: "/app/opd/history", icon: "FileText" },
          { name: "Reports", path: "/app/reports", icon: "BarChart3" },
        ]
      },
      { 
        name: "Patients", 
        path: "", 
        icon: "Users",
        children: [
          { name: "Search", path: "/app/patients", icon: "Search" },
        ]
      },
      { 
        name: "IPD", 
        path: "", 
        icon: "Bed",
        children: [
          { name: "My Patients", path: "/app/ipd/rounds", icon: "ClipboardList" },
          { name: "Discharges", path: "/app/ipd/discharges", icon: "FileText" },
        ]
      },
    ]
  },

  nurse: {
    items: [
      { name: "Dashboard", path: "/app/opd/nursing", icon: "LayoutDashboard" },
      { name: "Patient Queue", path: "/app/appointments/queue", icon: "ListOrdered" },
      { 
        name: "Triage", 
        path: "", 
        icon: "Activity",
        children: [
          { name: "Vitals Entry", path: "/app/opd/vitals", icon: "HeartPulse" },
          { name: "ER Triage", path: "/app/emergency/triage", icon: "Gauge" },
        ]
      },
      { name: "Patients", path: "/app/patients", icon: "Users" },
    ]
  },

  ipd_nurse: {
    items: [
      { name: "Dashboard", path: "/app/ipd/nursing", icon: "LayoutDashboard" },
      { 
        name: "Patient Care", 
        path: "", 
        icon: "HeartPulse",
        children: [
          { name: "Ward Rounds", path: "/app/ipd/rounds", icon: "ClipboardList" },
          { name: "Vitals", path: "/app/ipd/vitals", icon: "Activity" },
          { name: "Nursing Notes", path: "/app/ipd/nursing-notes", icon: "FileText" },
          { name: "Medication Chart", path: "/app/ipd/medication-chart", icon: "Pill" },
        ]
      },
      { 
        name: "Ward Management", 
        path: "", 
        icon: "Building",
        children: [
          { name: "Wards", path: "/app/ipd/wards", icon: "Building" },
          { name: "Beds", path: "/app/ipd/beds", icon: "BedDouble" },
          { name: "Housekeeping", path: "/app/ipd/housekeeping", icon: "ClipboardList" },
        ]
      },
      { name: "Patients", path: "/app/patients", icon: "Users" },
    ]
  },

  // ==================== RECEPTION / FRONT DESK ====================
  
  receptionist: {
    items: [
      { name: "Dashboard", path: "/app/reception", icon: "LayoutDashboard" },
      { 
        name: "Appointments", 
        path: "", 
        icon: "Calendar",
        children: [
          { name: "Book Appointment", path: "/app/appointments/new", icon: "CalendarPlus" },
          { name: "Today's Schedule", path: "/app/appointments/calendar", icon: "CalendarDays" },
          { name: "Queue", path: "/app/appointments/queue", icon: "ListOrdered" },
        ]
      },
      { 
        name: "Patients", 
        path: "", 
        icon: "Users",
        children: [
          { name: "All Patients", path: "/app/patients", icon: "Users" },
          { name: "Register Patient", path: "/app/patients/new", icon: "UserPlus" },
        ]
      },
      { 
        name: "Beds & Rooms", 
        path: "", 
        icon: "BedDouble",
        children: [
          { name: "Bed Availability", path: "/app/ipd/beds", icon: "BedDouble" },
          { name: "Ward View", path: "/app/ipd/wards", icon: "Building" },
          { name: "New Admission", path: "/app/ipd/admissions/new", icon: "UserPlus" },
          { name: "Active Admissions", path: "/app/ipd/admissions", icon: "ClipboardList" },
        ]
      },
      { 
        name: "Billing", 
        path: "", 
        icon: "Receipt",
        children: [
          { name: "New Invoice", path: "/app/billing/invoices/new", icon: "FilePlus" },
          { name: "Invoices", path: "/app/billing/invoices", icon: "FileText" },
          { name: "Payments", path: "/app/billing/payments", icon: "CreditCard" },
        ]
      },
    ]
  },

  // ==================== PHARMACY ====================
  
  pharmacist: {
    items: [
      { name: "Dashboard", path: "/app/pharmacy", icon: "LayoutDashboard" },
      { 
        name: "Dispensing", 
        path: "", 
        icon: "ClipboardList",
        children: [
          { name: "Prescriptions", path: "/app/pharmacy/queue", icon: "FileText" },
          { name: "POS Terminal", path: "/app/pharmacy/pos", icon: "Calculator" },
          { name: "Transactions", path: "/app/pharmacy/pos/transactions", icon: "Receipt" },
        ]
      },
      { 
        name: "Inventory", 
        path: "", 
        icon: "Package",
        children: [
          { name: "Medicines", path: "/app/pharmacy/medicines", icon: "Pill" },
          { name: "Stock", path: "/app/pharmacy/inventory", icon: "ListTree" },
          { name: "Add Stock", path: "/app/pharmacy/inventory/add", icon: "PackageCheck" },
          { name: "Stock Alerts", path: "/app/pharmacy/alerts", icon: "AlertTriangle" },
          { name: "Movements", path: "/app/pharmacy/stock-movements", icon: "ArrowLeftRight" },
          { name: "Suppliers", path: "/app/inventory/vendors", icon: "Store" },
        ]
      },
      { 
        name: "Setup", 
        path: "", 
        icon: "Settings",
        children: [
          { name: "Categories", path: "/app/pharmacy/categories", icon: "FolderTree" },
          { name: "Settings", path: "/app/pharmacy/settings", icon: "Settings" },
        ]
      },
      { name: "Reports", path: "/app/pharmacy/reports", icon: "BarChart3" },
    ]
  },

  // ==================== LABORATORY ====================
  
  lab_technician: {
    items: [
      { name: "Dashboard", path: "/app/lab", icon: "LayoutDashboard" },
      { 
        name: "Lab Work", 
        path: "", 
        icon: "FlaskConical",
        children: [
          { name: "Sample Queue", path: "/app/lab/queue", icon: "ListOrdered" },
        ]
      },
      { 
        name: "Setup", 
        path: "", 
        icon: "Settings",
        children: [
          { name: "Test Templates", path: "/app/lab/templates", icon: "FileSpreadsheet" },
          { name: "Categories", path: "/app/lab/categories", icon: "FolderTree" },
        ]
      },
      { name: "Reports", path: "/app/lab/reports", icon: "BarChart3" },
    ]
  },

  // ==================== RADIOLOGY ====================
  
  radiologist: {
    items: [
      { name: "Dashboard", path: "/app/radiology", icon: "LayoutDashboard" },
      { 
        name: "Reporting", 
        path: "", 
        icon: "FileText",
        children: [
          { name: "Worklist", path: "/app/radiology/reporting", icon: "ListOrdered" },
          { name: "Verification", path: "/app/radiology/verification", icon: "ListChecks" },
        ]
      },
      { 
        name: "Setup", 
        path: "", 
        icon: "Settings",
        children: [
          { name: "Modalities", path: "/app/radiology/modalities", icon: "Scan" },
          { name: "Procedures", path: "/app/radiology/procedures", icon: "FileSpreadsheet" },
        ]
      },
    ]
  },

  radiology_technician: {
    items: [
      { name: "Dashboard", path: "/app/radiology/worklist", icon: "LayoutDashboard" },
      { 
        name: "Imaging", 
        path: "", 
        icon: "Scan",
        children: [
          { name: "Worklist", path: "/app/radiology/worklist", icon: "ListOrdered" },
          { name: "Orders", path: "/app/radiology/orders", icon: "FileText" },
        ]
      },
      { name: "Schedule", path: "/app/radiology/schedule", icon: "Calendar" },
    ]
  },

  // ==================== BLOOD BANK ====================
  
  blood_bank_technician: {
    items: [
      { name: "Dashboard", path: "/app/blood-bank", icon: "LayoutDashboard" },
      { 
        name: "Donors", 
        path: "", 
        icon: "Users",
        children: [
          { name: "Donor List", path: "/app/blood-bank/donors", icon: "Users" },
          { name: "Register Donor", path: "/app/blood-bank/donors/new", icon: "UserPlus" },
          { name: "Donations", path: "/app/blood-bank/donations", icon: "Droplet" },
        ]
      },
      { 
        name: "Blood Work", 
        path: "", 
        icon: "Droplet",
        children: [
          { name: "Inventory", path: "/app/blood-bank/inventory", icon: "Package" },
          { name: "Cross Match", path: "/app/blood-bank/cross-match", icon: "Activity" },
          { name: "Requests", path: "/app/blood-bank/requests", icon: "FileText" },
          { name: "Transfusions", path: "/app/blood-bank/transfusions", icon: "HeartPulse" },
        ]
      },
    ]
  },

  // ==================== OPERATION THEATRE ====================
  
  ot_technician: {
    items: [
      { name: "Dashboard", path: "/app/ot", icon: "LayoutDashboard" },
      { 
        name: "Surgeries", 
        path: "", 
        icon: "Scissors",
        children: [
          { name: "Schedule", path: "/app/ot/schedule", icon: "Calendar" },
          { name: "Surgery List", path: "/app/ot/surgeries", icon: "ListOrdered" },
        ]
      },
      { 
        name: "Recovery", 
        path: "", 
        icon: "HeartPulse",
        children: [
          { name: "PACU", path: "/app/ot/pacu", icon: "Bed" },
        ]
      },
      { name: "OT Rooms", path: "/app/ot/rooms", icon: "Building" },
    ]
  },

  // ==================== HR ====================
  
  hr_manager: {
    items: [
      { name: "Dashboard", path: "/app/hr", icon: "LayoutDashboard" },
      { 
        name: "Employees", 
        path: "", 
        icon: "Users",
        children: [
          { name: "Directory", path: "/app/hr/employees", icon: "Users" },
          { name: "Add Employee", path: "/app/hr/employees/new", icon: "UserPlus" },
          { name: "Doctors", path: "/app/hr/doctors", icon: "Stethoscope" },
          { name: "Nurses", path: "/app/hr/nurses", icon: "HeartPulse" },
        ]
      },
      { 
        name: "Attendance", 
        path: "", 
        icon: "Clock",
        children: [
          { name: "Daily Attendance", path: "/app/hr/attendance", icon: "ClipboardList" },
          { name: "Attendance Sheet", path: "/app/hr/attendance/sheet", icon: "FileSpreadsheet" },
        ]
      },
      { 
        name: "Leave Management", 
        path: "", 
        icon: "CalendarDays",
        children: [
          { name: "Leave Requests", path: "/app/hr/leaves", icon: "FileText" },
          { name: "Leave Balances", path: "/app/hr/leaves/balances", icon: "PieChart" },
        ]
      },
      { 
        name: "Payroll", 
        path: "", 
        icon: "DollarSign",
        children: [
          { name: "Dashboard", path: "/app/hr/payroll", icon: "LayoutDashboard" },
          { name: "Process Payroll", path: "/app/hr/payroll/process", icon: "Calculator" },
          { name: "Employee Salaries", path: "/app/hr/payroll/salaries", icon: "Users" },
          { name: "Loans & Advances", path: "/app/hr/payroll/loans", icon: "Landmark" },
          { name: "Payslips", path: "/app/hr/payroll/slips", icon: "FileText" },
          { name: "Reports", path: "/app/hr/payroll/reports", icon: "PieChart" },
        ]
      },
      { 
        name: "Setup", 
        path: "", 
        icon: "Settings",
        children: [
          { name: "Departments", path: "/app/hr/setup/departments", icon: "Building2" },
          { name: "Designations", path: "/app/hr/setup/designations", icon: "UserCog" },
          { name: "Employee Categories", path: "/app/hr/setup/categories", icon: "Briefcase" },
          { name: "Leave Types", path: "/app/hr/setup/leave-types", icon: "CalendarCheck" },
          { name: "Shifts", path: "/app/hr/setup/shifts", icon: "CalendarClock" },
          { name: "Holidays", path: "/app/hr/setup/holidays", icon: "Gift" },
        ]
      },
      { name: "Reports", path: "/app/hr/reports", icon: "BarChart3" },
    ]
  },

  hr_officer: {
    items: [
      { name: "Dashboard", path: "/app/hr", icon: "LayoutDashboard" },
      { 
        name: "Employees", 
        path: "", 
        icon: "Users",
        children: [
          { name: "Directory", path: "/app/hr/employees", icon: "Users" },
          { name: "Doctors", path: "/app/hr/doctors", icon: "Stethoscope" },
          { name: "Nurses", path: "/app/hr/nurses", icon: "HeartPulse" },
        ]
      },
      { 
        name: "Attendance", 
        path: "", 
        icon: "Clock",
        children: [
          { name: "Daily Attendance", path: "/app/hr/attendance", icon: "ClipboardList" },
        ]
      },
      { 
        name: "Leave Management", 
        path: "", 
        icon: "CalendarDays",
        children: [
          { name: "Leave Requests", path: "/app/hr/leaves", icon: "FileText" },
        ]
      },
    ]
  },

  // ==================== FINANCE / ACCOUNTS ====================
  
  finance_manager: {
    items: [
      { name: "Dashboard", path: "/app/accounts", icon: "LayoutDashboard" },
      { 
        name: "Accounting", 
        path: "", 
        icon: "Calculator",
        children: [
          { name: "Chart of Accounts", path: "/app/accounts/chart-of-accounts", icon: "ListTree" },
          { name: "Journal Entries", path: "/app/accounts/journal-entries", icon: "BookOpen" },
          { name: "General Ledger", path: "/app/accounts/ledger", icon: "FileText" },
        ]
      },
      { 
        name: "Receivables", 
        path: "", 
        icon: "TrendingUp",
        children: [
          { name: "Outstanding", path: "/app/accounts/receivables", icon: "FileText" },
        ]
      },
      { 
        name: "Payables", 
        path: "", 
        icon: "Receipt",
        children: [
          { name: "Vendor Bills", path: "/app/accounts/payables", icon: "FileText" },
        ]
      },
      { 
        name: "Banking", 
        path: "", 
        icon: "Building",
        children: [
          { name: "Bank Accounts", path: "/app/accounts/bank-accounts", icon: "Building" },
          { name: "Budgets", path: "/app/accounts/budgets", icon: "PieChart" },
        ]
      },
      { 
        name: "Reports", 
        path: "", 
        icon: "BarChart3",
        children: [
          { name: "Financial Reports", path: "/app/accounts/reports", icon: "FileSpreadsheet" },
          { name: "Trial Balance", path: "/app/accounts/reports/trial-balance", icon: "Scale" },
          { name: "Profit & Loss", path: "/app/accounts/reports/profit-loss", icon: "TrendingUp" },
          { name: "Balance Sheet", path: "/app/accounts/reports/balance-sheet", icon: "FileText" },
          { name: "Cash Flow", path: "/app/accounts/reports/cash-flow", icon: "DollarSign" },
        ]
      },
      { 
        name: "Setup", 
        path: "", 
        icon: "Settings",
        children: [
          { name: "Account Types", path: "/app/accounts/types", icon: "FolderTree" },
        ]
      },
    ]
  },

  accountant: {
    items: [
      { name: "Dashboard", path: "/app/accounts", icon: "LayoutDashboard" },
      { 
        name: "Accounting", 
        path: "", 
        icon: "Calculator",
        children: [
          { name: "Journal Entries", path: "/app/accounts/journal-entries", icon: "BookOpen" },
          { name: "General Ledger", path: "/app/accounts/ledger", icon: "FileText" },
        ]
      },
      { 
        name: "Banking", 
        path: "", 
        icon: "Building",
        children: [
          { name: "Bank Accounts", path: "/app/accounts/bank-accounts", icon: "Building" },
        ]
      },
      { name: "Reports", path: "/app/accounts/reports", icon: "BarChart3" },
    ]
  },

  // ==================== INVENTORY / STORE ====================
  
  store_manager: {
    items: [
      { name: "Dashboard", path: "/app/inventory", icon: "LayoutDashboard" },
      { 
        name: "Stock", 
        path: "", 
        icon: "Package",
        children: [
          { name: "Items", path: "/app/inventory/items", icon: "Box" },
          { name: "Stock Levels", path: "/app/inventory/stock", icon: "ListTree" },
          { name: "Categories", path: "/app/inventory/categories", icon: "FolderTree" },
        ]
      },
      { 
        name: "Procurement", 
        path: "", 
        icon: "Boxes",
        children: [
          { name: "Purchase Orders", path: "/app/inventory/purchase-orders", icon: "FileEdit" },
          { name: "GRN", path: "/app/inventory/grn", icon: "PackageCheck" },
          { name: "Vendors", path: "/app/inventory/vendors", icon: "Store" },
        ]
      },
      { 
        name: "Requests", 
        path: "", 
        icon: "ClipboardList",
        children: [
          { name: "Requisitions", path: "/app/inventory/requisitions", icon: "FileText" },
        ]
      },
      { name: "Reports", path: "/app/inventory/reports", icon: "BarChart3" },
    ]
  },

  // ==================== DEFAULT (fallback) ====================
  
  default: {
    items: [
      { name: "Dashboard", path: "/app/dashboard", icon: "LayoutDashboard" },
    ]
  },
};

// Helper to get primary role from roles array
export const getPrimaryRole = (roles: string[]): string => {
  // Priority order for determining primary role
  const rolePriority = [
    'super_admin',
    'org_admin', 
    'branch_admin',
    'doctor',
    'nurse',
    'ipd_nurse',
    'receptionist',
    'pharmacist',
    'lab_technician',
    'radiologist',
    'radiology_technician',
    'blood_bank_technician',
    'ot_technician',
    'hr_manager',
    'hr_officer',
    'finance_manager',
    'accountant',
    'store_manager',
  ];

  for (const role of rolePriority) {
    if (roles.includes(role)) {
      return role;
    }
  }
  
  return roles[0] || 'default';
};

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
export const ADMIN_ROLES = ['super_admin', 'org_admin', 'branch_admin'];

export const ROLE_SIDEBAR_CONFIG: Record<string, SidebarConfig> = {
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
        ]
      },
      { 
        name: "OPD", 
        path: "", 
        icon: "Stethoscope",
        children: [
          { name: "Consultation History", path: "/app/opd/history", icon: "FileText" },
          { name: "Reports", path: "/app/opd/reports", icon: "BarChart3" },
        ]
      },
      { 
        name: "Patients", 
        path: "", 
        icon: "Users",
        children: [
          { name: "Search Patients", path: "/app/patients", icon: "Search" },
          { name: "My Patients", path: "/app/patients?doctor=me", icon: "UserCheck" },
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
      { name: "Nurse Station", path: "/app/opd/nursing", icon: "HeartPulse" },
      { name: "Patient Queue", path: "/app/appointments/queue", icon: "ListOrdered" },
      { 
        name: "Triage", 
        path: "", 
        icon: "Activity",
        children: [
          { name: "ER Triage", path: "/app/emergency/triage", icon: "Gauge" },
          { name: "Vitals Entry", path: "/app/opd/vitals", icon: "HeartPulse" },
        ]
      },
      { name: "Patients", path: "/app/patients", icon: "Users" },
    ]
  },

  ipd_nurse: {
    items: [
      { name: "IPD Dashboard", path: "/app/ipd/nursing", icon: "Bed" },
      { 
        name: "Patient Care", 
        path: "", 
        icon: "HeartPulse",
        children: [
          { name: "Ward Rounds", path: "/app/ipd/rounds", icon: "ClipboardList" },
          { name: "eMAR", path: "/app/ipd/emar", icon: "Pill" },
          { name: "Vitals", path: "/app/ipd/vitals", icon: "Activity" },
          { name: "Nursing Notes", path: "/app/ipd/notes", icon: "FileText" },
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
      { name: "Dashboard", path: "/app/reception", icon: "ConciergeBell" },
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
          { name: "Check-In", path: "/app/reception/check-in", icon: "ClipboardList" },
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
      { name: "Dashboard", path: "/app/pharmacy", icon: "Pill" },
      { 
        name: "Dispensing", 
        path: "", 
        icon: "ClipboardList",
        children: [
          { name: "Prescriptions", path: "/app/pharmacy/prescriptions", icon: "FileText" },
          { name: "POS Terminal", path: "/app/pharmacy/pos", icon: "Calculator" },
        ]
      },
      { 
        name: "Inventory", 
        path: "", 
        icon: "Package",
        children: [
          { name: "Stock List", path: "/app/pharmacy/inventory", icon: "ListTree" },
          { name: "Add Stock", path: "/app/pharmacy/inventory/add", icon: "PackageCheck" },
          { name: "Stock Alerts", path: "/app/pharmacy/alerts", icon: "AlertTriangle" },
          { name: "Expiry Management", path: "/app/pharmacy/expiry", icon: "Clock" },
        ]
      },
      { 
        name: "Reports", 
        path: "", 
        icon: "BarChart3",
        children: [
          { name: "Sales Report", path: "/app/pharmacy/reports/sales", icon: "TrendingUp" },
          { name: "Stock Report", path: "/app/pharmacy/reports/stock", icon: "Package" },
        ]
      },
    ]
  },

  // ==================== LABORATORY ====================
  
  lab_technician: {
    items: [
      { name: "Dashboard", path: "/app/lab", icon: "TestTube" },
      { 
        name: "Lab Work", 
        path: "", 
        icon: "FlaskConical",
        children: [
          { name: "Sample Queue", path: "/app/lab/queue", icon: "ListOrdered" },
          { name: "Pending Tests", path: "/app/lab/pending", icon: "Clock" },
          { name: "Enter Results", path: "/app/lab/results", icon: "FileInput" },
        ]
      },
      { 
        name: "Management", 
        path: "", 
        icon: "Settings",
        children: [
          { name: "Test Templates", path: "/app/lab/templates", icon: "FileSpreadsheet" },
          { name: "Panels", path: "/app/lab/panels", icon: "ListChecks" },
        ]
      },
      { name: "Reports", path: "/app/lab/reports", icon: "BarChart3" },
    ]
  },

  // ==================== RADIOLOGY ====================
  
  radiologist: {
    items: [
      { name: "Dashboard", path: "/app/radiology", icon: "Scan" },
      { 
        name: "Reporting", 
        path: "", 
        icon: "FileText",
        children: [
          { name: "Worklist", path: "/app/radiology/worklist", icon: "ListOrdered" },
          { name: "Pending Reports", path: "/app/radiology/pending", icon: "Clock" },
          { name: "Completed", path: "/app/radiology/completed", icon: "ListChecks" },
        ]
      },
      { name: "Templates", path: "/app/radiology/templates", icon: "FileSpreadsheet" },
    ]
  },

  radiology_technician: {
    items: [
      { name: "Worklist", path: "/app/radiology/worklist", icon: "ListOrdered" },
      { 
        name: "Imaging", 
        path: "", 
        icon: "Scan",
        children: [
          { name: "Capture Images", path: "/app/radiology/capture", icon: "FileInput" },
          { name: "Upload Images", path: "/app/radiology/upload", icon: "FilePlus" },
        ]
      },
      { name: "Schedule", path: "/app/radiology/schedule", icon: "Calendar" },
    ]
  },

  // ==================== BLOOD BANK ====================
  
  blood_bank_technician: {
    items: [
      { name: "Dashboard", path: "/app/blood-bank", icon: "Droplet" },
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
        icon: "TestTubes",
        children: [
          { name: "Inventory", path: "/app/blood-bank/inventory", icon: "Package" },
          { name: "Cross Match", path: "/app/blood-bank/cross-match", icon: "Activity" },
          { name: "Requests", path: "/app/blood-bank/requests", icon: "FileText" },
        ]
      },
      { name: "Reports", path: "/app/blood-bank/reports", icon: "BarChart3" },
    ]
  },

  // ==================== OPERATION THEATRE ====================
  
  ot_technician: {
    items: [
      { name: "OT Dashboard", path: "/app/ot", icon: "Scissors" },
      { 
        name: "Surgeries", 
        path: "", 
        icon: "ClipboardList",
        children: [
          { name: "Today's Schedule", path: "/app/ot/schedule", icon: "Calendar" },
          { name: "Surgery List", path: "/app/ot/surgeries", icon: "ListOrdered" },
        ]
      },
      { 
        name: "Recovery", 
        path: "", 
        icon: "HeartPulse",
        children: [
          { name: "PACU", path: "/app/ot/pacu", icon: "Bed" },
          { name: "Post-Op Notes", path: "/app/ot/notes", icon: "FileText" },
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
          { name: "Departments", path: "/app/hr/departments", icon: "Building2" },
          { name: "Designations", path: "/app/hr/designations", icon: "UserCog" },
        ]
      },
      { 
        name: "Attendance", 
        path: "", 
        icon: "Clock",
        children: [
          { name: "Daily Attendance", path: "/app/hr/attendance", icon: "ClipboardList" },
          { name: "Attendance Sheet", path: "/app/hr/attendance/sheet", icon: "FileSpreadsheet" },
          { name: "Leave Requests", path: "/app/hr/leaves", icon: "CalendarDays" },
          { name: "Shifts", path: "/app/hr/shifts", icon: "CalendarClock" },
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
          { name: "Departments", path: "/app/hr/departments", icon: "Building2" },
        ]
      },
      { 
        name: "Attendance", 
        path: "", 
        icon: "Clock",
        children: [
          { name: "Daily Attendance", path: "/app/hr/attendance", icon: "ClipboardList" },
          { name: "Leave Requests", path: "/app/hr/leaves", icon: "CalendarDays" },
        ]
      },
    ]
  },

  // ==================== FINANCE / ACCOUNTS ====================
  
  finance_manager: {
    items: [
      { name: "Dashboard", path: "/app/accounts", icon: "DollarSign" },
      { 
        name: "Accounting", 
        path: "", 
        icon: "Calculator",
        children: [
          { name: "Chart of Accounts", path: "/app/accounts/chart", icon: "ListTree" },
          { name: "Journal Entries", path: "/app/accounts/journal", icon: "BookOpen" },
          { name: "Ledger", path: "/app/accounts/ledger", icon: "FileText" },
        ]
      },
      { 
        name: "Receivables", 
        path: "", 
        icon: "TrendingUp",
        children: [
          { name: "Outstanding", path: "/app/accounts/receivables", icon: "FileText" },
          { name: "Collections", path: "/app/accounts/collections", icon: "CreditCard" },
        ]
      },
      { 
        name: "Payables", 
        path: "", 
        icon: "Receipt",
        children: [
          { name: "Vendor Bills", path: "/app/accounts/payables", icon: "FileText" },
          { name: "Payments", path: "/app/accounts/payments", icon: "DollarSign" },
        ]
      },
      { 
        name: "Reports", 
        path: "", 
        icon: "BarChart3",
        children: [
          { name: "Financial Reports", path: "/app/accounts/reports", icon: "FileSpreadsheet" },
          { name: "Tax Reports", path: "/app/accounts/tax", icon: "Receipt" },
        ]
      },
    ]
  },

  accountant: {
    items: [
      { name: "Dashboard", path: "/app/accounts", icon: "DollarSign" },
      { 
        name: "Accounting", 
        path: "", 
        icon: "Calculator",
        children: [
          { name: "Journal Entries", path: "/app/accounts/journal", icon: "BookOpen" },
          { name: "Ledger", path: "/app/accounts/ledger", icon: "FileText" },
          { name: "Vouchers", path: "/app/accounts/vouchers", icon: "Ticket" },
        ]
      },
      { 
        name: "Banking", 
        path: "", 
        icon: "PiggyBank",
        children: [
          { name: "Bank Accounts", path: "/app/accounts/bank", icon: "Building" },
          { name: "Reconciliation", path: "/app/accounts/reconciliation", icon: "ListChecks" },
        ]
      },
      { name: "Reports", path: "/app/accounts/reports", icon: "BarChart3" },
    ]
  },

  // ==================== INVENTORY / STORE ====================
  
  store_manager: {
    items: [
      { name: "Dashboard", path: "/app/inventory", icon: "Warehouse" },
      { 
        name: "Stock", 
        path: "", 
        icon: "Package",
        children: [
          { name: "Item Master", path: "/app/inventory/items", icon: "Box" },
          { name: "Stock Levels", path: "/app/inventory/stock", icon: "ListTree" },
          { name: "Categories", path: "/app/inventory/categories", icon: "FolderTree" },
        ]
      },
      { 
        name: "Procurement", 
        path: "", 
        icon: "Boxes",
        children: [
          { name: "Purchase Orders", path: "/app/inventory/po", icon: "FileEdit" },
          { name: "GRN", path: "/app/inventory/grn", icon: "PackageCheck" },
          { name: "Vendors", path: "/app/inventory/vendors", icon: "Store" },
        ]
      },
      { 
        name: "Issuance", 
        path: "", 
        icon: "ClipboardList",
        children: [
          { name: "Issue Stock", path: "/app/inventory/issue", icon: "Package" },
          { name: "Returns", path: "/app/inventory/returns", icon: "Folders" },
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

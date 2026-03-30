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
        name: "Services", 
        path: "", 
        icon: "Banknote",
        children: [
          { name: "All Services", path: "/app/services", icon: "List" },
          { name: "Categories", path: "/app/services/categories", icon: "FolderTree" },
          { name: "Consultations", path: "/app/services/category/consultation", icon: "Stethoscope" },
          { name: "Lab Tests", path: "/app/services/category/lab", icon: "FlaskConical" },
          { name: "Radiology", path: "/app/services/category/radiology", icon: "Scan" },
          { name: "Rooms & Beds", path: "/app/services/category/room", icon: "BedDouble" },
        ]
      },
      { 
        name: "Configuration", 
        path: "", 
        icon: "Settings",
        children: [
          { name: "Payment Methods", path: "/app/settings/payment-methods", icon: "CreditCard" },
          { name: "OPD Departments", path: "/app/settings/opd-departments", icon: "Building2" },
          { name: "Specializations", path: "/app/settings/specializations", icon: "Award" },
          { name: "Qualifications", path: "/app/settings/qualifications", icon: "GraduationCap" },
          { name: "Tax Settings", path: "/app/settings/tax", icon: "Percent" },
          { name: "Receipt Templates", path: "/app/settings/receipts", icon: "FileText" },
        ]
      },
      { 
        name: "Inventory", 
        path: "", 
        icon: "Package",
        children: [
          { name: "Dashboard", path: "/app/inventory", icon: "LayoutDashboard" },
          { name: "Items", path: "/app/inventory/items", icon: "Box" },
          { name: "Stock Levels", path: "/app/inventory/stock", icon: "ListTree" },
          { name: "Categories", path: "/app/inventory/categories", icon: "FolderTree" },
          { name: "Vendors", path: "/app/inventory/vendors", icon: "Store" },
          { name: "Requisitions", path: "/app/inventory/requisitions", icon: "FileText" },
          { name: "Purchase Requests", path: "/app/inventory/purchase-requests", icon: "FileInput" },
          { name: "Purchase Orders", path: "/app/inventory/purchase-orders", icon: "FileEdit" },
          { name: "GRN", path: "/app/inventory/grn", icon: "PackageCheck" },
          { name: "Stock Adjustments", path: "/app/inventory/adjustments", icon: "SlidersHorizontal" },
          { name: "Reorder Alerts", path: "/app/inventory/reorder-alerts", icon: "AlertTriangle" },
          { name: "Reports", path: "/app/inventory/reports", icon: "BarChart3" },
        ]
      },
      {
        name: "Warehouse Management",
        path: "",
        icon: "Warehouse",
        children: [
          { name: "All Warehouses", path: "/app/inventory/stores", icon: "List" },
          { name: "Create Warehouse", path: "/app/inventory/stores/new", icon: "Plus" },
          { name: "Store Transfers", path: "/app/inventory/transfers", icon: "ArrowLeftRight" },
        ]
      },
      { 
        name: "HR & Staff",
        path: "", 
        icon: "Users2",
        children: [
          { name: "Dashboard", path: "/app/hr", icon: "LayoutDashboard" },
          { name: "Employees", path: "/app/hr/employees", icon: "Users" },
          { name: "Attendance", path: "/app/hr/attendance", icon: "Clock" },
          { name: "Leaves", path: "/app/hr/leaves", icon: "CalendarDays" },
          { name: "Payroll", path: "/app/hr/payroll", icon: "DollarSign" },
          { name: "Reports", path: "/app/hr/reports", icon: "BarChart3" },
        ]
      },
      { 
        name: "Billing", 
        path: "", 
        icon: "Receipt",
        children: [
          { name: "Invoices", path: "/app/billing/invoices", icon: "FileText" },
          { name: "Payments", path: "/app/billing/payments", icon: "CreditCard" },
          { name: "Payment Reconciliation", path: "/app/billing/reconciliation", icon: "BookOpen" },
          { name: "Reports", path: "/app/billing/reports", icon: "PieChart" },
        ]
      },
      { 
        name: "Accounts", 
        path: "", 
        icon: "Landmark",
        children: [
          { name: "Dashboard", path: "/app/accounts", icon: "LayoutDashboard" },
          { name: "Chart of Accounts", path: "/app/accounts/chart", icon: "ListTree" },
          { name: "Journal Entries", path: "/app/accounts/journal", icon: "BookOpen" },
          { name: "Accounts Payable", path: "/app/accounts/payable", icon: "Wallet" },
          { name: "Reports", path: "/app/accounts/reports", icon: "PieChart" },
        ]
      },
      {
        name: "Kitchen",
        path: "",
        icon: "UtensilsCrossed",
        children: [
          { name: "Dashboard", path: "/app/kitchen", icon: "LayoutDashboard" },
          { name: "Meal Orders", path: "/app/kitchen/orders", icon: "ClipboardList" },
          { name: "Meal Planning", path: "/app/kitchen/planning", icon: "Calendar" },
        ]
      },
      {
        name: "Asset Management",
        path: "",
        icon: "Wrench",
        children: [
          { name: "Dashboard", path: "/app/assets", icon: "LayoutDashboard" },
          { name: "Registry", path: "/app/assets/registry", icon: "Package" },
          { name: "Maintenance", path: "/app/assets/maintenance", icon: "Wrench" },
          { name: "AMC Tracking", path: "/app/assets/amc", icon: "Shield" },
        ]
      },
      {
        name: "Housekeeping",
        path: "",
        icon: "Sparkles",
        children: [
          { name: "Dashboard", path: "/app/housekeeping", icon: "LayoutDashboard" },
          { name: "Task Assignments", path: "/app/housekeeping/tasks", icon: "ClipboardList" },
          { name: "Inspections", path: "/app/housekeeping/inspections", icon: "CheckSquare" },
          { name: "Issue Reporting", path: "/app/housekeeping/issues", icon: "AlertTriangle" },
        ]
      },
      {
        name: "Dialysis",
        path: "",
        icon: "Droplets",
        children: [
          { name: "Dashboard", path: "/app/dialysis", icon: "LayoutDashboard" },
          { name: "Patients", path: "/app/dialysis/patients", icon: "Users" },
          { name: "Sessions", path: "/app/dialysis/sessions", icon: "ClipboardList" },
          { name: "Schedule", path: "/app/dialysis/schedule", icon: "Calendar" },
          { name: "Machines", path: "/app/dialysis/machines", icon: "Monitor" },
          { name: "Reports", path: "/app/dialysis/reports", icon: "BarChart3" },
        ]
      },
      {
        name: "Dental",
        path: "",
        icon: "Smile",
        children: [
          { name: "Dashboard", path: "/app/dental", icon: "LayoutDashboard" },
          { name: "Tooth Chart", path: "/app/dental/chart", icon: "Smile" },
          { name: "Treatments", path: "/app/dental/treatments", icon: "ClipboardList" },
          { name: "Procedures", path: "/app/dental/procedures", icon: "BookOpen" },
          { name: "Images", path: "/app/dental/images", icon: "Image" },
          { name: "Reports", path: "/app/dental/reports", icon: "BarChart3" },
        ]
      },
      { 
        name: "Reports", 
        path: "", 
        icon: "BarChart3",
        children: [
          { name: "Organization Reports", path: "/app/reports/organization", icon: "PieChart" },
          { name: "Branch Comparison", path: "/app/reports/branches", icon: "BarChart3" },
          { name: "Day-End Summary", path: "/app/reports/day-end-summary", icon: "Receipt" },
          { name: "OPD Departments", path: "/app/reports/opd-departments", icon: "Building2" },
        ]
      },
      {
        name: "KSA Integrations",
        path: "",
        icon: "ShieldAlert",
        children: [
          { name: "KSA Dashboard", path: "/app/settings/ksa-integrations", icon: "LayoutDashboard" },
          { name: "NPHIES", path: "/app/settings/ksa/nphies", icon: "FileText" },
          { name: "ZATCA Phase 2", path: "/app/settings/ksa/zatca", icon: "Receipt" },
          { name: "Wasfaty", path: "/app/settings/ksa/wasfaty", icon: "Pill" },
          { name: "Tatmeen / RSD", path: "/app/settings/ksa/tatmeen", icon: "ScanBarcode" },
          { name: "HESN", path: "/app/settings/ksa/hesn", icon: "ShieldAlert" },
          { name: "Nafath", path: "/app/settings/ksa/nafath", icon: "Fingerprint" },
          { name: "Sehhaty", path: "/app/settings/ksa/sehhaty", icon: "Smartphone" },
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
          { name: "My Calendar", path: "/app/appointments/my-calendar", icon: "CalendarDays" },
          { name: "Today's Queue", path: "/app/appointments/queue", icon: "ListOrdered" },
          { name: "All Appointments", path: "/app/appointments", icon: "Calendar" },
        ]
      },
      { 
        name: "Consultations", 
        path: "", 
        icon: "Stethoscope",
        children: [
          { name: "History", path: "/app/opd/history", icon: "FileText" },
          { name: "OPD Orders", path: "/app/opd/orders", icon: "ClipboardList" },
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
          { name: "Request Discharge", path: "/app/ipd/discharges", icon: "Send" },
        ]
      },
      {
        name: "Dialysis",
        path: "",
        icon: "Droplets",
        children: [
          { name: "Dashboard", path: "/app/dialysis", icon: "LayoutDashboard" },
          { name: "My Sessions", path: "/app/dialysis/sessions", icon: "ClipboardList" },
          { name: "Patients", path: "/app/dialysis/patients", icon: "Users" },
          { name: "Reports", path: "/app/dialysis/reports", icon: "BarChart3" },
        ]
      },
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Wallet", path: "/app/my-wallet", icon: "Wallet" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
    ]
  },

  nurse: {
    items: [
      { name: "Dashboard", path: "/app/opd/nursing", icon: "LayoutDashboard" },
      { name: "My Calendar", path: "/app/appointments/my-calendar", icon: "CalendarDays" },
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
      { name: "OPD Orders", path: "/app/opd/orders", icon: "ClipboardList" },
      { name: "Patients", path: "/app/patients", icon: "Users" },
      {
        name: "Dialysis",
        path: "",
        icon: "Droplets",
        children: [
          { name: "Dashboard", path: "/app/dialysis", icon: "LayoutDashboard" },
          { name: "Sessions", path: "/app/dialysis/sessions", icon: "ClipboardList" },
          { name: "Patients", path: "/app/dialysis/patients", icon: "Users" },
          { name: "Schedule", path: "/app/dialysis/schedule", icon: "Calendar" },
        ]
      },
      {
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
    ]
  },

  ipd_nurse: {
    items: [
      { name: "Dashboard", path: "/app/ipd/nursing-notes", icon: "LayoutDashboard" },
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
      {
        name: "Dialysis",
        path: "",
        icon: "Droplets",
        children: [
          { name: "Dashboard", path: "/app/dialysis", icon: "LayoutDashboard" },
          { name: "Sessions", path: "/app/dialysis/sessions", icon: "ClipboardList" },
          { name: "Patients", path: "/app/dialysis/patients", icon: "Users" },
        ]
      },
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
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
        name: "Surgeries", 
        path: "", 
        icon: "Scissors",
        children: [
          { name: "Surgery Requests", path: "/app/ot/requests", icon: "FileText" },
          { name: "All Surgeries", path: "/app/ot/surgeries", icon: "ListOrdered" },
          { name: "OT Schedule", path: "/app/ot/schedule", icon: "Calendar" },
        ]
      },
      { 
        name: "OT Charges", 
        path: "", 
        icon: "Pill",
        children: [
          { name: "Medication Charges", path: "/app/reception/ot-charges", icon: "Receipt" },
        ]
      },
      {
        name: "Billing", 
        path: "", 
        icon: "Receipt",
        children: [
          { name: "Billing Sessions", path: "/app/billing/sessions", icon: "Monitor" },
          { name: "OPD Checkout", path: "/app/opd/checkout", icon: "Receipt" },
          { name: "New Invoice", path: "/app/billing/invoices/new", icon: "FilePlus" },
          { name: "Invoices", path: "/app/billing/invoices", icon: "FileText" },
          { name: "Payments", path: "/app/billing/payments", icon: "CreditCard" },
          { name: "Daily Closing", path: "/app/billing/daily-closing", icon: "Clock" },
          { name: "Closing History", path: "/app/billing/daily-closing/history", icon: "History" },
        ]
      },
      {
        name: "Dialysis",
        path: "",
        icon: "Droplets",
        children: [
          { name: "Enroll Patient", path: "/app/dialysis/patients/enroll", icon: "UserPlus" },
          { name: "Schedule", path: "/app/dialysis/schedule", icon: "Calendar" },
          { name: "New Schedule", path: "/app/dialysis/schedule/new", icon: "CalendarPlus" },
          { name: "Sessions", path: "/app/dialysis/sessions", icon: "ClipboardList" },
          { name: "Machines", path: "/app/dialysis/machines", icon: "Monitor" },
        ]
      },
      {
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
    ]
  },

  // ==================== PHARMACY ====================
  
  pharmacist: {
    items: [
      { name: "Dashboard", path: "/app/pharmacy", icon: "LayoutDashboard" },
      { name: "Prescription Queue", path: "/app/pharmacy/queue", icon: "ClipboardList" },
      { 
        name: "Dispensing", 
        path: "", 
        icon: "Pill",
        children: [
          { name: "POS Terminal", path: "/app/pharmacy/pos", icon: "Calculator" },
          { name: "Transactions", path: "/app/pharmacy/pos/transactions", icon: "Receipt" },
          { name: "Sessions", path: "/app/pharmacy/pos/sessions", icon: "Clock" },
          { name: "Returns", path: "/app/pharmacy/returns", icon: "RotateCcw" },
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
          { name: "Add Vendor", path: "/app/inventory/vendors/new", icon: "Plus" },
        ]
      },
      { 
        name: "Requisitions", 
        path: "", 
        icon: "ShoppingCart",
        children: [
          { name: "My Requisitions", path: "/app/inventory/requisitions", icon: "ClipboardList" },
          { name: "New Requisition", path: "/app/inventory/requisitions/new", icon: "Plus" },
        ]
      },
      {
        name: "Warehouses",
        path: "",
        icon: "Warehouse",
        children: [
          { name: "My Warehouses", path: "/app/pharmacy/warehouses", icon: "List" },
          { name: "Create Warehouse", path: "/app/pharmacy/warehouses/new", icon: "Plus" },
          { name: "Rack Assignments", path: "/app/pharmacy/rack-assignments", icon: "LayoutGrid" },
          { name: "Store Transfers", path: "/app/inventory/transfers", icon: "ArrowLeftRight" },
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
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
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
          { name: "Archive", path: "/app/radiology/archive", icon: "Archive" },
        ]
      },
      { 
        name: "PACS", 
        path: "", 
        icon: "Radio",
        children: [
          { name: "Studies", path: "/app/radiology/pacs", icon: "Image" },
          { name: "Settings", path: "/app/radiology/pacs/settings", icon: "Server" },
          { name: "Setup Guide", path: "/app/radiology/pacs/guide", icon: "BookOpen" },
        ]
      },
      { 
        name: "Setup", 
        path: "", 
        icon: "Settings",
        children: [
          { name: "Modalities", path: "/app/radiology/modalities", icon: "Scan" },
          { name: "Procedures", path: "/app/radiology/procedures", icon: "FileSpreadsheet" },
          { name: "Report Templates", path: "/app/radiology/templates", icon: "FileText" },
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
      { 
        name: "PACS", 
        path: "", 
        icon: "Radio",
        children: [
          { name: "Studies", path: "/app/radiology/pacs", icon: "Image" },
        ]
      },
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
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
          { name: "Donor Cards", path: "/app/blood-bank/donor-cards", icon: "CreditCard" },
        ]
      },
      { 
        name: "Blood Work", 
        path: "", 
        icon: "Droplet",
        children: [
          { name: "Inventory", path: "/app/blood-bank/inventory", icon: "Package" },
          { name: "Blood Testing", path: "/app/blood-bank/testing", icon: "Beaker" },
          { name: "Cross Match", path: "/app/blood-bank/cross-match", icon: "Activity" },
          { name: "Requests", path: "/app/blood-bank/requests", icon: "FileText" },
          { name: "Transfusions", path: "/app/blood-bank/transfusions", icon: "HeartPulse" },
          { name: "Bag Labels", path: "/app/blood-bank/labels", icon: "Tag" },
        ]
      },
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
    ]
  },

  // ==================== OPERATION THEATRE ====================
  
  // SURGEON - Surgery-focused workflow
  surgeon: {
    items: [
      { name: "Dashboard", path: "/app/ot", icon: "LayoutDashboard" },
      { name: "My Calendar", path: "/app/appointments/my-calendar", icon: "CalendarDays" },
      { 
        name: "Surgeries", 
        path: "", 
        icon: "Scissors",
        children: [
          { name: "Today's Schedule", path: "/app/ot/schedule", icon: "Calendar" },
          { name: "All Surgeries", path: "/app/ot/surgeries", icon: "ListOrdered" },
          { name: "Surgery Requests", path: "/app/ot/requests", icon: "FileText" },
          { name: "Schedule Surgery", path: "/app/ot/surgeries/new", icon: "CalendarPlus" },
        ]
      },
      { 
        name: "Pre-Op", 
        path: "", 
        icon: "ClipboardCheck",
        children: [
          { name: "Assessments", path: "/app/ot/surgeries", icon: "FileText" },
        ]
      },
      { 
        name: "Patients", 
        path: "", 
        icon: "Users",
        children: [
          { name: "Search", path: "/app/patients", icon: "Search" },
          { name: "IPD Patients", path: "/app/ipd/rounds", icon: "Bed" },
        ]
      },
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Wallet", path: "/app/my-wallet", icon: "Wallet" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
    ]
  },

  // ANESTHETIST - Anesthesia-focused workflow
  anesthetist: {
    items: [
      { name: "Dashboard", path: "/app/ot/anesthesia", icon: "LayoutDashboard" },
      { 
        name: "Assessments", 
        path: "", 
        icon: "ClipboardList",
        children: [
          { name: "Pre-Anesthesia", path: "/app/ot/schedule", icon: "FileText" },
        ]
      },
      { 
        name: "Surgeries", 
        path: "", 
        icon: "Scissors",
        children: [
          { name: "Today's Schedule", path: "/app/ot/schedule", icon: "Calendar" },
          { name: "All Surgeries", path: "/app/ot/surgeries", icon: "ListOrdered" },
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
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Wallet", path: "/app/my-wallet", icon: "Wallet" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
    ]
  },

  // OT NURSE - OT Nursing workflows
  ot_nurse: {
    items: [
      { name: "Dashboard", path: "/app/ot", icon: "LayoutDashboard" },
      { 
        name: "Surgeries", 
        path: "", 
        icon: "Scissors",
        children: [
          { name: "Today's Schedule", path: "/app/ot/schedule", icon: "Calendar" },
          { name: "Surgery List", path: "/app/ot/surgeries", icon: "ListOrdered" },
        ]
      },
      { 
        name: "Nursing", 
        path: "", 
        icon: "HeartPulse",
        children: [
          { name: "Intra-Op Notes", path: "/app/ot/nursing-notes", icon: "FileText" },
          { name: "Instrument Count", path: "/app/ot/instruments", icon: "ClipboardCheck" },
        ]
      },
      { 
        name: "Recovery", 
        path: "", 
        icon: "Activity",
        children: [
          { name: "PACU", path: "/app/ot/pacu", icon: "Bed" },
        ]
      },
      { name: "OT Rooms", path: "/app/ot/rooms", icon: "Building" },
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
    ]
  },

  // OT PHARMACIST - Dedicated OT medication workflow
  ot_pharmacist: {
    items: [
      { name: "Dashboard", path: "/app/pharmacy", icon: "LayoutDashboard" },
      { name: "Prescription Queue", path: "/app/pharmacy/queue", icon: "ClipboardList" },
      { 
        name: "OT Queue",
        path: "", 
        icon: "Syringe",
        children: [
          { name: "Medication Queue", path: "/app/pharmacy/ot-queue", icon: "ClipboardList" },
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
        ]
      },
      { name: "POS Terminal", path: "/app/pharmacy/pos", icon: "Calculator" },
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
    ]
  },

  // OT TECHNICIAN - General OT support
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
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
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
          { name: "Paramedical Staff", path: "/app/hr/paramedical", icon: "Activity" },
          { name: "Support Staff", path: "/app/hr/support-staff", icon: "HardHat" },
          { name: "Visiting Doctors", path: "/app/hr/visiting-doctors", icon: "UserCheck" },
        ]
      },
      { 
        name: "Attendance", 
        path: "", 
        icon: "Clock",
        children: [
          { name: "Daily Attendance", path: "/app/hr/attendance", icon: "ClipboardList" },
          { name: "Attendance Sheet", path: "/app/hr/attendance/sheet", icon: "FileSpreadsheet" },
          { name: "Biometric Setup", path: "/app/hr/attendance/biometric", icon: "Fingerprint" },
          { name: "Duty Roster", path: "/app/hr/attendance/roster", icon: "Calendar" },
          { name: "OT Roster", path: "/app/hr/attendance/ot-roster", icon: "Scissors" },
          { name: "Emergency Roster", path: "/app/hr/attendance/emergency-roster", icon: "Siren" },
          { name: "On-Call Schedule", path: "/app/hr/attendance/on-call", icon: "Phone" },
          { name: "Publish Roster", path: "/app/hr/attendance/publish", icon: "Send" },
          { name: "Roster Reports", path: "/app/hr/attendance/roster-reports", icon: "FileBarChart" },
          { name: "Overtime", path: "/app/hr/attendance/overtime", icon: "Clock" },
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
          { name: "Doctor Compensation", path: "/app/hr/payroll/doctor-compensation", icon: "Stethoscope" },
          { name: "Doctor Earnings", path: "/app/hr/payroll/doctor-earnings", icon: "Receipt" },
          { name: "Wallet Balances", path: "/app/hr/payroll/wallet-balances", icon: "Wallet" },
          { name: "Commissions", path: "/app/hr/payroll/commissions", icon: "TrendingUp" },
          { name: "Loans & Advances", path: "/app/hr/payroll/loans", icon: "Landmark" },
          { name: "Payslips", path: "/app/hr/payroll/slips", icon: "FileText" },
          { name: "Bank Sheets", path: "/app/hr/payroll/bank-sheet", icon: "FileSpreadsheet" },
          { name: "Reports", path: "/app/hr/payroll/reports", icon: "PieChart" },
        ]
      },
      { 
        name: "Recruitment", 
        path: "", 
        icon: "UserPlus",
        children: [
          { name: "Job Openings", path: "/app/hr/recruitment/jobs", icon: "Briefcase" },
          { name: "Applications", path: "/app/hr/recruitment/applications", icon: "FileText" },
        ]
      },
      {
        name: "Onboarding",
        path: "/app/hr/onboarding",
        icon: "ClipboardCheck",
      },
      { 
        name: "Exit Management", 
        path: "", 
        icon: "LogOut",
        children: [
          { name: "Resignations", path: "/app/hr/exit/resignations", icon: "UserMinus" },
          { name: "Clearance", path: "/app/hr/exit/clearance", icon: "ClipboardCheck" },
          { name: "Final Settlement", path: "/app/hr/exit/settlements", icon: "Calculator" },
          { name: "Exit Interviews", path: "/app/hr/exit/interviews", icon: "MessageSquare" },
        ]
      },
      { 
        name: "Compliance", 
        path: "", 
        icon: "Shield",
        children: [
          { name: "Dashboard", path: "/app/hr/compliance", icon: "LayoutDashboard" },
          { name: "Medical Fitness", path: "/app/hr/compliance/medical-fitness", icon: "HeartPulse" },
          { name: "Vaccinations", path: "/app/hr/compliance/vaccinations", icon: "Syringe" },
          { name: "Disciplinary", path: "/app/hr/compliance/disciplinary", icon: "AlertTriangle" },
          { name: "Expiry Tracker", path: "/app/hr/compliance/expiry-tracker", icon: "Calendar" },
        ]
      },
      {
        name: "Training",
        path: "/app/hr/training",
        icon: "GraduationCap",
      },
      {
        name: "HR Letters",
        path: "/app/hr/letters",
        icon: "FileText",
      },
      {
        name: "Contracts",
        path: "/app/hr/contracts",
        icon: "ScrollText",
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
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
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
          { name: "Biometric Setup", path: "/app/hr/attendance/biometric", icon: "Fingerprint" },
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
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
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
          { name: "Vendor Payments", path: "/app/accounts/vendor-payments", icon: "CreditCard" },
          { name: "Expense Management", path: "/app/accounts/expenses", icon: "Receipt" },
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
      { 
        name: "Doctor Settlements", 
        path: "", 
        icon: "Stethoscope",
        children: [
          { name: "Doctor Earnings", path: "/app/hr/payroll/doctor-earnings", icon: "Receipt" },
          { name: "Wallet Balances", path: "/app/hr/payroll/wallet-balances", icon: "Wallet" },
          { name: "Daily Commissions", path: "/app/hr/payroll/daily-commissions", icon: "TrendingUp" },
        ]
      },
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
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
          { name: "Vendor Payments", path: "/app/accounts/vendor-payments", icon: "CreditCard" },
          { name: "Expense Management", path: "/app/accounts/expenses", icon: "Receipt" },
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
        name: "Doctor Settlements", 
        path: "", 
        icon: "Stethoscope",
        children: [
          { name: "Doctor Earnings", path: "/app/hr/payroll/doctor-earnings", icon: "Receipt" },
          { name: "Wallet Balances", path: "/app/hr/payroll/wallet-balances", icon: "Wallet" },
          { name: "Daily Commissions", path: "/app/hr/payroll/daily-commissions", icon: "TrendingUp" },
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
      { 
        name: "My Work", 
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
    ]
  },

  // ==================== INVENTORY / STORE ====================
  
  store_manager: {
    items: [
      { name: "Dashboard", path: "/app/inventory", icon: "LayoutDashboard" },
      { 
        name: "Receiving", 
        path: "", 
        icon: "PackageCheck",
        children: [
          { name: "GRN", path: "/app/inventory/grn", icon: "PackageCheck" },
          { name: "Put-Away Tasks", path: "/app/inventory/putaway", icon: "ArrowDownToLine" },
        ]
      },
      { 
        name: "Storage", 
        path: "", 
        icon: "MapPin",
        children: [
          { name: "Zones", path: "/app/inventory/warehouse/zones", icon: "Map" },
          { name: "Bins", path: "/app/inventory/warehouse/bins", icon: "Grid3x3" },
          { name: "Storage Map", path: "/app/inventory/warehouse/map", icon: "LayoutGrid" },
        ]
      },
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
        name: "Picking & Packing", 
        path: "", 
        icon: "ClipboardList",
        children: [
          { name: "Pick Lists", path: "/app/inventory/picking", icon: "ClipboardCheck" },
          { name: "Packing Slips", path: "/app/inventory/packing", icon: "Package" },
          { name: "Picking Dashboard", path: "/app/inventory/picking/dashboard", icon: "BarChart3" },
        ]
      },
      { 
        name: "Shipping", 
        path: "", 
        icon: "Truck",
        children: [
          { name: "Shipments", path: "/app/inventory/shipping", icon: "Truck" },
          { name: "Dispatch Dashboard", path: "/app/inventory/shipping/dashboard", icon: "BarChart3" },
        ]
      },
      { 
        name: "Procurement", 
        path: "", 
        icon: "Boxes",
        children: [
          { name: "Purchase Orders", path: "/app/inventory/purchase-orders", icon: "FileEdit" },
          { name: "Vendors", path: "/app/inventory/vendors", icon: "Store" },
        ]
      },
      { 
        name: "Transfers", 
        path: "", 
        icon: "ArrowLeftRight",
        children: [
          { name: "Requisitions", path: "/app/inventory/requisitions", icon: "FileText" },
          { name: "Store Transfers", path: "/app/inventory/transfers", icon: "ArrowLeftRight" },
        ]
      },
      { name: "Reports", path: "/app/inventory/reports", icon: "BarChart3" },
      { name: "Barcode Labels", path: "/app/inventory/barcode-labels", icon: "Tag" },
      {
        name: "Warehouse Settings",
        path: "",
        icon: "Warehouse",
        children: [
          { name: "All Warehouses", path: "/app/inventory/stores", icon: "List" },
          { name: "Create Warehouse", path: "/app/inventory/stores/new", icon: "Plus" },
        ]
      },
      { 
        name: "My Work",
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
    ]
  },

  // ==================== WAREHOUSE ====================

  warehouse_admin: {
    items: [
      { name: "Dashboard", path: "/app/inventory", icon: "LayoutDashboard" },
      { 
        name: "Receiving", 
        path: "", 
        icon: "PackageCheck",
        children: [
          { name: "GRN", path: "/app/inventory/grn", icon: "PackageCheck" },
          { name: "Put-Away Tasks", path: "/app/inventory/putaway", icon: "ArrowDownToLine" },
        ]
      },
      { 
        name: "Storage", 
        path: "", 
        icon: "MapPin",
        children: [
          { name: "Zones", path: "/app/inventory/warehouse/zones", icon: "Map" },
          { name: "Bins", path: "/app/inventory/warehouse/bins", icon: "Grid3x3" },
          { name: "Storage Map", path: "/app/inventory/warehouse/map", icon: "LayoutGrid" },
        ]
      },
      { 
        name: "Stock", 
        path: "", 
        icon: "Package",
        children: [
          { name: "Items", path: "/app/inventory/items", icon: "Box" },
          { name: "Stock Levels", path: "/app/inventory/stock", icon: "ListTree" },
          { name: "Stock Adjustments", path: "/app/inventory/stock-adjustments", icon: "Sliders" },
          { name: "Categories", path: "/app/inventory/categories", icon: "FolderTree" },
        ]
      },
      { 
        name: "Picking & Packing", 
        path: "", 
        icon: "ClipboardList",
        children: [
          { name: "New Pick List", path: "/app/inventory/picking/new", icon: "Plus" },
          { name: "Pick Lists", path: "/app/inventory/picking", icon: "ClipboardCheck" },
          { name: "New Packing Slip", path: "/app/inventory/packing/new", icon: "Plus" },
          { name: "Packing Slips", path: "/app/inventory/packing", icon: "Package" },
          { name: "Picking Dashboard", path: "/app/inventory/picking/dashboard", icon: "BarChart3" },
        ]
      },
      { 
        name: "Shipping", 
        path: "", 
        icon: "Truck",
        children: [
          { name: "Shipments", path: "/app/inventory/shipping", icon: "Truck" },
          { name: "Dispatch Dashboard", path: "/app/inventory/shipping/dashboard", icon: "BarChart3" },
        ]
      },
      { 
        name: "Procurement", 
        path: "", 
        icon: "Boxes",
        children: [
          { name: "Purchase Requests", path: "/app/inventory/purchase-requests", icon: "FileText" },
          { name: "Purchase Orders", path: "/app/inventory/purchase-orders", icon: "FileEdit" },
          { name: "Vendors", path: "/app/inventory/vendors", icon: "Store" },
          { name: "Reorder Alerts", path: "/app/inventory/reorder-alerts", icon: "AlertTriangle" },
        ]
      },
      { 
        name: "Transfers", 
        path: "", 
        icon: "ArrowLeftRight",
        children: [
          { name: "Requisitions", path: "/app/inventory/requisitions", icon: "FileText" },
          { name: "Store Transfers", path: "/app/inventory/transfers", icon: "ArrowLeftRight" },
        ]
      },
      { name: "Reports", path: "/app/inventory/reports", icon: "BarChart3" },
      { name: "Barcode Labels", path: "/app/inventory/barcode-labels", icon: "Tag" },
      { name: "Integrations", path: "/app/inventory/integrations", icon: "Webhook" },
      {
        name: "Warehouse Settings",
        path: "",
        icon: "Settings",
        children: [
          { name: "Warehouses", path: "/app/inventory/stores", icon: "Warehouse" },
          { name: "Create Warehouse", path: "/app/inventory/stores/new", icon: "Plus" },
        ]
      },
      { 
        name: "HR & Staff",
        path: "", 
        icon: "Users2",
        children: [
          { name: "Dashboard", path: "/app/hr", icon: "LayoutDashboard" },
          { name: "Employees", path: "/app/hr/employees", icon: "Users" },
          { name: "Add Employee", path: "/app/hr/employees/new", icon: "UserPlus" },
          { name: "Attendance", path: "/app/hr/attendance", icon: "Clock" },
          { name: "Leaves", path: "/app/hr/leaves", icon: "CalendarDays" },
          { name: "Payroll", path: "/app/hr/payroll", icon: "DollarSign" },
          { name: "Shifts", path: "/app/hr/setup/shifts", icon: "CalendarClock" },
          { name: "Reports", path: "/app/hr/reports", icon: "BarChart3" },
        ]
      },
      { 
        name: "Finance",
        path: "", 
        icon: "Landmark",
        children: [
          { name: "Dashboard", path: "/app/accounts", icon: "LayoutDashboard" },
          { name: "Chart of Accounts", path: "/app/accounts/chart-of-accounts", icon: "ListTree" },
          { name: "Journal Entries", path: "/app/accounts/journal-entries", icon: "BookOpen" },
          { name: "Vendor Payments", path: "/app/accounts/vendor-payments", icon: "CreditCard" },
          { name: "Bank Accounts", path: "/app/accounts/bank-accounts", icon: "Building" },
          { name: "Reports", path: "/app/accounts/reports", icon: "PieChart" },
        ]
      },
      { 
        name: "My Work",
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
      { 
        name: "Settings",
        path: "", 
        icon: "Settings",
        children: [
          { name: "Organization", path: "/app/settings/organization", icon: "Building2" },
          { name: "Users", path: "/app/settings/users", icon: "Users" },
          { name: "Roles & Permissions", path: "/app/settings/roles", icon: "Shield" },
        ]
      },
    ]
  },

  warehouse_user: {
    items: [
      { name: "Dashboard", path: "/app/inventory", icon: "LayoutDashboard" },
      { 
        name: "Receiving", 
        path: "", 
        icon: "PackageCheck",
        children: [
          { name: "GRN", path: "/app/inventory/grn", icon: "PackageCheck" },
          { name: "Put-Away Tasks", path: "/app/inventory/putaway", icon: "ArrowDownToLine" },
        ]
      },
      { 
        name: "Storage", 
        path: "", 
        icon: "MapPin",
        children: [
          { name: "Zones", path: "/app/inventory/warehouse/zones", icon: "Map" },
          { name: "Bins", path: "/app/inventory/warehouse/bins", icon: "Grid3x3" },
          { name: "Storage Map", path: "/app/inventory/warehouse/map", icon: "LayoutGrid" },
        ]
      },
      { 
        name: "Stock", 
        path: "", 
        icon: "Package",
        children: [
          { name: "Items", path: "/app/inventory/items", icon: "Box" },
          { name: "Stock Levels", path: "/app/inventory/stock", icon: "ListTree" },
        ]
      },
      { 
        name: "Picking & Packing", 
        path: "", 
        icon: "ClipboardList",
        children: [
          { name: "Pick Lists", path: "/app/inventory/picking", icon: "ClipboardCheck" },
          { name: "Packing Slips", path: "/app/inventory/packing", icon: "Package" },
        ]
      },
      { 
        name: "Shipping", 
        path: "", 
        icon: "Truck",
        children: [
          { name: "Shipments", path: "/app/inventory/shipping", icon: "Truck" },
        ]
      },
      { 
        name: "Transfers", 
        path: "", 
        icon: "ArrowLeftRight",
        children: [
          { name: "Requisitions", path: "/app/inventory/requisitions", icon: "FileText" },
          { name: "Store Transfers", path: "/app/inventory/transfers", icon: "ArrowLeftRight" },
        ]
      },
      { 
        name: "My Work",
        path: "", 
        icon: "Briefcase",
        children: [
          { name: "My Schedule", path: "/app/my-schedule", icon: "Calendar" },
          { name: "My Attendance", path: "/app/my-attendance", icon: "Clock" },
          { name: "My Leaves", path: "/app/my-leaves", icon: "CalendarOff" },
          { name: "My Payslips", path: "/app/my-payslips", icon: "FileText" },
        ]
      },
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
    'surgeon',        // OT roles before generic doctor
    'anesthetist',    // OT roles before generic doctor
    'doctor',
    'nurse',
    'ipd_nurse',
    'ot_nurse',       // OT nurse role
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
    'warehouse_admin',
    'warehouse_user',
  ];

  for (const role of rolePriority) {
    if (roles.includes(role)) {
      return role;
    }
  }
  
  return roles[0] || 'default';
};

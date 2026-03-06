import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Pill,
  Receipt,
  BarChart3,
  Settings,
  Shield,
  UserPlus,
  CalendarDays,
  ClipboardList,
  ListOrdered,
  Package,
  AlertTriangle,
  FileText,
  FilePlus,
  CreditCard,
  DollarSign,
  Activity,
  UserCog,
  Building2,
  Palette,
  Building,
  Cog,
  TrendingUp,
  ConciergeBell,
  CalendarClock,
  CalendarPlus,
  HeartPulse,
  TestTube,
  FlaskConical,
  ListChecks,
  FileInput,
  FileSpreadsheet,
  Siren,
  Ambulance,
  Gauge,
  Monitor,
  Bed,
  Droplet,
  Scissors,
  TestTubes,
  Heart,
  Box,
  FolderTree,
  PackageCheck,
  Boxes,
  FileEdit,
  Warehouse,
  Store,
  Clock,
  Tags,
  Calculator,
  ListTree,
  BookOpen,
  Ticket,
  PiggyBank,
  Folders,
  BedDouble,
  Scan,
  Landmark,
  PieChart,
  Search,
  UserCheck,
  Camera,
  Scale,
  ArrowLeftRight,
  ClipboardCheck,
  Briefcase,
  Gift,
  CalendarCheck,
  Apple,
  Sparkles,
  History,
  GitBranch,
  Puzzle,
  ScrollText,
  Headphones,
  List,
  Percent,
  Award,
  GraduationCap,
  DoorOpen,
  UtensilsCrossed,
  Plus,
  Settings2,
  // HR icons
  UserCircle,
  Table2,
  Inbox,
  PlayCircle,
  BadgeCheck,
  Tag,
  CheckSquare,
  Fingerprint,
  Book,
  CalendarX,
  CalendarOff,
  Edit,
  ShieldCheck,
  Wallet,
  Syringe,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  // Added missing icons
  ArrowRightLeft,
  Banknote,
  BarChart,
  Bell,
  FileCode,
  FolderOpen,
  Footprints,
  HeartHandshake,
  Layers,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Network,
  PackagePlus,
  Radio,
  Server,
  Tv,
  ShoppingCart,
  RotateCcw,
  ArrowDownToLine,
  MapPin,
  Map as MapIcon,
  Grid3x3,
  Truck,
  Webhook,
  Users2,
  Sliders,
  Anchor,
  ShieldAlert,
  CloudUpload,
  FileCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_SIDEBAR_CONFIG, getPrimaryRole } from "@/config/role-sidebars";
import { filterSidebarByFacilityType } from "@/lib/facility-type-filter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";

// Maps hardcoded sidebar names → translation keys
export const SIDEBAR_NAME_TO_KEY: Record<string, TranslationKey> = {
  // Core navigation
  "Dashboard": "nav.dashboard",
  "Patients": "nav.patients",
  "Appointments": "nav.appointments",
  "Billing": "nav.billing",
  "Pharmacy": "nav.pharmacy",
  "Laboratory": "nav.lab",
  "IPD": "nav.ipd",
  "OPD": "nav.opd",
  "HR": "nav.hr",
  "Inventory": "nav.inventory",
  "Settings": "nav.settings",
  "Reports": "nav.reports",
  "Emergency": "nav.emergency",
  // Database menu item names (slightly different from static configs)
  "Reception": "nav.reception",
  "Inpatient (IPD)": "nav.inpatientIpd",
  "Operation Theatre": "nav.operationTheatre",
  "Blood Bank": "nav.bloodBank",
  "Accounts & Finance": "nav.accountsFinance",
  // Admin/org navigation
  "Branches": "nav.branches",
  "Users & Staff": "nav.usersStaff",
  "Organization": "nav.organization",
  "Services": "nav.services",
  "Configuration": "nav.configuration",
  "Warehouse Management": "nav.warehouseManagement",
  "HR & Staff": "nav.hrStaff",
  "Accounts": "nav.accounts",
  "All Branches": "nav.allBranches",
  "Add Branch": "nav.addBranch",
  "All Users": "nav.allUsers",
  "Roles & Permissions": "nav.rolesPermissions",
  "Invite Users": "nav.inviteUsers",
  "Profile": "nav.profile",
  "Modules": "nav.modules",
  "All Services": "nav.allServices",
  "Categories": "nav.categories",
  "Consultations": "nav.consultations",
  "Lab Tests": "nav.labTests",
  "Radiology": "nav.radiology",
  "Rooms & Beds": "nav.roomsBeds",
  "Payment Methods": "nav.paymentMethods",
  "Tax Settings": "nav.taxSettings",
  "Receipt Templates": "nav.receiptTemplates",
  "Purchase Orders": "nav.purchaseOrders",
  "Vendors": "nav.vendors",
  "Employees": "nav.employees",
  "Attendance": "nav.attendance",
  "Leaves": "nav.leaves",
  "Payroll": "nav.payroll",
  "Invoices": "nav.invoices",
  "Payments": "nav.payments",
  "My Work": "nav.myWork",
  "My Schedule": "nav.mySchedule",
  "My Wallet": "nav.myWallet",
  "My Attendance": "nav.myAttendance",
  "My Leaves": "nav.myLeaves",
  "My Payslips": "nav.myPayslips",
  "Patient Queue": "nav.patientQueue",
  "Today's Queue": "nav.todaysQueue",
  "My Calendar": "nav.myCalendar",
  "Triage": "nav.triage",
  "Vitals Entry": "nav.vitalsEntry",
  "OPD Orders": "nav.opdOrders",
  "History": "nav.history",
  "All Appointments": "nav.allAppointments",
  "Chart of Accounts": "nav.chartOfAccounts",
  "Journal Entries": "nav.journalEntries",
  "Accounts Payable": "nav.accountsPayable",
  "Dispensing": "nav.dispensing",
  "Procurement": "nav.procurement",
  "Warehouses": "nav.warehouses",
  "Setup": "nav.setup",
  "Lab Work": "nav.labWork",
  "Reporting": "nav.reporting",
  "PACS": "nav.pacs",
  "Donors": "nav.donors",
  "Blood Work": "nav.bloodWork",
  "Surgeries": "nav.surgeries",
  "Pre-Op": "nav.preOp",
  "Patient Care": "nav.patientCare",
  "Ward Management": "nav.wardManagement",
  "Imaging": "nav.imaging",
  "Assessments": "nav.assessments",
  "Beds & Rooms": "nav.bedsRooms",
  "My Patients": "nav.myPatients",
  "All Patients": "nav.allPatients",
  "Organizations": "nav.organizations",
  "Platform Users": "nav.platformUsers",
  "Billing & Plans": "nav.billingPlans",
  "System": "nav.system",
  "Support": "nav.support",
  // Sub-items: org_admin / branch
  "Branch Branding": "nav.branchBranding",
  "Branch Roles": "nav.branchRoles",
  "Branding & Logo": "nav.brandingLogo",
  "Audit Logs": "nav.auditLogs",
  "OPD Departments": "nav.opdDepartments",
  "Specializations": "nav.specializations",
  "Qualifications": "nav.qualifications",
  "Items": "nav.items",
  "Stock Levels": "nav.stockLevels",
  "GRN": "nav.grn",
  "Requisitions": "nav.requisitions",
  "All Warehouses": "nav.allWarehouses",
  "Create Warehouse": "nav.createWarehouse",
  "Store Transfers": "nav.storeTransfers",
  "Subscription Plans": "nav.subscriptionPlans",
  "Organization Billing": "nav.organizationBilling",
  "Platform Settings": "nav.platformSettings",
  "Module Catalog": "nav.moduleCatalog",
  "System Health": "nav.systemHealth",
  "Support Tickets": "nav.supportTickets",
  "All Organizations": "nav.allOrganizations",
  "Add Organization": "nav.addOrganization",
  "Branch Analytics": "nav.branchAnalytics",
  "Role Management": "nav.roleManagement",
  // Sub-items: IPD / nursing
  "Nursing": "nav.nursing",
  "Recovery": "nav.recovery",
  "Beds": "nav.beds",
  "Wards": "nav.wards",
  "Housekeeping": "nav.housekeeping",
  "Ward Rounds": "nav.wardRounds",
  "Vitals": "nav.vitals",
  "Nursing Notes": "nav.nursingNotes",
  "Medication Chart": "nav.medicationChart",
  "IPD Patients": "nav.ipdPatients",
  "Bed Availability": "nav.bedAvailability",
  "Ward View": "nav.wardView",
  "New Admission": "nav.newAdmission",
  "Active Admissions": "nav.activeAdmissions",
  "Request Discharge": "nav.requestDischarge",
  // Sub-items: OT
  "OT Queue": "nav.otQueue",
  "OT Charges": "nav.otCharges",
  "OT Rooms": "nav.otRooms",
  "OT Roster": "nav.otRoster",
  "Today's Schedule": "nav.todaysSchedule",
  "All Surgeries": "nav.allSurgeries",
  "Surgery Requests": "nav.surgeryRequests",
  "Schedule Surgery": "nav.scheduleSurgery",
  "PACU": "nav.pacu",
  "Intra-Op Notes": "nav.intraNotes",
  "Instrument Count": "nav.instrumentCount",
  "Surgery List": "nav.surgeryList",
  "Medication Queue": "nav.medicationQueue",
  "Medication Charges": "nav.medicationCharges",
  "Pre-Anesthesia": "nav.preAnesthesia",
  // Sub-items: Finance / Accounts
  "Accounting": "nav.accounting",
  "Receivables": "nav.receivables",
  "Payables": "nav.payables",
  "Banking": "nav.banking",
  "General Ledger": "nav.generalLedger",
  "Outstanding": "nav.outstanding",
  "Vendor Bills": "nav.vendorBills",
  "Vendor Payments": "nav.vendorPayments",
  "Bank Accounts": "nav.bankAccounts",
  "Budgets": "nav.budgets",
  "Financial Reports": "nav.financialReports",
  "Trial Balance": "nav.trialBalance",
  "Profit & Loss": "nav.profitLoss",
  "Balance Sheet": "nav.balanceSheet",
  "Cash Flow": "nav.cashFlow",
  "Account Types": "nav.accountTypes",
  // Sub-items: Pharmacy / Inventory
  "Stock": "nav.stock",
  "POS Terminal": "nav.posTerminal",
  "Transactions": "nav.transactions",
  "Sessions": "nav.sessions",
  "Returns": "nav.returns",
  "Medicines": "nav.medicines",
  "Add Stock": "nav.addStock",
  "Stock Alerts": "nav.stockAlerts",
  "Movements": "nav.movements",
  "Suppliers": "nav.suppliers",
  "Add Vendor": "nav.addVendor",
  "My Warehouses": "nav.myWarehouses",
  "Rack Assignments": "nav.rackAssignments",
  // Sub-items: Lab
  "Sample Queue": "nav.sampleQueue",
  "Test Templates": "nav.testTemplates",
  // Sub-items: Radiology
  "Worklist": "nav.worklist",
  "Verification": "nav.verification",
  "Archive": "nav.archive",
  "Studies": "nav.studies",
  "Modalities": "nav.modalities",
  "Procedures": "nav.procedures",
  "Report Templates": "nav.reportTemplates",
  "Schedule": "nav.schedule",
  "Setup Guide": "nav.setupGuide",
  // Sub-items: Blood Bank
  "Donor List": "nav.donorList",
  "Register Donor": "nav.registerDonor",
  "Donations": "nav.donations",
  "Cross Match": "nav.crossMatch",
  "Requests": "nav.requests",
  "Transfusions": "nav.transfusions",
  "ER Triage": "nav.erTriage",
  // Sub-items: HR
  "Leave Management": "nav.leaveManagement",
  "Recruitment": "nav.recruitment",
  "Exit Management": "nav.exitManagement",
  "Compliance": "nav.compliance",
  "Directory": "nav.directory",
  "Add Employee": "nav.addEmployee",
  "Doctors": "nav.doctors",
  "Nurses": "nav.nurses",
  "Paramedical Staff": "nav.paramedicalStaff",
  "Support Staff": "nav.supportStaff",
  "Visiting Doctors": "nav.visitingDoctors",
  "Daily Attendance": "nav.dailyAttendance",
  "Attendance Sheet": "nav.attendanceSheet",
  "Biometric Setup": "nav.biometricSetup",
  "Duty Roster": "nav.dutyRoster",
  "Emergency Roster": "nav.emergencyRoster",
  "On-Call Schedule": "nav.onCallSchedule",
  "Publish Roster": "nav.publishRoster",
  "Roster Reports": "nav.rosterReports",
  "Overtime": "nav.overtime",
  "Leave Requests": "nav.leaveRequests",
  "Leave Balances": "nav.leaveBalances",
  "Process Payroll": "nav.processPayroll",
  "Employee Salaries": "nav.employeeSalaries",
  "Doctor Compensation": "nav.doctorCompensation",
  "Doctor Earnings": "nav.doctorEarnings",
  "Wallet Balances": "nav.walletBalances",
  "Loans & Advances": "nav.loansAdvances",
  "Payslips": "nav.payslips",
  "Bank Sheets": "nav.bankSheets",
  "Job Openings": "nav.jobOpenings",
  "Applications": "nav.applications",
  "Resignations": "nav.resignations",
  "Clearance": "nav.clearance",
  "Final Settlement": "nav.finalSettlement",
  "Exit Interviews": "nav.exitInterviews",
  "Medical Fitness": "nav.medicalFitness",
  "Vaccinations": "nav.vaccinations",
  "Disciplinary": "nav.disciplinary",
  "Departments": "nav.departments",
  "Designations": "nav.designations",
  "Employee Categories": "nav.employeeCategories",
  "Leave Types": "nav.leaveTypes",
  "Shifts": "nav.shifts",
  "Holidays": "nav.holidays",
  // Sub-items: Receptionist
  "Book Appointment": "nav.bookAppointment",
  "Queue": "nav.queue",
  "OPD Checkout": "nav.opdCheckout",
  "New Invoice": "nav.newInvoice",

  // Sub-items: Reports
  "Organization Reports": "nav.organizationReports",
  "Branch Comparison": "nav.branchComparison",
  "Day-End Summary": "nav.dayEndSummary",

  // Donation Management
  "Donation Management": "nav.donationManagement",
  "Record Donation": "nav.recordDonation",
  "Recurring Schedules": "nav.recurringSchedules",

  // Misc
  "Search": "nav.searchNav",

  // Warehouse / Inventory sub-groups & items
  "Stock Management": "nav.stockManagement",
  "Warehouse Operations": "nav.warehouseOperations",
  "Picking & Packing": "nav.pickingPacking",
  "Shipping": "nav.shipping",
  "Barcode & Integrations": "nav.barcodeIntegrations",
  "Storage Map": "nav.storageMap",
  "Zones": "nav.zones",
  "Bins": "nav.bins",
  "Bin Assignments": "nav.binAssignments",
  "Put-Away Worklist": "nav.putAwayWorklist",
  "Picking Dashboard": "nav.pickingDashboard",
  "Pick Lists": "nav.pickLists",
  "Packing Slips": "nav.packingSlips",
  "Dispatch Dashboard": "nav.dispatchDashboard",
  "Shipments": "nav.shipments",
  "Barcode Labels": "nav.barcodeLabels",
  "Barcode Scanner": "nav.barcodeScanner",
  "API Keys": "nav.apiKeys",
  "Stock Adjustments": "nav.stockAdjustments",
  "Reorder Alerts": "nav.reorderAlerts",
  "Purchase Requisitions": "nav.purchaseRequisitions",
  "Cycle Counts": "nav.cycleCounts",
  "Return to Vendor": "nav.returnToVendor",

  // Missing DB menu item names
  "Walk-in Patient": "nav.walkInPatient",
  "Schedule Appointment": "nav.scheduleAppointment",
  "Today's Appointments": "nav.todaysAppointments",
  "Walk-in Registration": "nav.walkInRegistration",
  "Accounts Receivable": "nav.accountsReceivable",
  "Activity Log": "nav.activityLog",
  "Admission History": "nav.admissionHistory",
  "AI Assistant": "nav.aiAssistant",
  "Ambulance Alerts": "nav.ambulanceAlerts",
  "Appointment Reports": "nav.appointmentReports",
  "Attendance Reports": "nav.attendanceReports",
  "Bank & Cash": "nav.bankAndCash",
  "Bed Features": "nav.bedFeatures",
  "Bed Management": "nav.bedManagement",
  "Bed Map": "nav.bedMap",
  "Bed Transfers": "nav.bedTransfers",
  "Bed Types": "nav.bedTypes",
  "Billing Reports": "nav.billingReports",
  "Biometric Devices": "nav.biometricDevices",
  "Birth Records": "nav.birthRecords",
  "Blood Requests": "nav.bloodRequests",
  "Budgets & Fiscal Years": "nav.budgetsFiscalYears",
  "Care Plans": "nav.carePlans",
  "Claims": "nav.claims",
  "Claims Report": "nav.claimsReport",
  "Clinic": "nav.clinic",
  "Clinic Reports": "nav.clinicReports",
  "Clinical Config": "nav.clinicalConfig",
  "Corrections": "nav.corrections",
  "Cross Matching": "nav.crossMatching",
  "Customize": "nav.customize",
  "Daily Closing": "nav.dailyClosing",
  "Daily Rounds": "nav.dailyRounds",
  "Death Records": "nav.deathRecords",
  "Diet Management": "nav.dietManagement",
  "Diet Types": "nav.dietTypes",
  "Discharge": "nav.discharge",
  "Discharge Summaries": "nav.dischargeSummaries",
  "Doctor Dashboard": "nav.doctorDashboard",
  "Doctor Fees": "nav.doctorFees",
  "Doctor Reports": "nav.doctorReports",
  "eMAR": "nav.emar",
  "ER Dashboard": "nav.erDashboard",
  "ER Display Setup": "nav.erDisplaySetup",
  "ER Queue": "nav.erQueue",
  "ER Reports": "nav.erReports",
  "Fee Templates": "nav.feeTemplates",
  "Final Billing": "nav.finalBilling",
  "Floors & Buildings": "nav.floorsBuildings",
  "General": "nav.general",
  "Goods Receipt": "nav.goodsReceipt",
  "HR Config": "nav.hrConfig",
  "HR Dashboard": "nav.hrDashboard",
  "HR Reports": "nav.hrReports",
  "HR Setup": "nav.hrSetup",
  "Insurance & Claims": "nav.insuranceClaims",
  "Insurance Companies": "nav.insuranceCompanies",
  "Insurance Plans": "nav.insurancePlans",
  "Inventory Reports": "nav.inventoryReports",
  "IPD Billing": "nav.ipdBilling",
  "IPD Charges": "nav.ipdCharges",
  "IPD Config": "nav.ipdConfig",
  "IPD Dashboard": "nav.ipdDashboard",
  "IPD Reports": "nav.ipdReports",
  "IPD Setup": "nav.ipdSetup",
  "Item Catalog": "nav.itemCatalog",
  "Kiosk Management": "nav.kioskManagement",
  "Kiosk Sessions": "nav.kioskSessions",
  "Lab Analyzers": "nav.labAnalyzers",
  "Lab Dashboard": "nav.labDashboard",
  "Lab Queue": "nav.labQueue",
  "Lab Reports": "nav.labReports",
  "Lab Settings": "nav.labSettings",
  "Leave Calendar": "nav.leaveCalendar",
  "Medical Licenses": "nav.medicalLicenses",
  "New Registration": "nav.newRegistration",
  "New Onboarding": "nav.newOnboarding",
  "Notifications": "nav.notifications",
  "Nurse Station": "nav.nurseStation",
  "Nursing Station": "nav.nursingStation",
  "OPD Dashboard": "nav.opdDashboard",
  "Pending Checkout": "nav.pendingCheckout",
  "Gynecology": "nav.gynecology",
  "Orders": "nav.orders",
  "OT Dashboard": "nav.otDashboard",
  "OT Medication Charges": "nav.otMedicationCharges",
  "PACS Servers": "nav.pacsServers",
  "PACS Settings": "nav.pacsSettings",
  "PACS Studies": "nav.pacsStudies",
  "Patient Config": "nav.patientConfig",
  "Patient Directory": "nav.patientDirectory",
  "Patient Reports": "nav.patientReports",
  "Payroll Runs": "nav.payrollRuns",
  "Pending Approvals": "nav.pendingApprovals",
  "Pending Discharge": "nav.pendingDischarge",
  "Pharmacy Reports": "nav.pharmacyReports",
  "Platform Stats": "nav.platformStats",
  "POS Sessions": "nav.posSessions",
  "Prescription Queue": "nav.prescriptionQueue",
  "Queue Control": "nav.queueControl",
  "Queue Displays": "nav.queueDisplays",
  "Records": "nav.records",
  "Recovery (PACU)": "nav.recoveryPacu",
  "Register New": "nav.registerNew",
  "Reports Hub": "nav.reportsHub",
  "Result Entry": "nav.resultEntry",
  "Salary Components": "nav.salaryComponents",
  "Service Types": "nav.serviceTypes",
  "SMS Gateway": "nav.smsGateway",
  "Stock Entry": "nav.stockEntry",
  "Stock Movements": "nav.stockMovements",
  "Super Admin": "nav.superAdmin",
  "Surgeon Fee Templates": "nav.surgeonFeeTemplates",
  "Surgery Schedule": "nav.surgerySchedule",
  "System Settings": "nav.systemSettings",
  "Tax Slabs": "nav.taxSlabs",
  "Technician Worklist": "nav.technicianWorklist",
  "Test Categories": "nav.testCategories",
  "Token Counter": "nav.tokenCounter",
  "Token Display Setup": "nav.tokenDisplaySetup",
  "Token Kiosk": "nav.tokenKiosk",
  "Token Kiosk Setup": "nav.tokenKioskSetup",
  "Token Queue": "nav.tokenQueue",
  "Triage Station": "nav.triageStation",
  "Users & Roles": "nav.usersRoles",
  "Vitals Chart": "nav.vitalsChart",
  "Ward Types": "nav.wardTypes",
  "Shift Handover": "nav.shiftHandover",
  "Safety Incidents": "nav.safetyIncidents",
  "Warehouse Orders": "nav.warehouseOrders",
  "Dock Schedule": "nav.dockSchedule",
  "Gate Log": "nav.gateLog",
  "Expense Management": "nav.expenseManagement",
  "Insurance": "nav.insurance",
  "Manual Insurance": "nav.manualInsurance",
  "NPHIES": "nav.nphies",
  "NPHIES Settings": "nav.nphiesSettings",
  "NPHIES Analytics": "nav.nphiesAnalytics",
  "Eligibility Checks": "nav.eligibilityChecks",
  "Pre-Authorizations": "nav.preAuthorizations",
};


const ADMIN_ROLES = ["super_admin", "org_admin", "branch_admin"];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Pill,
  Receipt,
  BarChart3,
  Settings,
  Shield,
  UserPlus,
  CalendarDays,
  ClipboardList,
  ListOrdered,
  Package,
  AlertTriangle,
  FileText,
  FilePlus,
  CreditCard,
  DollarSign,
  Activity,
  UserCog,
  Building2,
  Palette,
  Building,
  Cog,
  TrendingUp,
  ConciergeBell,
  CalendarClock,
  CalendarPlus,
  HeartPulse,
  TestTube,
  FlaskConical,
  ListChecks,
  FileInput,
  FileSpreadsheet,
  Siren,
  Ambulance,
  Gauge,
  Monitor,
  Bed,
  Droplet,
  Scissors,
  TestTubes,
  Heart,
  Box,
  FolderTree,
  PackageCheck,
  Boxes,
  FileEdit,
  Warehouse,
  Store,
  Clock,
  Tags,
  Calculator,
  ListTree,
  BookOpen,
  Ticket,
  PiggyBank,
  Folders,
  BedDouble,
  Scan,
  Landmark,
  PieChart,
  Search,
  UserCheck,
  Camera,
  Scale,
  ArrowLeftRight,
  ClipboardCheck,
  Briefcase,
  Gift,
  CalendarCheck,
  Apple,
  Sparkles,
  History,
  GitBranch,
  Puzzle,
  ScrollText,
  Headphones,
  List,
  Percent,
  Award,
  GraduationCap,
  DoorOpen,
  UtensilsCrossed,
  Plus,
  Settings2,
  // HR icons
  UserCircle,
  Table2,
  Inbox,
  PlayCircle,
  BadgeCheck,
  Tag,
  CheckSquare,
  Fingerprint,
  Book,
  CalendarX,
  CalendarOff,
  Edit,
  ShieldCheck,
  Wallet,
  Syringe,
  // Added missing icons
  ArrowRightLeft,
  Banknote,
  BarChart,
  Bell,
  FileCode,
  FolderOpen,
  Footprints,
  HeartHandshake,
  Layers,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Network,
  PackagePlus,
  Radio,
  Server,
  Tv,
  ShoppingCart,
  RotateCcw,
  ArrowDownToLine,
  MapPin,
  Map: MapIcon,
  Grid3x3,
  Truck,
  Webhook,
  Users2,
  Sliders,
  Anchor,
  ShieldAlert,
  CloudUpload,
  FileCheck,
};

interface DynamicSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  showDesktopToggle?: boolean;
}

// Recursive menu item component for 3-level nesting support
interface RecursiveMenuItemProps {
  item: {
    id: string;
    code: string;
    name: string;
    icon?: string;
    path: string | null;
    children?: RecursiveMenuItemProps['item'][];
  };
  level: number;
  index: number;
  translateName: (name: string) => string;
  isCollapsed: boolean;
  openMenus: string[];
  toggleMenu: (code: string) => void;
  isActive: (path: string | null) => boolean;
  handleNavigation: (path: string | null) => void;
  iconMap: Record<string, React.ComponentType<{ className?: string }>>;
  badgeCounts?: Record<string, number>;
}

const RecursiveMenuItem = ({
  item,
  level,
  index,
  translateName,
  isCollapsed,
  openMenus,
  toggleMenu,
  isActive,
  handleNavigation,
  iconMap,
  badgeCounts = {},
}: RecursiveMenuItemProps) => {
  const IconComponent = item.icon ? iconMap[item.icon] : (level === 0 ? iconMap.LayoutDashboard : null);
  const hasChildren = item.children && item.children.length > 0;
  const menuCode = item.code || `menu-${level}-${index}`;
  const isOpen = openMenus.includes(menuCode);
  const itemIsActive = isActive(item.path);
  const badgeCount = item.path ? badgeCounts[item.path] : undefined;
  const displayName = translateName(item.name);

  // Visual hierarchy based on level - using logical properties for RTL support
  const getLevelStyles = () => {
    const common = {
      iconSize: "h-4 w-4",
      textStyle: "font-medium text-sm",
      hoverBg: "hover:bg-sidebar-accent",
      activeBg: "bg-sidebar-accent",
    };

    switch (level) {
      case 0:
        return { ...common, padding: "ps-3" };
      case 1:
        return { ...common, padding: "ps-8" };
      case 2:
      default:
        return { ...common, padding: "ps-12" };
    }
  };

  const styles = getLevelStyles();

  if (hasChildren) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={() => toggleMenu(menuCode)}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:text-sidebar-accent-foreground",
              styles.hoverBg,
              styles.textStyle,
              isCollapsed && level === 0 && "justify-center px-2",
              styles.padding
            )}
            title={isCollapsed ? displayName : undefined}
          >
            {IconComponent && <IconComponent className={cn(styles.iconSize, "flex-shrink-0")} />}
            {!isCollapsed && (
              <>
                <span className="flex-1 text-start">{displayName}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform opacity-60",
                    isOpen && "rotate-180"
                  )}
                />
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        {!isCollapsed && (
          <CollapsibleContent className="space-y-0.5 mt-0.5 relative z-10">
            {item.children?.map((child, childIndex) => (
              <RecursiveMenuItem
                key={child.id}
                item={child}
                level={level + 1}
                index={childIndex}
                translateName={translateName}
                isCollapsed={isCollapsed}
                openMenus={openMenus}
                toggleMenu={toggleMenu}
                isActive={isActive}
                handleNavigation={handleNavigation}
                iconMap={iconMap}
                badgeCounts={badgeCounts}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={() => handleNavigation(item.path)}
      className={cn(
        "w-full justify-start gap-3 text-sidebar-foreground hover:text-sidebar-accent-foreground relative z-10",
        styles.hoverBg,
        styles.textStyle,
        isCollapsed && level === 0 && "justify-center px-2",
        itemIsActive && cn(styles.activeBg, "text-sidebar-accent-foreground"),
        styles.padding
      )}
      title={isCollapsed ? displayName : undefined}
    >
      {IconComponent && <IconComponent className={cn(styles.iconSize, "flex-shrink-0")} />}
      {!isCollapsed && (
        <>
          <span className="flex-1 text-start">{displayName}</span>
          {badgeCount !== undefined && badgeCount > 0 && (
            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
              {badgeCount > 99 ? "99+" : badgeCount}
            </Badge>
          )}
        </>
      )}
      {isCollapsed && badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-1 end-[-4px] h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
          {badgeCount > 9 ? "9+" : badgeCount}
        </span>
      )}
    </Button>
  );
};


export const DynamicSidebar = ({ isCollapsed = false, onToggle, showDesktopToggle = false }: DynamicSidebarProps) => {
  // Use database menu items for admin roles, static config for operational roles
  const { menuItems: dbMenuItems, isLoading: menuLoading } = useMenuItems();
  const { profile, roles, signOut, isSuperAdmin, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Determine role and sidebar type
  const primaryRole = getPrimaryRole(roles);
  
  // Super admin and org_admin use static configs; only branch_admin uses database menus
  const usesStaticSidebar = isSuperAdmin || primaryRole === 'super_admin' || primaryRole === 'org_admin';
  const usesDatabaseMenus = ADMIN_ROLES.includes(primaryRole) && !usesStaticSidebar;

  // Fetch pending admissions count for badge
  const { data: pendingAdmissionsCount = 0 } = useQuery({
    queryKey: ["pending-admissions-count", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return 0;
      const { count, error } = await supabase
        .from("admissions")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", profile.organization_id)
        .eq("status", "pending");
      if (error) return 0;
      return count || 0;
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Badge counts for specific menu paths
  const badgeCounts: Record<string, number> = {
    "/app/ipd/nursing": pendingAdmissionsCount,
  };

  // Fetch organization facility_type for sidebar filtering
  const { data: orgFacilityType } = useQuery({
    queryKey: ["org-facility-type", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      const { data } = await supabase
        .from("organizations")
        .select("facility_type")
        .eq("id", profile.organization_id)
        .single();
      return (data as any)?.facility_type as string | null;
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get sidebar config based on role, then filter by facility type
  const rawSidebarConfig = usesDatabaseMenus 
    ? null
    : (ROLE_SIDEBAR_CONFIG[primaryRole] || ROLE_SIDEBAR_CONFIG.default);
  
  const sidebarConfig = rawSidebarConfig && orgFacilityType
    ? { items: filterSidebarByFacilityType(rawSidebarConfig.items, orgFacilityType) }
    : rawSidebarConfig;

  // Label overrides for DB menu items based on facility type
  const DB_LABEL_OVERRIDES: Record<string, Record<string, string>> = {
    warehouse: { inventory: "Warehouse" },
  };

  const applyDbLabelOverrides = (items: typeof dbMenuItems): typeof dbMenuItems => {
    const overrides = orgFacilityType ? DB_LABEL_OVERRIDES[orgFacilityType] : null;
    if (!overrides) return items;
    return items.map(item => {
      const override = overrides[item.code?.toLowerCase() || ""];
      const newItem = override ? { ...item, name: override } : item;
      if (newItem.children && newItem.children.length > 0) {
        return { ...newItem, children: applyDbLabelOverrides(newItem.children) };
      }
      return newItem;
    });
  };

  // Convert static config to menu items format for rendering
  const menuItems = usesDatabaseMenus 
    ? applyDbLabelOverrides(dbMenuItems)
    : (sidebarConfig?.items.map((item, index) => ({
        id: `role-menu-${index}`,
        code: item.path || `menu-${index}`,
        name: item.name,
        icon: item.icon,
        path: item.path || null,
        children: item.children?.map((child, childIndex) => ({
          id: `role-menu-${index}-${childIndex}`,
          code: child.path,
          name: child.name,
          icon: child.icon,
          path: child.path,
          children: [],
        })) || [],
      })) || []);

  // Recursively find all parent menus that should be expanded for current route
  const findMenusToExpand = (items: typeof menuItems, currentPath: string): string[] => {
    const menusToOpen: string[] = [];
    
    const checkItem = (item: typeof menuItems[0], parentCodes: string[] = []): boolean => {
      const itemCode = item.code || item.id;
      
      // Check if this item matches current path
      if (item.path && (currentPath === item.path || currentPath.startsWith(item.path + "/"))) {
        menusToOpen.push(...parentCodes);
        return true;
      }
      
      // Check children recursively
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          if (checkItem(child, [...parentCodes, itemCode])) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    items.forEach(item => checkItem(item));
    return menusToOpen;
  };

  // Auto-expand parent menus based on current route
  useEffect(() => {
    const menusToOpen = findMenusToExpand(menuItems, location.pathname);
    
    if (menusToOpen.length > 0) {
      setOpenMenus(prev => {
        const currentSet = new Set(prev);
        const hasNew = menusToOpen.some(code => !currentSet.has(code));
        if (!hasNew) return prev;
        return [...new Set([...prev, ...menusToOpen])];
      });
    }
  }, [location.pathname, menuItems]);

  const toggleMenu = (code: string) => {
    setOpenMenus((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const isActive = (path: string | null) => {
    if (!path) return false;
    // Use exact match to prevent multiple items highlighting
    return location.pathname === path;
  };

  const handleNavigation = (path: string | null) => {
    if (path) {
      navigate(path);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isLoading = authLoading || (usesDatabaseMenus && menuLoading);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-sm font-bold text-sidebar-primary-foreground">24</span>
        </div>
        {!isCollapsed && (
          <span className="text-lg font-semibold text-sidebar-foreground">HealthOS 24</span>
        )}
        
        {/* Mobile close button */}
        {onToggle && !showDesktopToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ms-auto text-white hover:bg-white/20 lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        {/* Desktop collapse toggle */}
        {showDesktopToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "text-white hover:bg-white/20",
              isCollapsed ? "mx-auto" : "ms-auto"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              isRTL ? <PanelRight className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />
            ) : (
              isRTL ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {isLoading ? (
            <div className="space-y-2 px-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <>
          {menuItems.map((item, index) => (
            <RecursiveMenuItem
              key={item.id}
              item={item}
              level={0}
              index={index}
              translateName={(name) => {
                const key = SIDEBAR_NAME_TO_KEY[name];
                return key ? t(key) : name;
              }}
              isCollapsed={isCollapsed}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
              isActive={isActive}
              handleNavigation={handleNavigation}
              iconMap={iconMap}
              badgeCounts={badgeCounts}
            />
          ))}
          </>
          )}
        </nav>
      </ScrollArea>

      {/* User Menu */}
      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}
        >
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
              {profile?.full_name ? getInitials(profile.full_name) : "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {profile?.email || ""}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
        {/* Collapsed sign out */}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="w-full mt-2 text-sidebar-foreground hover:bg-sidebar-accent"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
};
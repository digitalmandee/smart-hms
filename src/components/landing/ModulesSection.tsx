import { useState } from "react";
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  Pill, 
  Receipt, 
  ChevronDown,
  QrCode,
  Bell,
  FileText,
  Package,
  CreditCard,
  BarChart3,
  FlaskConical,
  TestTube,
  Microscope,
  FileCheck,
  UserCog,
  Clock,
  Wallet,
  Store,
  Barcode,
  Percent,
  ReceiptText,
  CalendarCheck,
  CalendarOff,
  FileSpreadsheet,
  FolderOpen,
  TrendingUp,
  Calculator,
  BookOpen,
  FileOutput,
  FileInput,
  Building2,
  PieChart,
  Target,
  ArrowLeftRight,
  // Nursing module icons
  HeartPulse,
  Activity,
  Syringe,
  ClipboardList,
  BedDouble,
  UserRound,
  FileHeart,
  AlertCircle,
  ArrowRightLeft,
  // IPD module icons
  Hotel,
  DoorOpen,
  ClipboardCheck,
  Bed,
  Footprints,
  FileSymlink,
  Timer,
  HeartHandshake,
  // Emergency module icons
  Siren,
  Zap,
  Ambulance,
  HeartCrack,
  Gauge,
  Phone,
  ArrowUpFromLine,
  // OT module icons
  Scissors,
  Clipboard,
  MonitorDot,
  Thermometer,
  CircleCheck,
  AlarmClock,
  // Radiology module icons
  ScanLine,
  Bone,
  Waves,
  CircleDot,
  HardDrive,
  ListTodo,
  FileSearch,
  Share2,
  AlertTriangle,
  // Enhanced module icons
  Shield,
  FileUp,
  History,
  Globe,
  Repeat,
  ListOrdered,
  ShieldCheck,
  Link,
  Lock,
  RotateCcw,
  MessageSquare,
  Building,
  // Inventory module icons
  Warehouse,
  ClipboardPen,
  PackageCheck,
  FileBarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const modules = [
  {
    icon: Users,
    title: "Patient Management",
    description: "Complete patient lifecycle from registration to discharge with QR-based quick check-in",
    color: "from-blue-500 to-cyan-500",
    features: [
      { icon: QrCode, text: "QR code integration for instant patient identification" },
      { icon: FileText, text: "Complete medical history with allergies and chronic conditions" },
      { icon: Bell, text: "Automated SMS/Email appointment reminders" },
      { icon: Users, text: "Custom fields for specialized healthcare data" },
      { icon: Users, text: "Family linkage to connect dependents together" },
      { icon: Shield, text: "Insurance policies and coverage information storage" },
      { icon: FileUp, text: "Document uploads for ID cards, reports, and records" },
      { icon: History, text: "Visual timeline of all visits, tests, and treatments" },
    ],
  },
  {
    icon: Calendar,
    title: "Appointment System",
    description: "Smart scheduling with token-based queue management and automated reminders",
    color: "from-green-500 to-emerald-500",
    features: [
      { icon: Calendar, text: "Doctor-wise availability calendar with time slots" },
      { icon: Bell, text: "Token-based queue system with display board" },
      { icon: FileText, text: "Walk-in, scheduled, and emergency appointment types" },
      { icon: Users, text: "Multi-doctor, multi-branch scheduling support" },
      { icon: Globe, text: "Online self-scheduling via patient portal" },
      { icon: Repeat, text: "Recurring appointments for weekly/monthly visits" },
      { icon: ListOrdered, text: "Automatic waitlist management for cancellations" },
      { icon: BarChart3, text: "Analytics for no-shows, peak hours, utilization" },
    ],
  },
  {
    icon: Stethoscope,
    title: "OPD & Consultations",
    description: "Streamlined clinical documentation with vitals, diagnosis, prescriptions, and lab orders",
    color: "from-purple-500 to-violet-500",
    features: [
      { icon: Stethoscope, text: "Vitals recording with BMI auto-calculation" },
      { icon: FileText, text: "Symptoms, diagnosis, and clinical notes documentation" },
      { icon: Pill, text: "Quick e-prescription with drug database integration" },
      { icon: Calendar, text: "Follow-up scheduling with reminders" },
      { icon: FileCheck, text: "Clinical templates for common conditions" },
      { icon: FlaskConical, text: "Lab and radiology orders from consultation screen" },
      { icon: AlertTriangle, text: "Real-time drug interaction and allergy alerts" },
      { icon: FileOutput, text: "Auto-generated visit summaries for patients" },
    ],
  },
  {
    icon: Siren,
    title: "Emergency & Casualty",
    description: "Rapid triage, trauma tracking, and critical care management for emergency departments",
    color: "from-red-600 to-red-700",
    features: [
      { icon: Gauge, text: "5-level triage system with color-coded priority bands" },
      { icon: HeartCrack, text: "Trauma tracking with injury documentation and scores" },
      { icon: Ambulance, text: "Ambulance arrival alerts with pre-hospital data" },
      { icon: Zap, text: "Emergency admissions with fast-track bed allocation" },
      { icon: Activity, text: "Real-time vitals monitoring with critical alerts" },
      { icon: ArrowUpFromLine, text: "ICU/OT handoff with complete patient status" },
      { icon: Phone, text: "Family notification system for patient status updates" },
      { icon: FileText, text: "Medico-legal documentation and police case tracking" },
    ],
  },
  {
    icon: Scissors,
    title: "Operation Theatre (OT)",
    description: "End-to-end surgical management from scheduling to post-op recovery with anesthesia records",
    color: "from-indigo-600 to-indigo-700",
    features: [
      { icon: Calendar, text: "Surgery scheduling with OT room and team allocation" },
      { icon: Clipboard, text: "Pre-operative assessment checklists and clearances" },
      { icon: Bed, text: "OT booking calendar with equipment availability" },
      { icon: Thermometer, text: "Anesthesia records with vital monitoring logs" },
      { icon: FileText, text: "Intra-operative notes and surgical documentation" },
      { icon: MonitorDot, text: "Post-op recovery tracking with pain scores" },
      { icon: AlarmClock, text: "Surgery duration tracking with delay alerts" },
      { icon: CircleCheck, text: "Surgical safety checklist (WHO standards)" },
    ],
  },
  {
    icon: Hotel,
    title: "IPD (Inpatient) Management",
    description: "Complete inpatient workflow from admission to discharge with bed management and daily rounds",
    color: "from-slate-600 to-slate-700",
    features: [
      { icon: DoorOpen, text: "Patient admission with room/bed allocation workflow" },
      { icon: Bed, text: "Real-time bed availability and occupancy dashboard" },
      { icon: ClipboardCheck, text: "Daily doctor rounds with notes and orders" },
      { icon: Footprints, text: "Patient movement tracking (OT, Radiology, ICU transfer)" },
      { icon: FileSymlink, text: "Treatment plans with care team assignments" },
      { icon: Timer, text: "Length of stay tracking with alerts for extended stays" },
      { icon: HeartHandshake, text: "Discharge planning with summary and follow-up" },
      { icon: Receipt, text: "Running bill generation with room charges and services" },
    ],
  },
  {
    icon: HeartPulse,
    title: "Nursing & Ward Management",
    description: "Comprehensive nursing station for inpatient care with eMAR and real-time vital monitoring",
    color: "from-rose-500 to-pink-500",
    features: [
      { icon: Activity, text: "Real-time BP, pulse, temperature, SpO2 tracking with trends" },
      { icon: Syringe, text: "eMAR with barcode dose verification and timing alerts" },
      { icon: ClipboardList, text: "Shift-based documentation with nursing templates" },
      { icon: BedDouble, text: "Bed allocation, occupancy tracking, and transfers" },
      { icon: UserRound, text: "Scheduled patient rounds with task checklists" },
      { icon: FileHeart, text: "Individualized care plans with treatment goals" },
      { icon: ArrowRightLeft, text: "Digital shift handover with critical patient alerts" },
      { icon: AlertCircle, text: "Critical value alerts, fall risk, and pain assessments" },
    ],
  },
  {
    icon: FlaskConical,
    title: "Laboratory Management",
    description: "Complete lab workflow from test ordering to professional report generation with reference ranges",
    color: "from-violet-500 to-purple-500",
    features: [
      { icon: TestTube, text: "Test ordering with pre-built panels (CBC, LFT, RFT, Lipid)" },
      { icon: Microscope, text: "Sample collection, barcoding, and status tracking" },
      { icon: FileText, text: "Template-based result entry with normal ranges" },
      { icon: FileCheck, text: "Professional reports with abnormal value highlighting" },
      { icon: Barcode, text: "Barcode labels for sample identification and tracking" },
      { icon: ShieldCheck, text: "Quality control tracking and instrument calibration" },
      { icon: Bell, text: "Critical/panic value alerts for immediate attention" },
      { icon: Link, text: "External lab integration for outsourced tests" },
    ],
  },
  {
    icon: ScanLine,
    title: "Radiology & Imaging",
    description: "End-to-end diagnostic imaging from order to report with PACS-compatible storage",
    color: "from-cyan-500 to-sky-500",
    features: [
      { icon: Bone, text: "Digital X-ray requisition directly from consultations" },
      { icon: Waves, text: "Ultrasound scheduling, image capture, and reporting" },
      { icon: CircleDot, text: "CT/MRI scan ordering with protocol selection" },
      { icon: HardDrive, text: "DICOM-compatible image archive (PACS integration)" },
      { icon: ListTodo, text: "Technician worklist with priority-based ordering" },
      { icon: FileSearch, text: "Structured radiologist reporting with templates" },
      { icon: Share2, text: "Secure image sharing with referring physicians" },
      { icon: AlertTriangle, text: "STAT alerts for critical/urgent findings" },
    ],
  },
  {
    icon: Pill,
    title: "Pharmacy Management",
    description: "Complete pharmacy operations from procurement to dispensing with drug interaction checks",
    color: "from-orange-500 to-amber-500",
    features: [
      { icon: Package, text: "Batch tracking with automated expiry alerts" },
      { icon: Bell, text: "Low stock notifications with reorder points" },
      { icon: FileText, text: "Prescription queue for efficient dispensing" },
      { icon: BarChart3, text: "Stock movement and consumption reports" },
      { icon: Building, text: "Supplier management with purchase history" },
      { icon: AlertTriangle, text: "Drug-drug and drug-allergy interaction checks" },
      { icon: RotateCcw, text: "Customer returns and damaged goods handling" },
      { icon: Lock, text: "Controlled substance tracking with documentation" },
    ],
  },
  {
    icon: Store,
    title: "Pharmacy POS",
    description: "Retail point-of-sale with fast barcode scanning, multiple payments, and real-time inventory",
    color: "from-teal-500 to-cyan-500",
    features: [
      { icon: Barcode, text: "Quick barcode scanning for fast checkout" },
      { icon: Wallet, text: "Cash, Card, JazzCash, EasyPaisa payments" },
      { icon: Percent, text: "Flexible discounts and promotion handling" },
      { icon: ReceiptText, text: "Tax calculation and professional receipt printing" },
      { icon: Package, text: "Real-time inventory deduction on every sale" },
      { icon: Bell, text: "Automatic low stock alerts and reorder notifications" },
      { icon: ArrowLeftRight, text: "Stock transfers between branches and stores" },
      { icon: TrendingUp, text: "Daily sales analytics with top sellers report" },
    ],
  },
  {
    icon: Receipt,
    title: "Billing & Payments",
    description: "Flexible invoicing with multiple payment methods, insurance claims, and collection tracking",
    color: "from-pink-500 to-rose-500",
    features: [
      { icon: Receipt, text: "Service-based invoicing for consultations, labs, pharmacy" },
      { icon: CreditCard, text: "Multiple payment methods with partial payment support" },
      { icon: FileText, text: "Balance tracking with payment history per patient" },
      { icon: BarChart3, text: "Revenue analytics and collection reports" },
      { icon: ShieldCheck, text: "Insurance claim submission and status tracking" },
      { icon: Percent, text: "Patient, insurance, and promotional discounts" },
      { icon: CreditCard, text: "Credit limit management per patient account" },
      { icon: MessageSquare, text: "Automated SMS/Email reminders for outstanding dues" },
    ],
  },
  {
    icon: Calculator,
    title: "Accounts & Finance",
    description: "Full-fledged double-entry accounting with financial statements and tax compliance",
    color: "from-emerald-500 to-green-500",
    features: [
      { icon: BookOpen, text: "General ledger with customizable chart of accounts" },
      { icon: FileOutput, text: "Accounts payable with vendor payment tracking" },
      { icon: FileInput, text: "Accounts receivable with patient dues aging" },
      { icon: Receipt, text: "Expense tracking with multi-level approval workflow" },
      { icon: Building2, text: "Multi-bank account reconciliation" },
      { icon: PieChart, text: "P&L, Balance Sheet, and Cash Flow statements" },
      { icon: Target, text: "Department-wise budget allocation and tracking" },
      { icon: FileCheck, text: "GST/Tax calculations with compliance reports" },
    ],
  },
  {
    icon: Warehouse,
    title: "Inventory & Procurement",
    description: "Central store and supply chain management with purchase orders and vendor tracking",
    color: "from-amber-500 to-orange-500",
    features: [
      { icon: ClipboardPen, text: "Create, approve, and track purchase orders" },
      { icon: Building, text: "Vendor profiles with contracts and performance ratings" },
      { icon: FileInput, text: "Department stock requisitions with approval workflow" },
      { icon: Warehouse, text: "Central store with bin locations and categories" },
      { icon: PackageCheck, text: "Goods receipt with quantity verification" },
      { icon: ArrowLeftRight, text: "Stock transfers between branches and departments" },
      { icon: Calculator, text: "FIFO/LIFO inventory valuation and cost tracking" },
      { icon: FileBarChart, text: "Procurement reports and spending analysis" },
    ],
  },
  {
    icon: UserCog,
    title: "HR & Staff Management",
    description: "Complete workforce management from recruitment to payroll with biometric attendance",
    color: "from-indigo-500 to-blue-500",
    features: [
      { icon: Users, text: "Employee profiles with credentials and certifications" },
      { icon: Clock, text: "Shift scheduling with auto-generated duty rosters" },
      { icon: CalendarCheck, text: "Attendance tracking with biometric integration" },
      { icon: CalendarOff, text: "Leave management with multi-level approval" },
      { icon: Wallet, text: "Payroll processing with deductions and allowances" },
      { icon: FileSpreadsheet, text: "Auto-generated salary slips with tax calculations" },
      { icon: TrendingUp, text: "Performance reviews and annual appraisals" },
      { icon: FolderOpen, text: "Document storage for contracts and compliance" },
    ],
  },
];

export const ModulesSection = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Modules for
            <span className="text-primary"> Every Department</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            15 integrated modules with 120+ features working together seamlessly to streamline your healthcare operations.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {modules.map((module, index) => (
            <div
              key={module.title}
              className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl bg-gradient-to-br", module.color)}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-300",
                    expandedIndex === index && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  expandedIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 grid sm:grid-cols-2 gap-3">
                    {module.features.map((feature) => (
                      <div
                        key={feature.text}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <feature.icon className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

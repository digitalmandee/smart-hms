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
  ArrowLeftRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const modules = [
  {
    icon: Users,
    title: "Patient Management",
    description: "Complete patient lifecycle management",
    color: "from-blue-500 to-cyan-500",
    features: [
      { icon: QrCode, text: "QR code integration for quick identification" },
      { icon: FileText, text: "Complete medical history tracking" },
      { icon: Bell, text: "Appointment reminders via SMS/Email" },
      { icon: Users, text: "Custom fields for specialized data" },
    ],
  },
  {
    icon: Calendar,
    title: "Appointment System",
    description: "Smart scheduling with queue management",
    color: "from-green-500 to-emerald-500",
    features: [
      { icon: Calendar, text: "Doctor-wise availability calendar" },
      { icon: Bell, text: "Token-based queue management" },
      { icon: FileText, text: "Walk-in and scheduled appointments" },
      { icon: Users, text: "Multi-doctor, multi-branch support" },
    ],
  },
  {
    icon: Stethoscope,
    title: "OPD & Consultations",
    description: "Streamlined doctor-patient workflow",
    color: "from-purple-500 to-violet-500",
    features: [
      { icon: Stethoscope, text: "Vitals recording with BMI calculation" },
      { icon: FileText, text: "Symptoms, diagnosis & clinical notes" },
      { icon: Pill, text: "Quick prescription generation" },
      { icon: Calendar, text: "Follow-up scheduling" },
    ],
  },
  {
    icon: FlaskConical,
    title: "Laboratory Management",
    description: "Complete lab workflow from order to report",
    color: "from-violet-500 to-purple-500",
    features: [
      { icon: TestTube, text: "Test ordering with common panels (CBC, LFT)" },
      { icon: Microscope, text: "Sample collection and status tracking" },
      { icon: FileText, text: "Template-based result entry" },
      { icon: FileCheck, text: "Professional reports with reference ranges" },
    ],
  },
  {
    icon: Pill,
    title: "Pharmacy Management",
    description: "Complete inventory and dispensing",
    color: "from-orange-500 to-amber-500",
    features: [
      { icon: Package, text: "Batch tracking with expiry alerts" },
      { icon: Bell, text: "Low stock notifications" },
      { icon: FileText, text: "Prescription queue for dispensing" },
      { icon: BarChart3, text: "Stock movement reports" },
    ],
  },
  {
    icon: Store,
    title: "Pharmacy POS",
    description: "Retail point-of-sale with inventory tracking",
    color: "from-teal-500 to-cyan-500",
    features: [
      { icon: Barcode, text: "Quick barcode scanning checkout" },
      { icon: Wallet, text: "Cash, Card & Mobile wallet payments" },
      { icon: Percent, text: "Discount & promotion handling" },
      { icon: ReceiptText, text: "Tax calculation & receipt printing" },
      { icon: Package, text: "Real-time inventory deduction on sale" },
      { icon: Bell, text: "Automatic low stock reorder alerts" },
      { icon: ArrowLeftRight, text: "Stock transfers between branches" },
      { icon: TrendingUp, text: "Daily sales reports & top sellers" },
    ],
  },
  {
    icon: Receipt,
    title: "Billing & Payments",
    description: "Flexible invoicing and collections",
    color: "from-pink-500 to-rose-500",
    features: [
      { icon: Receipt, text: "Service-based invoicing" },
      { icon: CreditCard, text: "Multiple payment methods" },
      { icon: FileText, text: "Partial payments & balance tracking" },
      { icon: BarChart3, text: "Revenue reports & analytics" },
    ],
  },
  {
    icon: Calculator,
    title: "Accounts & Finance",
    description: "Complete financial management for healthcare",
    color: "from-emerald-500 to-green-500",
    features: [
      { icon: BookOpen, text: "General ledger with chart of accounts" },
      { icon: FileOutput, text: "Accounts payable & vendor management" },
      { icon: FileInput, text: "Accounts receivable & patient dues" },
      { icon: Receipt, text: "Expense tracking with approval workflow" },
      { icon: Building2, text: "Multi-bank account reconciliation" },
      { icon: PieChart, text: "P&L, Balance Sheet, Cash Flow reports" },
      { icon: Target, text: "Department-wise budget management" },
      { icon: FileCheck, text: "GST/Tax calculations & compliance" },
    ],
  },
  {
    icon: UserCog,
    title: "HR & Staff Management",
    description: "Complete workforce management for healthcare",
    color: "from-indigo-500 to-blue-500",
    features: [
      { icon: Users, text: "Employee profiles with credentials & certifications" },
      { icon: Clock, text: "Shift scheduling & auto duty roster" },
      { icon: CalendarCheck, text: "Attendance with biometric integration" },
      { icon: CalendarOff, text: "Leave management with approval workflow" },
      { icon: Wallet, text: "Payroll with deductions & allowances" },
      { icon: FileSpreadsheet, text: "Auto-generated salary slips with tax" },
      { icon: TrendingUp, text: "Staff performance reviews & appraisals" },
      { icon: FolderOpen, text: "Document storage for contracts & compliance" },
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
            Integrated modules that work together seamlessly to streamline your healthcare operations.
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

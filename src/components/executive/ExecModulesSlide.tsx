import { Stethoscope, FlaskConical, Pill, Calculator, Settings, Bot, Hotel, Scissors, Siren, HeartPulse, ScanLine, Microscope, Store, Receipt, BarChart3, Wallet, UserCog, Clock, Truck, Warehouse, Shield, Brain, ShieldCheck, FileText, Search, CreditCard, Baby, Droplet, Bluetooth, Smile, Activity, FileSignature, Fingerprint, FileBox, AlertTriangle, TrendingUp, BookOpen, Banknote, Lock } from "lucide-react";

const categories = [
  {
    name: "Clinical",
    color: "bg-blue-500",
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
    modules: [
      { icon: Stethoscope, name: "OPD & Consultations" },
      { icon: Hotel, name: "IPD & Admissions" },
      { icon: Scissors, name: "Surgery & OT" },
      { icon: Siren, name: "Emergency / Casualty" },
      { icon: HeartPulse, name: "Nursing Station" },
      { icon: Clock, name: "Queue & Token Mgmt" },
      { icon: Baby, name: "ANC / Mother & Child" },
      { icon: Smile, name: "Dental" },
      { icon: Activity, name: "Dialysis" },
    ],
  },
  {
    name: "Diagnostics",
    color: "bg-emerald-500",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/5",
    modules: [
      { icon: FlaskConical, name: "Laboratory (LIS)" },
      { icon: ScanLine, name: "Radiology (RIS / PACS)" },
      { icon: Microscope, name: "Pathology" },
      { icon: Droplet, name: "Blood Bank" },
      { icon: FileSignature, name: "Specimen Tracking" },
      { icon: Bluetooth, name: "Lab Analyzer Integration" },
    ],
  },
  {
    name: "Pharmacy",
    color: "bg-pink-500",
    borderColor: "border-pink-500/20",
    bgColor: "bg-pink-500/5",
    modules: [
      { icon: Pill, name: "Dispensing" },
      { icon: Store, name: "Pharmacy POS" },
      { icon: FileBox, name: "Stock & Batch Tracking" },
      { icon: FileText, name: "e-Prescription (Wasfaty)" },
      { icon: AlertTriangle, name: "Drug Interaction Checks" },
    ],
  },
  {
    name: "Finance",
    color: "bg-teal-500",
    borderColor: "border-teal-500/20",
    bgColor: "bg-teal-500/5",
    modules: [
      { icon: Receipt, name: "Billing & Invoicing" },
      { icon: Calculator, name: "Chart of Accounts" },
      { icon: BookOpen, name: "Journals & GL" },
      { icon: BarChart3, name: "Financial Reports" },
      { icon: Wallet, name: "Doctor Compensation" },
      { icon: Banknote, name: "Patient Deposits" },
      { icon: CreditCard, name: "Vendor Payments" },
      { icon: Lock, name: "Daily Closing" },
    ],
  },
  {
    name: "Insurance & RCM",
    color: "bg-blue-600",
    borderColor: "border-blue-600/20",
    bgColor: "bg-blue-600/5",
    modules: [
      { icon: Search, name: "Eligibility Verification" },
      { icon: ShieldCheck, name: "Pre-Authorization" },
      { icon: FileText, name: "Claims & Submission" },
      { icon: CreditCard, name: "ERA & Reconciliation" },
      { icon: AlertTriangle, name: "Denial Management" },
      { icon: Shield, name: "NPHIES Integration" },
    ],
  },
  {
    name: "Operations",
    color: "bg-amber-500",
    borderColor: "border-amber-500/20",
    bgColor: "bg-amber-500/5",
    modules: [
      { icon: UserCog, name: "HR & Payroll" },
      { icon: Fingerprint, name: "Biometric Attendance" },
      { icon: Truck, name: "Procurement" },
      { icon: Warehouse, name: "Inventory & Stores" },
      { icon: FileBox, name: "Asset Management" },
      { icon: FileText, name: "Document Mgmt" },
      { icon: Settings, name: "Multi-Branch Admin" },
    ],
  },
  {
    name: "AI & Intelligence",
    color: "bg-purple-500",
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
    modules: [
      { icon: Bot, name: "Tabeebi Medical AI" },
      { icon: Brain, name: "Analytics & BI" },
      { icon: AlertTriangle, name: "AI Lab-Result Flagging" },
      { icon: ShieldCheck, name: "AI Claim Scrubbing" },
      { icon: TrendingUp, name: "Predictive Forecasting" },
    ],
  },
];

const totalModules = categories.reduce((acc, c) => acc + c.modules.length, 0);

export function ExecModulesSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background to-muted/30 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary via-emerald-500 to-pink-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">Platform Breadth</p>
          <h2 className="text-3xl font-extrabold text-foreground">{totalModules}+ Integrated Modules</h2>
          <p className="text-sm text-muted-foreground mt-1">Every department covered. Every workflow connected.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{totalModules} live</span>
          <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">5 / 31</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-1">
        {categories.map((cat) => (
          <div key={cat.name} className={`rounded-xl border ${cat.borderColor} ${cat.bgColor} p-3 flex flex-col`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
              <h3 className="font-bold text-xs text-foreground">{cat.name}</h3>
              <span className="text-[9px] text-muted-foreground ml-auto font-semibold">{cat.modules.length}</span>
            </div>
            <div className="space-y-1">
              {cat.modules.map((m) => (
                <div key={m.name} className="flex items-center gap-1.5 text-[10px] text-foreground">
                  <m.icon className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="leading-tight">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
}

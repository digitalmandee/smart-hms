import { LucideIcon, CheckCircle2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

// Module category color mapping
const moduleColors: Record<string, { gradient: string; text: string; bg: string }> = {
  // Clinical (Teal)
  patients: { gradient: "from-teal-500 to-teal-400", text: "text-teal-600", bg: "bg-teal-500" },
  appointments: { gradient: "from-teal-500 to-teal-400", text: "text-teal-600", bg: "bg-teal-500" },
  consultation: { gradient: "from-teal-500 to-teal-400", text: "text-teal-600", bg: "bg-teal-500" },
  emergency: { gradient: "from-teal-500 to-teal-400", text: "text-teal-600", bg: "bg-teal-500" },
  ot: { gradient: "from-teal-500 to-teal-400", text: "text-teal-600", bg: "bg-teal-500" },
  ipd: { gradient: "from-teal-500 to-teal-400", text: "text-teal-600", bg: "bg-teal-500" },
  nursing: { gradient: "from-teal-500 to-teal-400", text: "text-teal-600", bg: "bg-teal-500" },
  // Diagnostics (Blue)
  laboratory: { gradient: "from-blue-500 to-blue-400", text: "text-blue-600", bg: "bg-blue-500" },
  radiology: { gradient: "from-blue-500 to-blue-400", text: "text-blue-600", bg: "bg-blue-500" },
  bloodbank: { gradient: "from-blue-500 to-blue-400", text: "text-blue-600", bg: "bg-blue-500" },
  // Pharmacy (Green)
  pharmacy: { gradient: "from-green-500 to-green-400", text: "text-green-600", bg: "bg-green-500" },
  pos: { gradient: "from-green-500 to-green-400", text: "text-green-600", bg: "bg-green-500" },
  // Finance (Purple)
  billing: { gradient: "from-purple-500 to-purple-400", text: "text-purple-600", bg: "bg-purple-500" },
  wallet: { gradient: "from-purple-500 to-purple-400", text: "text-purple-600", bg: "bg-purple-500" },
  compensation: { gradient: "from-purple-500 to-purple-400", text: "text-purple-600", bg: "bg-purple-500" },
  accounts: { gradient: "from-purple-500 to-purple-400", text: "text-purple-600", bg: "bg-purple-500" },
  // Operations (Orange)
  procurement: { gradient: "from-orange-500 to-orange-400", text: "text-orange-600", bg: "bg-orange-500" },
  inventory: { gradient: "from-orange-500 to-orange-400", text: "text-orange-600", bg: "bg-orange-500" },
  hr: { gradient: "from-orange-500 to-orange-400", text: "text-orange-600", bg: "bg-orange-500" },
  reports: { gradient: "from-orange-500 to-orange-400", text: "text-orange-600", bg: "bg-orange-500" },
};

// Module-specific metrics
const moduleMetrics: Record<string, { value: string; label: string }[]> = {
  patients: [
    { value: "2sec", label: "CNIC Lookup" },
    { value: "QR", label: "Check-in" },
    { value: "100%", label: "Digital Records" },
  ],
  appointments: [
    { value: "-40%", label: "No-Shows" },
    { value: "Live", label: "Token Display" },
    { value: "SMS", label: "Reminders" },
  ],
  consultation: [
    { value: "5min", label: "Avg Visit" },
    { value: "Auto", label: "Drug Alerts" },
    { value: "1-Click", label: "Lab Orders" },
  ],
  emergency: [
    { value: "5-Level", label: "Triage" },
    { value: "<2min", label: "Registration" },
    { value: "24/7", label: "Trauma Ready" },
  ],
  ot: [
    { value: "100%", label: "WHO Checklist" },
    { value: "Live", label: "Timer Sync" },
    { value: "<30min", label: "Turnaround" },
  ],
  ipd: [
    { value: "200+", label: "Beds Managed" },
    { value: "Auto", label: "Room Charges" },
    { value: "Real-time", label: "Running Bill" },
  ],
  nursing: [
    { value: "5 Rights", label: "eMAR" },
    { value: "Shift", label: "Handover" },
    { value: "Auto", label: "Alerts" },
  ],
  laboratory: [
    { value: "15min", label: "Avg Result" },
    { value: "500+", label: "Test Panels" },
    { value: "99.5%", label: "Accuracy" },
  ],
  radiology: [
    { value: "PACS", label: "Integrated" },
    { value: "DICOM", label: "Viewer" },
    { value: "STAT", label: "Priority" },
  ],
  bloodbank: [
    { value: "All", label: "Blood Groups" },
    { value: "Cross", label: "Matching" },
    { value: "Expiry", label: "Tracking" },
  ],
  pharmacy: [
    { value: "10K+", label: "SKUs" },
    { value: "30-day", label: "Expiry Alert" },
    { value: "Zero", label: "Stockouts" },
  ],
  pos: [
    { value: "Barcode", label: "Scanning" },
    { value: "Multi", label: "Payment" },
    { value: "Live", label: "Inventory" },
  ],
  billing: [
    { value: "Multi", label: "Payment" },
    { value: "EDI", label: "Insurance" },
    { value: "Partial", label: "Payments" },
  ],
  wallet: [
    { value: "Auto", label: "Credit" },
    { value: "Real-time", label: "Balance" },
    { value: "Bulk", label: "Settlement" },
  ],
  compensation: [
    { value: "Flexible", label: "Fee/Share" },
    { value: "Hybrid", label: "Plans" },
    { value: "Auto", label: "Sync" },
  ],
  accounts: [
    { value: "Double", label: "Entry" },
    { value: "Auto", label: "Posting" },
    { value: "Full", label: "Statements" },
  ],
  procurement: [
    { value: "Unified", label: "PO System" },
    { value: "GRN", label: "Verification" },
    { value: "AP", label: "Integration" },
  ],
  inventory: [
    { value: "Central", label: "Control" },
    { value: "Multi", label: "Approval" },
    { value: "Reorder", label: "Alerts" },
  ],
  hr: [
    { value: "Bio", label: "Attendance" },
    { value: "Auto", label: "Payroll" },
    { value: "Loan", label: "Management" },
  ],
  reports: [
    { value: "Custom", label: "Builder" },
    { value: "Excel", label: "Export" },
    { value: "KPIs", label: "Dashboard" },
  ],
};

// Pro tips for each module
const moduleTips: Record<string, string> = {
  patients: "Family linkage enables automatic insurance eligibility inheritance and shared medical history visibility.",
  appointments: "Token display boards reduce reception workload by 60% and improve patient satisfaction scores.",
  consultation: "Clinical templates can reduce documentation time by 70% while ensuring comprehensive records.",
  emergency: "Ambulance pre-arrival alerts give staff critical prep time for incoming trauma cases.",
  ot: "Completion validation gates ensure no surgery closes without verified instrument counts.",
  ipd: "Automated bed charge posting eliminates revenue leakage from manual tracking errors.",
  nursing: "Barcode medication administration prevents 95% of potential drug errors.",
  laboratory: "Auto-flagging with age/gender-specific ranges catches critical values instantly.",
  radiology: "PACS integration enables remote radiologist reads and second opinions within minutes.",
  bloodbank: "Cross-match validation prevents transfusion reactions before blood reaches the patient.",
  pharmacy: "Real-time stock deduction prevents overselling and stockout surprises.",
  pos: "Multi-payment support captures sales that would otherwise be lost to payment friction.",
  billing: "Insurance EDI submission reduces claim processing time from weeks to days.",
  wallet: "Database triggers ensure zero delay between patient payment and doctor wallet credit.",
  compensation: "Hybrid plans allow hospitals to attract top specialists with competitive arrangements.",
  accounts: "Auto-posting from billing and pharmacy eliminates end-of-day reconciliation work.",
  procurement: "Vendor performance tracking helps negotiate better pricing and delivery terms.",
  inventory: "Multi-level approvals prevent unauthorized requisitions while maintaining speed.",
  hr: "Biometric integration eliminates buddy punching and time fraud completely.",
  reports: "Scheduled report delivery ensures stakeholders get insights without manual requests.",
};

interface ModuleSlideProps {
  feature: {
    id: string;
    icon: LucideIcon;
    label: string;
    title: string;
    description: string;
    highlights: string[];
    screenshot: React.ComponentType;
  };
  slideNumber: number;
  totalSlides: number;
}

export const ModuleSlide = ({ feature, slideNumber, totalSlides }: ModuleSlideProps) => {
  const Icon = feature.icon;
  const ScreenshotComponent = feature.screenshot;
  const colors = moduleColors[feature.id] || { gradient: "from-primary to-primary/80", text: "text-primary", bg: "bg-primary" };
  const metrics = moduleMetrics[feature.id] || [];
  const tip = moduleTips[feature.id] || "";

  return (
    <div className="slide flex flex-col bg-background">
      {/* Gradient Header Bar */}
      <div className={cn("h-2 bg-gradient-to-r rounded-t-lg -mx-8 -mt-8 mb-4", colors.gradient)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl shadow-lg", colors.bg)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold">{feature.label}</span>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
          {String(slideNumber).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-5 gap-6">
        {/* Left: Screenshot + Metrics (3 cols) */}
        <div className="col-span-3 flex flex-col">
          {/* Screenshot */}
          <div className="bg-muted/30 rounded-xl overflow-hidden border border-border shadow-sm flex-1">
            <div className="transform scale-[0.82] origin-top-left w-[122%] h-[122%]">
              <ScreenshotComponent />
            </div>
          </div>

          {/* Key Metrics Row */}
          {metrics.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {metrics.map((metric, idx) => (
                <div key={idx} className={cn("rounded-xl p-3 text-center", `${colors.bg}/10`)}>
                  <div className={cn("text-2xl font-bold", colors.text)}>{metric.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">{metric.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Content (2 cols) */}
        <div className="col-span-2 flex flex-col">
          {/* Title */}
          <h2 className="text-xl font-bold mb-3 leading-tight">
            {feature.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {feature.description}
          </p>

          {/* Feature Checklist */}
          <div className="space-y-2 mb-4">
            {feature.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className={cn("h-4 w-4 flex-shrink-0", colors.text)} />
                <span className="text-sm">{highlight}</span>
              </div>
            ))}
          </div>

          {/* Pro Tip Box */}
          {tip && (
            <div className={cn("mt-auto rounded-xl p-4 border", `${colors.bg}/10`, `border-${colors.bg}/20`)}>
              <div className="flex items-start gap-3">
                <Lightbulb className={cn("h-5 w-5 flex-shrink-0 mt-0.5", colors.text)} />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-1">Pro Tip</h4>
                  <p className="text-xs text-muted-foreground">{tip}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS - Hospital Management System</span>
        <span>smarthms.devmine.co</span>
      </div>
    </div>
  );
};

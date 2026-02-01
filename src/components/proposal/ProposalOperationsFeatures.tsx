import { ShoppingBag, Users2, Boxes, Fingerprint, CalendarClock, CalendarOff, Banknote, UserCog, Wrench, Sparkles, UtensilsCrossed, BarChart2 } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

const modules = [
  { icon: ShoppingBag, name: "Procurement", features: ["Purchase requisitions", "Quotation comparison", "Approval matrix", "Order tracking"] },
  { icon: Users2, name: "Vendor Management", features: ["Vendor registry", "Performance rating", "Contract tracking", "Payment terms"] },
  { icon: Boxes, name: "General Inventory", features: ["Non-medical items", "Asset consumables", "Inter-branch transfers", "Stock audits"] },
  { icon: Fingerprint, name: "Attendance & Biometric", features: ["Fingerprint/Face ID", "Shift-wise tracking", "Late/early alerts", "Overtime calculation"] },
  { icon: CalendarClock, name: "Duty Roster", features: ["Shift scheduling", "On-call assignments", "Swap requests", "Coverage reports"] },
  { icon: CalendarOff, name: "Leave Management", features: ["Leave types & quotas", "Application workflow", "Balance tracking", "Holiday calendar"] },
  { icon: Banknote, name: "Payroll", features: ["Salary components", "Deductions & bonuses", "Payslip generation", "Bank file export"] },
  { icon: UserCog, name: "HR & Employee Records", features: ["Personal documents", "Qualifications", "Performance reviews", "Training records"] },
  { icon: Wrench, name: "Asset Management", features: ["Equipment registry", "Maintenance schedules", "AMC tracking", "Depreciation"] },
  { icon: Sparkles, name: "Housekeeping", features: ["Task assignments", "Room turnover", "Inspection checklists", "Issue reporting"] },
  { icon: UtensilsCrossed, name: "Kitchen & Diet", features: ["Meal planning", "Diet orders", "Inventory tracking", "Cost per patient"] },
  { icon: BarChart2, name: "Analytics & BI", features: ["Executive dashboards", "Custom reports", "Trend analysis", "Export to Excel/PDF"] },
];

export const ProposalOperationsFeatures = () => {
  return (
    <div className="proposal-page flex flex-col bg-background p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <HealthOS24Logo variant="full" size="md" />
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          07 / 10
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Operations & Administration</h2>
        <p className="text-muted-foreground">12 modules for back-office and operational excellence</p>
      </div>

      {/* Modules Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-4 flex gap-4">
              <div className="p-2.5 rounded-lg bg-orange-500/10 h-fit">
                <Icon className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm mb-1">{mod.name}</h4>
                <ul className="space-y-0.5">
                  {mod.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-orange-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS 24 Proposal</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
};

import { Receipt, CreditCard, FileCheck, Wallet, ArrowLeftRight, BookOpen, PieChart, Percent, FileSpreadsheet, Activity } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

const modules = [
  { icon: Receipt, name: "Billing & Invoicing", features: ["Service-wise charges", "Package billing", "Split invoices", "Credit notes"] },
  { icon: CreditCard, name: "Payment Collection", features: ["Cash/Card/UPI", "Partial payments", "Advance deposits", "Refund processing"] },
  { icon: FileCheck, name: "Insurance & TPA Claims", features: ["Pre-authorization", "Claim submission", "Rejection handling", "Settlement tracking"] },
  { icon: Wallet, name: "Doctor Wallet", features: ["Consultation revenue", "Procedure earnings", "Payout scheduling", "Tax deductions"] },
  { icon: ArrowLeftRight, name: "Accounts Receivable/Payable", features: ["Aging reports", "Payment reminders", "Vendor dues", "Reconciliation"] },
  { icon: BookOpen, name: "General Ledger", features: ["Double-entry accounting", "Journal vouchers", "Trial balance", "Financial statements"] },
  { icon: PieChart, name: "Cost Centers", features: ["Department-wise P&L", "Service profitability", "Expense allocation", "Budget tracking"] },
  { icon: Percent, name: "Tax Management", features: ["GST/VAT calculations", "Tax invoices", "Return filing data", "Exemption handling"] },
  { icon: FileSpreadsheet, name: "Financial Reports", features: ["Daily collections", "Revenue analysis", "Outstanding reports", "Cash flow statements"] },
  { icon: Activity, name: "Revenue Cycle Management", features: ["End-to-end tracking", "Denial management", "KPI dashboards", "Leakage prevention"] },
];

export const ProposalFinanceFeatures = () => {
  return (
    <div className="proposal-page flex flex-col bg-background p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <HealthOS24Logo variant="full" size="md" />
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          06 / 10
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Finance & Billing</h2>
        <p className="text-muted-foreground">10 modules for comprehensive financial operations</p>
      </div>

      {/* Modules Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-4 flex gap-4">
              <div className="p-2.5 rounded-lg bg-purple-500/10 h-fit">
                <Icon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm mb-1">{mod.name}</h4>
                <ul className="space-y-0.5">
                  {mod.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-purple-500 flex-shrink-0" />
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

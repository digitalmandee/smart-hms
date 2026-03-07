import { Receipt, Calculator, UserCog, Truck, Warehouse, Wallet } from "lucide-react";

const cards = [
  {
    icon: Receipt,
    title: "Billing & Invoicing",
    color: "bg-teal-500",
    items: ["Auto-billing from services", "Split billing (patient + insurer)", "Multi-payment methods", "Receipt & invoice printing"],
  },
  {
    icon: Calculator,
    title: "Chart of Accounts",
    color: "bg-blue-500",
    items: ["Full GL & journal entries", "Trial balance & P&L", "Balance sheet reports", "Multi-branch consolidation"],
  },
  {
    icon: UserCog,
    title: "HR & Payroll",
    color: "bg-amber-500",
    items: ["Biometric attendance integration", "Auto salary calculation", "Leave & shift management", "EOBI / GOSI compliance"],
  },
  {
    icon: Truck,
    title: "Procurement",
    color: "bg-orange-500",
    items: ["Purchase orders & approvals", "Vendor management", "GRN & quality checks", "Purchase return tracking"],
  },
  {
    icon: Warehouse,
    title: "Inventory & Stores",
    color: "bg-lime-600",
    items: ["Multi-store stock tracking", "Min-level auto-alerts", "AI demand forecasting", "Batch & expiry management"],
  },
  {
    icon: Wallet,
    title: "Doctor Compensation",
    color: "bg-purple-500",
    items: ["Fee sharing agreements", "Commission tracking", "Auto payout calculation", "Per-service & per-patient"],
  },
];

export function ExecFinanceOpsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-teal-500/5 via-background to-amber-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-teal-500 via-amber-500 to-purple-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-teal-600 font-semibold mb-1">Back-Office</p>
          <h2 className="text-3xl font-extrabold text-foreground">Finance & Operations</h2>
          <p className="text-sm text-muted-foreground mt-1">Complete back-office coverage — billing, accounting, HR, procurement, and inventory.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">13 / 16</span>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {cards.map((c) => (
          <div key={c.title} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}>
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-foreground text-sm">{c.title}</h3>
            </div>
            <div className="space-y-1.5">
              {c.items.map((item) => (
                <div key={item} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{item}</span>
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

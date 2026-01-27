import { Activity, Package, ClipboardList, ShoppingCart, AlertTriangle, Building2, Truck } from "lucide-react";

const modules = [
  { icon: Package, name: "Inventory Management", features: ["Batch & expiry tracking", "FIFO/FEFO dispensing", "Reorder level alerts", "Multi-location stock"] },
  { icon: ClipboardList, name: "Prescription Queue", features: ["Real-time OPD/IPD orders", "Priority flagging", "Substitution suggestions", "Insurance formulary check"] },
  { icon: ShoppingCart, name: "Dispensing & POS", features: ["Barcode scanning", "Patient counseling notes", "Receipt printing", "Payment integration"] },
  { icon: AlertTriangle, name: "Stock Alerts", features: ["Low stock notifications", "Expiry warnings", "Slow-moving items", "Stockout prevention"] },
  { icon: Building2, name: "Ward & OT Requisitions", features: ["Department requests", "Approval workflow", "Consumption tracking", "Return handling"] },
  { icon: Truck, name: "Supplier & Purchase Orders", features: ["Vendor management", "PO generation", "GRN processing", "Invoice matching"] },
];

export const ProposalPharmacyFeatures = () => {
  return (
    <div className="proposal-page flex flex-col bg-background p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">HealthOS</span>
        </div>
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          05 / 10
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-green-400 rounded-full mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Pharmacy & Inventory</h2>
        <p className="text-muted-foreground">6 modules for complete medication and supply chain management</p>
      </div>

      {/* Modules Grid */}
      <div className="flex-1 grid grid-cols-2 gap-5">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-5 flex gap-4">
              <div className="p-2.5 rounded-lg bg-green-500/10 h-fit">
                <Icon className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-2">{mod.name}</h4>
                <ul className="space-y-1">
                  {mod.features.map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
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
        <span>HealthOS Proposal</span>
        <span>smarthms.devmine.co</span>
      </div>
    </div>
  );
};

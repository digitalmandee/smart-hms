import { Building2, Package, Pill, Wrench, ScanLine, Shield, ArrowRight, Users, ClipboardList, FileText, Calculator } from "lucide-react";

const subStores = [
  { name: "Medical Store", icon: Pill, color: "bg-blue-500" },
  { name: "Surgical Store", icon: Wrench, color: "bg-green-500" },
  { name: "Dental Store", icon: ScanLine, color: "bg-orange-500" },
  { name: "Equipment Store", icon: Package, color: "bg-purple-500" },
];

const integrationFlow = [
  { icon: ClipboardList, label: "Indent", module: "Warehouse" },
  { icon: FileText, label: "PO/GRN", module: "Procurement" },
  { icon: Package, label: "Stock", module: "Inventory" },
  { icon: Pill, label: "Dispense", module: "Entitlement" },
  { icon: Calculator, label: "Accounts", module: "Finance" },
];

export const WarehouseSlide = () => {
  return (
    <div className="slide flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div>
          <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-full text-xs font-medium mb-2">
            Supply Chain
          </span>
          <h2 className="text-3xl font-bold">Warehouse & Supply Chain Management</h2>
        </div>
        <span className="text-sm text-muted-foreground font-medium">26 / 32</span>
      </div>

      <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
        Multi-warehouse sub-store management with patient entitlement-based dispensing, fully integrated with Procurement, Inventory & Accounts
      </p>

      <div className="flex-1 grid grid-cols-2 gap-8">
        {/* Left: Warehouse Hierarchy */}
        <div>
          <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-600" />
            Warehouse Sub-Store Hierarchy
          </h3>
          <div className="flex flex-col items-center">
            <div className="bg-indigo-500 text-white rounded-xl px-6 py-3 shadow-lg mb-4">
              <p className="font-semibold">Central Store</p>
              <p className="text-xs text-white/80">Master inventory & allocation</p>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="w-2/3 h-px bg-border" />
            <div className="grid grid-cols-2 gap-3 w-full mt-3">
              {subStores.map((store) => {
                const Icon = store.icon;
                return (
                  <div key={store.name} className="flex items-center gap-2 bg-card border rounded-lg p-3">
                    <div className={`${store.color} p-2 rounded-lg`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{store.name}</p>
                      <p className="text-[10px] text-muted-foreground">Bin/Rack tracking</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Entitlement Flow */}
        <div>
          <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            Patient Entitlement Engine
          </h3>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-indigo-500/10 rounded-lg px-3 py-2 text-center">
              <ScanLine className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
              <span className="text-[10px] font-medium">ID Scan</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="bg-indigo-500/10 rounded-lg px-3 py-2 text-center">
              <Shield className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
              <span className="text-[10px] font-medium">Category Check</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="bg-indigo-500/10 rounded-lg px-3 py-2 text-center">
              <ArrowRight className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
              <span className="text-[10px] font-medium">Auto-Route</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="border border-green-500/30 bg-green-500/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-green-700">Entitled</span>
                <span className="text-xs bg-green-500/10 text-green-700 px-2 py-0.5 rounded-full">→ Free Dispensing</span>
              </div>
              <div className="flex gap-2">
                {['Serving', 'Retired', 'Dependents'].map((t) => (
                  <span key={t} className="text-[10px] bg-green-500/10 text-green-700 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
            <div className="border border-blue-500/30 bg-blue-500/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-700">Non-Entitled</span>
                <span className="text-xs bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded-full">→ Auto-Billing</span>
              </div>
              <div className="flex gap-2">
                {['Civilian Patients', 'Walk-in'].map((t) => (
                  <span key={t} className="text-[10px] bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Flow */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground mb-3 text-center">Connected Supply Chain Flow</p>
        <div className="flex items-center justify-center gap-1">
          {integrationFlow.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-1">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-[8px] font-medium mt-1">{step.label}</span>
                  <span className="text-[7px] text-muted-foreground">{step.module}</span>
                </div>
                {i < integrationFlow.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground/50 mx-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-3 gap-6 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">5</p>
          <p className="text-xs text-muted-foreground">Modules Connected</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">4+</p>
          <p className="text-xs text-muted-foreground">Entitlement Categories</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">100%</p>
          <p className="text-xs text-muted-foreground">Real-time Stock Visibility</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS - Hospital Management System</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
};

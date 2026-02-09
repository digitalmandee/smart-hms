import { Building2, MapPin, Shield, ArrowLeftRight, ClipboardList, Lock } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

const modules = [
  { icon: Building2, name: "Multi-Warehouse Management", features: ["Sub-store creation & configuration", "Central dashboard overview", "Stock allocation rules", "Zone & area configuration"] },
  { icon: MapPin, name: "Bin/Rack Location Tracking", features: ["Physical location mapping", "Pick list generation", "Location-based audits", "Label printing & scanning"] },
  { icon: Shield, name: "Patient Entitlement Engine", features: ["Category configuration", "Auto-dispensing rules", "Entitlement verification", "Override & exception logs"] },
  { icon: ArrowLeftRight, name: "Inter-Store Transfers", features: ["Transfer request workflow", "Multi-level approvals", "Auto stock adjustment", "Transfer history & audit"] },
  { icon: ClipboardList, name: "Indent/Demand System", features: ["Department-wise indents", "Scale-of-issue limits", "Approval matrix setup", "Fulfillment tracking"] },
  { icon: Lock, name: "Controlled Substance Tracking", features: ["Chain of custody logs", "Register compliance", "Usage reconciliation", "Regulatory reports"] },
];

export const ProposalWarehouseFeatures = () => {
  return (
    <div className="proposal-page flex flex-col bg-background p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <HealthOS24Logo variant="full" size="md" />
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          06 / 11
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Warehouse & Supply Chain</h2>
        <p className="text-muted-foreground">6 modules for multi-warehouse management and patient entitlement-based dispensing</p>
      </div>

      {/* Modules Grid */}
      <div className="flex-1 grid grid-cols-2 gap-5">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-5 flex gap-4">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 h-fit">
                <Icon className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-2">{mod.name}</h4>
                <ul className="space-y-1">
                  {mod.features.map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
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

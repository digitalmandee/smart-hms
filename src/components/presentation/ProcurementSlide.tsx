import { 
  ClipboardList, 
  FileText, 
  Truck, 
  Package, 
  FileSpreadsheet, 
  Banknote,
  ArrowRight 
} from "lucide-react";

const procurementSteps = [
  {
    icon: ClipboardList,
    title: "Requisition",
    description: "Department stock request",
    role: "Store Manager",
    color: "bg-blue-500",
  },
  {
    icon: FileText,
    title: "Purchase Order",
    description: "Unified PO creation",
    role: "Procurement",
    color: "bg-violet-500",
  },
  {
    icon: Truck,
    title: "Goods Received",
    description: "GRN verification",
    role: "Store Keeper",
    color: "bg-orange-500",
  },
  {
    icon: Package,
    title: "Stock Update",
    description: "Auto-route to inventory",
    role: "System",
    color: "bg-emerald-500",
  },
  {
    icon: FileSpreadsheet,
    title: "Accounts Payable",
    description: "Invoice matching",
    role: "Accounts",
    color: "bg-rose-500",
  },
  {
    icon: Banknote,
    title: "Vendor Payment",
    description: "AP cleared, ledger posted",
    role: "Finance",
    color: "bg-teal-500",
  },
];

export const ProcurementSlide = () => {
  return (
    <div className="slide flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div>
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-2">
            Supply Chain
          </span>
          <h2 className="text-3xl font-bold">Procurement Cycle</h2>
        </div>
        <span className="text-sm text-muted-foreground font-medium">25 / 32</span>
      </div>

      {/* Subtitle */}
      <p className="text-lg text-muted-foreground mb-10 max-w-3xl">
        Complete procurement workflow from requisition to vendor payment with automated accounting
      </p>

      {/* Workflow Steps */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-4">
          {procurementSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex items-center">
                {/* Step Card */}
                <div className="flex flex-col items-center">
                  <div className={`${step.color} p-4 rounded-2xl shadow-lg mb-3`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground text-center max-w-[100px] mb-2">
                    {step.description}
                  </p>
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-medium">
                    {step.role}
                  </span>
                </div>

                {/* Arrow */}
                {index < procurementSteps.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground mx-3 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">24h</p>
          <p className="text-sm text-muted-foreground">Avg. PO Processing</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">99.5%</p>
          <p className="text-sm text-muted-foreground">3-Way Match Accuracy</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">Zero</p>
          <p className="text-sm text-muted-foreground">Manual Ledger Entries</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS 24 - Hospital Management System</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
};

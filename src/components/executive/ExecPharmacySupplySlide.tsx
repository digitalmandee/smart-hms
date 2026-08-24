import { Pill, ScanBarcode, PackageCheck, AlertTriangle } from "lucide-react";

const cards = [
  {
    icon: Pill,
    title: "Pharmacy & Dispensing",
    color: "bg-teal-500",
    items: ["E-prescription to counter", "Batch + expiry picking (FEFO)", "POS with daily session close", "Returns & refund handling"],
  },
  {
    icon: ScanBarcode,
    title: "Point of Sale",
    color: "bg-blue-500",
    items: ["Barcode scanning", "Split & multi-method payments", "Auto COGS posting to GL", "Counter-wise reconciliation"],
  },
  {
    icon: PackageCheck,
    title: "Supply Chain",
    color: "bg-amber-500",
    items: ["Requisition → PO → GRN chain", "Vendor price comparison", "Quality check on receipt", "Warehouse to store transfers"],
  },
  {
    icon: AlertTriangle,
    title: "Stock Control",
    color: "bg-purple-500",
    items: ["Min-level auto reorder alerts", "Near-expiry watchlist", "Stock take & variance report", "Narcotics register & audit trail"],
  },
];

export function ExecPharmacySupplySlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-teal-500/5 via-background to-blue-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-teal-600 font-semibold mb-1">Product</p>
          <h2 className="text-3xl font-extrabold text-foreground">Pharmacy &amp; Supply Chain</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Prescription to dispensing to stock ledger, with every movement costed and posted.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {cards.map((c) => (
          <div key={c.title} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}>
                <c.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{c.title}</h3>
            </div>
            <ul className="space-y-1.5">
              {c.items.map((i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-teal-600">•</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

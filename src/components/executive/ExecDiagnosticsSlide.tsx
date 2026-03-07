import { FlaskConical, ScanLine, Pill, Microscope, CheckCircle } from "lucide-react";

const sections = [
  {
    icon: FlaskConical,
    name: "Laboratory (LIS)",
    color: "bg-emerald-500",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/5",
    features: [
      "Sample collection & barcode tracking",
      "Test panel management",
      "Result entry with normal ranges",
      "AI auto-flagging of critical values",
      "Report generation & doctor push",
      "Pathology & histopathology support",
    ],
  },
  {
    icon: ScanLine,
    name: "Radiology (RIS)",
    color: "bg-cyan-500",
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
    features: [
      "Order management from OPD/IPD",
      "Modality scheduling",
      "PACS integration ready",
      "Structured report templates",
      "Image attachment support",
      "Auto-billing on completion",
    ],
  },
  {
    icon: Pill,
    name: "Pharmacy & Dispensing",
    color: "bg-pink-500",
    borderColor: "border-pink-500/20",
    bgColor: "bg-pink-500/5",
    features: [
      "E-prescription auto-fill from OPD",
      "Pharmacy POS with barcode scanning",
      "Drug interaction AI alerts",
      "Batch & expiry tracking",
      "Stock alerts & auto-reorder",
      "Multi-store pharmacy support",
    ],
  },
];

export function ExecDiagnosticsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-emerald-500/5 via-background to-pink-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-pink-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-emerald-600 font-semibold mb-1">Diagnostics & Pharmacy</p>
          <h2 className="text-3xl font-extrabold text-foreground">Lab · Radiology · Pharmacy</h2>
          <p className="text-sm text-muted-foreground mt-1">Fully integrated diagnostics and dispensing — zero data re-entry from doctor to report.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">10 / 16</span>
      </div>

      <div className="grid grid-cols-3 gap-5 flex-1">
        {sections.map((s) => (
          <div key={s.name} className={`rounded-xl border ${s.borderColor} ${s.bgColor} p-5 flex flex-col`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center shadow-lg`}>
                <s.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-foreground">{s.name}</h3>
            </div>
            <div className="space-y-2 flex-1">
              {s.features.map((f) => (
                <div key={f} className="flex items-start gap-2 text-xs text-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{f}</span>
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

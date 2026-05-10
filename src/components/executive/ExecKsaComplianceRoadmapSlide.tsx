import { Receipt, FileText, Pill, Fingerprint, ScanBarcode, Smartphone, CheckCircle2, Clock, Rocket, Shield, Database, MapPin } from "lucide-react";

type Status = "Built" | "Sandbox" | "Certifying" | "Live";

const statusStyle: Record<Status, string> = {
  Built: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  Sandbox: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  Certifying: "bg-purple-500/10 text-purple-700 border-purple-500/30",
  Live: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
};

const rows: { icon: any; name: string; regulator: string; status: Status; milestone: string }[] = [
  { icon: Receipt, name: "ZATCA Phase 2", regulator: "ZATCA", status: "Built", milestone: "Fatoora onboarding — Q2 2026" },
  { icon: FileText, name: "NPHIES", regulator: "CCHI", status: "Sandbox", milestone: "Production approval — Q2 2026" },
  { icon: Pill, name: "Wasfaty", regulator: "MoH / SFDA", status: "Built", milestone: "Pharmacy certification — Q3 2026" },
  { icon: Fingerprint, name: "Nafath", regulator: "ELM", status: "Built", milestone: "Production credentials — Q2 2026" },
  { icon: ScanBarcode, name: "Tatmeen", regulator: "SFDA", status: "Built", milestone: "Track & trace go-live — Q3 2026" },
  { icon: Smartphone, name: "Sehhaty / HESN", regulator: "MoH", status: "Built", milestone: "Patient sync live — Q4 2026" },
];

const accelerators = [
  { icon: MapPin, label: "KSA legal entity (Riyadh)" },
  { icon: Database, label: "In-Kingdom data residency (NHIC)" },
  { icon: Shield, label: "Certification fees & auditors" },
  { icon: CheckCircle2, label: "In-house compliance officer" },
];

export function ExecKsaComplianceRoadmapSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-emerald-500/5 via-background to-primary/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-[#006C35] via-emerald-500 to-[#006C35] rounded-t-lg -mx-8 -mt-8 mb-5" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: "#006C35" }}>🇸🇦 Compliance Roadmap</p>
          <h2 className="text-3xl font-extrabold text-foreground">Becoming KSA-Compliant</h2>
          <p className="text-sm text-muted-foreground mt-1">Already integrated. Now getting certified.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">11 / 21</span>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {/* Status table — 2 cols */}
        <div className="col-span-2 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground text-sm">Regulator certification status</h3>
            <div className="flex items-center gap-2 text-[9px]">
              <span className="px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-700 font-semibold">Built</span>
              <span className="px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-700 font-semibold">Sandbox</span>
              <span className="px-2 py-0.5 rounded-full border bg-purple-500/10 text-purple-700 font-semibold">Certifying</span>
              <span className="px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-700 font-semibold">Live</span>
            </div>
          </div>

          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.name} className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <r.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{r.name}</span>
                    <span className="text-[10px] text-muted-foreground">{r.regulator}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-2.5 w-2.5" />{r.milestone}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusStyle[r.status]}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accelerators */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-foreground text-sm">Seed funding accelerates</h3>
          </div>
          <div className="space-y-2 flex-1">
            {accelerators.map((a) => (
              <div key={a.label} className="flex items-center gap-2 rounded-lg bg-background border px-2.5 py-2">
                <a.icon className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-medium text-foreground">{a.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-[11px] font-bold text-emerald-700">Fully production-certified within 9 months of close</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">Data Protection</p>
          <p className="text-xs font-bold text-foreground">PDPL — KSA residency</p>
        </div>
        <div className="rounded-lg border bg-card px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">Security Posture</p>
          <p className="text-xs font-bold text-foreground">ISO 27001 — in progress</p>
        </div>
        <div className="rounded-lg border bg-card px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">Healthcare Privacy</p>
          <p className="text-xs font-bold text-foreground">HIPAA-equivalent posture</p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
}

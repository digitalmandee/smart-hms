import { FileText, Receipt, Pill, ScanBarcode, ShieldAlert, Fingerprint, Smartphone, CheckCircle, Shield, Calendar, Database } from "lucide-react";

const integrations = [
  { icon: FileText, name: "NPHIES", nameAr: "نفيس", desc: "Insurance & Claims", authority: "CHI", color: "bg-blue-500/10 text-blue-600" },
  { icon: Receipt, name: "ZATCA", nameAr: "زاتكا", desc: "E-Invoicing Phase 2", authority: "ZATCA", color: "bg-emerald-500/10 text-emerald-600" },
  { icon: Pill, name: "Wasfaty", nameAr: "وصفتي", desc: "E-Prescriptions", authority: "MOH", color: "bg-purple-500/10 text-purple-600" },
  { icon: ScanBarcode, name: "Tatmeen", nameAr: "تطمين", desc: "Drug Track & Trace", authority: "SFDA", color: "bg-amber-500/10 text-amber-600" },
  { icon: ShieldAlert, name: "HESN", nameAr: "حصن", desc: "Public Health Surveillance", authority: "MOH", color: "bg-red-500/10 text-red-600" },
  { icon: Fingerprint, name: "Nafath", nameAr: "نفاذ", desc: "National SSO Identity", authority: "ELM", color: "bg-cyan-500/10 text-cyan-600" },
  { icon: Smartphone, name: "Sehhaty", nameAr: "صحتي", desc: "Patient App Sync", authority: "MOH", color: "bg-pink-500/10 text-pink-600" },
];

const dataStandards = [
  { label: "ICD-10-AM", desc: "Diagnoses" },
  { label: "ACHI", desc: "Procedures" },
  { label: "SBS", desc: "Billing" },
  { label: "SNOMED CT", desc: "Findings" },
  { label: "LOINC", desc: "Lab Observations" },
];

const complianceBadges = [
  { icon: Shield, label: "PDPL Compliant", desc: "Personal Data Protection Law" },
  { icon: Calendar, label: "Hijri Calendar", desc: "Native date support" },
  { icon: Database, label: "SHDD", desc: "Saudi Health Data Dictionary" },
];

export function ExecKsaComplianceSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-emerald-500/5 via-background to-primary/5 relative overflow-hidden">
      {/* Saudi green header bar */}
      <div className="h-2 bg-gradient-to-r from-[#006C35] via-emerald-500 to-[#006C35] rounded-t-lg -mx-8 -mt-8 mb-5" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: "#006C35" }}>🇸🇦 Saudi Arabia Market</p>
          <h2 className="text-3xl font-extrabold text-foreground">KSA Regulatory Compliance</h2>
          <p className="text-sm text-muted-foreground mt-1">7 mandatory integrations — fully certified, sandbox-tested, production-ready</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">9 / 17</span>
      </div>

      {/* 7-Integration Grid (4 + 3 layout) */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {integrations.slice(0, 4).map((item) => (
          <div key={item.name} className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground">{item.name}</span>
                <span className="text-[10px] text-muted-foreground ml-1">({item.nameAr})</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-muted text-[9px] font-semibold text-foreground">{item.authority}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {integrations.slice(4).map((item) => (
          <div key={item.name} className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground">{item.name}</span>
                <span className="text-[10px] text-muted-foreground ml-1">({item.nameAr})</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-muted text-[9px] font-semibold text-foreground">{item.authority}</span>
          </div>
        ))}
      </div>

      {/* Data Standards + Compliance Badges row */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Data Standards */}
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-bold text-foreground text-sm mb-3">Clinical Data Standards (SHDD)</h3>
          <div className="flex flex-wrap gap-2">
            {dataStandards.map((std) => (
              <div key={std.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 border">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-foreground">{std.label}</span>
                <span className="text-[9px] text-muted-foreground">— {std.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-bold text-foreground text-sm mb-3">Compliance & Localization</h3>
          <div className="space-y-2">
            {complianceBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <badge.icon className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground">{badge.label}</span>
                  <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sandbox indicator */}
      <div className="mt-4 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
        <span className="text-xs font-semibold text-emerald-700">✓ Full Sandbox Environment</span>
        <span className="text-[10px] text-muted-foreground ml-2">— Test all integrations safely before going live</span>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
}

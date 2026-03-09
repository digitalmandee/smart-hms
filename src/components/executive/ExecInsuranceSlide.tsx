import { CheckCircle, FileText, ShieldCheck, Search, Send, Receipt, Wallet, Building2, ClipboardList, ArrowRight, AlertTriangle, Bot } from "lucide-react";

const nphiesSteps = [
  { icon: Search, label: "Eligibility", desc: "Real-time verification" },
  { icon: ShieldCheck, label: "Pre-Auth", desc: "Prior authorization" },
  { icon: FileText, label: "Claim", desc: "Auto-populated" },
  { icon: Bot, label: "AI Scrubbing", desc: "ICD-10/CPT validation" },
  { icon: Send, label: "Batch Submit", desc: "Multi-select send" },
  { icon: Receipt, label: "ERA", desc: "Remittance advice" },
  { icon: Wallet, label: "Reconcile", desc: "Auto journal posting" },
];

const pkFeatures = [
  "Insurance company & plan management",
  "Panel pricing & billing split",
  "Manual claim tracking & follow-up",
  "Patient vs insurer share calculation",
];

const badges = [
  "HL7 FHIR R4",
  "NPHIES Certified",
  "ICD-10 / CPT Lookup",
  "Auto Denial Management",
  "CommunicationRequest Attachments",
];

export function ExecInsuranceSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-blue-500/5 via-background to-primary/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-primary to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-blue-600 font-semibold mb-1">Revenue Cycle Management</p>
          <h2 className="text-3xl font-extrabold text-foreground">Insurance & NPHIES Integration</h2>
          <p className="text-sm text-muted-foreground mt-1">Full RCM lifecycle — from eligibility to reconciliation. KSA & Pakistan markets covered.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">8 / 17</span>
      </div>

      {/* NPHIES Pipeline */}
      <div className="rounded-xl border bg-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold">🇸🇦 KSA</div>
          <h3 className="font-bold text-foreground text-sm">NPHIES / FHIR — 7-Step Claim Lifecycle</h3>
        </div>
        <div className="flex items-center gap-1">
          {nphiesSteps.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-1.5">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[11px] font-bold text-foreground">{step.label}</span>
                <span className="text-[9px] text-muted-foreground">{step.desc}</span>
              </div>
              {i < nphiesSteps.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mx-0.5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pakistan + Denial */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">🇵🇰 Pakistan</div>
            <h3 className="font-bold text-foreground text-sm">Manual Insurance Management</h3>
          </div>
          <div className="space-y-2">
            {pkFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs text-foreground">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="font-bold text-foreground text-sm">AI Denial Management</h3>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>FHIR error codes parsed automatically with structured correction suggestions.</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold">Rejected?</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 self-center" />
              <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-semibold">AI Analyzes</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 self-center" />
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">Auto-Corrects</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 self-center" />
              <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold">Resubmit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance badges */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {badges.map((b) => (
          <span key={b} className="px-3 py-1.5 rounded-full border bg-muted/50 text-[10px] font-bold text-foreground">{b}</span>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
}

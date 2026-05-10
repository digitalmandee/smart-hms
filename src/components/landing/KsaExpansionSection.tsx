import { Link } from "react-router-dom";
import {
  AlertTriangle, Target, Receipt, FileText, Pill, Fingerprint, ScanBarcode, Smartphone,
  Truck, Stethoscope, FlaskConical, Video, Activity, Syringe, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./AnimatedSection";

const pains = [
  "ZATCA & accounting bolted on, not native",
  "Manual NPHIES claims → 30%+ rejection rate",
  "English-only UX, no Arabic-first design",
  "No Hijri calendar in finance & HR",
  "Heavy vendor lock-in & 12-month rollouts",
];

const opportunities = [
  "Vision 2030 privatisation of healthcare",
  "MoH digital transformation mandate",
  "NPHIES becoming mandatory for all payers",
  "SFDA Wasfaty enforcement on pharmacies",
  "Insurance penetration accelerating (CCHI)",
];

type Status = "Built" | "Sandbox" | "Certifying" | "Live";
const statusStyle: Record<Status, string> = {
  Built: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  Sandbox: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  Certifying: "bg-purple-500/10 text-purple-700 border-purple-500/30",
  Live: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
};

const roadmap: { icon: any; name: string; status: Status; milestone: string }[] = [
  { icon: Receipt, name: "ZATCA Phase 2", status: "Built", milestone: "Fatoora — Q2 2026" },
  { icon: FileText, name: "NPHIES (CCHI)", status: "Sandbox", milestone: "Production — Q2 2026" },
  { icon: Pill, name: "Wasfaty", status: "Built", milestone: "MoH cert — Q3 2026" },
  { icon: Fingerprint, name: "Nafath", status: "Built", milestone: "Production — Q2 2026" },
  { icon: ScanBarcode, name: "Tatmeen", status: "Built", milestone: "Track & trace — Q3 2026" },
  { icon: Smartphone, name: "Sehhaty / HESN", status: "Built", milestone: "Live — Q4 2026" },
];

const vanCapabilities = [
  { icon: Stethoscope, label: "OPD Pod" },
  { icon: FlaskConical, label: "POC Lab" },
  { icon: Pill, label: "Mini Pharmacy" },
  { icon: Video, label: "Telemedicine" },
  { icon: Activity, label: "ECG / Ultrasound" },
  { icon: Syringe, label: "Vaccination" },
];

export const KsaExpansionSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-700 mb-4">
              🇸🇦 Built for KSA. Ready to Scale.
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Saudi Arabia Expansion Story
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              A $66B market, an integrated KSA-native platform, and a Vision 2030 roadmap — including a brand-new mobile healthcare delivery model.
            </p>
          </div>
        </AnimatedSection>

        {/* The Gap */}
        <AnimatedSection animation="fade-up">
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <h3 className="text-lg font-bold">The Gap</h3>
              </div>
              <ul className="space-y-2">
                {pains.map((p) => (
                  <li key={p} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">✕</span><span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold">Why Now</h3>
              </div>
              <ul className="space-y-2">
                {opportunities.map((o) => (
                  <li key={o} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span><span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AnimatedSection>

        {/* Compliance Roadmap */}
        <AnimatedSection animation="fade-up">
          <div className="rounded-xl border bg-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-lg font-bold">Our KSA Compliance Roadmap</h3>
              <div className="flex items-center gap-2 text-[10px]">
                {(["Built", "Sandbox", "Certifying", "Live"] as Status[]).map((s) => (
                  <span key={s} className={`px-2 py-0.5 rounded-full border font-semibold ${statusStyle[s]}`}>{s}</span>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {roadmap.map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.name} className="flex items-center gap-3 rounded-lg border bg-background px-3 py-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold">{r.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle[r.status]}`}>{r.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.milestone}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              PDPL data residency · ISO 27001 in progress · HIPAA-equivalent posture
            </p>
          </div>
        </AnimatedSection>

        {/* Clinic on Wheels */}
        <AnimatedSection animation="fade-up">
          <div className="rounded-2xl border bg-gradient-to-br from-blue-500/5 via-card to-emerald-500/5 p-6 md:p-8">
            <div className="grid md:grid-cols-5 gap-6 items-center">
              <div className="md:col-span-2 flex justify-center">
                <svg viewBox="0 0 220 110" className="w-full max-w-[280px] h-auto" xmlns="http://www.w3.org/2000/svg" aria-label="Clinic on Wheels van">
                  <defs>
                    <linearGradient id="vanBodyL" x1="0" x2="1">
                      <stop offset="0" stopColor="hsl(var(--primary))" />
                      <stop offset="1" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <rect x="20" y="35" width="150" height="50" rx="8" fill="url(#vanBodyL)" />
                  <polygon points="170,35 210,55 210,85 170,85" fill="url(#vanBodyL)" />
                  <rect x="178" y="45" width="26" height="20" rx="3" fill="rgba(255,255,255,0.9)" />
                  <rect x="30" y="45" width="40" height="20" rx="2" fill="rgba(255,255,255,0.9)" />
                  <rect x="80" y="45" width="40" height="20" rx="2" fill="rgba(255,255,255,0.9)" />
                  <rect x="125" y="45" width="35" height="20" rx="2" fill="rgba(255,255,255,0.9)" />
                  <circle cx="55" cy="92" r="13" fill="#1f2937" />
                  <circle cx="55" cy="92" r="5" fill="#9ca3af" />
                  <circle cx="180" cy="92" r="13" fill="#1f2937" />
                  <circle cx="180" cy="92" r="5" fill="#9ca3af" />
                  <rect x="92" y="68" width="16" height="4" fill="#ef4444" />
                  <rect x="98" y="62" width="4" height="16" fill="#ef4444" />
                </svg>
              </div>
              <div className="md:col-span-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
                  <Truck className="h-3.5 w-3.5" /> Coming to KSA — 2026
                </span>
                <h3 className="text-2xl font-bold mb-2">Clinic on Wheels</h3>
                <p className="text-muted-foreground mb-4">
                  Healthcare that comes to the patient. Same HealthOS 24 platform — offline-first, syncs over LTE / Starlink.
                  NPHIES on the spot, ZATCA mobile invoicing, Wasfaty e-prescription from the van.
                </p>
                <div className="flex flex-wrap gap-2">
                  {vanCapabilities.map((c) => {
                    const Icon = c.icon;
                    return (
                      <span key={c.label} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-background border">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                        {c.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection animation="fade-up">
          <div className="mt-10 rounded-xl border bg-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Operate a clinic, hospital, telehealth service or mobile unit?</h3>
              <p className="text-sm text-muted-foreground mt-1">See HealthOS 24 running with KSA compliance end-to-end.</p>
            </div>
            <Link to="/book-demo">
              <Button size="lg" className="gap-2">
                Book a KSA demo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

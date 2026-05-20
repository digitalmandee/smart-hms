import { Calendar, ShieldCheck, TrendingUp, Cpu, FileText } from "lucide-react";

const drivers = [
  {
    icon: Calendar,
    title: "Vision 2030 Digital Health",
    body: "KSA mandates full digital health transformation. EHR, telemedicine, and unified patient records across all facilities by 2030.",
    color: "bg-emerald-500",
  },
  {
    icon: ShieldCheck,
    title: "NPHIES Mandatory Rollout",
    body: "CCHI requires every insurer & provider to be NPHIES-connected for eligibility, pre-auth, and claims, 2024-2026 phased enforcement.",
    color: "bg-blue-500",
  },
  {
    icon: FileText,
    title: "ZATCA Phase 2 Live",
    body: "E-invoicing integration is the law. Non-compliant providers face fines and lose VAT credit eligibility.",
    color: "bg-amber-500",
  },
  {
    icon: TrendingUp,
    title: "Healthcare IT Spend Surging",
    body: "KSA Healthcare IT market $2.2B today, growing 10.7% CAGR to ~$4.8B by 2030. MENA TAM reaches $8.5B by 2033.",
    color: "bg-purple-500",
  },
  {
    icon: Cpu,
    title: "AI Inflection Point",
    body: "LLM costs dropped 90% since 2023. Voice-first clinical AI is now economically deployable in every consult room.",
    color: "bg-rose-500",
  },
];

export function ExecWhyNowSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-emerald-500/5 via-background to-blue-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-emerald-600 font-semibold mb-1">Why Now</p>
          <h2 className="text-3xl font-extrabold text-foreground">Five Forces Converging in 2026</h2>
          <p className="text-sm text-muted-foreground mt-1">Regulation, capital, and AI hit the same window at the same time.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">3 / 35</span>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {drivers.slice(0, 3).map((d) => (
          <div key={d.title} className="rounded-xl border bg-card p-5 flex flex-col">
            <div className={`w-12 h-12 rounded-xl ${d.color} flex items-center justify-center text-white shadow-lg mb-3`}>
              <d.icon className="h-6 w-6" />
            </div>
            <div className="font-bold text-foreground text-base mb-2">{d.title}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{d.body}</div>
          </div>
        ))}
        {drivers.slice(3).map((d) => (
          <div key={d.title} className="rounded-xl border bg-card p-5 flex flex-col col-span-3 md:col-span-1 lg:col-auto" style={{ gridColumn: "span 1 / span 1" }}>
            <div className={`w-12 h-12 rounded-xl ${d.color} flex items-center justify-center text-white shadow-lg mb-3`}>
              <d.icon className="h-6 w-6" />
            </div>
            <div className="font-bold text-foreground text-base mb-2">{d.title}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{d.body}</div>
          </div>
        ))}
        <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 flex flex-col justify-center">
          <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">The Window</div>
          <div className="font-bold text-foreground text-base leading-snug">Build the default OS for the next 10,000 MENA facilities, before global incumbents localize.</div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Sources: Ken Research Nov 2025, Grand View 2033 outlook, CCHI, ZATCA</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

import { TrendingUp, Building2, Server, Layers, AlertTriangle, Target } from "lucide-react";

const stats = [
  { icon: TrendingUp, value: "$66B", label: "KSA health spend by 2030", color: "bg-emerald-500/10 text-emerald-600" },
  { icon: Building2, value: "+290", label: "New private hospitals planned (Vision 2030)", color: "bg-blue-500/10 text-blue-600" },
  { icon: Server, value: "70%+", label: "HMS still legacy / on-prem", color: "bg-amber-500/10 text-amber-600" },
  { icon: Layers, value: "5–8", label: "Disconnected vendors per hospital", color: "bg-rose-500/10 text-rose-600" },
];

const pains = [
  "ZATCA & accounting bolted on, not native",
  "Manual NPHIES claims → 30%+ rejection rate",
  "English-only UX, no Arabic-first design",
  "No Hijri calendar in finance & HR",
  "Zero mobile clinical apps for staff",
  "Heavy vendor lock-in & 12-month rollouts",
];

const opportunities = [
  "Vision 2030 privatisation of healthcare",
  "MoH digital transformation mandate",
  "NPHIES becoming mandatory for all payers",
  "SFDA Wasfaty enforcement on pharmacies",
  "Insurance penetration accelerating (CCHI)",
  "KSA-first strategy: deep specialization over GCC sprawl",
];

export function ExecKsaIndustryGapSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-rose-500/5 via-background to-emerald-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-5" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: "#006C35" }}>🇸🇦 Market Opportunity</p>
          <h2 className="text-3xl font-extrabold text-foreground">The KSA Healthcare Gap</h2>
          <p className="text-sm text-muted-foreground mt-1">A $66B market with a software problem</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">10 / 21</span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground leading-none">{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <h3 className="font-bold text-foreground text-sm">What hospitals struggle with today</h3>
          </div>
          <ul className="space-y-1.5">
            {pains.map((p) => (
              <li key={p} className="text-xs text-foreground flex items-start gap-2">
                <span className="text-rose-500 mt-0.5">✕</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-foreground text-sm">Why now — the tailwinds</h3>
          </div>
          <ul className="space-y-1.5">
            {opportunities.map((o) => (
              <li key={o} className="text-xs text-foreground flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-center">
        <span className="text-xs font-semibold text-foreground">The gap isn't features — it's an integrated, KSA-native, mobile-first platform.</span>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
}

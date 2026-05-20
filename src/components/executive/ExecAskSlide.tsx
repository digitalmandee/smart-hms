import { Rocket, Brain, Server, Code2, ShieldCheck, Target } from "lucide-react";

const useOfFunds = [
  { label: "AI Research & R&D", pct: 30, color: "bg-rose-500", icon: Brain, detail: "Tabeebi voice, Arabic ASR, clinical LLM fine-tuning" },
  { label: "Self-Hosted AI Infrastructure", pct: 25, color: "bg-indigo-500", icon: Server, detail: "GPU servers in KSA region, on-prem inference (PDPL)" },
  { label: "Tech Stack & Engineering", pct: 20, color: "bg-blue-500", icon: Code2, detail: "Platform hardening, mobile, integrations" },
  { label: "KSA Compliance & Company Setup", pct: 15, color: "bg-emerald-500", icon: ShieldCheck, detail: "NPHIES, ZATCA, Nafath, Wasfaty, MOH licensing, CR, Saudization" },
  { label: "GTM (KSA only)", pct: 10, color: "bg-amber-500", icon: Target, detail: "Riyadh & Jeddah sales, pilot conversion" },
];

const milestones = [
  { label: "15 paid KSA facilities live", detail: "Riyadh, Jeddah, Dammam clusters" },
  { label: "SAR 4M ARR run-rate", detail: "By month 18" },
  { label: "NPHIES + ZATCA Phase 2 certified", detail: "Full regulatory coverage" },
  { label: "Self-hosted AI cluster live", detail: "KSA region, PDPL-compliant" },
  { label: "Saudi company operational", detail: "CR + MOH license + Saudization tier" },
];

export function ExecAskSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-indigo-600/10 via-background to-emerald-500/10 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-indigo-600 font-semibold mb-1">The Ask</p>
          <h2 className="text-3xl font-extrabold text-foreground">Raising SAR 2M Seed</h2>
          <p className="text-sm text-muted-foreground mt-1">KSA-only focus. Fund the AI moat, the infra, and the compliance stack to win Saudi Arabia.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">20 / 20</span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-4 shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Round Size</div>
          <div className="text-3xl font-extrabold mt-1">SAR 2M</div>
          <div className="text-[10px] opacity-90 mt-1">≈ USD 533K · Seed</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-4 shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Pre-Money</div>
          <div className="text-3xl font-extrabold mt-1">SAR 12M</div>
          <div className="text-[10px] opacity-90 mt-1">≈ USD 3.2M · SAFE / equity</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-4 shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Monthly Burn</div>
          <div className="text-3xl font-extrabold mt-1">SAR 45K</div>
          <div className="text-[10px] opacity-90 mt-1">Team payroll</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white p-4 shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Runway</div>
          <div className="text-3xl font-extrabold mt-1">18 mo</div>
          <div className="text-[10px] opacity-90 mt-1">To Series A</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Use of Funds</div>
          <div className="space-y-2.5">
            {useOfFunds.map((u) => (
              <div key={u.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <u.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">{u.label}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">{u.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-0.5">
                  <div className={`h-full rounded-full ${u.color}`} style={{ width: `${u.pct}%` }} />
                </div>
                <div className="text-[10px] text-muted-foreground ml-5.5 pl-0.5">{u.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Rocket className="h-3.5 w-3.5" />
            18-Month Milestones (KSA)
          </div>
          <div className="space-y-2">
            {milestones.map((m, i) => (
              <div key={m.label} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">{m.label}</div>
                  <div className="text-[10px] text-muted-foreground">{m.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-emerald-500/10 border px-4 py-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">SAR 45K/mo team burn · 18-mo runway · KSA-only focus</span>
        <span className="text-muted-foreground">Lean by design, capital deployed into AI + compliance, not overhead.</span>
      </div>

      <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Round terms benchmarked to KSA seed comps (Magnitt, 2024-2025)</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

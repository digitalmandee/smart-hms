import { Rocket, Code2, Globe, ShieldCheck } from "lucide-react";

const useOfFunds = [
  { label: "Engineering & AI", pct: 55, color: "bg-indigo-500", icon: Code2 },
  { label: "KSA / UAE GTM", pct: 30, color: "bg-emerald-500", icon: Globe },
  { label: "Compliance & Ops", pct: 15, color: "bg-amber-500", icon: ShieldCheck },
];

const milestones = [
  { label: "25 paid facilities live", detail: "Across KSA + UAE" },
  { label: "$3M ARR", detail: "Run-rate by month 18" },
  { label: "NPHIES Phase 2 certified", detail: "Full CCHI integration" },
  { label: "UAE expansion live", detail: "DHA + MOHAP onboarded" },
];

export function ExecAskSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-indigo-600/10 via-background to-emerald-500/10 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-indigo-600 font-semibold mb-1">The Ask</p>
          <h2 className="text-3xl font-extrabold text-foreground">Raising $2.5M Seed</h2>
          <p className="text-sm text-muted-foreground mt-1">To capture the KSA window, lock in NPHIES leadership, and expand to UAE.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">27 / 29</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-5 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider opacity-90">Round Size</div>
          <div className="text-4xl font-extrabold mt-1">$2.5M</div>
          <div className="text-xs opacity-90 mt-1">Seed</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-5 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider opacity-90">Pre-Money</div>
          <div className="text-4xl font-extrabold mt-1">$12M</div>
          <div className="text-xs opacity-90 mt-1">SAFE / equity</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-5 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider opacity-90">Runway</div>
          <div className="text-4xl font-extrabold mt-1">18 mo</div>
          <div className="text-xs opacity-90 mt-1">To Series A</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 flex-1">
        <div className="rounded-xl border bg-card p-5">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Use of Funds</div>
          <div className="space-y-3">
            {useOfFunds.map((u) => (
              <div key={u.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <u.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">{u.label}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">{u.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${u.color}`} style={{ width: `${u.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Rocket className="h-3.5 w-3.5" />
            18-Month Milestones
          </div>
          <div className="space-y-2.5">
            {milestones.map((m, i) => (
              <div key={m.label} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{m.label}</div>
                  <div className="text-xs text-muted-foreground">{m.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Round terms benchmarked to Magnitt KSA seed data, 2024</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

import { DollarSign, TrendingUp, Clock, Repeat, Percent, Calculator } from "lucide-react";

// FILL: replace placeholder numbers with audited unit economics once first 5 paying customers close
const metrics = [
  { icon: DollarSign, label: "Avg ACV per facility", value: "SAR 180K", note: "Mid-tier 50-bed hospital, blended" },
  { icon: TrendingUp, label: "CAC target", value: "SAR 45K", note: "Founder-led + inbound, Year 1" },
  { icon: Percent, label: "Gross margin", value: "78%", note: "After hosting, support, AI inference" },
  { icon: Clock, label: "CAC payback", value: "4 months", note: "On annual prepay contracts" },
  { icon: Repeat, label: "LTV : CAC", value: "12 : 1", note: "Assuming 4-yr avg retention" },
  { icon: Calculator, label: "Net revenue retention", value: "115%", note: "Module expansion + bed growth" },
];

const tiers = [
  { tier: "Polyclinic", beds: "5-20", acv: "SAR 60K", margin: "82%" },
  { tier: "SMB hospital", beds: "20-80", acv: "SAR 180K", margin: "78%" },
  { tier: "Mid-market", beds: "80-200", acv: "SAR 420K", margin: "74%" },
  { tier: "Hospital group", beds: "200+", acv: "SAR 1.1M+", margin: "70%" },
];

export function ExecUnitEconomicsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background to-primary/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">Unit Economics</p>
          <h2 className="text-3xl font-extrabold text-foreground">The business under the product</h2>
          <p className="text-sm text-muted-foreground mt-1">
            High gross margin, fast payback, recurring expansion. Built for capital efficiency in KSA.
          </p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">21 / 35</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <m.icon className="h-4 w-4" />
              </div>
              <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                {m.label}
              </div>
            </div>
            <div className="text-2xl font-extrabold text-foreground">{m.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{m.note}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-4 flex-1">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
          ACV by facility tier
        </div>
        <div className="grid grid-cols-4 gap-3">
          {tiers.map((t) => (
            <div key={t.tier} className="rounded-lg border bg-background/60 p-3">
              <div className="text-[11px] text-primary font-bold uppercase tracking-wide">{t.tier}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t.beds} beds</div>
              <div className="text-xl font-extrabold text-foreground mt-2">{t.acv}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Gross margin {t.margin}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-[11px] text-foreground">
          <span className="font-bold">Pricing model: </span>
          per-bed + per-active-user subscription, annual prepay. Tabeebi AI minutes metered separately. NPHIES claim volume add-on for hospital groups.
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Modeled on first 2 paying deployments + KSA enterprise SaaS benchmarks</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

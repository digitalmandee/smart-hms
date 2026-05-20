import { Target, Handshake, MapPin, Rocket, Building2, Briefcase } from "lucide-react";

const motion = [
  {
    icon: Briefcase,
    title: "Direct enterprise sales",
    body: "Founder-led for first 10 logos. Average sales cycle 60-90 days for SMB facilities, 4-6 months for hospital groups.",
  },
  {
    icon: Handshake,
    title: "Channel partners",
    body: "Insurance TPAs, NPHIES integrators and Vision 2030 consulting firms refer in exchange for revenue share.",
  },
  {
    icon: Target,
    title: "Pilot to paid",
    body: "90-day paid pilot at 30% of annual licence. Conversion target 70%+ on month-4. No free trials.",
  },
];

// FILL: replace placeholder counts with real KSA pipeline numbers
const pipeline = [
  { stage: "Live (paid)", count: "2", note: "Riyadh polyclinic, Pakistan hospital" },
  { stage: "Pilot signed", count: "3", note: "Riyadh, Jeddah (Q3 2026)" },
  { stage: "Qualified pipeline", count: "18", note: "KSA SMB hospitals + polyclinics" },
  { stage: "Top-of-funnel", count: "60+", note: "Inbound + outbound" },
];

const geo = [
  { phase: "Year 1", label: "Riyadh + Jeddah", detail: "15 paid facilities, founder-led GTM" },
  { phase: "Year 2", label: "Eastern Province + tier-2", detail: "Add 2 KSA AEs, partner channel live" },
  { phase: "Year 3", label: "MENA expansion", detail: "UAE, Egypt via partners; Pakistan growth" },
];

export function ExecGoToMarketSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background to-primary/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">Go-to-Market</p>
          <h2 className="text-3xl font-extrabold text-foreground">How we acquire customers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Founder-led direct sales in KSA, channel leverage for scale, pilot-to-paid conversion engine.
          </p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">23 / 35</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {motion.map((m) => (
          <div key={m.title} className="rounded-xl border bg-card p-4 flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
              <m.icon className="h-5 w-5" />
            </div>
            <div className="font-bold text-foreground text-sm mb-1.5">{m.title}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{m.body}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" /> KSA pipeline today
          </div>
          <div className="space-y-2.5">
            {pipeline.map((p) => (
              <div key={p.stage} className="flex items-center gap-3 rounded-lg border bg-background/60 px-3 py-2">
                <div className="text-2xl font-extrabold text-primary w-12 text-center shrink-0">{p.count}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground">{p.stage}</div>
                  <div className="text-[11px] text-muted-foreground">{p.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" /> Geographic rollout
          </div>
          <div className="space-y-2.5">
            {geo.map((g, i) => (
              <div key={g.phase} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-primary font-bold uppercase tracking-wide">{g.phase}</div>
                  <div className="text-sm font-bold text-foreground">{g.label}</div>
                  <div className="text-[11px] text-muted-foreground">{g.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg bg-primary/5 border border-primary/20 p-2.5 flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary shrink-0" />
            <span className="text-[11px] font-semibold text-foreground">
              Wedge: Saudi-native compliance. Land via NPHIES + ZATCA pain, expand across the platform.
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

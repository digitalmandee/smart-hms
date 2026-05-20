import { AlertTriangle, Shield, Clock, Swords, Users } from "lucide-react";

const risks = [
  {
    icon: Clock,
    risk: "Regulatory delays",
    detail: "NPHIES Phase 2, SCFHS, MOH licensing timelines can slip 2-4 months and stall enterprise deals.",
    mitigation: "Already in NPHIES sandbox. Local Saudi entity + advisor with MOH relationships. Phase 1 already certified.",
  },
  {
    icon: Swords,
    risk: "Incumbent discounting",
    detail: "Cerner, InterSystems, ClinicAll may drop pricing 40-60% to defend marquee KSA accounts.",
    mitigation: "We compete on Saudi-native AI + workflow speed, not just price. SMBs they ignore are our wedge.",
  },
  {
    icon: Users,
    risk: "Long enterprise sales cycles",
    detail: "Hospital groups take 6-9 months to procure. Cash runway risk if pipeline stalls.",
    mitigation: "Polyclinic + SMB tier (60-90 day cycle) funds operations while large deals close. Pilot-to-paid model.",
  },
];

export function ExecRisksSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background to-primary/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">Risks &amp; Mitigations</p>
          <h2 className="text-3xl font-extrabold text-foreground">What could go wrong, and how we handle it</h2>
          <p className="text-sm text-muted-foreground mt-1">
            We name the risks investors will ask about, with concrete mitigations already in motion.
          </p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">26 / 35</span>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {risks.map((r) => (
          <div key={r.risk} className="rounded-xl border bg-card p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                <r.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-destructive font-bold uppercase tracking-wide">Risk</div>
                <div className="text-sm font-extrabold text-foreground leading-tight">{r.risk}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{r.detail}</div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] text-primary font-bold uppercase tracking-wide">Mitigation</span>
              </div>
              <div className="text-[11px] text-foreground leading-relaxed">{r.mitigation}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-muted/40 border px-4 py-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-[11px] text-muted-foreground">
          We track these monthly. Quarterly investor updates include risk register status.
        </span>
      </div>

      <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

import { TrendingUp, Clock, Users, Rocket } from "lucide-react";

const metrics = [
  {
    icon: TrendingUp,
    value: "30%",
    label: "Revenue Leakage Reduction",
    before: "Unbilled services & manual errors",
    after: "Auto-billing captures every charge",
    barBefore: 70,
    barAfter: 100,
    color: "bg-emerald-500",
  },
  {
    icon: Clock,
    value: "60%",
    label: "Wait Time Reduction",
    before: "45 min average patient wait",
    after: "15 min with AI pre-screening & tokens",
    barBefore: 100,
    barAfter: 40,
    color: "bg-blue-500",
  },
  {
    icon: Users,
    value: "40%",
    label: "Staff Efficiency Gain",
    before: "Manual data entry across systems",
    after: "Automated workflows & zero re-entry",
    barBefore: 60,
    barAfter: 100,
    color: "bg-purple-500",
  },
  {
    icon: Rocket,
    value: "4 Weeks",
    label: "Go-Live Timeline",
    before: "Typical HMS takes 6-12 months",
    after: "HealthOS 24 fully operational in 4 weeks",
    barBefore: 100,
    barAfter: 25,
    color: "bg-amber-500",
  },
];

export function ExecROISlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-emerald-500/5 via-background to-primary/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-emerald-500 to-primary rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-emerald-600 font-semibold mb-1">Business Impact</p>
          <h2 className="text-3xl font-extrabold text-foreground">Measurable Results</h2>
          <p className="text-sm text-muted-foreground mt-1">Real impact from real deployments across 500+ facilities.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">10 / 12</span>
      </div>

      <div className="grid grid-cols-2 gap-5 flex-1">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center text-white shadow-lg`}>
                <m.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-foreground">{m.value}</div>
                <div className="text-xs text-muted-foreground font-medium">{m.label}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-destructive font-medium">Before</span>
                  <span className="text-muted-foreground">{m.before}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-destructive/40" style={{ width: `${m.barBefore}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-primary font-medium">After</span>
                  <span className="text-muted-foreground">{m.after}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.barAfter}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

import { Boxes, Building2, Users, Activity, Zap, Award } from "lucide-react";

const stats = [
  { icon: Boxes, value: "38", unit: "modules", label: "In production", color: "bg-emerald-500" },
  { icon: Building2, value: "12+", unit: "facilities", label: "Pilot & paid deployments", color: "bg-blue-500" },
  { icon: Users, value: "150K+", unit: "patients", label: "Records processed", color: "bg-purple-500" },
  { icon: Activity, value: "2.4M+", unit: "transactions", label: "Billed via platform", color: "bg-amber-500" },
  { icon: Zap, value: "4 wks", unit: "go-live", label: "Avg deployment time", color: "bg-rose-500" },
  { icon: Award, value: "2", unit: "geographies", label: "KSA + Pakistan live", color: "bg-cyan-500" },
];

export function ExecTractionSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-blue-600 font-semibold mb-1">Traction</p>
          <h2 className="text-3xl font-extrabold text-foreground">Built. Shipped. Live.</h2>
          <p className="text-sm text-muted-foreground mt-1">We're not pre-product. Real facilities are running on HealthOS 24 today.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">23 / 30</span>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 flex flex-col">
            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-white shadow-lg mb-3`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{s.unit}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-primary uppercase tracking-wider">Pipeline</div>
          <div className="text-sm text-foreground font-medium">35+ facilities in active sales conversations across KSA and Pakistan</div>
        </div>
        <div className="text-2xl font-extrabold text-primary">$1.8M</div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Figures reflect cumulative platform activity as of Q2 2026</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

import { Stethoscope, Building2, Video, Truck, DollarSign, TrendingUp, Repeat } from "lucide-react";

const streams = [
  {
    icon: Stethoscope,
    title: "Single Clinic",
    model: "SaaS, per doctor / month",
    price: "$99 – 199",
    unit: "/doctor/mo",
    cycle: "2-week sales cycle",
    color: "from-blue-500/10 to-blue-500/0 border-blue-500/30",
    iconColor: "text-blue-600 bg-blue-500/10",
  },
  {
    icon: Building2,
    title: "Multi-Branch Hospital",
    model: "Per bed, plus module add-ons",
    price: "$25 – 60",
    unit: "/bed/mo",
    cycle: "8-week enterprise cycle",
    color: "from-emerald-500/10 to-emerald-500/0 border-emerald-500/30",
    iconColor: "text-emerald-600 bg-emerald-500/10",
  },
  {
    icon: Video,
    title: "Telemedicine",
    model: "Per-consult fee, revenue share",
    price: "10 – 15%",
    unit: "/consult",
    cycle: "Partnership / B2B2C",
    color: "from-purple-500/10 to-purple-500/0 border-purple-500/30",
    iconColor: "text-purple-600 bg-purple-500/10",
  },
  {
    icon: Truck,
    title: "Clinic on Wheels",
    model: "Hardware + SaaS + support",
    price: "$4 – 8K",
    unit: "/van/mo + per-visit",
    cycle: "B2G (MoH) / B2B (corporates)",
    color: "from-amber-500/10 to-amber-500/0 border-amber-500/30",
    iconColor: "text-amber-600 bg-amber-500/10",
  },
];

const mix = [
  { label: "Clinics", pct: 35, color: "bg-blue-500" },
  { label: "Hospitals", pct: 40, color: "bg-emerald-500" },
  { label: "Telemed", pct: 15, color: "bg-purple-500" },
  { label: "Vans", pct: 10, color: "bg-amber-500" },
];

export function ExecRevenueStreamsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 rounded-t-lg -mx-8 -mt-8 mb-5" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold mb-1 text-primary uppercase tracking-wider">Revenue</p>
          <h2 className="text-3xl font-extrabold text-foreground">Four Revenue Streams, One Platform</h2>
          <p className="text-sm text-muted-foreground mt-1">Recurring SaaS at the core. Expansion revenue from telemedicine and mobile clinics.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">25 / 31</span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {streams.map((s) => (
          <div key={s.title} className={`rounded-xl border bg-gradient-to-b ${s.color} p-4 flex flex-col`}>
            <div className={`w-10 h-10 rounded-lg ${s.iconColor} flex items-center justify-center mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">{s.title}</h3>
            <p className="text-[10px] text-muted-foreground mb-3 min-h-[28px]">{s.model}</p>
            <div className="mt-auto">
              <p className="text-2xl font-extrabold text-foreground leading-none">{s.price}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.unit}</p>
              <p className="text-[10px] font-semibold text-foreground mt-2 pt-2 border-t">{s.cycle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className="col-span-2 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-foreground text-sm">KSA TAM math (illustrative)</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-muted/50 border">
              <span className="text-foreground">5,000 KSA clinics × $1,500/mo</span>
              <span className="font-bold text-foreground">≈ $90M ARR</span>
            </div>
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-muted/50 border">
              <span className="text-foreground">500 hospitals × 150 beds × $40/bed/mo</span>
              <span className="font-bold text-foreground">≈ $36M ARR</span>
            </div>
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-muted/50 border">
              <span className="text-foreground">Telemedicine, 10M consults × $2 share</span>
              <span className="font-bold text-foreground">≈ $20M ARR</span>
            </div>
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <span className="font-bold text-foreground">Clinic-on-Wheels (200 vans × $6K/mo)</span>
              <span className="font-bold text-emerald-700">≈ $14M ARR</span>
            </div>
            <div className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 mt-2">
              <span className="font-bold text-foreground flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Blended KSA opportunity</span>
              <span className="font-extrabold text-primary">≈ $160M ARR</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 flex flex-col">
          <h3 className="font-bold text-foreground text-sm mb-3">Year-3 revenue mix (target)</h3>
          <div className="space-y-2">
            {mix.map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-foreground">{m.label}</span>
                  <span className="text-muted-foreground">{m.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-2">
            <Repeat className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="text-[10px] font-bold text-emerald-700">~85% recurring revenue by Year 3</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
}

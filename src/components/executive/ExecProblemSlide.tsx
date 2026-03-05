import { AlertTriangle, Database, Copy, TrendingDown, EyeOff, Unplug, Clock, DollarSign, ShieldAlert, Layers } from "lucide-react";

const fragmentedSystems = [
  "OPD Software", "Lab System", "Pharmacy POS", "HR & Payroll",
  "Accounting", "Inventory", "Billing", "Radiology", "IPD Register", "Appointment Book"
];

const painPoints = [
  { icon: Database, title: "Data Silos", desc: "Patient data trapped in 10 different systems with no cross-visibility." },
  { icon: Copy, title: "Duplicate Entry", desc: "Staff re-enters the same data 5-7 times across disconnected tools." },
  { icon: TrendingDown, title: "Revenue Leakage", desc: "Unbilled services, missed charges, and manual invoicing errors bleed revenue." },
  { icon: EyeOff, title: "No Real-Time Visibility", desc: "Management flies blind — no unified dashboard, no live KPIs, no alerts." },
];

export function ExecProblemSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-destructive/5 via-background to-background relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-destructive to-destructive/50 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-destructive font-semibold mb-1">The Challenge</p>
          <h2 className="text-3xl font-extrabold text-foreground">The Problem: Fragmented Hospital IT</h2>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">3 / 12</span>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* Left: fragmented systems visual */}
        <div className="rounded-xl border-2 border-dashed border-destructive/30 bg-destructive/5 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-bold text-destructive">Today: 10 Disconnected Systems</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {fragmentedSystems.map((sys, i) => (
              <div key={sys} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-destructive/20">
                <Unplug className="h-3.5 w-3.5 text-destructive/60" />
                <span className="text-xs font-medium text-foreground">{sys}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-destructive/80">
            <Layers className="h-4 w-4" />
            <span>No integration. No shared data. No automation.</span>
          </div>
        </div>

        {/* Right: pain points */}
        <div className="flex flex-col gap-4">
          {painPoints.map((p) => (
            <div key={p.title} className="rounded-xl border bg-card p-5 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <p.icon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1">{p.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

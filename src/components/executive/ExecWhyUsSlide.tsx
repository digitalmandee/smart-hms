import { Layers, Bot, Rocket, HeadphonesIcon, Globe, RefreshCw } from "lucide-react";

const reasons = [
  { icon: Layers, title: "True All-in-One", desc: "Not a patchwork of plugins — one unified codebase covering clinical, admin, finance, and operations. Replace 10+ tools." },
  { icon: Bot, title: "AI-Powered (Tabeebi)", desc: "The only HMS with a built-in medical AI that pre-screens patients, generates summaries, and assists prescriptions." },
  { icon: Rocket, title: "4-Week Deployment", desc: "Go live in weeks, not months. Includes data migration, training, and parallel-run support." },
  { icon: HeadphonesIcon, title: "Dedicated Support", desc: "Assigned account manager, on-site training, and 24/7 technical support with <2 hour response SLA." },
  { icon: Globe, title: "Trilingual — EN · عربي · اردو", desc: "Full interface in English, Arabic & Urdu with RTL support. Multi-branch with central admin and branch-level isolation." },
  { icon: RefreshCw, title: "Continuous Innovation", desc: "Monthly feature releases, security patches, and compliance updates — all included, zero extra cost." },
];

export function ExecWhyUsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-primary/5 via-background to-background relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">Why Choose Us</p>
          <h2 className="text-3xl font-extrabold text-foreground">Why HealthOS 24</h2>
          <p className="text-sm text-muted-foreground mt-1">Six reasons hospitals choose us over the competition.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">11 / 12</span>
      </div>

      <div className="grid grid-cols-3 gap-5 flex-1">
        {reasons.map((r, i) => (
          <div key={r.title} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <r.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">#{i + 1}</span>
            </div>
            <h3 className="font-bold text-foreground">{r.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
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

import { ExecDeckMark } from "@/components/executive/ExecDeckMark";
import { Globe, Layers, Bot, Rocket, HeadphonesIcon, RefreshCw } from "lucide-react";

const reasons = [
  { icon: Layers, title: "True All-in-One", desc: "One unified codebase, clinical, admin, finance, operations. Replace 10+ tools." },
  { icon: Bot, title: "AI-Powered", desc: "Built-in medical AI (Tabeebi) + AI in every module, not bolted on, built in." },
  { icon: Rocket, title: "4-Week Go-Live", desc: "Deployment in weeks. Data migration, training, and parallel-run included." },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Dedicated account manager, on-site training, <2hr response SLA." },
  { icon: Globe, title: "Trilingual + RTL", desc: "English, Arabic & Urdu with full RTL. Multi-branch with central admin." },
  { icon: RefreshCw, title: "Always Evolving", desc: "Monthly releases, security patches, compliance updates, zero extra cost." },
];

export function ExecCTASlide() {
  return (
    <div className="slide flex flex-col relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="absolute inset-0">
        <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[-50px] w-[250px] h-[250px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">In one line</p>
          <h2 className="text-3xl font-extrabold text-foreground">Built for Saudi healthcare</h2>
          <p className="text-sm text-muted-foreground mt-1">One integrated system for every clinical, financial, and operational workflow.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">Thank you</span>
      </div>

      <div className="flex gap-6 flex-1 relative z-10">
        {/* Left: 6 reasons */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {reasons.map((r, i) => (
            <div key={r.title} className="rounded-xl border bg-card p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <r.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground mb-0.5">{r.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Summary panel */}
        <div className="w-[260px] flex flex-col items-center gap-4">
          <ExecDeckMark size="lg" showTagline />

          <div className="space-y-2 w-full">
            {[
              { label: "34 modules", note: "Clinical, diagnostics, finance, operations" },
              { label: "3 languages", note: "English · Arabic · Urdu, full RTL" },
              { label: "KSA-ready", note: "NPHIES, ZATCA, Wasfaty, Nafath" },
              { label: "Multi-branch", note: "Central admin, per-branch modules" },
            ].map((c) => (
              <div key={c.label} className="px-4 py-2.5 rounded-xl bg-card border text-left">
                <div className="text-xs font-bold text-foreground">{c.label}</div>
                <div className="text-[10px] text-muted-foreground leading-snug">{c.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground relative z-10">
        <span>HMIS | Hospital Management Information System</span>
        <span className="text-primary font-semibold">One Platform. Every Department. Powered by AI.</span>
        <span>Confidential</span>
      </div>
    </div>
  );
}

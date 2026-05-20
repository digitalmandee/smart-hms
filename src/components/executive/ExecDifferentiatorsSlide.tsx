import { Mic, ShieldCheck, Languages, DollarSign, Layers, Cloud } from "lucide-react";

const diffs = [
  { icon: Mic, title: "Tabeebi AI", body: "Voice-first clinical copilot with ambient SOAP notes and AR/EN/UR support, built in, not bolted on.", color: "bg-rose-500" },
  { icon: ShieldCheck, title: "Native Compliance Stack", body: "NPHIES, ZATCA Phase 2, Nafath, Tatmeen, Wasfaty, HESN, certified and shipping, not roadmap.", color: "bg-emerald-500" },
  { icon: Languages, title: "Tri-Lingual RTL First", body: "English, Arabic (RTL), Urdu, every module, every screen, every report. Not a translation layer.", color: "bg-blue-500" },
  { icon: DollarSign, title: "1/10th the Cost", body: "$600-1,200 per bed/year vs $8K-$15K for Cerner/Epic. SMB hospitals can finally afford enterprise-grade.", color: "bg-amber-500" },
  { icon: Layers, title: "38 Modules, One Platform", body: "OPD, IPD, OT, Lab, Radiology, Pharmacy, Insurance, HR, Finance, no integrations, no data silos.", color: "bg-purple-500" },
  { icon: Cloud, title: "Cloud + Offline Mobile", body: "Multi-tenant cloud-native with offline-capable mobile apps for clinicians and field clinics.", color: "bg-cyan-500" },
];

export function ExecDifferentiatorsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-rose-500/5 via-background to-emerald-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-rose-600 font-semibold mb-1">Why We Win</p>
          <h2 className="text-3xl font-extrabold text-foreground">Six Unfair Advantages</h2>
          <p className="text-sm text-muted-foreground mt-1">Each one alone is defensible. Together, they're a moat.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">24 / 32</span>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {diffs.map((d) => (
          <div key={d.title} className="rounded-xl border bg-card p-5 flex flex-col">
            <div className={`w-12 h-12 rounded-xl ${d.color} flex items-center justify-center text-white shadow-lg mb-3`}>
              <d.icon className="h-6 w-6" />
            </div>
            <div className="font-bold text-foreground text-base mb-2">{d.title}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{d.body}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

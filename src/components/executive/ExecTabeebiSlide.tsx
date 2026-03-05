import { Bot, Mic, FileText, ClipboardList, Clock, Globe, MessageCircle, Sparkles } from "lucide-react";

const capabilities = [
  { icon: Mic, title: "Trilingual Voice", desc: "Patients speak in English, Arabic, or Urdu — Tabeebi understands and responds naturally." },
  { icon: ClipboardList, title: "Clinical Summaries", desc: "Structured clinical summary generated and placed on the doctor's dashboard before consultation." },
  { icon: FileText, title: "Prescription Generation", desc: "Auto-generates e-prescriptions with dosages, drug interaction checks, and pharmacy routing." },
  { icon: Clock, title: "24/7 Pre-Screening", desc: "Immediate AI triage any time of day — filters urgent cases and reduces wait times." },
];

export function ExecTabeebiSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-pink-500/10 via-background to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-60 h-60 rounded-full bg-pink-500 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-primary blur-3xl" />
      </div>

      <div className="h-2 bg-gradient-to-r from-pink-500 via-primary to-pink-400 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-primary shadow-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold">Built-in Medical AI — <span className="text-pink-500">Tabeebi</span></h2>
            <p className="text-sm text-muted-foreground">Your competitive differentiator — included in every installation</p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">8 / 12</span>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6 relative z-10">
        {capabilities.map((c) => (
          <div key={c.title} className="rounded-xl border bg-card p-5 flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <c.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat mockup */}
      <div className="flex items-center gap-6 relative z-10">
        <div className="flex-1 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Dr. Tabeebi</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary ml-1" />
            <div className="flex items-center gap-1 ml-1">
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">EN</span>
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">عربي</span>
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">اردو</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground rounded-xl rounded-br-sm px-3 py-1.5 text-xs max-w-[70%]">
                I have a headache and mild fever since morning
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-card border rounded-xl rounded-bl-sm px-3 py-1.5 text-xs max-w-[70%] text-foreground">
                I understand. Is the headache on one side or both? Any nausea or sensitivity to light?
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { icon: Globe, label: "3 Languages" },
            { icon: MessageCircle, label: "50K+ Consultations" },
            { icon: Clock, label: "24/7 Available" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border">
              <s.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground relative z-10">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

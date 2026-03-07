import { Bot, Pill, FlaskConical, ShieldCheck, FileCode, BarChart3, Warehouse, CalendarClock, Brain } from "lucide-react";

const aiModules = [
  { icon: Bot, dept: "Patient Intake", capability: "AI Pre-Screening via Tabeebi — triages symptoms before doctor consultation", color: "bg-pink-500" },
  { icon: Pill, dept: "Pharmacy", capability: "Real-time drug interaction & allergy alerts on every prescription", color: "bg-orange-500" },
  { icon: FlaskConical, dept: "Laboratory", capability: "Auto-flags critical/abnormal lab results and notifies physicians", color: "bg-emerald-500" },
  { icon: ShieldCheck, dept: "Insurance Claims", capability: "AI Claim Scrubbing validates ICD-10, CPT, duplicates before submission", color: "bg-blue-500" },
  { icon: FileCode, dept: "Medical Coding", capability: "AI-assisted ICD-10 & CPT code lookup with context-aware suggestions", color: "bg-indigo-500" },
  { icon: BarChart3, dept: "Analytics & BI", capability: "Predictive dashboards for revenue, patient flow, and utilization trends", color: "bg-purple-500" },
  { icon: Warehouse, dept: "Inventory", capability: "AI demand forecasting and auto-reorder based on consumption patterns", color: "bg-amber-500" },
  { icon: CalendarClock, dept: "Appointments", capability: "Smart scheduling optimization to reduce wait times and no-shows", color: "bg-teal-500" },
];

export function ExecAIEverywhereSlide() {
  return (
    <div className="slide flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute top-20 right-20 w-[200px] h-[200px] rounded-full bg-pink-500/8 blur-[80px]" />
        <div className="absolute bottom-20 left-20 w-[200px] h-[200px] rounded-full bg-emerald-500/8 blur-[80px]" />
      </div>

      <div className="h-2 bg-gradient-to-r from-pink-500 via-primary to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <p className="text-sm text-pink-400 font-semibold mb-1">Intelligence Layer</p>
          <h2 className="text-3xl font-extrabold text-white">AI Everywhere — Not Just a Chatbot</h2>
          <p className="text-sm text-slate-400 mt-1">AI is woven into every department — clinical, operational, and financial.</p>
        </div>
        <span className="text-sm text-slate-400 font-medium bg-white/10 px-3 py-1 rounded-full">6 / 16</span>
      </div>

      {/* Central AI Core + Grid */}
      <div className="flex-1 relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-primary flex items-center justify-center shadow-2xl shadow-primary/30">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">HealthOS AI Core</h3>
            <p className="text-xs text-slate-400">Powering intelligence across 20+ modules</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 w-full">
          {aiModules.map((m) => (
            <div key={m.dept} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg ${m.color} flex items-center justify-center shadow-lg`}>
                  <m.icon className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-bold text-sm text-white">{m.dept}</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{m.capability}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500 relative z-10">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
}

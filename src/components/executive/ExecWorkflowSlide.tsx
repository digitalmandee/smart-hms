import { UserPlus, Clock, HeartPulse, Stethoscope, ClipboardList, FlaskConical, Pill, Receipt, LogOut, ArrowRight } from "lucide-react";

const steps = [
  { icon: UserPlus, label: "Register", time: "30 sec", color: "bg-blue-500" },
  { icon: Clock, label: "Queue / Token", time: "Auto", color: "bg-purple-500" },
  { icon: HeartPulse, label: "Vitals", time: "2 min", color: "bg-pink-500" },
  { icon: Stethoscope, label: "Consultation", time: "10 min", color: "bg-teal-600" },
  { icon: ClipboardList, label: "Orders", time: "1-click", color: "bg-indigo-500" },
  { icon: FlaskConical, label: "Lab / Radiology", time: "Auto-routed", color: "bg-emerald-500" },
  { icon: Pill, label: "Pharmacy", time: "Auto-filled", color: "bg-orange-500" },
  { icon: Receipt, label: "Billing", time: "Auto-generated", color: "bg-amber-500" },
  { icon: LogOut, label: "Discharge", time: "15 min", color: "bg-green-600" },
];

export function ExecWorkflowSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-primary to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">End-to-End Flow</p>
          <h2 className="text-3xl font-extrabold text-foreground">Seamless Patient Journey</h2>
          <p className="text-sm text-muted-foreground mt-1">Walk-in to walkout — zero data re-entry, one unified system.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">7 / 12</span>
      </div>

      {/* Flow diagram */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-start gap-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center text-center w-[100px]">
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center text-white shadow-lg mb-2`}>
                  <step.icon className="h-7 w-7" />
                </div>
                <h4 className="font-semibold text-xs text-foreground mb-0.5">{step.label}</h4>
                <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">{step.time}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center mt-[-30px]">
                  <div className="w-4 h-0.5 bg-muted-foreground/20" />
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-extrabold text-primary">0</div>
          <div className="text-xs text-muted-foreground">Data Re-entries</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-extrabold text-primary">15 min</div>
          <div className="text-xs text-muted-foreground">Avg. Visit Time (was 45)</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-extrabold text-primary">100%</div>
          <div className="text-xs text-muted-foreground">Services Auto-Billed</div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

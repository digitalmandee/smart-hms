import { Scissors, Play, Clock, User, Stethoscope, MapPin, AlertTriangle, CheckCircle2, ClipboardList, Activity, Syringe } from "lucide-react";
import { cn } from "@/lib/utils";

export const OTDashboardSlide = () => {
  const progressPercent = 78;
  const isOvertime = false;

  return (
    <div className="slide flex flex-col bg-gradient-to-br from-teal-500/10 via-background to-teal-600/5">
      {/* Gradient Header Bar */}
      <div className="h-2 bg-gradient-to-r from-teal-500 to-teal-400 rounded-t-lg -mx-8 -mt-8 mb-6" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Live Surgery Dashboard</h2>
            <p className="text-sm text-muted-foreground">Real-time OT Monitoring & Documentation</p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
          23 / 32
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-5 gap-6">
        {/* Left: Timer Display (3 cols) */}
        <div className="col-span-3 space-y-4">
          {/* Surgery Status Card */}
          <div className="bg-card border-2 border-teal-500/30 rounded-2xl p-6 shadow-lg">
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-green-600 uppercase tracking-wider">
                  Surgery In Progress
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Started: 09:15 AM
              </div>
            </div>

            {/* Large Timer Display */}
            <div className="text-center py-6">
              <div className="text-6xl font-mono font-bold text-teal-600 tracking-wider mb-2">
                02:34:18
              </div>
              <p className="text-sm text-muted-foreground">
                Estimated: 3:00:00 | <span className="text-teal-600">On Track</span>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="relative h-4 rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    isOvertime ? "bg-red-500" : "bg-gradient-to-r from-teal-500 to-teal-400"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-bold text-teal-600">{progressPercent}% Complete</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Surgery Info Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <User className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-xs text-muted-foreground mb-1">Patient</div>
              <div className="font-semibold text-sm">Ahmed Khan</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <ClipboardList className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-xs text-muted-foreground mb-1">Procedure</div>
              <div className="font-semibold text-sm">Appendectomy</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <Stethoscope className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-xs text-muted-foreground mb-1">Lead Surgeon</div>
              <div className="font-semibold text-sm">Dr. Ali Ahmed</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <MapPin className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-xs text-muted-foreground mb-1">OT Room</div>
              <div className="font-semibold text-sm">OT-1</div>
            </div>
          </div>

          {/* Role Tabs Preview */}
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Role-Specific Documentation Tabs
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium text-center">
                <ClipboardList className="h-4 w-4 mx-auto mb-1" />
                Surgeon Notes
              </div>
              <div className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm font-medium text-center text-muted-foreground">
                <Activity className="h-4 w-4 mx-auto mb-1" />
                Anesthesia Vitals
              </div>
              <div className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm font-medium text-center text-muted-foreground">
                <Syringe className="h-4 w-4 mx-auto mb-1" />
                Instrument Count
              </div>
            </div>
          </div>
        </div>

        {/* Right: Features & Alerts (2 cols) */}
        <div className="col-span-2 space-y-4">
          {/* Key Features */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-bold mb-4">Dashboard Features</h3>
            <div className="space-y-3">
              {[
                "Real-time synchronized timers across all devices",
                "Overtime warnings with auto-escalation alerts",
                "Role-specific documentation (Surgeon/Anesthetist/Nurse)",
                "WHO Safety Checklist integration",
                "Digital consent with signature capture",
                "Instrument & sponge count verification",
                "Post-op order templates & PACU handoff",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Highlight Box */}
          <div className="bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-500/20">
                <AlertTriangle className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Completion Validation</h4>
                <p className="text-xs text-muted-foreground">
                  Surgery cannot be marked complete until all mandatory checks pass:
                  instrument counts verified, anesthesia records signed, and closure documented.
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-xs text-muted-foreground">WHO Checklist</div>
            </div>
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary">&lt;30min</div>
              <div className="text-xs text-muted-foreground">OT Turnaround</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS 24 - Hospital Management System</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
};

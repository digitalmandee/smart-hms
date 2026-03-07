import { Zap, Receipt, Pill, FlaskConical, UserCog, Warehouse, Shield, Bell, ArrowRight } from "lucide-react";

const automations = [
  {
    icon: Receipt,
    title: "Auto-Billing",
    before: "Manually create invoices after each service",
    after: "Bills auto-generate from consultations, labs, pharmacy orders",
  },
  {
    icon: Pill,
    title: "Drug Interaction Alerts",
    before: "Doctor manually checks drug compatibility",
    after: "Real-time AI alerts on prescription conflicts & allergies",
  },
  {
    icon: FlaskConical,
    title: "Lab Result Flagging",
    before: "Lab tech manually highlights abnormal values",
    after: "Auto-flags critical/abnormal results with doctor notifications",
  },
  {
    icon: UserCog,
    title: "Payroll from Biometric",
    before: "HR manually calculates hours from attendance sheets",
    after: "Auto payroll calculation from biometric device check-in/out",
  },
  {
    icon: Warehouse,
    title: "Inventory Reorder",
    before: "Staff checks stock levels daily and orders manually",
    after: "Auto-reorder alerts when stock hits minimum threshold",
  },
  {
    icon: Shield,
    title: "Insurance Claim Routing",
    before: "Staff manually fills claim forms and follows up",
    after: "Auto-routes claims with pre-filled data to insurance panel",
  },
  {
    icon: Bell,
    title: "Appointment Reminders",
    before: "Receptionist calls patients one by one",
    after: "Auto SMS/WhatsApp reminders reduce no-shows by 40%",
  },
  {
    icon: Zap,
    title: "Discharge Processing",
    before: "Multi-department clearance takes 2+ hours",
    after: "Automated clearance workflow completes in 15 minutes",
  },
];

export function ExecAutomationSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-amber-500/5 via-background to-primary/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-amber-500 to-primary rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-amber-600 font-semibold mb-1">Automation Engine</p>
          <h2 className="text-3xl font-extrabold text-foreground">Built-in Automation</h2>
          <p className="text-sm text-muted-foreground mt-1">Eliminate manual work. Let the system do the heavy lifting.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">11 / 16</span>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {automations.map((a) => (
          <div key={a.title} className="rounded-xl border bg-card p-4 flex gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <a.icon className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground text-sm mb-1.5">{a.title}</h4>
              <div className="flex items-start gap-2 text-[11px]">
                <div className="flex-1">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium mb-0.5">Before</span>
                  <p className="text-muted-foreground leading-snug">{a.before}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-primary mt-3 shrink-0" />
                <div className="flex-1">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium mb-0.5">After</span>
                  <p className="text-muted-foreground leading-snug">{a.after}</p>
                </div>
              </div>
            </div>
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

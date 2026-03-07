import { Stethoscope, Hotel, Siren, Scissors, HeartPulse } from "lucide-react";

const departments = [
  {
    icon: Stethoscope,
    name: "OPD",
    color: "bg-blue-500",
    borderColor: "border-blue-500/20",
    features: [
      "CNIC / ID auto-fill registration",
      "Queue & token management",
      "Vitals capture at check-in",
      "Consultation with AI summaries",
      "E-prescriptions with drug alerts",
    ],
  },
  {
    icon: Hotel,
    name: "IPD",
    color: "bg-indigo-500",
    borderColor: "border-indigo-500/20",
    features: [
      "Ward & bed management",
      "Admission workflow",
      "Nursing station dashboard",
      "Diet & kitchen orders",
      "Discharge with auto-billing",
    ],
  },
  {
    icon: Siren,
    name: "Emergency",
    color: "bg-red-500",
    borderColor: "border-red-500/20",
    features: [
      "Triage classification",
      "Casualty register",
      "Rapid admission to IPD",
      "Ambulance alert tracking",
      "Emergency vitals monitoring",
    ],
  },
  {
    icon: Scissors,
    name: "Surgery & OT",
    color: "bg-violet-500",
    borderColor: "border-violet-500/20",
    features: [
      "OT scheduling & calendar",
      "Surgical notes & checklists",
      "Anesthesia records",
      "Post-op monitoring",
      "Consumables tracking",
    ],
  },
  {
    icon: HeartPulse,
    name: "Nursing",
    color: "bg-pink-500",
    borderColor: "border-pink-500/20",
    features: [
      "Medication administration",
      "Vitals charting",
      "Shift handover notes",
      "Care plan tracking",
      "ANC / Maternity module",
    ],
  },
];

export function ExecClinicalSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-blue-500/5 via-background to-pink-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-blue-600 font-semibold mb-1">Clinical Depth</p>
          <h2 className="text-3xl font-extrabold text-foreground">Clinical Workflows — Every Department</h2>
          <p className="text-sm text-muted-foreground mt-1">From walk-in to discharge — every clinical touchpoint is covered.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">9 / 16</span>
      </div>

      <div className="grid grid-cols-5 gap-3 flex-1">
        {departments.map((dept) => (
          <div key={dept.name} className={`rounded-xl border ${dept.borderColor} bg-card p-4 flex flex-col`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg ${dept.color} flex items-center justify-center`}>
                <dept.icon className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-sm text-foreground">{dept.name}</h3>
            </div>
            <div className="space-y-1.5 flex-1">
              {dept.features.map((f) => (
                <div key={f} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
}

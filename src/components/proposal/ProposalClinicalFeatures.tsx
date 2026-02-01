import { UserPlus, Calendar, ListOrdered, Stethoscope, Ambulance, Bed, Heart, Pill, ClipboardCheck, Scissors, Syringe, ThermometerSun, Baby, Activity as ICUIcon } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

const modules = [
  { icon: UserPlus, name: "Patient Registration", features: ["CNIC/Passport lookup", "Photo capture", "Family linking", "Insurance mapping"] },
  { icon: Calendar, name: "Appointments", features: ["Multi-doctor scheduling", "SMS/WhatsApp reminders", "Online booking portal"] },
  { icon: ListOrdered, name: "Queue & Token", features: ["Auto token generation", "Digital display boards", "Priority escalation"] },
  { icon: Stethoscope, name: "OPD Consultation", features: ["EMR with templates", "Prescription builder", "Investigation orders"] },
  { icon: Ambulance, name: "Emergency (ER)", features: ["Triage tagging", "Trauma protocols", "Ambulance tracking"] },
  { icon: Bed, name: "IPD Admission", features: ["Bed allocation", "Ward transfers", "Deposit management"] },
  { icon: Heart, name: "Nursing Station", features: ["Vitals charting", "Care plans", "Shift handover notes"] },
  { icon: Pill, name: "Medication Charts", features: ["eMAR integration", "Drug interaction alerts", "Administration logs"] },
  { icon: ClipboardCheck, name: "Discharge", features: ["Summary generation", "Follow-up scheduling", "Final billing trigger"] },
  { icon: Scissors, name: "OT & Surgeries", features: ["Scheduling board", "Consent forms", "Surgical checklists"] },
  { icon: Syringe, name: "Anesthesia", features: ["Pre-op assessment", "Intra-op vitals log", "Recovery scoring"] },
  { icon: ThermometerSun, name: "PACU", features: ["Post-op monitoring", "Pain management", "Discharge criteria"] },
  { icon: ICUIcon, name: "ICU Management", features: ["Ventilator tracking", "Hourly charting", "Critical alerts"] },
  { icon: Baby, name: "Maternity & Pediatrics", features: ["ANC visits", "Labor tracking", "Newborn records", "Immunization"] },
];

export const ProposalClinicalFeatures = () => {
  return (
    <div className="proposal-page flex flex-col bg-background p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <HealthOS24Logo variant="full" size="md" />
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          03 / 10
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="w-16 h-1 bg-gradient-to-r from-teal-500 to-teal-400 rounded-full mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Clinical Operations</h2>
        <p className="text-muted-foreground">14 modules covering the complete patient journey</p>
      </div>

      {/* Modules Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-4 flex gap-4">
              <div className="p-2.5 rounded-lg bg-teal-500/10 h-fit">
                <Icon className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm mb-1">{mod.name}</h4>
                <ul className="space-y-0.5">
                  {mod.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-teal-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS 24 Proposal</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
};

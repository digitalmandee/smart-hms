import { Smile, Activity, Baby } from "lucide-react";

const specialties = [
  {
    icon: Smile,
    name: "Dental",
    color: "bg-sky-500",
    borderColor: "border-sky-500/20",
    points: [
      "Interactive 3D tooth chart",
      "Per-surface charting (M/D/O/B/L)",
      "Procedure catalog & treatment plans",
      "Intra-oral image attachments",
      "Treatment billing into the same invoice",
    ],
  },
  {
    icon: Activity,
    name: "Dialysis",
    color: "bg-emerald-500",
    borderColor: "border-emerald-500/20",
    points: [
      "Machine and chair scheduling",
      "Recurring session plans per patient",
      "Intra-session vitals charting",
      "Decoupled nurse and doctor workflow",
      "Consumables and session billing",
    ],
  },
  {
    icon: Baby,
    name: "Gyn & Obstetrics",
    color: "bg-rose-500",
    borderColor: "border-rose-500/20",
    points: [
      "ANC visit schedule and records",
      "Risk scoring and high-risk flags",
      "Labour, delivery and birth records",
      "Newborn linkage and immunization",
      "Postnatal follow-up reminders",
    ],
  },
];

export function ExecSpecialtyCareSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-sky-500/5 via-background to-rose-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-sky-500 via-emerald-500 to-rose-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-sky-600 font-semibold mb-1">Specialty Care</p>
          <h2 className="text-3xl font-extrabold text-foreground">Dental, Dialysis, Gyn &amp; Obstetrics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Specialty departments run inside the same patient record, billing and inventory.
          </p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">Appendix · A15</span>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {specialties.map((s) => (
          <div key={s.name} className={`rounded-xl border ${s.borderColor} bg-card p-5 flex flex-col`}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-base text-foreground">{s.name}</h3>
            </div>
            <div className="space-y-2 flex-1">
              {s.points.map((p) => (
                <div key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="leading-relaxed">{p}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border bg-card px-5 py-3 text-xs text-muted-foreground">
        Every specialty visit posts to the same ledger: services, consumables and doctor share are billed on one invoice,
        with results and images attached to the patient's single record.
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HMIS | Hospital Management Information System</span>
        <span>Confidential</span>
      </div>
    </div>
  );
}

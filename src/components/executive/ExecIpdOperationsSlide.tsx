import { BedDouble, Stethoscope, Syringe, ClipboardList } from "lucide-react";

const cards = [
  {
    icon: BedDouble,
    title: "Admission & Beds",
    color: "bg-blue-500",
    items: ["Ward / room / bed map", "Procedure + attending doctor at intake", "Transfers with audit history", "Deposit collection on admission"],
  },
  {
    icon: Stethoscope,
    title: "Ward Rounds",
    color: "bg-teal-500",
    items: ["Doctor notes & progress charting", "Vitals, intake/output, TPR", "Order sets for lab & imaging", "Discharge summary generation"],
  },
  {
    icon: Syringe,
    title: "Medication Administration",
    color: "bg-amber-500",
    items: ["Nurse MAR with time slots", "Ward stock issue tracking", "Administered dose auto-charges", "Allergy & interaction warnings"],
  },
  {
    icon: ClipboardList,
    title: "Discharge & Billing",
    color: "bg-purple-500",
    items: ["Running charge sheet per patient", "Deposit applied at settlement", "Insurance vs patient share split", "Final invoice with GL posting"],
  },
];

export function ExecIpdOperationsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-teal-500 to-purple-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-blue-600 font-semibold mb-1">Product</p>
          <h2 className="text-3xl font-extrabold text-foreground">Inpatient &amp; Ward Operations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Admission to discharge on one record, every charge captured as care is delivered.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {cards.map((c) => (
          <div key={c.title} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}>
                <c.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{c.title}</h3>
            </div>
            <ul className="space-y-1.5">
              {c.items.map((i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

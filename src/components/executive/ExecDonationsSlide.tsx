import { HeartHandshake, Megaphone, RefreshCw, Banknote, Droplet, Building2, Truck, FlaskConical, Pill } from "lucide-react";

const donationFlow = [
  { icon: HeartHandshake, title: "Donor record", desc: "Individual, corporate or zakat donor with contact and history." },
  { icon: Megaphone, title: "Campaign", desc: "Target amount, timeline and a shareable public campaign page." },
  { icon: RefreshCw, title: "Recurring schedule", desc: "Monthly or quarterly pledges with automatic reminders." },
  { icon: Banknote, title: "Posted to the GL", desc: "Each donation posts to a donation revenue account and appears in the P&L." },
];

const thalassemiaEnabled = [
  { icon: Droplet, label: "Blood bank & transfusion" },
  { icon: FlaskConical, label: "Laboratory" },
  { icon: Pill, label: "Pharmacy (chelation)" },
  { icon: HeartHandshake, label: "Donations & donors" },
  { icon: Truck, label: "Procurement (PR → PO → GRN)" },
  { icon: Building2, label: "Warehouse & stores" },
];

const thalassemiaOff = ["Surgery & OT", "Emergency", "Radiology", "Dialysis", "Dental"];

export function ExecDonationsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-fuchsia-500/5 via-background to-emerald-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-fuchsia-500 via-primary to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-fuchsia-600 font-semibold mb-1">Donations &amp; Facility Profiles</p>
          <h2 className="text-3xl font-extrabold text-foreground">Donor Management and Specialty Centres</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Donation income is tracked as revenue, and each facility type gets only the modules it needs.
          </p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">Appendix · A16</span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {donationFlow.map((d, i) => (
          <div key={d.title} className="rounded-xl border bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-fuchsia-500 flex items-center justify-center">
                <d.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">STEP {i + 1}</span>
            </div>
            <h4 className="font-bold text-sm text-foreground">{d.title}</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{d.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className="col-span-2 rounded-xl border bg-card p-5">
          <h3 className="font-bold text-base text-foreground mb-1">Thalassemia Care Centre profile</h3>
          <p className="text-xs text-muted-foreground mb-4">
            A preset switches the platform into a day-care transfusion operation, no custom build required.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {thalassemiaEnabled.map((m) => (
              <div key={m.label} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                <m.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-[11px] font-medium text-foreground">{m.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Switched off by default: {thalassemiaOff.join(" · ")}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 flex flex-col gap-3">
          <h3 className="font-bold text-base text-foreground">Why it matters</h3>
          {[
            "Charity-funded centres see donation income and patient revenue in one P&L.",
            "Procurement and warehouse stay mandatory, so stock and cost of care are auditable.",
            "The same deployment serves hospitals, polyclinics and specialty centres.",
          ].map((t) => (
            <div key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="text-primary mt-0.5">•</span>
              <span className="leading-relaxed">{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HMIS | Hospital Management Information System</span>
        <span>Confidential</span>
      </div>
    </div>
  );
}

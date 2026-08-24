import { MonitorSmartphone, Ticket, QrCode, Languages } from "lucide-react";

const cards = [
  {
    icon: Ticket,
    title: "Token & Queue",
    color: "bg-teal-500",
    items: ["Walk-in registration in 4 steps", "Live token display screens", "Per-doctor queue with call-next", "Average wait time tracking"],
  },
  {
    icon: QrCode,
    title: "Self-Service Kiosk",
    color: "bg-blue-500",
    items: ["QR check-in at arrival", "Kiosk registration & token print", "Report pickup by QR", "No staff queue for repeat visits"],
  },
  {
    icon: MonitorSmartphone,
    title: "Patient Mobile Access",
    color: "bg-amber-500",
    items: ["Appointment booking", "Lab & imaging reports online", "Invoice and payment history", "Prescription history"],
  },
  {
    icon: Languages,
    title: "Trilingual Interface",
    color: "bg-purple-500",
    items: ["English, Arabic, Urdu", "Full right-to-left layout", "Hijri and Gregorian dates", "Printed documents follow language"],
  },
];

export function ExecPatientExperienceSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-amber-500/5 via-background to-teal-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-amber-500 via-teal-500 to-blue-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-amber-600 font-semibold mb-1">Product</p>
          <h2 className="text-3xl font-extrabold text-foreground">Patient Experience</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Check-in, queue, reports, and payments handled in the patient&apos;s own language.
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
                  <span className="text-amber-600">•</span>
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

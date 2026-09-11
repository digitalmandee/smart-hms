import { Bot, Mic, ClipboardList, FileText, Clock, Languages, Stethoscope, ShieldCheck } from "lucide-react";

const capabilities = [
  { icon: Mic, title: "Speaks with the patient", desc: "Live voice consultation in English, Arabic or Urdu. The patient just talks, no typing, no forms.", color: "bg-rose-500" },
  { icon: ClipboardList, title: "Writes the clinical summary", desc: "History, symptoms and duration arrive on the doctor's screen before the patient walks in.", color: "bg-emerald-500" },
  { icon: FileText, title: "Drafts the prescription", desc: "Suggested medicines with dosage, checked for interactions, sent to the doctor for approval.", color: "bg-blue-500" },
  { icon: Stethoscope, title: "Dictated SOAP notes", desc: "The doctor speaks during the consultation; the note is written into the patient record.", color: "bg-indigo-500" },
  { icon: Clock, title: "Screens round the clock", desc: "Patients get guidance at any hour; urgent cases are pushed up the queue.", color: "bg-amber-500" },
  { icon: ShieldCheck, title: "Doctor always decides", desc: "Nothing is prescribed or filed until a doctor reviews and signs it.", color: "bg-teal-500" },
];

export function PitchTabeebiSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-pink-500/10 via-background to-primary/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-pink-500 via-primary to-rose-400 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-500 to-primary shadow-lg">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-pink-600 font-semibold mb-1">Our own medical AI</p>
            <h2 className="text-3xl font-extrabold text-foreground">Tabeebi, the AI doctor inside the system</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Included with every installation. It talks to patients, prepares the case and hands it to your doctor.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Languages className="h-4 w-4 text-pink-600" />
          {["EN", "عربي", "اردو"].map((l) => (
            <span key={l} className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-600 text-[10px] font-bold">{l}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {capabilities.map((c) => (
          <div key={c.title} className="rounded-xl border bg-card p-5 flex flex-col">
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3 shadow-lg`}>
              <c.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="font-bold text-sm text-foreground mb-1.5">{c.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {[
          "Patient speaks",
          "Tabeebi asks & records",
          "Summary on doctor's screen",
          "Doctor confirms & prescribes",
        ].map((s, i) => (
          <div key={s} className="rounded-lg border bg-muted/30 px-3 py-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-pink-500 text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
            <span className="text-[11px] font-medium text-foreground leading-tight">{s}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HMIS | Hospital Management Information System</span>
        <span>7 / 11</span>
      </div>
    </div>
  );
}

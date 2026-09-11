import { Mic, FileText, Pill, ShieldAlert, Boxes, Receipt, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const soapLines = [
  { k: "S", t: "\"Fever for three days, cough at night, no chest pain.\"" },
  { k: "O", t: "Temp 38.4 °C · BP 120/80 · Chest clear" },
  { k: "A", t: "Acute viral upper respiratory infection" },
  { k: "P", t: "Paracetamol 500 mg TDS × 5 days · CBC · review in 3 days" },
];

const pharmacySteps = [
  { icon: Pill, title: "Prescription lands in the pharmacy queue", desc: "No re-typing, no paper slip, no lost handwriting." },
  { icon: ShieldAlert, title: "Interaction and allergy check first", desc: "Blocked before dispensing if it clashes with the patient's medicines." },
  { icon: Boxes, title: "Batch and expiry picked automatically", desc: "Oldest valid batch selected and stock deducted on the spot." },
  { icon: Receipt, title: "Price, cost and invoice posted instantly", desc: "Sale, cost of goods and ledger entries land in the same second." },
];

const outcomes = ["No typing", "No re-entry", "No stock guesswork", "No missed charge"];

export function PitchPharmacyAiSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-rose-500/5 via-background to-emerald-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-rose-500 via-primary to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-5" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-rose-600 font-semibold mb-1">The Flagship Flow</p>
          <h2 className="text-3xl font-extrabold text-foreground">The doctor speaks. The pharmacy is already ready.</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Voice becomes a signed SOAP note, the note becomes a prescription, the prescription moves stock, price and the ledger.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-emerald-500 flex items-center justify-center shadow-lg shrink-0">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 flex-1">
        {/* AI SOAP notes */}
        <div className="rounded-xl border bg-card p-5 flex flex-col">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-rose-500 flex items-center justify-center shadow">
              <Mic className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">AI SOAP notes</div>
              <div className="text-[11px] text-muted-foreground">Dictate in English, Arabic or Urdu</div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 space-y-2 flex-1">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              <FileText className="h-3 w-3" /> Consultation note, written automatically
            </div>
            {soapLines.map((l) => (
              <div key={l.k} className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded bg-rose-500/15 text-rose-600 text-[10px] font-extrabold flex items-center justify-center shrink-0">{l.k}</span>
                <span className="text-[11px] text-foreground leading-snug">{l.t}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-semibold text-emerald-700">
              Nothing is saved until the doctor reviews and signs it.
            </span>
          </div>
        </div>

        {/* Pharmacy */}
        <div className="rounded-xl border bg-card p-5 flex flex-col">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow">
              <Pill className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">Pharmacy reacts in the same second</div>
              <div className="text-[11px] text-muted-foreground">One prescription, four things done</div>
            </div>
          </div>

          <div className="space-y-2.5 flex-1">
            {pharmacySteps.map((s) => (
              <div key={s.title} className="flex gap-3 rounded-lg border bg-muted/20 p-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-[11.5px] font-bold text-foreground leading-tight">{s.title}</div>
                  <div className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flow strip */}
      <div className="mt-4 rounded-xl border bg-card px-4 py-3 flex items-center justify-between">
        {["Doctor speaks", "SOAP note written", "Doctor signs", "Pharmacy dispenses", "Stock & invoice posted"].map((step, i, arr) => (
          <div key={step} className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-foreground">{step}</span>
            {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-primary" />}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {outcomes.map((o) => (
          <span key={o} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">{o}</span>
        ))}
      </div>

      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground relative z-10">
        <span>HMIS | Hospital Management Information System</span>
        <span>8 / 12</span>
      </div>
    </div>
  );
}

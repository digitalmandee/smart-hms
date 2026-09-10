import {
  Globe, Monitor, FileSignature, QrCode, FileText, Receipt, FileBox, Printer,
  ShieldCheck, CheckCircle2, ArrowRight, XCircle,
} from "lucide-react";

const SlideFooter = ({ label }: { label: string }) => (
  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground relative z-10">
    <span>HMIS | Hospital Management Information System</span>
    <span>{label}</span>
  </div>
);

/* Paper file → digital record, step by step */
const flow = [
  { paper: "Registration form on paper", digital: "Web / kiosk registration with QR patient card", icon: QrCode },
  { paper: "Handwritten case sheet", digital: "Web consultation chart with voice-dictated notes", icon: Monitor },
  { paper: "Paper lab requisition slip", digital: "Order raised on screen, reaches the lab instantly", icon: FileText },
  { paper: "Printed report collected at counter", digital: "Report published to portal, phone and email", icon: FileBox },
  { paper: "Handwritten prescription", digital: "e-Prescription sent straight to the pharmacy", icon: FileSignature },
  { paper: "Manual bill book & cash slips", digital: "e-Invoice with ZATCA QR, digital receipt", icon: Receipt },
  { paper: "Signed consent in a folder", digital: "On-screen consent, signed and stored with the record", icon: ShieldCheck },
  { paper: "Files stored in the records room", digital: "Scanned documents attached to the patient record", icon: FileBox },
];

const gains = [
  "Nothing is written twice, so nothing is lost between departments",
  "Any authorised user opens the full history from any browser",
  "Every entry carries who did it and when, ready for audit",
  "Printing stays optional, for the patient who wants a copy",
];

export function PitchPaperlessSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-sky-500/5 via-background to-emerald-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-sky-500 via-primary to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-5" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-sky-600 font-semibold mb-1">Paperless</p>
          <h2 className="text-3xl font-extrabold text-foreground">The whole hospital runs in a browser</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Nothing to install. Every paper form, slip and file has a digital replacement inside the same record.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full bg-muted text-foreground">
            <Globe className="h-3 w-3 text-primary" />Web-based, any device
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full bg-muted text-foreground">
            <Printer className="h-3 w-3 text-primary" />Print only if asked
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 flex-1 content-start">
        {flow.map((f) => (
          <div key={f.paper} className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
              <f.icon className="h-4 w-4 text-sky-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground line-through">
                <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                <span className="truncate">{f.paper}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mt-0.5">
                <ArrowRight className="h-3 w-3 text-emerald-600 shrink-0" />
                <span className="leading-tight">{f.digital}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {gains.map((g) => (
          <div key={g} className="rounded-xl border bg-card px-3 py-2.5 flex gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-tight">{g}</p>
          </div>
        ))}
      </div>

      <SlideFooter label="6 / 10" />
    </div>
  );
}

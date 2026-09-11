import {
  Globe, Monitor, FileSignature, QrCode, FileText, Receipt, FileBox,
  ShieldCheck, CheckCircle2, Lock, Wifi, Files, Clock, Search,
} from "lucide-react";

const SlideFooter = ({ label }: { label: string }) => (
  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground relative z-10">
    <span>HMIS | Hospital Management Information System</span>
    <span>{label}</span>
  </div>
);

/* What used to be paper, and what it is now */
const swaps = [
  { paper: "Registration form", digital: "Online / kiosk registration with QR card", icon: QrCode },
  { paper: "Handwritten case sheet", digital: "Consultation chart with voice notes", icon: Monitor },
  { paper: "Lab requisition slip", digital: "Order reaches the lab instantly", icon: FileText },
  { paper: "Report at the counter", digital: "Published to portal, phone and email", icon: FileBox },
  { paper: "Handwritten prescription", digital: "e-Prescription straight to pharmacy", icon: FileSignature },
  { paper: "Bill book and cash slips", digital: "e-Invoice with ZATCA QR", icon: Receipt },
  { paper: "Consent in a folder", digital: "Signed on screen, stored with record", icon: ShieldCheck },
  { paper: "Records room", digital: "Every document on the patient file", icon: Files },
];

const gains = [
  { icon: Clock, text: "Nothing written twice between departments" },
  { icon: Search, text: "Full history opens from any browser" },
  { icon: Lock, text: "Every entry stamped with who and when" },
  { icon: Wifi, text: "No installs, no servers in the hospital" },
];

export function PitchPaperlessSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-sky-500/5 via-background to-emerald-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-sky-500 via-primary to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-5" />

      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-sm text-sky-600 font-semibold mb-1">Paperless</p>
          <h2 className="text-3xl font-extrabold text-foreground">Every paper form has a digital twin</h2>
          <p className="text-sm text-muted-foreground mt-1">
            One browser tab replaces the forms, slips, files and bill books moving around the hospital.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-700 shrink-0">
          <Globe className="h-3 w-3" />Web-based, any device
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1 content-start">
        {swaps.map((s) => (
          <div
            key={s.paper}
            className="group rounded-xl border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3.5 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500/15 to-emerald-500/15 flex items-center justify-center shrink-0">
              <s.icon className="h-4 w-4 text-sky-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70 line-through decoration-red-400/70">
                {s.paper}
              </p>
              <p className="text-[11.5px] font-semibold text-foreground leading-snug">{s.digital}</p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border bg-card px-4 py-3 grid grid-cols-4 gap-4">
        {gains.map((g) => (
          <div key={g.text} className="flex items-center gap-2.5">
            <g.icon className="h-4 w-4 text-emerald-600 shrink-0" />
            <p className="text-[10.5px] text-muted-foreground leading-tight">{g.text}</p>
          </div>
        ))}
      </div>

      <SlideFooter label="6 / 12" />
    </div>
  );
}

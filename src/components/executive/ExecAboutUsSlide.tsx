import { Quote, GraduationCap, Code2, Stethoscope, MapPin } from "lucide-react";

// Founder story slide (replaces the old "About Us" feature grid).
// EDIT the FOUNDER_* constants below with real bio / quote / photo before sending the deck.
const FOUNDER_NAME = "Ahmed Raza";
const FOUNDER_ROLE = "Founder & CEO, HealthOS 24";
const FOUNDER_LOCATION = "Riyadh, Saudi Arabia";
const FOUNDER_PHOTO_INITIALS = "AR";

const credentials = [
  { icon: Stethoscope, label: "5+ years in MENA health-tech" },
  { icon: Code2, label: "Built and shipped 28 production modules" },
  { icon: GraduationCap, label: "Computer Science, founder-engineer" },
];

export function ExecAboutUsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background to-primary/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">Founder Story</p>
          <h2 className="text-3xl font-extrabold text-foreground">Why we are building this</h2>
          <p className="text-sm text-muted-foreground mt-1">
            The "aha" moment that started HealthOS 24.
          </p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">2 / 32</span>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-6">
        {/* Founder card */}
        <div className="col-span-2 rounded-2xl border bg-card p-6 flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-4xl font-extrabold shadow-xl mb-4">
            {FOUNDER_PHOTO_INITIALS}
          </div>
          <h3 className="text-xl font-extrabold text-foreground">{FOUNDER_NAME}</h3>
          <p className="text-sm text-primary font-semibold mt-1">{FOUNDER_ROLE}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
            <MapPin className="h-3 w-3" />
            <span>{FOUNDER_LOCATION}</span>
          </div>

          <div className="w-full mt-6 space-y-2">
            {credentials.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-xs text-foreground bg-muted/40 rounded-lg px-3 py-2">
                <c.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-medium text-left">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Origin story */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="rounded-2xl border bg-card p-6 flex-1">
            <Quote className="h-8 w-8 text-primary/30 mb-3" />
            <p className="text-base text-foreground leading-relaxed">
              I spent years inside MENA hospitals watching brilliant doctors fight their software more than they treated patients. Cerner cost millions and still left gaps. Local tools couldn't speak Arabic, couldn't talk to NPHIES, couldn't keep up with Vision 2030.
            </p>
            <p className="text-base text-foreground leading-relaxed mt-3">
              So we built the system we wished existed. Saudi-native, AI-first, priced for the region, and already running real clinics today.
            </p>
            <div className="text-xs text-muted-foreground italic mt-4 font-semibold">
              — {FOUNDER_NAME}
            </div>
          </div>

          <div className="rounded-xl border bg-primary/5 border-primary/20 px-5 py-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">What we believe</p>
            <p className="text-sm text-foreground font-medium leading-relaxed">
              Saudi healthcare deserves software built for Saudi healthcare. Not a global product translated. Not a local shortcut.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

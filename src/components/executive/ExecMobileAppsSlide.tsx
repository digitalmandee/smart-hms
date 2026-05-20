import {
  Stethoscope,
  HeartPulse,
  User,
  ClipboardList,
  Smartphone,
  Wifi,
  Fingerprint,
  Bell,
  Mic,
  Calendar,
  FlaskConical,
  CheckCircle2,
  Apple,
  ShieldCheck,
} from "lucide-react";

const apps = [
  { icon: Stethoscope, title: "Doctor", line: "Rounds, voice SOAP, e-Rx" },
  { icon: HeartPulse, title: "Nurse", line: "Vitals, BCMA, handover" },
  { icon: User, title: "Patient", line: "Appointments, results, bills" },
  { icon: ClipboardList, title: "Reception", line: "Check-in, tokens, POS" },
];

const techChips = [
  { icon: Smartphone, label: "iOS + Android (Capacitor)" },
  { icon: Wifi, label: "Offline sync built-in" },
  { icon: Fingerprint, label: "Biometric login" },
  { icon: Bell, label: "Push notifications" },
];

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[180px] h-[360px] rounded-[34px] bg-foreground/90 p-[3px] shadow-xl">
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-foreground rounded-b-2xl z-10" />
      <div className="w-full h-full rounded-[31px] overflow-hidden bg-background flex flex-col">
        {children}
      </div>
    </div>
  );
}

export function ExecMobileAppsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background to-primary/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">Mobile, Already Shipped</p>
          <h2 className="text-3xl font-extrabold text-foreground">Native apps for every role</h2>
          <p className="text-sm text-muted-foreground mt-1">
            iOS and Android in production. Clinicians, patients and staff carry the hospital in their pocket.
          </p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">16 / 31</span>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-6 items-center">
        {/* Phones */}
        <div className="col-span-3 flex items-center justify-center gap-6 relative">
          {/* Doctor phone */}
          <PhoneFrame>
            <div className="px-3 pt-4 pb-2">
              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <span className="font-semibold">9:41</span>
                <span className="font-semibold">Doctor</span>
              </div>
              <div className="mt-2">
                <div className="text-[10px] text-muted-foreground">Good morning</div>
                <div className="text-sm font-extrabold text-foreground">Dr. Khalid</div>
              </div>
            </div>

            <div className="px-3 flex-1 flex flex-col gap-2">
              <div className="rounded-xl bg-primary p-2.5 text-primary-foreground">
                <div className="text-[9px] uppercase tracking-wide opacity-80">Today</div>
                <div className="text-xl font-extrabold leading-tight">12 rounds</div>
                <div className="text-[10px] opacity-90">8 OPD waiting</div>
              </div>

              <div className="rounded-lg border bg-card p-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="text-[10px] flex-1 min-w-0">
                  <div className="font-bold text-foreground leading-tight truncate">Bed 204 · A. Salem</div>
                  <div className="text-muted-foreground leading-tight">Post-op day 2</div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <FlaskConical className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="text-[10px] flex-1 min-w-0">
                  <div className="font-bold text-foreground leading-tight truncate">CBC ready · ICU-3</div>
                  <div className="text-destructive font-semibold leading-tight">Flagged abnormal</div>
                </div>
              </div>
            </div>

            <div className="px-3 pb-3 pt-2">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-2 flex items-center justify-center gap-2 text-primary">
                <Mic className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold">Voice SOAP</span>
              </div>
            </div>
          </PhoneFrame>

          {/* Patient phone */}
          <PhoneFrame>
            <div className="px-3 pt-4 pb-2">
              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <span className="font-semibold">9:41</span>
                <span className="font-semibold">Patient</span>
              </div>
              <div className="mt-2">
                <div className="text-[10px] text-muted-foreground">Welcome back</div>
                <div className="text-sm font-extrabold text-foreground">Sara A.</div>
              </div>
            </div>

            <div className="px-3 flex-1 flex flex-col gap-2">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5">
                <div className="flex items-center gap-1.5 text-primary">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[9px] uppercase tracking-wide font-bold">Next visit</span>
                </div>
                <div className="text-sm font-extrabold leading-tight mt-0.5 text-foreground">Tue · 10:30</div>
                <div className="text-[10px] text-muted-foreground">Dr. Khalid · OPD-2</div>
              </div>

              <div className="rounded-lg border bg-card p-2">
                <div className="text-[9px] uppercase text-muted-foreground font-bold tracking-wide">Lab results</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <div className="text-[10px] text-foreground font-bold flex-1">CBC · Normal</div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <div className="text-[10px] text-foreground font-bold flex-1">Lipid · Normal</div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-2">
                <div className="text-[9px] uppercase text-muted-foreground font-bold tracking-wide">Invoice</div>
                <div className="text-sm font-extrabold text-foreground">SAR 420.00</div>
                <div className="text-[10px] text-primary font-bold">Paid</div>
              </div>
            </div>

            <div className="px-3 pb-3 pt-2">
              <div className="rounded-xl bg-primary p-2 flex items-center justify-center gap-2 text-primary-foreground">
                <Fingerprint className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold">Sign in</span>
              </div>
            </div>
          </PhoneFrame>
        </div>

        {/* Roles & store badges */}
        <div className="col-span-2 flex flex-col gap-2.5">
          {apps.map((a) => (
            <div
              key={a.title}
              className="rounded-xl border bg-card p-3 flex items-center gap-3 hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <a.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground text-sm">{a.title}</div>
                <div className="text-[11px] text-muted-foreground">{a.line}</div>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="rounded-lg border bg-card px-3 py-2 flex items-center gap-2">
              <Apple className="h-4 w-4 text-foreground shrink-0" />
              <div className="leading-tight">
                <div className="text-[8px] text-muted-foreground uppercase tracking-wide">Download on</div>
                <div className="text-[11px] font-bold text-foreground">App Store</div>
              </div>
            </div>
            <div className="rounded-lg border bg-card px-3 py-2 flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-primary shrink-0" />
              <div className="leading-tight">
                <div className="text-[8px] text-muted-foreground uppercase tracking-wide">Get it on</div>
                <div className="text-[11px] font-bold text-foreground">Google Play</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {techChips.map((c) => (
          <div key={c.label} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <c.icon className="h-4 w-4 text-primary shrink-0" />
            <span className="text-[11px] text-foreground font-medium">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-primary">
            PDPL-aware · Arabic RTL · Nafath and Sehhaty integration paths
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

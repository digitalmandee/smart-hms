import { Stethoscope, HeartPulse, User, ClipboardList, Smartphone, Wifi, Fingerprint, Bell, Globe, Mic, Calendar, FlaskConical, CheckCircle2 } from "lucide-react";

const apps = [
  { icon: Stethoscope, title: "Doctor", color: "bg-blue-500", line: "Rounds, voice SOAP, e-Rx" },
  { icon: HeartPulse, title: "Nurse", color: "bg-rose-500", line: "Vitals, BCMA, handover" },
  { icon: User, title: "Patient", color: "bg-emerald-500", line: "Appointments, results, bills" },
  { icon: ClipboardList, title: "Reception", color: "bg-amber-500", line: "Check-in, tokens, POS" },
];

const techChips = [
  { icon: Smartphone, label: "Capacitor: iOS + Android" },
  { icon: Wifi, label: "Offline sync built-in" },
  { icon: Fingerprint, label: "Biometric login" },
  { icon: Bell, label: "Push notifications" },
];

function PhoneFrame({
  tint,
  children,
}: {
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-[180px] h-[360px] rounded-[36px] bg-slate-900 p-2 shadow-2xl border-4 border-slate-800">
      <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-b-2xl z-10`} />
      <div className={`w-full h-full rounded-[28px] overflow-hidden bg-gradient-to-br ${tint} p-3 flex flex-col gap-2`}>
        {children}
      </div>
    </div>
  );
}

export function ExecMobileAppsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-cyan-500/5 via-background to-blue-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 rounded-t-lg -mx-8 -mt-8 mb-5" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-cyan-600 font-semibold mb-1">Mobile-First, Already Shipped</p>
          <h2 className="text-3xl font-extrabold text-foreground">Native Apps for Every Role</h2>
          <p className="text-sm text-muted-foreground mt-1">
            iOS and Android in production. Clinicians, patients and staff carry the hospital in their pocket.
          </p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">16 / 30</span>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-6 items-center">
        {/* Phones */}
        <div className="col-span-3 flex items-center justify-center gap-6">
          <PhoneFrame tint="from-blue-600 to-indigo-700">
            <div className="flex items-center justify-between text-white text-[9px] pt-3 px-1 opacity-80">
              <span>9:41</span>
              <span>Doctor</span>
            </div>
            <div className="text-white">
              <div className="text-[10px] opacity-80">Good morning</div>
              <div className="text-sm font-bold">Dr. Khalid</div>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur p-2.5 text-white">
              <div className="text-[9px] opacity-80 uppercase tracking-wide">Today</div>
              <div className="text-xl font-extrabold leading-tight">12 rounds</div>
              <div className="text-[10px] opacity-80">8 OPD waiting</div>
            </div>
            <div className="rounded-xl bg-white p-2 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="text-[10px] flex-1">
                <div className="font-bold text-slate-900 leading-tight">Bed 204 · A. Salem</div>
                <div className="text-slate-500 leading-tight">Post-op day 2</div>
              </div>
            </div>
            <div className="rounded-xl bg-white p-2 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div className="text-[10px] flex-1">
                <div className="font-bold text-slate-900 leading-tight">CBC ready · ICU-3</div>
                <div className="text-rose-600 font-semibold leading-tight">Flagged abnormal</div>
              </div>
            </div>
            <div className="mt-auto rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 p-2.5 flex items-center justify-center gap-2 text-white">
              <Mic className="h-4 w-4" />
              <span className="text-[11px] font-bold">Voice note</span>
            </div>
          </PhoneFrame>

          <PhoneFrame tint="from-emerald-500 to-teal-600">
            <div className="flex items-center justify-between text-white text-[9px] pt-3 px-1 opacity-80">
              <span>9:41</span>
              <span>Patient</span>
            </div>
            <div className="text-white">
              <div className="text-[10px] opacity-80">Welcome back</div>
              <div className="text-sm font-bold">Sara A.</div>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur p-2.5 text-white">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span className="text-[9px] opacity-80 uppercase tracking-wide">Next visit</span>
              </div>
              <div className="text-sm font-extrabold leading-tight mt-0.5">Tue · 10:30</div>
              <div className="text-[10px] opacity-80">Dr. Khalid · OPD-2</div>
            </div>
            <div className="rounded-xl bg-white p-2">
              <div className="text-[9px] uppercase text-slate-500 font-bold tracking-wide">Lab results</div>
              <div className="flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <div className="text-[10px] text-slate-900 font-bold flex-1">CBC · Normal</div>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <div className="text-[10px] text-slate-900 font-bold flex-1">Lipid · Normal</div>
              </div>
            </div>
            <div className="rounded-xl bg-white p-2">
              <div className="text-[9px] uppercase text-slate-500 font-bold tracking-wide">Invoice</div>
              <div className="text-sm font-extrabold text-slate-900">SAR 420.00</div>
              <div className="text-[10px] text-emerald-600 font-bold">Paid</div>
            </div>
            <div className="mt-auto rounded-2xl bg-white p-2 flex items-center justify-center gap-2 text-emerald-700">
              <Fingerprint className="h-4 w-4" />
              <span className="text-[11px] font-bold">Sign in</span>
            </div>
          </PhoneFrame>
        </div>

        {/* Roles & details */}
        <div className="col-span-2 flex flex-col gap-2.5">
          {apps.map((a) => (
            <div key={a.title} className="rounded-xl border bg-card p-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                <a.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-foreground text-sm">{a.title}</div>
                <div className="text-[11px] text-muted-foreground">{a.line}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {techChips.map((c) => (
          <div key={c.label} className="flex items-center gap-2 rounded-lg border bg-card/60 px-3 py-2">
            <c.icon className="h-4 w-4 text-cyan-600 shrink-0" />
            <span className="text-[11px] text-foreground font-medium">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <Globe className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-[11px] font-semibold text-emerald-700">
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

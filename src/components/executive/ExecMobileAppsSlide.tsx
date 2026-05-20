import { Stethoscope, HeartPulse, User, ClipboardList, Smartphone, Download, Wifi, Fingerprint, Bell, Globe } from "lucide-react";

const apps = [
  {
    icon: Stethoscope,
    title: "Doctor App",
    color: "bg-blue-500",
    points: [
      "Today's rounds & OPD queue",
      "Voice SOAP notes (Tabeebi)",
      "e-Prescribing + lab / imaging orders",
      "Offline-capable rounding",
    ],
  },
  {
    icon: HeartPulse,
    title: "Nurse App",
    color: "bg-rose-500",
    points: [
      "Vitals capture & med admin (BCMA-ready)",
      "Task lists & shift handover",
      "Barcode patient ID",
      "Real-time alerts",
    ],
  },
  {
    icon: User,
    title: "Patient App",
    color: "bg-emerald-500",
    points: [
      "Appointments, lab / imaging results",
      "Prescriptions, invoices, deposits",
      "Push notifications & biometric login",
      "Nafath / Sehhaty-ready",
    ],
  },
  {
    icon: ClipboardList,
    title: "Staff / Reception App",
    color: "bg-amber-500",
    points: [
      "Check-in, token queue, POS dispensing",
      "Pull-to-refresh + native haptics",
      "Inventory & stock counts on the floor",
      "Multi-branch switching",
    ],
  },
];

const techChips = [
  { icon: Smartphone, label: "Capacitor — iOS + Android binaries" },
  { icon: Download, label: "Installable PWA — instant install, no store" },
  { icon: Wifi, label: "Offline sync · Push · Biometric · Deep links" },
];

export function ExecMobileAppsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-cyan-500/5 via-background to-blue-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-cyan-600 font-semibold mb-1">Mobile-First, Already Shipped</p>
          <h2 className="text-3xl font-extrabold text-foreground">Native Apps for Every Role</h2>
          <p className="text-sm text-muted-foreground mt-1">
            iOS + Android + PWA — clinicians, patients, and staff carry the hospital in their pocket.
          </p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">17 / 30</span>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {apps.map((a) => (
          <div key={a.title} className="rounded-xl border bg-card p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-11 h-11 rounded-xl ${a.color} flex items-center justify-center text-white shadow-md`}>
                <a.icon className="h-5 w-5" />
              </div>
              <div className="font-bold text-foreground text-base">{a.title}</div>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
              {a.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-cyan-600 mt-1">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
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
            PDPL-aware · Arabic RTL · Nafath / Sehhaty integration paths
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

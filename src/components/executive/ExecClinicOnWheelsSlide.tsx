import { Truck, Stethoscope, FlaskConical, Pill, Video, Activity, Syringe, MapPin, Users, TrendingDown, Building2 } from "lucide-react";

const capabilities = [
  { icon: Stethoscope, label: "OPD Pod" },
  { icon: FlaskConical, label: "POC Lab" },
  { icon: Pill, label: "Mini Pharmacy" },
  { icon: Video, label: "Telemedicine" },
  { icon: Activity, label: "ECG / Ultrasound" },
  { icon: Syringe, label: "Vaccination, cold chain" },
];

const kpis = [
  { icon: MapPin, value: "5", label: "Target cities", color: "text-emerald-600 bg-emerald-500/10" },
  { icon: Truck, value: "20", label: "Year-1 vans", color: "text-blue-600 bg-blue-500/10" },
  { icon: Users, value: "~2M", label: "Underserved reach", color: "text-purple-600 bg-purple-500/10" },
  { icon: TrendingDown, value: "-70%", label: "CAPEX vs brick & mortar", color: "text-amber-600 bg-amber-500/10" },
];

const useCases = [
  "Hajj & Umrah pilgrim care",
  "Rural villages & desert outposts",
  "Corporate camps (Aramco / SABIC)",
  "School & university screenings",
  "Disaster & emergency response",
];

export function ExecClinicOnWheelsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-blue-500/5 via-background to-emerald-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-5" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold mb-1 text-blue-600">🚐 KSA Expansion Module</p>
          <h2 className="text-3xl font-extrabold text-foreground">Clinic on Wheels</h2>
          <p className="text-sm text-muted-foreground mt-1">Healthcare that comes to the patient. Vision 2030 aligned</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">16 / 32</span>
      </div>

      {/* Hero strip: van + capabilities */}
      <div className="rounded-xl border bg-card p-4 mb-4">
        <div className="flex items-center gap-5">
          {/* Stylized van SVG */}
          <svg viewBox="0 0 220 110" className="h-28 w-auto shrink-0" xmlns="http://www.w3.org/2000/svg" aria-label="Clinic on Wheels van">
            <defs>
              <linearGradient id="vanBody" x1="0" x2="1">
                <stop offset="0" stopColor="hsl(var(--primary))" />
                <stop offset="1" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <rect x="20" y="35" width="150" height="50" rx="8" fill="url(#vanBody)" />
            <polygon points="170,35 210,55 210,85 170,85" fill="url(#vanBody)" />
            <rect x="178" y="45" width="26" height="20" rx="3" fill="rgba(255,255,255,0.85)" />
            <rect x="30" y="45" width="40" height="20" rx="2" fill="rgba(255,255,255,0.85)" />
            <rect x="80" y="45" width="40" height="20" rx="2" fill="rgba(255,255,255,0.85)" />
            <rect x="125" y="45" width="35" height="20" rx="2" fill="rgba(255,255,255,0.85)" />
            <circle cx="55" cy="92" r="13" fill="#1f2937" />
            <circle cx="55" cy="92" r="5" fill="#9ca3af" />
            <circle cx="180" cy="92" r="13" fill="#1f2937" />
            <circle cx="180" cy="92" r="5" fill="#9ca3af" />
            {/* red cross */}
            <rect x="92" y="68" width="16" height="4" fill="#ef4444" />
            <rect x="98" y="62" width="4" height="16" fill="#ef4444" />
          </svg>

          <div className="flex-1 grid grid-cols-3 gap-2">
            {capabilities.map((c) => (
              <div key={c.label} className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5">
                <c.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold text-foreground">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border bg-card p-3 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${k.color} flex items-center justify-center shrink-0`}>
              <k.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground leading-none">{k.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Use cases + tech callout */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className="col-span-2 rounded-xl border bg-card p-4">
          <h3 className="font-bold text-foreground text-sm mb-2">Use cases, where vans go first</h3>
          <div className="flex flex-wrap gap-2">
            {useCases.map((u) => (
              <span key={u} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted border">{u}</span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-foreground text-sm">Same HealthOS 24</h3>
          </div>
          <p className="text-[11px] text-foreground leading-relaxed">
            Offline-first, syncs over LTE / Starlink. NPHIES on the spot, ZATCA mobile invoicing, Wasfaty e-prescription from the van.
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
}

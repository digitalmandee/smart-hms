import { Telescope, MapPin, Globe, TrendingUp } from "lucide-react";

const horizons = [
  {
    year: "2026",
    title: "Win Riyadh and Jeddah",
    desc: "15 paid KSA facilities. SAR 4M ARR. NPHIES + ZATCA certified.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    year: "2028",
    title: "The default HMS in Saudi Arabia",
    desc: "150+ facilities across all KSA regions. Tabeebi powering 1M+ patient interactions.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    year: "2030",
    title: "The operating system for MENA healthcare",
    desc: "1 in 5 KSA facilities on HealthOS 24. Expansion into GCC and North Africa.",
    color: "from-amber-500 to-orange-500",
  },
];

export function ExecVisionSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-indigo-600/10 via-background to-emerald-500/10 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-indigo-600 via-emerald-500 to-amber-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-indigo-600 font-semibold mb-1">Vision</p>
          <h2 className="text-3xl font-extrabold text-foreground">Where HealthOS 24 is going</h2>
          <p className="text-sm text-muted-foreground mt-1">A five-year path from Riyadh to the rest of the region.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">30 / 31</span>
      </div>

      {/* North star */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-500 text-white p-6 mb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Telescope className="h-5 w-5" />
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">North Star</span>
        </div>
        <p className="text-2xl font-extrabold leading-tight">
          By 2030, HealthOS 24 powers 1 in 5 healthcare facilities in Saudi Arabia.
        </p>
        <p className="text-sm opacity-90 mt-2">
          Saudi-native. AI-first. Affordable. The default operating system for hospitals and clinics across MENA.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {horizons.map((h, i) => (
          <div key={h.year} className="relative rounded-xl border bg-card p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${h.color} flex items-center justify-center text-white shadow-md`}>
                {i === 0 ? <MapPin className="h-5 w-5" /> : i === 1 ? <TrendingUp className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
              </div>
              <div>
                <div className="text-2xl font-extrabold text-foreground leading-none">{h.year}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Horizon {i + 1}</div>
              </div>
            </div>
            <h3 className="font-bold text-foreground text-base mb-1">{h.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
}

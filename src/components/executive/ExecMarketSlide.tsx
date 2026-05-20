import { Globe2, MapPin, Target } from "lucide-react";

const layers = [
  {
    icon: Globe2,
    label: "TAM",
    value: "$8.5B",
    sub: "MENA Healthcare IT by 2033",
    detail: "Hospital information systems, EHR, RCM, clinical AI across MENA region. Grand View Research, 2025.",
    width: "w-full",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: MapPin,
    label: "SAM",
    value: "$2.4B",
    sub: "KSA + Pakistan HMS by 2030",
    detail: "Serviceable market across our two priority geographies, $1.3B today, growing 10-12% CAGR. KSA-first.",
    width: "w-3/4",
    color: "from-cyan-500 to-teal-500",
  },
  {
    icon: Target,
    label: "SOM",
    value: "$90M",
    sub: "Year-5 ARR target (≈3% of SAM)",
    detail: "≈300 mid-sized facilities at $300K avg ACV, achievable bottoms-up with KSA-first GTM.",
    width: "w-1/3",
    color: "from-emerald-500 to-lime-500",
  },
];

export function ExecMarketSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-indigo-500/5 via-background to-cyan-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-indigo-600 font-semibold mb-1">Market Opportunity</p>
          <h2 className="text-3xl font-extrabold text-foreground">A Multi-Billion Dollar Window</h2>
          <p className="text-sm text-muted-foreground mt-1">Top-down validation: MENA Healthcare IT is one of the fastest-growing verticals globally.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">21 / 30</span>
      </div>

      <div className="flex-1 flex flex-col gap-4 justify-center">
        {layers.map((l) => (
          <div key={l.label} className="flex items-center gap-5">
            <div className="w-24 text-right">
              <div className="text-xs text-muted-foreground font-bold">{l.label}</div>
              <div className="text-2xl font-extrabold text-foreground">{l.value}</div>
            </div>
            <div className={`${l.width} rounded-2xl bg-gradient-to-r ${l.color} text-white p-5 shadow-lg flex items-center gap-4`}>
              <l.icon className="h-8 w-8 flex-shrink-0" />
              <div>
                <div className="font-bold text-base">{l.sub}</div>
                <div className="text-xs opacity-90 mt-0.5">{l.detail}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3 mt-6">
        {[
          { v: "~500", l: "KSA hospitals" },
          { v: "78K", l: "KSA hospital beds" },
          { v: "~1,200", l: "Pakistan hospitals" },
          { v: "133K", l: "Pakistan beds" },
        ].map((s) => (
          <div key={s.l} className="rounded-lg border bg-card p-3 text-center">
            <div className="text-xl font-extrabold text-foreground">{s.v}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Sources: Grand View Research, Ken Research, Statista, WHO, MOH KSA, 2024-2025</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

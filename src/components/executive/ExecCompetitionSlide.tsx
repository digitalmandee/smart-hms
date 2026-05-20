import { Star } from "lucide-react";

// x = MENA localization (0-100), y = affordability (0-100, higher = cheaper)
const players = [
  { name: "Cerner / Oracle Health", x: 35, y: 8, color: "bg-slate-500" },
  { name: "Epic", x: 25, y: 5, color: "bg-slate-600" },
  { name: "InterSystems", x: 30, y: 15, color: "bg-slate-400" },
  { name: "eClinicWorks", x: 40, y: 55, color: "bg-amber-500" },
  { name: "Salamtak", x: 65, y: 60, color: "bg-blue-500" },
  { name: "ClinicMaster", x: 55, y: 70, color: "bg-purple-500" },
  { name: "HealthOS 24", x: 92, y: 88, color: "bg-emerald-500", us: true },
];

export function ExecCompetitionSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-slate-500/5 via-background to-emerald-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-slate-500 via-blue-500 to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-emerald-600 font-semibold mb-1">Competitive Landscape</p>
          <h2 className="text-3xl font-extrabold text-foreground">An Empty Top-Right Quadrant</h2>
          <p className="text-sm text-muted-foreground mt-1">Global incumbents are unaffordable & unlocalized. Local players lack depth. We sit alone.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">21 / 30</span>
      </div>

      <div className="flex-1 flex gap-6">
        <div className="flex-1 relative rounded-2xl border-2 border-border bg-card p-6">
          {/* Y axis label */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-muted-foreground whitespace-nowrap">
            Affordability →
          </div>
          {/* X axis label */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">
            MENA Localization →
          </div>

          {/* Quadrant grid */}
          <div className="absolute inset-8 grid grid-cols-2 grid-rows-2">
            <div className="border-r border-b border-dashed border-border" />
            <div className="border-b border-dashed border-border bg-emerald-500/5" />
            <div className="border-r border-dashed border-border" />
            <div className="border-dashed border-border" />
          </div>

          {/* Plot area */}
          <div className="absolute inset-8">
            {players.map((p) => (
              <div
                key={p.name}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, bottom: `${p.y}%` }}
              >
                <div className={`flex items-center gap-1.5 ${p.us ? "scale-110" : ""}`}>
                  <div className={`w-4 h-4 rounded-full ${p.color} ring-2 ring-background shadow-md`} />
                  <span className={`text-[11px] font-semibold ${p.us ? "text-emerald-600" : "text-foreground"} whitespace-nowrap bg-background/80 backdrop-blur px-1.5 py-0.5 rounded`}>
                    {p.us && <Star className="inline h-3 w-3 mr-0.5 fill-emerald-500 text-emerald-500" />}
                    {p.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-64 flex flex-col gap-3">
          <div className="rounded-xl border bg-card p-3">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">Global Incumbents</div>
            <div className="text-xs text-muted-foreground">High cost ($8-15K / bed / yr), 12-24mo deployment, weak Arabic / NPHIES.</div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1">Mid-Market</div>
            <div className="text-xs text-muted-foreground">Affordable but feature-thin. No clinical AI, weak compliance.</div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Local Players</div>
            <div className="text-xs text-muted-foreground">Good localization, narrow modules, limited scalability.</div>
          </div>
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-500/5 p-3">
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-1">HealthOS 24</div>
            <div className="text-xs text-foreground font-medium">Native MENA stack + AI + 1/10th the cost of Cerner.</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Pricing benchmark: HIMSS 2024 per-bed annual cost survey</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

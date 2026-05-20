import { CheckCircle2, Circle, Sparkles } from "lucide-react";

// FILL: confirm dates and milestones with engineering before sending
const horizons = [
  {
    quarter: "Q3 2026",
    title: "Foundation",
    status: "in-progress",
    items: [
      "NPHIES Phase 2 production certification",
      "ZATCA e-invoicing live across all paid customers",
      "Tabeebi voice SOAP GA (Arabic + English)",
      "5 paid KSA facilities live",
    ],
  },
  {
    quarter: "Q4 2026",
    title: "Scale-ready",
    status: "next",
    items: [
      "Self-hosted AI cluster live in KSA region (PDPL)",
      "Wasfaty e-prescription full integration",
      "Hospital group multi-branch billing engine",
      "10 paid KSA facilities live",
    ],
  },
  {
    quarter: "Q1 2027",
    title: "Expansion",
    status: "planned",
    items: [
      "Sehhaty patient portal sync (national patient app)",
      "Insurance pre-auth automation (NPHIES + 6 TPAs)",
      "Tabeebi nursing copilot beta",
      "SAR 4M ARR run-rate",
    ],
  },
  {
    quarter: "Q2 2027",
    title: "MENA",
    status: "planned",
    items: [
      "UAE DHA + DoH connector",
      "Egypt UPA integration",
      "Channel partner program live (3 partners)",
      "15 paid KSA facilities, 3 outside KSA",
    ],
  },
];

const statusStyle: Record<string, string> = {
  "in-progress": "bg-primary text-primary-foreground",
  next: "bg-primary/15 text-primary",
  planned: "bg-muted text-muted-foreground",
};

export function ExecRoadmapSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background to-primary/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">Product Roadmap</p>
          <h2 className="text-3xl font-extrabold text-foreground">What we ship in the next 12 months</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tied to compliance, AI depth and hospital-group readiness. Each milestone unlocks the next revenue tier.
          </p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">17 / 20</span>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-1">
        {horizons.map((h) => (
          <div key={h.quarter} className="rounded-xl border bg-card p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                  {h.quarter}
                </div>
                <div className="text-lg font-extrabold text-foreground leading-tight">{h.title}</div>
              </div>
              <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${statusStyle[h.status]}`}>
                {h.status === "in-progress" ? "Now" : h.status === "next" ? "Next" : "Planned"}
              </span>
            </div>

            <div className="space-y-2 flex-1">
              {h.items.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  {h.status === "in-progress" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="text-[11px] text-foreground leading-snug">{item}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <span className="text-[11px] font-semibold text-foreground">
          Each quarter ships one compliance milestone, one AI milestone, and one revenue milestone. No vapor.
        </span>
      </div>

      <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

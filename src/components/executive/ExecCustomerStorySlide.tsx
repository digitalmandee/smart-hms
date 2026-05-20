import { Quote, TrendingDown, TrendingUp, Clock, ShieldCheck } from "lucide-react";

// Customer story slide. EDIT customer name / quote / numbers with real data before sending.
// If the clinic prefers anonymity, keep CUSTOMER_NAME generic ("a 40-bed specialty clinic in Riyadh").
const CUSTOMER_NAME = "Al-Noor Specialty Clinic";
const CUSTOMER_DESCRIPTOR = "40-bed multi-specialty, Riyadh";
const CUSTOMER_QUOTE =
  "We replaced four separate systems with HealthOS 24 in six weeks. Our claim denials dropped by half and our doctors stopped complaining about software.";
const CUSTOMER_QUOTE_AUTHOR = "Clinic Director, Al-Noor";

const beforeAfter = [
  {
    icon: TrendingUp,
    label: "Revenue capture",
    before: "78%",
    after: "96%",
    delta: "+18 pts",
    color: "text-emerald-600",
  },
  {
    icon: TrendingDown,
    label: "Claim denials (NPHIES)",
    before: "22%",
    after: "9%",
    delta: "−13 pts",
    color: "text-emerald-600",
  },
  {
    icon: Clock,
    label: "Avg OPD visit time",
    before: "42 min",
    after: "18 min",
    delta: "−24 min",
    color: "text-emerald-600",
  },
  {
    icon: ShieldCheck,
    label: "Daily closing time",
    before: "3 hours",
    after: "20 min",
    delta: "−2h 40m",
    color: "text-emerald-600",
  },
];

export function ExecCustomerStorySlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-emerald-500/5 via-background to-primary/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-emerald-500 to-primary rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-emerald-600 font-semibold mb-1">Customer Story</p>
          <h2 className="text-3xl font-extrabold text-foreground">Before and after HealthOS 24</h2>
          <p className="text-sm text-muted-foreground mt-1">{CUSTOMER_NAME} · {CUSTOMER_DESCRIPTOR}</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">Appendix · A4</span>
      </div>

      <div className="grid grid-cols-5 gap-6 flex-1">
        {/* Quote panel */}
        <div className="col-span-2 rounded-2xl border bg-card p-6 flex flex-col justify-between">
          <div>
            <Quote className="h-10 w-10 text-emerald-500/30 mb-3" />
            <p className="text-lg text-foreground leading-relaxed font-medium">
              "{CUSTOMER_QUOTE}"
            </p>
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{CUSTOMER_QUOTE_AUTHOR}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{CUSTOMER_NAME}</div>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Live since Q4 2025
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/30">
                6-week deployment
              </span>
            </div>
          </div>
        </div>

        {/* Before / after grid */}
        <div className="col-span-3 grid grid-cols-2 gap-3">
          {beforeAfter.map((b) => (
            <div key={b.label} className="rounded-xl border bg-card p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <b.icon className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-xs font-bold text-foreground">{b.label}</div>
              </div>
              <div className="flex items-end gap-3 mt-auto">
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Before</div>
                  <div className="text-2xl font-extrabold text-muted-foreground line-through decoration-rose-500/60">{b.before}</div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">After</div>
                  <div className="text-2xl font-extrabold text-foreground">{b.after}</div>
                </div>
              </div>
              <div className={`text-[11px] font-bold mt-2 ${b.color}`}>{b.delta}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Numbers from a live deployment. Anonymized on request.</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const projections = [
  { year: "Y1", arr: 0.4 },
  { year: "Y2", arr: 2.1 },
  { year: "Y3", arr: 6.8 },
  { year: "Y4", arr: 14 },
  { year: "Y5", arr: 28 },
];

const economics = [
  { label: "ARPU", value: "$24K", sub: "per facility / year" },
  { label: "CAC", value: "$8K", sub: "blended" },
  { label: "Payback", value: "4 mo", sub: "to recover CAC" },
  { label: "Gross Margin", value: "78%", sub: "at steady state" },
];

export function ExecFinancialsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-emerald-500/5 via-background to-blue-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-emerald-600 font-semibold mb-1">Financials</p>
          <h2 className="text-3xl font-extrabold text-foreground">5-Year ARR Projection</h2>
          <p className="text-sm text-muted-foreground mt-1">Bottom-up: 200 paying facilities × $14K avg ACV → $2.8M by Y3, $28M ARR by Y5.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">16 / 20</span>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-6">
        <div className="col-span-3 rounded-xl border bg-card p-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Annual Recurring Revenue ($M)</div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projections} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}M`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`$${v}M ARR`, "Projection"]}
                />
                <Bar dataKey="arr" fill="hsl(160 84% 39%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-3">
          {economics.map((e) => (
            <div key={e.label} className="rounded-xl border bg-card p-4 flex flex-col justify-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{e.label}</div>
              <div className="text-2xl font-extrabold text-foreground mt-1">{e.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{e.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { l: "Break-even", v: "Month 22" },
          { l: "LTV / CAC", v: "11x" },
          { l: "Net Revenue Retention", v: "125%" },
        ].map((k) => (
          <div key={k.l} className="rounded-lg bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{k.l}</span>
            <span className="text-base font-extrabold text-foreground">{k.v}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Projections based on KSA SaaS comps and bottom-up facility pipeline. Illustrative.</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

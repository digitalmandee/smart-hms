import {
  Mic, AlertTriangle, FlaskConical, ShieldCheck, FileCode, TrendingUp, Brain,
  Check, X, Minus, Shield, Receipt, Pill, Fingerprint, Lock, Eye, History,
  Building2, Globe, Layers, Rocket, Smartphone,
} from "lucide-react";

const SlideFooter = ({ label }: { label: string }) => (
  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground relative z-10">
    <span>HMIS | Hospital Management Information System</span>
    <span>{label}</span>
  </div>
);

/* ── 6. AI built in ────────────────────────────────────────── */
const aiItems = [
  { icon: Mic, title: "Tabeebi voice assistant", desc: "Doctors dictate; the system writes the SOAP note in English, Arabic or Urdu.", color: "bg-rose-500" },
  { icon: AlertTriangle, title: "Drug interaction alerts", desc: "Every prescription checked against the patient's medicines and allergies before it prints.", color: "bg-orange-500" },
  { icon: FlaskConical, title: "Critical lab flagging", desc: "Abnormal and critical results are flagged and pushed to the treating doctor.", color: "bg-emerald-500" },
  { icon: ShieldCheck, title: "Claim scrubbing", desc: "Claims validated for codes, duplicates and missing data before NPHIES submission.", color: "bg-blue-500" },
  { icon: FileCode, title: "Coding assistance", desc: "ICD-10 and CPT lookup with context-aware suggestions during documentation.", color: "bg-indigo-500" },
  { icon: TrendingUp, title: "Forecasting", desc: "Stock demand, patient flow and revenue trends projected from your own data.", color: "bg-purple-500" },
];

export function PitchAISlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-rose-500/5 via-background to-purple-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-rose-500 via-primary to-purple-500 rounded-t-lg -mx-8 -mt-8 mb-6" />
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-rose-600 font-semibold mb-1">Intelligence</p>
          <h2 className="text-3xl font-extrabold text-foreground">AI inside the workflow, not a chat window</h2>
          <p className="text-sm text-muted-foreground mt-1">Each one runs where the work already happens, so staff do not change how they work.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-primary flex items-center justify-center shadow-lg">
          <Brain className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {aiItems.map((a) => (
          <div key={a.title} className="rounded-xl border bg-card p-5 flex flex-col">
            <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center mb-3 shadow-lg`}>
              <a.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="font-bold text-sm text-foreground mb-1.5">{a.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
          </div>
        ))}
      </div>
      <SlideFooter label="6 / 9" />
    </div>
  );
}

/* ── 7. Us vs global systems ───────────────────────────────── */
type Cell = { v: "yes" | "no" | "part"; t: string };
const rows: { label: string; us: Cell; epic: Cell; cerner: Cell; inter: Cell }[] = [
  {
    label: "Cost per bed, per year",
    us: { v: "yes", t: "SAR 2.2K-4.5K" },
    epic: { v: "no", t: "SAR 30K-56K" },
    cerner: { v: "no", t: "SAR 30K-56K" },
    inter: { v: "no", t: "Enterprise pricing" },
  },
  {
    label: "Time to go live",
    us: { v: "yes", t: "4-8 weeks" },
    epic: { v: "no", t: "12-24 months" },
    cerner: { v: "no", t: "12-24 months" },
    inter: { v: "no", t: "9-18 months" },
  },
  {
    label: "Arabic + Urdu, full RTL",
    us: { v: "yes", t: "Every screen & report" },
    epic: { v: "part", t: "Partial add-on" },
    cerner: { v: "part", t: "Partial add-on" },
    inter: { v: "part", t: "Partial" },
  },
  {
    label: "KSA compliance built in",
    us: { v: "yes", t: "NPHIES, ZATCA, Wasfaty, Nafath" },
    epic: { v: "part", t: "Custom integration project" },
    cerner: { v: "part", t: "Custom integration project" },
    inter: { v: "part", t: "Custom integration project" },
  },
  {
    label: "Mobile apps per role",
    us: { v: "yes", t: "Doctor, nurse, patient, staff" },
    epic: { v: "part", t: "Licensed separately" },
    cerner: { v: "part", t: "Licensed separately" },
    inter: { v: "no", t: "Limited" },
  },
  {
    label: "Finance, HR & payroll included",
    us: { v: "yes", t: "In the same product" },
    epic: { v: "no", t: "Third-party ERP" },
    cerner: { v: "no", t: "Third-party ERP" },
    inter: { v: "no", t: "Third-party ERP" },
  },
  {
    label: "AI in daily workflow",
    us: { v: "yes", t: "Voice notes, alerts, scrubbing" },
    epic: { v: "part", t: "Premium modules" },
    cerner: { v: "part", t: "Premium modules" },
    inter: { v: "part", t: "Add-on" },
  },
  {
    label: "Fits small & mid hospitals",
    us: { v: "yes", t: "Modules switched per branch" },
    epic: { v: "no", t: "Large systems only" },
    cerner: { v: "no", t: "Large systems only" },
    inter: { v: "part", t: "Mostly large systems" },
  },
];

const Icon = ({ v }: { v: Cell["v"] }) =>
  v === "yes" ? <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
  : v === "no" ? <X className="h-3.5 w-3.5 text-red-500 shrink-0" />
  : <Minus className="h-3.5 w-3.5 text-amber-500 shrink-0" />;

const Cellv = ({ c, us }: { c: Cell; us?: boolean }) => (
  <td className={`px-3 py-2 align-top ${us ? "bg-emerald-500/5" : ""}`}>
    <div className="flex items-start gap-1.5">
      <Icon v={c.v} />
      <span className={`text-[10px] leading-tight ${us ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{c.t}</span>
    </div>
  </td>
);

export function PitchComparisonSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-slate-500/5 via-background to-emerald-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-slate-500 via-blue-500 to-emerald-500 rounded-t-lg -mx-8 -mt-8 mb-5" />
      <div className="mb-4">
        <p className="text-sm text-emerald-600 font-semibold mb-1">The Difference</p>
        <h2 className="text-3xl font-extrabold text-foreground">Us versus the global systems</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Epic, Cerner and InterSystems are built for very large hospitals with long projects and big budgets.
        </p>
      </div>

      <div className="flex-1 rounded-xl border bg-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/60">
              <th className="text-left px-3 py-2.5 text-[11px] font-bold text-foreground w-[200px]"> </th>
              <th className="text-left px-3 py-2.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-500/10">HMIS (us)</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold text-foreground">Epic</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold text-foreground">Cerner / Oracle Health</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold text-foreground">InterSystems</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} className={i % 2 ? "bg-muted/20" : ""}>
                <td className="px-3 py-2 text-[11px] font-semibold text-foreground align-top">{r.label}</td>
                <Cellv c={r.us} us />
                <Cellv c={r.epic} />
                <Cellv c={r.cerner} />
                <Cellv c={r.inter} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[9px] text-muted-foreground mt-2">
        Competitor figures are public-market estimates for comparison, not quotations. Our pricing is our own list range.
      </p>
      <SlideFooter label="7 / 9" />
    </div>
  );
}

/* ── 8. Compliance & security ──────────────────────────────── */
const compliance = [
  { icon: Shield, title: "NPHIES", desc: "Eligibility, pre-auth and claims on HL7 FHIR" },
  { icon: Receipt, title: "ZATCA Phase 2", desc: "UBL 2.1 e-invoices, hashed and chained" },
  { icon: Pill, title: "Wasfaty & Tatmeen", desc: "e-Prescription and medicine traceability" },
  { icon: Fingerprint, title: "Nafath", desc: "National identity verification at registration" },
];
const security = [
  { icon: Lock, title: "Row-level data isolation", desc: "Each branch and each role only sees its own records." },
  { icon: Eye, title: "PHI masking", desc: "Sensitive patient fields hidden from roles that do not need them." },
  { icon: History, title: "Full audit trail", desc: "Every view and change of patient data is logged and exportable." },
  { icon: Building2, title: "Multi-branch control", desc: "Central administration with modules enabled per facility." },
];

export function PitchCompliancePitchSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-emerald-500/5 via-background to-blue-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-t-lg -mx-8 -mt-8 mb-6" />
      <div className="mb-6">
        <p className="text-sm text-emerald-600 font-semibold mb-1">Trust</p>
        <h2 className="text-3xl font-extrabold text-foreground">Saudi-ready and audit-ready on day one</h2>
        <p className="text-sm text-muted-foreground mt-1">Regulatory connections and HIPAA-style controls are part of the product, not a later project.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        <div>
          <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3">Regulatory integrations</h3>
          <div className="space-y-3">
            {compliance.map((c) => (
              <div key={c.title} className="rounded-xl border bg-card p-4 flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <c.icon className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">{c.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">Security & governance</h3>
          <div className="space-y-3">
            {security.map((c) => (
              <div key={c.title} className="rounded-xl border bg-card p-4 flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <c.icon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">{c.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SlideFooter label="8 / 9" />
    </div>
  );
}

/* ── 9. Close ──────────────────────────────────────────────── */
export function PitchCloseSlide() {
  return (
    <div className="slide flex flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-emerald-500/5">
      <div className="absolute top-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-primary/10 blur-3xl" />
      <div className="relative z-10 flex flex-col items-center">
        <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-4">In one line</p>
        <h2 className="text-4xl font-extrabold text-foreground max-w-3xl leading-tight">
          Everything a hospital runs on, in one system, in your language, at a price you can actually sign
        </h2>

        <div className="grid grid-cols-4 gap-4 mt-10 w-full max-w-4xl">
          {[
            { icon: Layers, big: "60+", small: "modules, one platform" },
            { icon: Globe, big: "3", small: "languages, full RTL" },
            { icon: Smartphone, big: "4", small: "role-based mobile apps" },
            { icon: Rocket, big: "4-8", small: "weeks to go live" },
          ].map((c) => (
            <div key={c.small} className="rounded-2xl border bg-card px-4 py-5">
              <c.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{c.big}</div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-tight">{c.small}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-8 text-[10px] text-muted-foreground">
        <span>HMIS | Hospital Management Information System</span>
        <span>9 / 9</span>
      </div>
    </div>
  );
}

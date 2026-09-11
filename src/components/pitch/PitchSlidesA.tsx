import {
  Activity, AlertTriangle, Baby, Banknote, BarChart3, Bluetooth, BookOpen, Bot, Brain,
  CreditCard, Clock, Droplet, FileBox, FileSignature, FileText, Fingerprint, FlaskConical,
  HeartHandshake, HeartPulse, Hotel, Lock, Megaphone, Microscope, Pill, Receipt, RefreshCw,
  ScanLine, Scissors, Search, Settings, Shield, ShieldCheck, Siren, Smile, Snowflake,
  Stethoscope, Store, TrendingUp, Truck, UserCog, Wallet, Warehouse, Calculator,
  Layers, FileSpreadsheet, Unplug, Hourglass, ClipboardX, Ticket, Microscope as Micro,
  Smartphone, Wifi, Bell, Globe, User, ClipboardList, ChevronRight, CheckCircle2, Building2,
} from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";
import mobileDoctor from "@/assets/mobile-doctor.png";
import mobileNurse from "@/assets/mobile-nurse.png";
import mobilePatient from "@/assets/mobile-patient.png";
import mobileStaff from "@/assets/mobile-staff.png";

const SlideFooter = ({ label }: { label: string }) => (
  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground relative z-10">
    <span>HMIS | Hospital Management Information System</span>
    <span>{label}</span>
  </div>
);

/* ── 1. Opening ─────────────────────────────────────────────── */
const openingHighlights = [
  "OPD & IPD", "Laboratory", "Pharmacy", "Billing", "HR & Payroll",
  "Accounts", "OT & Surgery", "Radiology", "Tabeebi AI",
];

export function PitchOpeningSlide() {
  const currentDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="slide flex flex-col bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-primary blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="mb-5">
          <HealthOS24Logo variant="full" size="xl" showTagline />
        </div>

        <h1 className="text-5xl font-bold text-center mb-3 leading-tight">
          AI-Powered Hospital<br />
          <span className="text-primary">Management System</span>
        </h1>

        <p className="text-xl text-muted-foreground text-center mb-5 max-w-2xl">
          {totalModules} integrated modules for 24/7 healthcare operations
        </p>

        <div className="flex flex-wrap justify-center gap-2.5 mb-5 max-w-3xl">
          {openingHighlights.map((item) => (
            <span
              key={item}
              className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-5">
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">English</span>
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">عربي</span>
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">اردو</span>
        </div>

        <div className="flex items-center gap-8 bg-card border border-border rounded-2xl px-8 py-4 shadow-lg">
          {[
            { icon: Layers, value: String(totalModules), label: "Modules" },
            { icon: Smartphone, value: "4", label: "Role-based apps" },
            { icon: Globe, value: "3", label: "Languages, full RTL" },
          ].map((stat, index) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
              {index < 2 && <div className="w-px h-10 bg-border ml-6" />}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 pb-2">
        <div className="flex items-center justify-center gap-8 mb-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Wifi className="h-4 w-4 text-primary" />Cloud-based</span>
          <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />HIPAA controls</span>
          <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />Multi-branch</span>
        </div>
        <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm">
          <span>{currentDate}</span>
          <span>healthos24.com</span>
          <span>1 / 12</span>
        </div>
      </div>
    </div>
  );
}


/* ── 2. Problem ─────────────────────────────────────────────── */
const problems = [
  { icon: Layers, title: "8-10 separate systems", desc: "Registration, lab, pharmacy, radiology, accounts and HR each run on their own software." },
  { icon: FileSpreadsheet, title: "Excel and paper in the gaps", desc: "Stock counts, doctor shares and daily cash are reconciled by hand every night." },
  { icon: Unplug, title: "No shared patient record", desc: "The same patient is re-registered in every department, with no single history." },
  { icon: Hourglass, title: "Revenue leaks silently", desc: "Unbilled lab tests, missed ward charges and rejected insurance claims go unnoticed." },
  { icon: ClipboardX, title: "Management flies blind", desc: "Reports arrive days late, so decisions are made on last month's numbers." },
  { icon: Ticket, title: "Patients wait, and repeat themselves", desc: "Long queues, lost reports and no way to see appointments or bills from a phone." },
];

export function PitchProblemSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-red-500/5 via-background to-amber-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-t-lg -mx-8 -mt-8 mb-6" />
      <div className="mb-6">
        <p className="text-sm text-red-600 font-semibold mb-1">The Problem</p>
        <h2 className="text-3xl font-extrabold text-foreground">Hospitals are stitched together, not connected</h2>
        <p className="text-sm text-muted-foreground mt-1">Every disconnected system is a place where money, time and information disappear.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {problems.map((p) => (
          <div key={p.title} className="rounded-xl border bg-card p-5 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
              <p.icon className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-bold text-sm text-foreground mb-1.5">{p.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
      <SlideFooter label="2 / 11" />
    </div>
  );
}

/* ── 3. All modules ────────────────────────────────────────── */
const categories = [
  {
    name: "Clinical", color: "bg-blue-500", borderColor: "border-blue-500/20", bgColor: "bg-blue-500/5",
    modules: [
      { icon: Stethoscope, name: "OPD & Consultations" },
      { icon: Hotel, name: "IPD & Admissions" },
      { icon: Hotel, name: "Ward & Bed Management" },
      { icon: Scissors, name: "Surgery & OT" },
      { icon: Siren, name: "ER & Triage" },
      { icon: Truck, name: "Clinic on Wheels" },
      { icon: HeartPulse, name: "Nursing Station" },
      { icon: ClipboardList, name: "Daily Rounds & Notes" },
      { icon: Clock, name: "Queue & Token" },
      { icon: Baby, name: "Gyn & Obstetrics" },
      { icon: Smile, name: "Dental & Odontogram" },
      { icon: Activity, name: "Dialysis" },
      { icon: FileSignature, name: "Consent Forms" },
      { icon: FileSignature, name: "Birth & Death Records" },
      { icon: Store, name: "Diet & Kitchen" },
    ],
  },
  {
    name: "Diagnostics", color: "bg-emerald-500", borderColor: "border-emerald-500/20", bgColor: "bg-emerald-500/5",
    modules: [
      { icon: FlaskConical, name: "Laboratory (LIS)" },
      { icon: ScanLine, name: "Radiology (RIS/PACS)" },
      { icon: Microscope, name: "Pathology" },
      { icon: Droplet, name: "Blood Bank" },
      { icon: FileSignature, name: "Specimen Tracking" },
      { icon: Bluetooth, name: "Analyzer Integration" },
      { icon: FileText, name: "Report Templates" },
      { icon: Activity, name: "Critical Result Alerts" },
    ],
  },
  {
    name: "Pharmacy & Supply", color: "bg-pink-500", borderColor: "border-pink-500/20", bgColor: "bg-pink-500/5",
    modules: [
      { icon: Pill, name: "Dispensing" },
      { icon: Store, name: "Pharmacy POS" },
      { icon: FileBox, name: "Stock & Batch Tracking" },
      { icon: FileText, name: "e-Prescription (Wasfaty)" },
      { icon: AlertTriangle, name: "Drug Interaction Checks" },
      { icon: Truck, name: "Procurement PR→PO→GRN" },
      { icon: Warehouse, name: "Warehouse / WMS" },
      { icon: FileBox, name: "Picking & Packing" },
      { icon: RefreshCw, name: "Cycle Count & Audit" },
      { icon: Truck, name: "Returns to Vendor" },
      { icon: Snowflake, name: "Cold-Chain Logs" },
    ],
  },
  {
    name: "Finance & HR", color: "bg-teal-500", borderColor: "border-teal-500/20", bgColor: "bg-teal-500/5",
    modules: [
      { icon: Receipt, name: "Billing & Invoicing" },
      { icon: Calculator, name: "Chart of Accounts" },
      { icon: BookOpen, name: "Journals & GL" },
      { icon: FileText, name: "Vouchers (CPV/CRV/JV)" },
      { icon: Wallet, name: "Doctor Compensation" },
      { icon: Banknote, name: "Patient Deposits" },
      { icon: Receipt, name: "Credit Notes & Refunds" },
      { icon: CreditCard, name: "Vendor Payments" },
      { icon: FileBox, name: "Fixed Assets & Depreciation" },
      { icon: BarChart3, name: "Cost Centres & Budgets" },
      { icon: Lock, name: "Daily Closing" },
      { icon: UserCog, name: "HR & Payroll" },
      { icon: Fingerprint, name: "Biometric Attendance" },
      { icon: FileSignature, name: "Exit & Clearance" },
      { icon: BarChart3, name: "Financial Reports & BI" },
    ],
  },
  {
    name: "Insurance & Compliance", color: "bg-blue-600", borderColor: "border-blue-600/20", bgColor: "bg-blue-600/5",
    modules: [
      { icon: Search, name: "Eligibility Verification" },
      { icon: ShieldCheck, name: "Pre-Authorization" },
      { icon: FileText, name: "Claims & Submission" },
      { icon: CreditCard, name: "ERA & Reconciliation" },
      { icon: AlertTriangle, name: "Denial Management" },
      { icon: Shield, name: "NPHIES Integration" },
      { icon: Receipt, name: "ZATCA E-Invoicing" },
      { icon: Fingerprint, name: "Nafath Identity" },
      { icon: Pill, name: "Tatmeen Traceability" },
      { icon: Shield, name: "HESN Notifiable Diseases" },
      { icon: Lock, name: "HIPAA Audit & Access Logs" },
    ],
  },
  {
    name: "Patient-Facing & AI", color: "bg-purple-500", borderColor: "border-purple-500/20", bgColor: "bg-purple-500/5",
    modules: [
      { icon: Smartphone, name: "Mobile Apps (4 roles)" },
      { icon: Store, name: "Self-Service Kiosk" },
      { icon: Clock, name: "Queue Displays" },
      { icon: User, name: "Patient Portal" },
      { icon: Bot, name: "Tabeebi Medical AI" },
      { icon: Brain, name: "Analytics & BI" },
      { icon: TrendingUp, name: "Predictive Forecasting" },
      { icon: Bell, name: "WhatsApp & SMS Alerts" },
      { icon: HeartHandshake, name: "Donor Management" },
      { icon: Megaphone, name: "Donation Campaigns" },
      { icon: RefreshCw, name: "Recurring Donations" },
      { icon: Settings, name: "Multi-Branch Admin" },
      { icon: Micro, name: "Document Management" },
    ],
  },
];
export const totalModules = categories.reduce((a, c) => a + c.modules.length, 0);


export function PitchModulesSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background to-muted/30 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary via-emerald-500 to-pink-500 rounded-t-lg -mx-8 -mt-8 mb-5" />
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">The Platform</p>
          <h2 className="text-3xl font-extrabold text-foreground">{totalModules} modules, one login, one database</h2>
          <p className="text-sm text-muted-foreground mt-1">Every department below is live in the same product, not a roadmap.</p>
        </div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{totalModules} live</span>
      </div>

      <div className="grid grid-cols-3 gap-3 flex-1">
        {categories.map((cat) => (
          <div key={cat.name} className={`rounded-xl border ${cat.borderColor} ${cat.bgColor} p-3 flex flex-col`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
              <h3 className="font-bold text-xs text-foreground">{cat.name}</h3>
              <span className="text-[9px] text-muted-foreground ml-auto font-semibold">{cat.modules.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {cat.modules.map((m) => (
                <div key={m.name} className="flex items-center gap-1.5 text-[10px] text-foreground">
                  <m.icon className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="leading-tight">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SlideFooter label="3 / 11" />
    </div>
  );
}

/* ── 4. Patient journey ────────────────────────────────────── */
const journey = [
  { step: "Arrival", module: "Kiosk / Reception", desc: "QR check-in or 4-step walk-in registration", color: "bg-blue-500" },
  { step: "Token", module: "Queue & Token", desc: "Token printed, live display, per-doctor queue", color: "bg-cyan-500" },
  { step: "Consultation", module: "OPD + Tabeebi AI", desc: "Vitals, diagnosis, voice notes, e-prescription", color: "bg-emerald-500" },
  { step: "Diagnostics", module: "Lab / Radiology", desc: "Order flows to lab, results posted back to chart", color: "bg-teal-500" },
  { step: "Pharmacy", module: "Dispensing & POS", desc: "Prescription pulled, stock deducted by batch", color: "bg-pink-500" },
  { step: "Payment", module: "Billing", desc: "All pending charges on one invoice, split payments", color: "bg-amber-500" },
  { step: "Claim", module: "Insurance / NPHIES", desc: "Coverage applied, claim scrubbed and submitted", color: "bg-indigo-500" },
  { step: "Books", module: "Finance & GL", desc: "Revenue, COGS and doctor share posted automatically", color: "bg-purple-500" },
];

export function PitchJourneySlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 rounded-t-lg -mx-8 -mt-8 mb-6" />
      <div className="mb-6">
        <p className="text-sm text-blue-600 font-semibold mb-1">How It Works</p>
        <h2 className="text-3xl font-extrabold text-foreground">One patient. One record. Zero re-entry.</h2>
        <p className="text-sm text-muted-foreground mt-1">
          From the front door to the general ledger, every step hands off inside the same system.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-1 content-start">
        {journey.map((j, i) => (
          <div key={j.step} className="rounded-xl border bg-card p-4 flex flex-col relative">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${j.color} flex items-center justify-center text-primary-foreground text-xs font-bold`}>
                {i + 1}
              </div>
              <h3 className="font-bold text-sm text-foreground">{j.step}</h3>
              {i < journey.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 ml-auto" />
              )}
            </div>
            <div className="text-[10px] font-semibold text-primary mb-1">{j.module}</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{j.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border bg-card px-5 py-3 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Nothing is billed twice and nothing is missed: lab, ward and pharmacy charges are pulled into the invoice
          automatically, and the journal entry is posted by the database, not by hand.
        </p>
      </div>
      <SlideFooter label="4 / 11" />
    </div>
  );
}

/* ── 5. Mobile apps — real app screenshots ─────────────────── */
function PhoneShot({ title, subtitle, src }: { title: string; subtitle: string; src: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[196px] h-[424px] rounded-[34px] bg-foreground/90 p-[4px] shadow-xl">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-3 bg-foreground rounded-b-2xl z-10" />
        <div className="w-full h-full rounded-[26px] overflow-hidden bg-background">
          <img src={src} alt={`${title} mobile app screen`} className="w-full h-full object-cover object-top" />
        </div>
      </div>
      <p className="text-xs font-bold text-foreground mt-2">{title}</p>
      <p className="text-[10px] text-muted-foreground text-center leading-tight">{subtitle}</p>
    </div>
  );
}

const techChips = [
  { icon: Smartphone, label: "iOS + Android" },
  { icon: Wifi, label: "Works offline, syncs later" },
  { icon: Fingerprint, label: "Biometric login" },
  { icon: Bell, label: "Push notifications" },
  { icon: Globe, label: "English · عربي · اردو" },
];

export function PitchMobileSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background to-primary/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 rounded-t-lg -mx-8 -mt-8 mb-5" />
      <div className="mb-4">
        <p className="text-sm text-primary font-semibold mb-1">Mobile Apps</p>
        <h2 className="text-3xl font-extrabold text-foreground">One app design, four roles — real screens</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Same navigation, same cards, same language switch. Only the work changes. Screens below are captured from the live app.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 flex-1">
        <PhoneShot title="Doctor" subtitle="Today's list, consults, lab results" src={mobileDoctor} />
        <PhoneShot title="Nurse" subtitle="Ward, vitals, medication tasks" src={mobileNurse} />
        <PhoneShot title="Patient" subtitle="Visits, bills, reports, prescriptions" src={mobilePatient} />
        <PhoneShot title="Staff" subtitle="Queue, check-in, cash session" src={mobileStaff} />
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        {techChips.map((c) => (
          <span key={c.label} className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full bg-muted text-foreground whitespace-nowrap">
            <c.icon className="h-3 w-3 text-primary" />{c.label}
          </span>
        ))}
      </div>
      <SlideFooter label="5 / 11" />
    </div>
  );
}

import { useState, useRef, useCallback, ReactNode } from "react";
import { FileDown, Printer, ArrowLeft, Loader2, ChevronDown, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { toPng } from "html-to-image";
import {
  UserPlus, HeartHandshake, FlaskConical, Microscope, Droplets, Syringe,
  CalendarClock, Pill, Stethoscope, Users, BarChart3, FileText, Rocket,
  ShieldCheck, CheckCircle2, Heart, ArrowRight,
} from "lucide-react";

/* ============================================================
   ADF Thalassemia Patient Journey — Client Presentation
   ============================================================ */

const TOTAL_SLIDES = 22;

/* ---------- Shared chrome ---------- */

function SlideHeader({ stage, title, subtitle }: { stage?: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start justify-between mb-5 pb-4 border-b border-border">
      <div>
        {stage && (
          <span className="inline-block px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-xs font-semibold mb-2 uppercase tracking-wider">
            {stage}
          </span>
        )}
        <h2 className="text-3xl font-bold text-foreground leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="text-right">
        <div className="text-xs font-bold text-rose-600 dark:text-rose-400">ADF</div>
        <div className="text-[10px] text-muted-foreground leading-tight">Aleem Dar<br />Foundation</div>
      </div>
    </div>
  );
}

function SlideFooter({ page }: { page: number }) {
  return (
    <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-8 text-[10px] text-muted-foreground">
      <span>ADF Thalassemia Care Program · Powered by HealthOS 24</span>
      <span>{page} / {TOTAL_SLIDES}</span>
      <span>Confidential · Client Preview</span>
    </div>
  );
}

/* ---------- Form mockup primitives ---------- */

function Field({ label, value, required, span = 1 }: { label: string; value: string; required?: boolean; span?: 1 | 2 | 3 }) {
  const spanClass = span === 2 ? "col-span-2" : span === 3 ? "col-span-3" : "col-span-1";
  return (
    <div className={spanClass}>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="px-2.5 py-1.5 text-xs rounded-md border border-border bg-muted/30 text-foreground min-h-[28px] flex items-center">
        {value}
      </div>
    </div>
  );
}

function SelectField({ label, value, required, span = 1 }: { label: string; value: string; required?: boolean; span?: 1 | 2 | 3 }) {
  const spanClass = span === 2 ? "col-span-2" : span === 3 ? "col-span-3" : "col-span-1";
  return (
    <div className={spanClass}>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="px-2.5 py-1.5 text-xs rounded-md border border-border bg-muted/30 text-foreground min-h-[28px] flex items-center justify-between">
        <span>{value}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </div>
    </div>
  );
}

function FormCard({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden">
      <div className="bg-muted/40 px-4 py-2 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-[10px] text-muted-foreground">Form Preview</span>
      </div>
      <div className="p-4">{children}</div>
      {footer && <div className="px-4 py-2 bg-muted/30 border-t border-border flex justify-end gap-2">{footer}</div>}
    </div>
  );
}

function FormSection({ heading, children, cols = 3 }: { heading?: string; children: ReactNode; cols?: 2 | 3 | 4 }) {
  const gridCols = cols === 2 ? "grid-cols-2" : cols === 4 ? "grid-cols-4" : "grid-cols-3";
  return (
    <div className="mb-4 last:mb-0">
      {heading && <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">{heading}</div>}
      <div className={`grid ${gridCols} gap-3`}>{children}</div>
    </div>
  );
}

function MockSubmitBtns() {
  return (
    <>
      <button disabled className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground bg-background opacity-70">Cancel</button>
      <button disabled className="px-3 py-1.5 text-xs rounded-md bg-rose-600 text-white opacity-70">Save & Continue</button>
    </>
  );
}

/* ============================================================
   SLIDES
   ============================================================ */

/* 1 — Title */
function S01Title() {
  return (
    <div className="slide flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-rose-500/10 via-background to-red-500/5">
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-rose-500/10 blur-3xl" />
      <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-red-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg">
            <Heart className="h-10 w-10 text-white" fill="white" />
          </div>
          <div className="text-left">
            <div className="text-3xl font-extrabold text-foreground">ADF</div>
            <div className="text-sm text-muted-foreground">Aleem Dar Foundation</div>
          </div>
        </div>

        <div className="space-y-3 max-w-3xl">
          <span className="inline-block px-4 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-xs font-semibold uppercase tracking-widest">
            Client Preview · What we are building
          </span>
          <h1 className="text-5xl font-extrabold text-foreground leading-tight tracking-tight">
            Thalassemia Patient Journey<br />
            <span className="text-rose-600 dark:text-rose-400">on HealthOS 24</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            End-to-end NGO workflow: Registration with Zakat & Sadaqa intake, screening,
            blood bank, transfusion, lifelong chelation and family screening.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2 max-w-2xl">
          {["Patient Registration", "Zakat / Sadaqa", "Screening & HPLC", "Blood Bank", "Transfusion", "Iron Chelation", "Family Screening", "Donor Receipts"].map((t) => (
            <span key={t} className="px-3 py-1 rounded-full bg-card border border-border text-xs font-medium text-foreground">{t}</span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-8 text-[10px] text-muted-foreground">
        <span>ADF Thalassemia Care Program · Powered by HealthOS 24</span>
        <span>Client Presentation</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
}

/* 2 — Journey Overview */
function S02Overview() {
  const steps = [
    { icon: UserPlus, label: "Register", color: "bg-rose-500" },
    { icon: HeartHandshake, label: "Zakat Intake", color: "bg-pink-500" },
    { icon: FlaskConical, label: "Screening", color: "bg-amber-500" },
    { icon: Microscope, label: "Diagnosis", color: "bg-orange-500" },
    { icon: Droplets, label: "Blood Match", color: "bg-red-500" },
    { icon: Syringe, label: "Transfusion", color: "bg-rose-600" },
    { icon: Pill, label: "Chelation", color: "bg-purple-500" },
    { icon: Users, label: "Family Screening", color: "bg-indigo-500" },
  ];
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader title="Patient Journey — 8 Stages" subtitle="From walk-in to lifelong care, every step captured in one system" />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-start flex-wrap justify-center gap-1 max-w-5xl">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center text-center w-[110px]">
                <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center text-white shadow-lg mb-2`}>
                  <s.icon className="h-7 w-7" />
                </div>
                <div className="text-xs font-semibold text-foreground">{i + 1}. {s.label}</div>
              </div>
              {i < steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground/40 mx-1 mt-5" />}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mt-6">
        <div className="rounded-lg border bg-card p-3 text-center">
          <div className="text-2xl font-extrabold text-rose-600">100%</div>
          <div className="text-[10px] text-muted-foreground">Digital Records</div>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <div className="text-2xl font-extrabold text-rose-600">Auto</div>
          <div className="text-[10px] text-muted-foreground">Zakat Eligibility</div>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <div className="text-2xl font-extrabold text-rose-600">35d</div>
          <div className="text-[10px] text-muted-foreground">Blood Bag Expiry</div>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <div className="text-2xl font-extrabold text-rose-600">Lifelong</div>
          <div className="text-[10px] text-muted-foreground">Care Tracking</div>
        </div>
      </div>
      <SlideFooter page={2} />
    </div>
  );
}

/* ---------- Stage intro slide helper ---------- */
function StageIntro({ page, stage, title, who, time, summary, points }: { page: number; stage: string; title: string; who: string; time: string; summary: string; points: string[] }) {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-rose-500/5 via-background to-background">
      <SlideHeader stage={stage} title={title} subtitle={summary} />
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Who fills it</div>
          <div className="text-sm font-bold text-foreground">{who}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Typical time</div>
          <div className="text-sm font-bold text-foreground">{time}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Stage</div>
          <div className="text-sm font-bold text-rose-600">{stage}</div>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-3">
        {points.map((p, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg border bg-card p-3">
            <CheckCircle2 className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
            <p className="text-xs text-foreground leading-relaxed">{p}</p>
          </div>
        ))}
      </div>
      <SlideFooter page={page} />
    </div>
  );
}

/* 3 — Registration Stage Intro */
function S03RegIntro() {
  return (
    <StageIntro
      page={3}
      stage="Stage 1 of 8"
      title="Patient Registration"
      who="Reception / Front Desk"
      time="5–7 minutes"
      summary="Onboard the thalassemia patient and capture identity, guardian, and clinical history in one wizard."
      points={[
        "Auto-generated MRN unique per patient — used across every module forever.",
        "Child patients enforce mandatory guardian details (parent/relative + relationship + contact).",
        "Blood group captured at registration — used by Blood Bank for crossmatch.",
        "Diagnosis date and diagnosing hospital recorded for medical history.",
        "CNIC / B-Form validated for Pakistan-issued IDs.",
        "Photo upload supported for visual identification at follow-up visits.",
      ]}
    />
  );
}

/* 4 — Patient Registration Form */
function S04RegForm() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 1" title="Patient Registration Form" subtitle="What the receptionist sees when a new thalassemia patient walks in" />
      <div className="flex-1">
        <FormCard title="Thalassemia Patient — New Registration" footer={<MockSubmitBtns />}>
          <FormSection heading="Identification">
            <Field label="MRN" value="THL-2026-00148" required />
            <Field label="Registration Date" value="06 June 2026" />
            <SelectField label="Patient Type" value="Thalassemia (Major)" required />
            <Field label="Full Name" value="Ali Hassan Raza" required span={2} />
            <Field label="Father / Guardian Name" value="Hassan Raza Khan" required />
            <Field label="Date of Birth" value="14 Mar 2018 (Age 8)" required />
            <SelectField label="Gender" value="Child (Male)" required />
            <Field label="CNIC / B-Form" value="35202-1234567-8" required />
          </FormSection>
          <FormSection heading="Contact & Address">
            <Field label="Mobile" value="+92 300 1234567" required />
            <Field label="Alternate Contact" value="+92 321 9876543" />
            <Field label="City" value="Lahore" required />
            <Field label="Address" value="House 12, Block C, Model Town, Lahore" span={3} />
          </FormSection>
          <FormSection heading="Clinical">
            <SelectField label="Blood Group" value="B+" required />
            <SelectField label="Thalassemia Type" value="Beta Thalassemia Major" required />
            <Field label="Date of Diagnosis" value="22 Aug 2019" required />
            <Field label="Diagnosing Hospital" value="Children's Hospital Lahore" span={2} />
            <Field label="Referred By" value="Dr. Sana Iqbal" />
          </FormSection>
        </FormCard>
      </div>
      <SlideFooter page={4} />
    </div>
  );
}

/* 5 — Guardian & Socioeconomic Intake */
function S05Socio() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 1" title="Guardian & Socioeconomic Intake" subtitle="Drives Zakat / Sadaqa eligibility — filled by social worker after registration" />
      <div className="flex-1">
        <FormCard title="Socioeconomic Assessment" footer={<MockSubmitBtns />}>
          <FormSection heading="Guardian Details">
            <Field label="Guardian Name" value="Hassan Raza Khan" required />
            <SelectField label="Relationship" value="Father" required />
            <Field label="CNIC" value="35202-9988776-5" required />
            <Field label="Occupation" value="Daily-wage carpenter" required />
            <Field label="Employer (if any)" value="Self-employed" />
            <Field label="Contact" value="+92 300 1234567" required />
          </FormSection>
          <FormSection heading="Household Economics">
            <Field label="Monthly Household Income (PKR)" value="28,000" required />
            <Field label="No. of Dependents" value="5" required />
            <SelectField label="Residence" value="Rented" required />
            <SelectField label="Owns Vehicle" value="No" />
            <SelectField label="Has Other Income Source" value="No" />
            <SelectField label="Receives Other Welfare" value="No" />
          </FormSection>
          <FormSection heading="Eligibility (Auto-suggested)">
            <div className="col-span-3 flex items-center gap-3 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div className="flex-1">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Eligible for Zakat / Sadaqa funding</div>
                <div className="text-[10px] text-muted-foreground">Income PKR 28,000 with 5 dependents falls below Nisab threshold. Confirm with social worker.</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">Approved</span>
            </div>
          </FormSection>
          <FormSection heading="Documents & Notes" cols={2}>
            <Field label="ID Copy Uploaded" value="✓ guardian-cnic.pdf" />
            <Field label="Income Proof Uploaded" value="✓ income-affidavit.pdf" />
            <Field label="Social Worker Notes" value="Family struggling with monthly transfusion costs. Recommend full Zakat coverage." span={2} />
          </FormSection>
        </FormCard>
      </div>
      <SlideFooter page={5} />
    </div>
  );
}

/* 6 — Zakat / Sadaqa / Sponsorship */
function S06Funding() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 1" title="Zakat / Sadaqa / Donor Sponsorship" subtitle="Assign the funding source — auto-links to ADF donor records and finance ledger" />
      <div className="grid grid-cols-2 gap-4 flex-1">
        <FormCard title="Funding Assignment">
          <FormSection cols={2}>
            <SelectField label="Funding Source" value="Zakat" required span={2} />
            <SelectField label="Sponsorship Plan" value="Per-Transfusion" required />
            <Field label="Coverage %" value="100%" required />
            <Field label="Sponsor / Donor (optional)" value="Anonymous Donor #A-2410" span={2} />
            <Field label="Approved By" value="Mr. Aleem Dar (Trustee)" span={2} />
            <Field label="Effective From" value="06 June 2026" />
            <Field label="Review Date" value="06 June 2027" />
          </FormSection>
        </FormCard>
        <div className="border border-border rounded-lg bg-gradient-to-br from-rose-500/5 to-background p-4 flex flex-col">
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-3">Acknowledgement Preview</div>
          <div className="flex-1 bg-card rounded-md border border-border p-4 text-xs">
            <div className="text-center pb-3 border-b">
              <div className="text-base font-bold text-rose-600">ADF — Aleem Dar Foundation</div>
              <div className="text-[10px] text-muted-foreground">Zakat / Sadaqa Sponsorship Acknowledgement</div>
            </div>
            <div className="space-y-2 mt-3 text-foreground">
              <div className="flex justify-between"><span className="text-muted-foreground">Patient:</span><span className="font-semibold">Ali Hassan Raza (THL-2026-00148)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Funding:</span><span className="font-semibold">Zakat — 100%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Plan:</span><span className="font-semibold">Per-Transfusion</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sponsor:</span><span className="font-semibold">Anonymous #A-2410</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Effective:</span><span className="font-semibold">06 Jun 2026</span></div>
            </div>
            <div className="mt-4 pt-3 border-t text-[10px] text-muted-foreground italic">
              This patient's transfusion, screening and chelation costs are covered under ADF Zakat fund. Auto-linked to donor ledger.
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Posted to Zakat Receivables account in finance module.
          </div>
        </div>
      </div>
      <SlideFooter page={6} />
    </div>
  );
}

/* 7 — Screening Stage Intro */
function S07ScreenIntro() {
  return (
    <StageIntro
      page={7}
      stage="Stage 2 of 8"
      title="Screening & Diagnosis"
      who="Lab Technician + Pathologist"
      time="2–4 hours (results)"
      summary="Confirm thalassemia type via CBC and HPLC. Rule out transfusion-transmitted infections."
      points={[
        "CBC reveals microcytic hypochromic anemia, low MCV / MCH.",
        "HPLC (Hb Electrophoresis) classifies Beta Major, Intermedia, Trait, or HbE.",
        "Serum Ferritin baseline measured for chelation planning.",
        "TTI panel mandatory: HIV, HBsAg, HCV — must be non-reactive.",
        "LFTs and RFTs for iron-overload organ baseline.",
        "Specimen IDs follow THL-YYMMDD-NNNN format and lock on collection.",
      ]}
    />
  );
}

/* 8 — Lab Order Form */
function S08LabOrder() {
  const tests = [
    { code: "CBC", name: "Complete Blood Count", checked: true },
    { code: "HPLC", name: "Hb Electrophoresis (HPLC)", checked: true },
    { code: "FER", name: "Serum Ferritin", checked: true },
    { code: "LFT", name: "Liver Function Tests", checked: true },
    { code: "RFT", name: "Renal Function Tests", checked: true },
    { code: "HIV", name: "HIV (TTI)", checked: true },
    { code: "HBS", name: "HBsAg (TTI)", checked: true },
    { code: "HCV", name: "HCV Antibody (TTI)", checked: true },
    { code: "TIBC", name: "Total Iron Binding Capacity", checked: false },
    { code: "GEN", name: "Genetic Confirmation (HBB)", checked: false },
  ];
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 2" title="Lab Order — Thalassemia Workup" subtitle="Single bundled order auto-suggested from patient type" />
      <div className="flex-1">
        <FormCard title="New Lab Order · Patient: Ali Hassan Raza (THL-2026-00148)" footer={<MockSubmitBtns />}>
          <FormSection cols={4}>
            <Field label="Order ID" value="LO-2026-08741" />
            <Field label="Order Date" value="06 Jun 2026, 09:14" />
            <SelectField label="Priority" value="Routine" />
            <SelectField label="Fasting Required" value="No" />
            <Field label="Specimen ID" value="THL-260606-0148" />
            <SelectField label="Sample Type" value="Whole Blood (EDTA)" />
            <Field label="Collected By" value="Nurse Ayesha" />
            <Field label="Collected At" value="09:32" />
          </FormSection>
          <FormSection heading="Tests Ordered" cols={2}>
            {tests.map((t) => (
              <div key={t.code} className="col-span-1 flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/20">
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${t.checked ? "bg-rose-600 border-rose-600" : "border-border bg-background"}`}>
                  {t.checked && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
                <span className="text-[11px] font-mono text-muted-foreground w-12">{t.code}</span>
                <span className="text-xs text-foreground flex-1">{t.name}</span>
              </div>
            ))}
          </FormSection>
          <FormSection heading="Funding" cols={2}>
            <div className="col-span-2 flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/30">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Covered under ADF Zakat fund — no charge to patient</span>
            </div>
          </FormSection>
        </FormCard>
      </div>
      <SlideFooter page={8} />
    </div>
  );
}

/* 9 — HPLC Result Entry */
function S09Hplc() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 2" title="HPLC Result Entry" subtitle="Pathologist enters Hb fractions; system auto-classifies thalassemia type" />
      <div className="grid grid-cols-2 gap-4 flex-1">
        <FormCard title="Hb Electrophoresis · HPLC">
          <FormSection heading="Hemoglobin Fractions" cols={3}>
            <Field label="Hb A (%)" value="12.4" required />
            <Field label="Hb A2 (%)" value="3.8" required />
            <Field label="Hb F (%)" value="82.6" required />
            <Field label="Hb S (%)" value="0.0" />
            <Field label="Total Hb (g/dL)" value="6.2" required />
            <Field label="Ret. Count (%)" value="2.1" />
          </FormSection>
          <FormSection heading="Interpretation">
            <SelectField label="HPLC Pattern" value="Beta Thalassemia Major" required span={3} />
            <Field label="Pathologist" value="Dr. Farah Ali" required span={2} />
            <SelectField label="Status" value="Verified" />
          </FormSection>
        </FormCard>
        <div className="border border-border rounded-lg bg-gradient-to-br from-rose-500/5 to-background p-4 flex flex-col">
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-3">Auto-Classification</div>
          <div className="bg-card rounded-md border border-border p-4 mb-3">
            <div className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Diagnosis</div>
            <div className="text-2xl font-extrabold text-rose-600">Beta Thalassemia Major</div>
            <div className="text-xs text-muted-foreground mt-1">Hb F &gt; 80% with Hb A2 &gt; 3.5% confirms major.</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-rose-500/10 border border-rose-500/30">
              <span className="text-xs font-semibold text-foreground">Lifelong transfusions required</span>
              <span className="text-[10px] text-rose-600 font-bold">Every 3–4 weeks</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30">
              <span className="text-xs font-semibold text-foreground">Iron chelation needed</span>
              <span className="text-[10px] text-amber-600 font-bold">From 10–15 transfusions</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/30">
              <span className="text-xs font-semibold text-foreground">Family screening recommended</span>
              <span className="text-[10px] text-blue-600 font-bold">Siblings & parents</span>
            </div>
          </div>
          <div className="mt-auto pt-3 text-[10px] text-muted-foreground italic">
            Diagnosis auto-pushed to patient record. Transfusion schedule and chelation reminders activated.
          </div>
        </div>
      </div>
      <SlideFooter page={9} />
    </div>
  );
}

/* 10 — Blood Bank Stage Intro */
function S10BBIntro() {
  return (
    <StageIntro
      page={10}
      stage="Stage 3 of 8"
      title="Blood Bank — Donor to Bedside"
      who="Blood Bank Officer + Lab"
      time="Same day for crossmatch"
      summary="From donor registration through screening, inventory, crossmatch and issue. 35-day expiry tracked per bag."
      points={[
        "Donor registered with eligibility checklist (Hb ≥12.5, weight ≥50kg, no recent illness).",
        "Mandatory TTI panel: HIV, HBsAg, HCV, Syphilis, Malaria, ABO/Rh — release gated on all non-reactive.",
        "Bag enters inventory with unique ID, blood group, collection date, expiry +35 days.",
        "FIFO suggestion when crossmatching — oldest compatible unit first.",
        "Crossmatch result (Compatible / Incompatible) logged with technician verification.",
        "Issue record captures requesting ward, transport temperature, time and receiving nurse.",
      ]}
    />
  );
}

/* 11 — Donor Registration */
function S11Donor() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 3" title="Blood Donor Registration" subtitle="Walk-in or camp donor — eligibility checklist before sample is drawn" />
      <div className="flex-1">
        <FormCard title="New Donor · ADF Blood Bank" footer={<MockSubmitBtns />}>
          <FormSection heading="Donor Identity">
            <Field label="Donor ID" value="DNR-2026-04211" />
            <Field label="Full Name" value="Bilal Ahmed" required />
            <SelectField label="Donor Type" value="Voluntary (Sadaqa)" required />
            <Field label="CNIC" value="35202-5544332-1" required />
            <Field label="Date of Birth" value="12 Jan 1995 (Age 31)" required />
            <SelectField label="Gender" value="Male" required />
            <SelectField label="Blood Group" value="B+" required />
            <Field label="Mobile" value="+92 333 7766554" required />
            <Field label="Last Donation Date" value="14 Feb 2026 (113 days ago)" />
          </FormSection>
          <FormSection heading="Eligibility Checklist" cols={4}>
            {[
              ["Weight ≥ 50 kg", "72 kg ✓"],
              ["Hb ≥ 12.5 g/dL", "14.2 g/dL ✓"],
              ["BP normal", "120/78 ✓"],
              ["No recent illness", "Confirmed ✓"],
              ["No tattoo in 6 months", "Confirmed ✓"],
              ["No medication", "Confirmed ✓"],
              ["Not pregnant/lactating", "N/A ✓"],
              ["Consent signed", "✓ digital sign"],
            ].map(([label, value]) => (
              <div key={label} className="col-span-1 px-2.5 py-2 rounded-md border border-emerald-500/30 bg-emerald-500/5">
                <div className="text-[10px] text-muted-foreground">{label}</div>
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{value}</div>
              </div>
            ))}
          </FormSection>
          <FormSection cols={2}>
            <div className="col-span-2 flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Donor eligible — proceed to sample collection</span>
            </div>
          </FormSection>
        </FormCard>
      </div>
      <SlideFooter page={11} />
    </div>
  );
}

/* 12 — Donor Screening Panel */
function S12DonorScreen() {
  const tests = [
    ["HIV 1/2", "Non-Reactive", "ok"],
    ["HBsAg", "Non-Reactive", "ok"],
    ["HCV Antibody", "Non-Reactive", "ok"],
    ["Syphilis (VDRL)", "Non-Reactive", "ok"],
    ["Malaria (ICT)", "Non-Reactive", "ok"],
    ["ABO Grouping", "B", "ok"],
    ["Rh Typing", "Positive (+)", "ok"],
    ["Hb (Pre-donation)", "14.2 g/dL", "ok"],
  ];
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 3" title="Donor Screening Panel (TTI)" subtitle="All eight tests must be non-reactive before the bag enters inventory" />
      <div className="flex-1">
        <FormCard title="Donor Screening · DNR-2026-04211 / Bag BB-2026-09887" footer={<MockSubmitBtns />}>
          <FormSection cols={4}>
            <Field label="Bag ID" value="BB-2026-09887" />
            <Field label="Collection Date" value="06 Jun 2026" />
            <Field label="Expiry Date" value="11 Jul 2026 (35d)" />
            <SelectField label="Component" value="Whole Blood → PRBC" />
          </FormSection>
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Test</th>
                  <th className="text-left px-3 py-2 font-semibold">Result</th>
                  <th className="text-left px-3 py-2 font-semibold">Tested By</th>
                  <th className="text-left px-3 py-2 font-semibold">Verified By</th>
                  <th className="text-center px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(([name, result]) => (
                  <tr key={name} className="border-t border-border">
                    <td className="px-3 py-1.5 font-medium text-foreground">{name}</td>
                    <td className="px-3 py-1.5 text-foreground">{result}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">Tech. Usman</td>
                    <td className="px-3 py-1.5 text-muted-foreground">Dr. Farah</td>
                    <td className="px-3 py-1.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">PASS</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/30">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">All TTI tests non-reactive → Bag released to inventory</span>
          </div>
        </FormCard>
      </div>
      <SlideFooter page={12} />
    </div>
  );
}

/* 13 — Crossmatch & Issue */
function S13Crossmatch() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 3" title="Crossmatch & Issue" subtitle="Match available bags to patient, log crossmatch result, issue to ward" />
      <div className="flex-1">
        <FormCard title="Blood Issue Request · Patient: Ali Hassan Raza (B+)" footer={<MockSubmitBtns />}>
          <FormSection cols={4}>
            <Field label="Request ID" value="BIR-2026-02014" />
            <Field label="Requested By" value="Dr. Sana Iqbal" />
            <SelectField label="Required Component" value="PRBC" required />
            <Field label="Units Required" value="2" required />
          </FormSection>
          <FormSection heading="Available Compatible Units (FIFO suggested)">
            <div className="col-span-3 border border-border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-3 py-2">Bag ID</th>
                    <th className="text-left px-3 py-2">Group</th>
                    <th className="text-left px-3 py-2">Collected</th>
                    <th className="text-left px-3 py-2">Expires</th>
                    <th className="text-left px-3 py-2">Age</th>
                    <th className="text-left px-3 py-2">Crossmatch</th>
                    <th className="text-center px-3 py-2">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["BB-2026-09210", "B+", "12 May", "16 Jun", "25d", "Compatible", true],
                    ["BB-2026-09445", "B+", "22 May", "26 Jun", "15d", "Compatible", true],
                    ["BB-2026-09887", "B+", "06 Jun", "11 Jul", "0d", "Pending", false],
                  ].map(([bag, group, coll, exp, age, xm, sel]) => (
                    <tr key={bag as string} className="border-t border-border">
                      <td className="px-3 py-1.5 font-mono text-foreground">{bag}</td>
                      <td className="px-3 py-1.5 font-bold text-rose-600">{group}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{coll}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{exp}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{age}</td>
                      <td className="px-3 py-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${xm === "Compatible" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}`}>{xm}</span>
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <div className={`inline-block w-4 h-4 rounded border ${sel ? "bg-rose-600 border-rose-600" : "border-border"}`}>
                          {sel && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormSection>
          <FormSection heading="Issue Details" cols={4}>
            <SelectField label="Issued To Ward" value="Thalassemia Day Care" required />
            <Field label="Receiving Nurse" value="Ayesha Saleem" required />
            <Field label="Transport Temp" value="2–6°C ✓" />
            <Field label="Time of Issue" value="06 Jun, 11:42" />
          </FormSection>
        </FormCard>
      </div>
      <SlideFooter page={13} />
    </div>
  );
}

/* 14 — Transfusion Record */
function S14Transfusion() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 3" title="Transfusion Record" subtitle="Nurse-driven form at bedside — vitals before, during and after each unit" />
      <div className="flex-1">
        <FormCard title="Transfusion Episode · Patient: Ali Hassan Raza" footer={<MockSubmitBtns />}>
          <FormSection cols={4}>
            <Field label="Episode ID" value="TXN-2026-01876" />
            <Field label="Bag ID" value="BB-2026-09210" />
            <Field label="Group / Volume" value="B+ / 350 mL" />
            <SelectField label="Component" value="PRBC" />
          </FormSection>
          <FormSection heading="Pre-Transfusion" cols={4}>
            <Field label="BP" value="100/65" />
            <Field label="Pulse" value="92" />
            <Field label="Temp" value="36.8°C" />
            <Field label="SpO2" value="98%" />
            <Field label="Pre-Hb (g/dL)" value="6.2" />
            <Field label="Start Time" value="12:05" />
            <Field label="Nurse" value="Ayesha Saleem" />
            <Field label="Doctor on Call" value="Dr. Sana Iqbal" />
          </FormSection>
          <FormSection heading="During & Post" cols={4}>
            <Field label="Rate" value="2 mL/kg/hr" />
            <Field label="End Time" value="14:35" />
            <Field label="Post BP" value="105/70" />
            <Field label="Post Pulse" value="88" />
            <Field label="Post Temp" value="37.0°C" />
            <Field label="Post-Hb (next visit)" value="9.6 g/dL" />
            <SelectField label="Reaction" value="None" />
            <SelectField label="Outcome" value="Completed" />
          </FormSection>
          <FormSection cols={2}>
            <div className="col-span-2 flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Transfusion completed. Next visit auto-scheduled in 21 days. Donor receipt queued.</span>
            </div>
          </FormSection>
        </FormCard>
      </div>
      <SlideFooter page={14} />
    </div>
  );
}

/* 15 — Ongoing Care Intro */
function S15CareIntro() {
  return (
    <StageIntro
      page={15}
      stage="Stage 4 of 8"
      title="Lifelong Care — Chelation & Follow-up"
      who="Day Care Nurse + Pediatric Hematologist"
      time="Lifelong (every 3–4 weeks)"
      summary="Beta Thal Major needs 13–17 transfusions per year plus iron chelation. The system manages the schedule and tracks complications."
      points={[
        "Auto-scheduled transfusions every 3–4 weeks with SMS reminders to guardian.",
        "Iron chelation started after Ferritin > 1000 ng/mL or ~10–15 transfusions.",
        "Serum Ferritin trend charted to adjust chelator dose.",
        "OPD review every 2 months: growth, splenomegaly, cardiac and endocrine check.",
        "Missed visit alerts pushed to social worker for home follow-up.",
        "Family / sibling screening offered at each visit until completed.",
      ]}
    />
  );
}

/* 16 — Transfusion Schedule */
function S16Schedule() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 4" title="Transfusion Schedule" subtitle="Recurring schedule auto-generated from diagnosis, with reminders and missed-visit alerts" />
      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className="col-span-2">
          <FormCard title="Patient Schedule · Ali Hassan Raza">
            <FormSection cols={3}>
              <SelectField label="Frequency" value="Every 21 days" required />
              <Field label="Units per Visit" value="2 PRBC" required />
              <Field label="Next Due" value="27 Jun 2026" required />
              <SelectField label="SMS Reminders" value="Enabled (T-2 & T-0)" />
              <SelectField label="Preferred Day" value="Saturday" />
              <Field label="Preferred Ward" value="Day Care Centre" />
            </FormSection>
            <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-2">Upcoming Visits</div>
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr><th className="text-left px-3 py-2">Visit</th><th className="text-left px-3 py-2">Date</th><th className="text-left px-3 py-2">Units</th><th className="text-left px-3 py-2">Status</th><th className="text-left px-3 py-2">Reminder</th></tr>
                </thead>
                <tbody>
                  {[
                    ["#48", "06 Jun 2026", "2", "Completed", "Sent ✓"],
                    ["#49", "27 Jun 2026", "2", "Scheduled", "Queued"],
                    ["#50", "18 Jul 2026", "2", "Scheduled", "Queued"],
                    ["#51", "08 Aug 2026", "2", "Scheduled", "Queued"],
                  ].map(([v, d, u, s, r]) => (
                    <tr key={v} className="border-t border-border">
                      <td className="px-3 py-1.5 font-mono">{v}</td>
                      <td className="px-3 py-1.5">{d}</td>
                      <td className="px-3 py-1.5">{u}</td>
                      <td className="px-3 py-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s === "Completed" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"}`}>{s}</span>
                      </td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormCard>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Transfusions to Date</div>
            <div className="text-3xl font-extrabold text-rose-600">48</div>
            <div className="text-[10px] text-muted-foreground">96 units · since Aug 2019</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Compliance</div>
            <div className="text-3xl font-extrabold text-emerald-600">96%</div>
            <div className="text-[10px] text-muted-foreground">2 missed in 2 years</div>
          </div>
          <div className="rounded-lg border bg-rose-500/5 border-rose-500/30 p-4">
            <div className="text-[10px] uppercase font-semibold text-rose-600 mb-1">Auto-Alert</div>
            <div className="text-xs text-foreground">If visit missed by 3+ days, social worker is notified for home follow-up.</div>
          </div>
        </div>
      </div>
      <SlideFooter page={16} />
    </div>
  );
}

/* 17 — Iron Chelation Tracking */
function S17Chelation() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 4" title="Iron Chelation Tracking" subtitle="Ferritin trend drives dose; compliance and side effects logged each visit" />
      <div className="grid grid-cols-2 gap-4 flex-1">
        <FormCard title="Chelation Plan">
          <FormSection cols={2}>
            <SelectField label="Chelator" value="Deferasirox (Oral)" required />
            <Field label="Dose" value="20 mg/kg/day" required />
            <Field label="Started On" value="14 Feb 2022" />
            <SelectField label="Status" value="Active" />
            <Field label="Weight (kg)" value="22" />
            <Field label="Daily Dose (mg)" value="440 mg" />
          </FormSection>
          <FormSection heading="Latest Labs" cols={2}>
            <Field label="Serum Ferritin" value="2,140 ng/mL" />
            <Field label="ALT / AST" value="38 / 42 U/L" />
            <Field label="Creatinine" value="0.6 mg/dL" />
            <Field label="Cardiac T2*" value="32 ms (Normal)" />
          </FormSection>
          <FormSection heading="Compliance & Side Effects" cols={2}>
            <SelectField label="Compliance" value="Good (>90%)" />
            <SelectField label="Side Effects" value="None reported" />
          </FormSection>
        </FormCard>
        <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-3">Serum Ferritin Trend (Last 12 months)</div>
          <div className="flex-1 flex items-end gap-2 px-2 pb-6 border-l border-b border-border relative">
            {[3200, 3050, 2880, 2750, 2640, 2520, 2410, 2330, 2250, 2210, 2180, 2140].map((v, i) => {
              const h = ((v - 1500) / 2000) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[9px] text-muted-foreground">{v}</div>
                  <div className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t" style={{ height: `${h}%` }} />
                </div>
              );
            })}
            <div className="absolute right-2 top-2 text-[10px] text-emerald-600 font-bold">↓ Improving</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="rounded border p-2">
              <div className="text-[9px] text-muted-foreground">Target</div>
              <div className="text-sm font-bold text-emerald-600">&lt;1000</div>
            </div>
            <div className="rounded border p-2">
              <div className="text-[9px] text-muted-foreground">Current</div>
              <div className="text-sm font-bold text-amber-600">2,140</div>
            </div>
            <div className="rounded border p-2">
              <div className="text-[9px] text-muted-foreground">12-mo Δ</div>
              <div className="text-sm font-bold text-emerald-600">−1,060</div>
            </div>
          </div>
        </div>
      </div>
      <SlideFooter page={17} />
    </div>
  );
}

/* 18 — OPD/IPD Visit */
function S18Visit() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 4" title="OPD / IPD Visit — Hematologist Review" subtitle="Every 2 months — growth, splenomegaly, cardiac and endocrine screening" />
      <div className="flex-1">
        <FormCard title="Hematology OPD Visit · 06 Jun 2026 · Dr. Sana Iqbal" footer={<MockSubmitBtns />}>
          <FormSection heading="Vitals & Growth" cols={4}>
            <Field label="Weight" value="22 kg" />
            <Field label="Height" value="118 cm" />
            <Field label="BMI" value="15.8" />
            <Field label="Growth Centile" value="10th %ile" />
            <Field label="BP" value="100/65" />
            <Field label="Pulse" value="88" />
            <Field label="Temp" value="36.8°C" />
            <Field label="SpO2" value="98%" />
          </FormSection>
          <FormSection heading="Examination" cols={3}>
            <SelectField label="Pallor" value="Moderate" />
            <SelectField label="Splenomegaly" value="2 cm BCM" />
            <SelectField label="Hepatomegaly" value="None" />
            <SelectField label="Jaundice" value="Mild" />
            <SelectField label="Cardiac" value="No murmur" />
            <SelectField label="Bone deformity" value="None" />
          </FormSection>
          <FormSection heading="Complications Screened" cols={4}>
            {[
              ["Cardiac (T2* MRI)", "32 ms ✓", "ok"],
              ["Endocrine (TFTs)", "Normal ✓", "ok"],
              ["Glycemia (HbA1c)", "5.4% ✓", "ok"],
              ["Hepatic (LFTs)", "Mild ↑", "warn"],
            ].map(([label, val, s]) => (
              <div key={label} className={`col-span-1 px-2.5 py-2 rounded-md border ${s === "ok" ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                <div className="text-[10px] text-muted-foreground">{label}</div>
                <div className={`text-xs font-bold ${s === "ok" ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>{val}</div>
              </div>
            ))}
          </FormSection>
          <FormSection heading="Plan" cols={2}>
            <Field label="Continue Chelation" value="Deferasirox 20 mg/kg/day" />
            <Field label="Repeat Ferritin" value="In 8 weeks" />
            <Field label="Next Review" value="08 Aug 2026" />
            <Field label="Notes" value="Discuss hepatic enzyme rise; recheck LFTs next visit." />
          </FormSection>
        </FormCard>
      </div>
      <SlideFooter page={18} />
    </div>
  );
}

/* 19 — Family Screening */
function S19Family() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader stage="Form Preview · Stage 4" title="Family / Sibling Screening" subtitle="Prevent the next case — screen siblings and parents, refer for genetic counselling" />
      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className="col-span-2">
          <FormCard title="Family Members of Ali Hassan Raza">
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-left px-3 py-2">Relation</th>
                    <th className="text-left px-3 py-2">Age</th>
                    <th className="text-left px-3 py-2">HPLC</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Counselling</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Hassan Raza", "Father", "38", "Hb A2 = 5.2%", "Beta Trait (Carrier)", "Done ✓"],
                    ["Saima Bibi", "Mother", "33", "Hb A2 = 4.8%", "Beta Trait (Carrier)", "Done ✓"],
                    ["Fatima Raza", "Sister", "12", "Hb A2 = 4.6%", "Beta Trait (Carrier)", "Done ✓"],
                    ["Hamza Raza", "Brother", "6", "Hb A2 = 2.4%", "Normal", "N/A"],
                    ["Aisha (Newborn)", "Sister", "0.5", "Pending", "Pending", "Scheduled"],
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-1.5 font-medium">{row[0]}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{row[1]}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{row[2]}</td>
                      <td className="px-3 py-1.5 font-mono text-[11px]">{row[3]}</td>
                      <td className="px-3 py-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row[4] === "Normal" ? "bg-emerald-600 text-white" :
                          row[4] === "Pending" ? "bg-amber-500 text-white" :
                          "bg-rose-500 text-white"
                        }`}>{row[4]}</span>
                      </td>
                      <td className="px-3 py-1.5 text-muted-foreground">{row[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30">
              <Users className="h-4 w-4 text-amber-600" />
              <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Both parents are carriers → 25% risk per pregnancy. Premarital screening referral added for daughter (12 yrs).</span>
            </div>
          </FormCard>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-2">Family Tree</div>
            <div className="text-center text-xs space-y-2">
              <div className="flex justify-center gap-3">
                <div className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40">👨 Father (Carrier)</div>
                <div className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40">👩 Mother (Carrier)</div>
              </div>
              <div className="text-muted-foreground">│</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="px-2 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-[10px]">Ali (Major) — Index</div>
                <div className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-[10px]">Fatima (Carrier)</div>
                <div className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px]">Hamza (Normal)</div>
                <div className="px-2 py-1 rounded bg-muted border text-[10px]">Aisha (Pending)</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-[10px] uppercase text-muted-foreground">Screened</div>
            <div className="text-2xl font-bold text-foreground">4 / 5</div>
          </div>
        </div>
      </div>
      <SlideFooter page={19} />
    </div>
  );
}

/* 20 — Reporting Dashboard */
function S20Dashboard() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader title="Foundation Reporting Dashboard" subtitle="Real-time KPIs for ADF trustees, donors and operations" />
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          ["Active Patients", "284", "rose"],
          ["Transfusions / Month", "1,142", "rose"],
          ["Donors Registered", "1,876", "rose"],
          ["Units in Inventory", "412", "rose"],
          ["Zakat Funds Utilized", "PKR 8.4M", "emerald"],
          ["Avg Pre-Tx Hb", "6.4 g/dL", "amber"],
          ["Missed Appointments", "12", "amber"],
          ["Family Members Screened", "612", "blue"],
        ].map(([label, val, c]) => (
          <div key={label} className={`rounded-lg border bg-card p-3 border-t-4 ${
            c === "rose" ? "border-t-rose-500" :
            c === "emerald" ? "border-t-emerald-500" :
            c === "amber" ? "border-t-amber-500" : "border-t-blue-500"
          }`}>
            <div className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">{label}</div>
            <div className="text-xl font-extrabold text-foreground">{val}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 flex-1">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-3">Transfusions per Month</div>
          <div className="flex items-end gap-2 h-32">
            {[820, 910, 980, 1020, 1080, 1142].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[9px] font-semibold">{v}</div>
                <div className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t" style={{ height: `${(v / 1200) * 100}%` }} />
                <div className="text-[9px] text-muted-foreground">M{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-3">Funding Mix (This Month)</div>
          <div className="space-y-2 text-xs">
            {[
              ["Zakat", 62, "bg-rose-500"],
              ["Sadaqa", 24, "bg-pink-500"],
              ["General Donation", 11, "bg-amber-500"],
              ["Self-pay", 3, "bg-muted-foreground"],
            ].map(([label, pct, color]) => (
              <div key={label as string}>
                <div className="flex justify-between mb-0.5">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SlideFooter page={20} />
    </div>
  );
}

/* 21 — Donor Receipt */
function S21Receipt() {
  return (
    <div className="slide flex flex-col bg-background">
      <SlideHeader title="Donor / Sponsor Receipt" subtitle="Auto-generated PDF — emailed to donor and stored under their profile" />
      <div className="flex-1 grid grid-cols-2 gap-4">
        <div className="border border-border rounded-lg bg-card p-6 flex flex-col">
          <div className="text-center pb-4 border-b border-border">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                <Heart className="h-7 w-7 text-white" fill="white" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-rose-600">ADF — Aleem Dar Foundation</div>
            <div className="text-[10px] text-muted-foreground">Registered Non-Profit · NTN 1234567-8</div>
            <div className="text-sm font-bold text-foreground mt-3">Zakat / Sadaqa Receipt</div>
            <div className="text-[10px] text-muted-foreground">Receipt #: ZR-2026-001875 · Date: 06 Jun 2026</div>
          </div>
          <div className="py-4 space-y-2 text-xs flex-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Donor:</span><span className="font-bold">Anonymous Donor #A-2410</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span><span className="font-bold text-rose-600 text-base">PKR 50,000</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Designation:</span><span className="font-bold">Zakat — Thalassemia Care</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Patients Sponsored:</span><span className="font-bold">8 children</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Coverage Period:</span><span className="font-bold">Jun 2026 – Aug 2026</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment Method:</span><span className="font-bold">Bank Transfer</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Reference:</span><span className="font-mono text-[10px]">TXN-908871234</span></div>
          </div>
          <div className="pt-3 border-t border-border text-[10px] text-muted-foreground italic text-center">
            Jazak Allah Khair. Your contribution covers 16 transfusions and one month of iron chelation for 8 children. Tax-exempt under Section 61 of ITO 2001.
          </div>
          <div className="mt-3 flex justify-center">
            <div className="w-16 h-16 bg-foreground/10 rounded grid grid-cols-4 gap-px p-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className={`${i % 2 === 0 ? "bg-foreground" : ""}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-2">What gets auto-generated</div>
            <ul className="space-y-1.5 text-xs">
              {[
                "Receipt PDF emailed to donor in real time",
                "Tax-exemption clause embedded per Pakistan tax law",
                "Donor profile updated with cumulative giving",
                "Linked to specific patients (anonymized for privacy)",
                "Posted to Zakat Receivables in finance module",
                "QR code links to donor portal for impact reports",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" /><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border bg-rose-500/5 border-rose-500/30 p-4">
            <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-2">Donor Portal (Phase 4)</div>
            <p className="text-xs">Each donor will get a login to see: total contributions, patients impacted, latest transfusion stats, and download all receipts for their tax filing.</p>
          </div>
        </div>
      </div>
      <SlideFooter page={21} />
    </div>
  );
}

/* 22 — Phased Rollout */
function S22Roadmap() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Registration + Zakat Intake",
      weeks: "Weeks 1–3",
      color: "bg-rose-500",
      items: ["Patient registration with thalassemia type", "Guardian & socioeconomic intake", "Zakat / Sadaqa eligibility engine", "Funding source assignment + acknowledgement"],
    },
    {
      phase: "Phase 2",
      title: "Blood Bank & Transfusion",
      weeks: "Weeks 4–7",
      color: "bg-pink-500",
      items: ["Donor registration + eligibility", "Donor TTI screening panel", "Bag inventory with 35-day expiry", "Crossmatch, issue, transfusion record"],
    },
    {
      phase: "Phase 3",
      title: "Chelation, Follow-up & Family",
      weeks: "Weeks 8–11",
      color: "bg-amber-500",
      items: ["Auto-scheduled transfusions + SMS reminders", "Iron chelation tracking + Ferritin trend", "Hematology OPD/IPD visits", "Family / sibling screening workflow"],
    },
    {
      phase: "Phase 4",
      title: "Dashboard, Receipts & Donor Portal",
      weeks: "Weeks 12–14",
      color: "bg-emerald-500",
      items: ["Foundation reporting dashboard", "Auto-generated Zakat / Sadaqa receipts", "Donor portal with impact reports", "Tax-exempt PDF and email automation"],
    },
  ];
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-rose-500/5 via-background to-background">
      <SlideHeader title="What We Will Deliver" subtitle="Phased rollout · 14 weeks end-to-end" />
      <div className="grid grid-cols-2 gap-3 flex-1">
        {phases.map((p) => (
          <div key={p.phase} className="rounded-lg border bg-card p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg ${p.color} flex items-center justify-center text-white shadow`}>
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">{p.phase} · {p.weeks}</div>
                <div className="text-sm font-bold text-foreground">{p.title}</div>
              </div>
            </div>
            <ul className="space-y-1 text-xs">
              {p.items.map((it) => (
                <li key={it} className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" /><span>{it}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-3 text-center">
          <Stethoscope className="h-5 w-5 text-rose-500 mx-auto mb-1" />
          <div className="text-xs font-bold">Built on HealthOS 24</div>
          <div className="text-[10px] text-muted-foreground">Reuses 20+ existing modules</div>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <BarChart3 className="h-5 w-5 text-rose-500 mx-auto mb-1" />
          <div className="text-xs font-bold">Live for ADF in 14 weeks</div>
          <div className="text-[10px] text-muted-foreground">Pilot at one centre first</div>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <FileText className="h-5 w-5 text-rose-500 mx-auto mb-1" />
          <div className="text-xs font-bold">Training & support included</div>
          <div className="text-[10px] text-muted-foreground">Staff onboarding + manuals</div>
        </div>
      </div>
      <div className="mt-4 text-center text-sm font-bold text-rose-600">
        Thank you — let's discuss timeline and next steps.
      </div>
      <SlideFooter page={22} />
    </div>
  );
}

/* ============================================================
   Main page
   ============================================================ */

const ThalassemiaPresentation = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => window.print(), []);

  const handleDownloadPDF = useCallback(async () => {
    if (!printContainerRef.current) return;
    setIsDownloading(true);
    try {
      const slides = printContainerRef.current.querySelectorAll(".slide");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [297, 167.0625] });
      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage();
        const el = slides[i] as HTMLElement;
        el.scrollIntoView();
        const orig = el.style.cssText;
        el.style.width = "1200px"; el.style.maxWidth = "1200px";
        el.style.minHeight = "675px"; el.style.height = "675px";
        el.style.overflow = "hidden"; el.style.margin = "0";
        el.style.borderRadius = "0"; el.style.border = "none"; el.style.boxShadow = "none";
        await new Promise((r) => setTimeout(r, 300));
        const dataUrl = await toPng(el, { quality: 0.95, pixelRatio: 2, backgroundColor: "#ffffff", width: 1200, height: 675 });
        el.style.cssText = orig;
        pdf.addImage(dataUrl, "PNG", 0, 0, 297, 167.0625);
      }
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = "ADF-Thalassemia-Patient-Journey.pdf";
      document.body.appendChild(link); link.click();
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 5000);
    } catch (e) {
      console.error(e); alert("PDF generation failed.");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const handleDownloadImages = useCallback(async () => {
    if (!printContainerRef.current) return;
    setIsDownloading(true);
    try {
      const slides = printContainerRef.current.querySelectorAll(".slide");
      const zip = new JSZip();
      const folder = zip.folder("ADF-Thalassemia-Slides")!;
      for (let i = 0; i < slides.length; i++) {
        const el = slides[i] as HTMLElement;
        el.scrollIntoView();
        const orig = el.style.cssText;
        el.style.width = "1200px"; el.style.maxWidth = "1200px";
        el.style.minHeight = "675px"; el.style.height = "675px";
        el.style.overflow = "hidden"; el.style.margin = "0";
        el.style.borderRadius = "0"; el.style.border = "none"; el.style.boxShadow = "none";
        await new Promise((r) => setTimeout(r, 200));
        const dataUrl = await toPng(el, { quality: 0.95, pixelRatio: 2, backgroundColor: "#ffffff", width: 1200, height: 675 });
        el.style.cssText = orig;
        folder.file(`slide-${String(i + 1).padStart(2, "0")}.png`, dataUrl.split(",")[1], { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = "ADF-Thalassemia-Slides.zip";
      document.body.appendChild(link); link.click();
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 5000);
    } catch (e) {
      console.error(e); alert("Image export failed.");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .slide {
            width: 297mm; height: 210mm; page-break-after: always;
            padding: 15mm; box-sizing: border-box; overflow: hidden;
          }
          .slide:last-child { page-break-after: avoid; }
        }
        @media screen {
          .slide {
            width: 100%; max-width: 1200px; min-height: 675px;
            margin: 0 auto 2rem; padding: 2rem;
            border: 1px solid hsl(var(--border)); border-radius: 0.5rem;
            background: hsl(var(--background));
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            position: relative;
          }
        }
      `}</style>

      <div className="no-print sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />Back to Site
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">ADF Thalassemia Patient Journey — Client Preview</h1>
              <p className="text-xs text-muted-foreground">{TOTAL_SLIDES} slides · Powered by HealthOS 24</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={isDownloading}>
              <Printer className="h-4 w-4 mr-2" />Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isDownloading}>
                  {isDownloading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</>
                  ) : (
                    <><FileDown className="h-4 w-4 mr-2" />Export<ChevronDown className="h-4 w-4 ml-2" /></>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <FileDown className="h-4 w-4 mr-2" />Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadImages}>
                  <ImageIcon className="h-4 w-4 mr-2" />Download Images (ZIP)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 min-h-screen">
        <div ref={printContainerRef} className="py-8 px-4">
          <S01Title />
          <S02Overview />
          <S03RegIntro />
          <S04RegForm />
          <S05Socio />
          <S06Funding />
          <S07ScreenIntro />
          <S08LabOrder />
          <S09Hplc />
          <S10BBIntro />
          <S11Donor />
          <S12DonorScreen />
          <S13Crossmatch />
          <S14Transfusion />
          <S15CareIntro />
          <S16Schedule />
          <S17Chelation />
          <S18Visit />
          <S19Family />
          <S20Dashboard />
          <S21Receipt />
          <S22Roadmap />
        </div>
      </div>
    </>
  );
};

export default ThalassemiaPresentation;

import {
  Users, Calendar, Stethoscope, AlertTriangle, Pill, FlaskConical,
  Scissors, BedDouble, Calculator, ShoppingCart, Bot, ShieldAlert,
  Brain, Receipt, TrendingUp, ArrowRight, Package, FileText,
  Droplets, ClipboardCheck, Clock, Layers, Bell, Target, Activity,
  Flag, Rocket, Zap, Building2, Globe
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PostCategory = "modules" | "ai" | "workflows" | "stats" | "brand";

export interface SocialPost {
  id: number;
  hook: string;
  subtext: string;
  category: PostCategory;
  icon: LucideIcon;
  brandColor: string; // tailwind color name e.g. "teal", "sky"
  module?: string;
}

export const categoryLabels: Record<PostCategory, string> = {
  modules: "Modules",
  ai: "AI / Tabeebi",
  workflows: "Workflows",
  stats: "Stats",
  brand: "Brand",
};

export const categoryColors: Record<PostCategory, string> = {
  modules: "bg-teal-500",
  ai: "bg-pink-500",
  workflows: "bg-blue-500",
  stats: "bg-amber-500",
  brand: "bg-purple-500",
};

export const socialPosts: SocialPost[] = [
  // ── Module Spotlight (1-10) ──
  { id: 1, hook: "Still using paper files?", subtext: "Register patients in 30 seconds with CNIC auto-fill. Digital records, zero paperwork.", category: "modules", icon: Users, brandColor: "teal", module: "Patients" },
  { id: 2, hook: "Your patients hate waiting.", subtext: "Show them live token queues on TV displays. Real-time updates, happier patients.", category: "modules", icon: Calendar, brandColor: "sky", module: "Appointments" },
  { id: 3, hook: "AI pre-screens patients before the doctor walks in.", subtext: "Tabeebi collects symptoms, history & vitals — so doctors focus on diagnosis.", category: "modules", icon: Stethoscope, brandColor: "violet", module: "OPD + Tabeebi" },
  { id: 4, hook: "5-Level triage in seconds.", subtext: "Because emergencies can't wait. Color-coded severity, instant prioritization.", category: "modules", icon: AlertTriangle, brandColor: "red", module: "Emergency" },
  { id: 5, hook: "Track every pill, every batch, every expiry.", subtext: "Automated inventory, smart reorder alerts, and complete batch traceability.", category: "modules", icon: Pill, brandColor: "emerald", module: "Pharmacy" },
  { id: 6, hook: "Lab results in minutes, not days.", subtext: "With AI-flagged abnormals, analyzer integration, and instant patient notifications.", category: "modules", icon: FlaskConical, brandColor: "cyan", module: "Laboratory" },
  { id: 7, hook: "From surgery scheduling to PACU.", subtext: "One seamless OT workflow. Pre-op, intra-op, post-op — all connected.", category: "modules", icon: Scissors, brandColor: "orange", module: "Operation Theatre" },
  { id: 8, hook: "Admit, treat, discharge, bill.", subtext: "IPD without the chaos. Bed management, rounds, nursing stations — unified.", category: "modules", icon: BedDouble, brandColor: "indigo", module: "IPD" },
  { id: 9, hook: "Double-entry accounting that posts itself.", subtext: "Zero manual journal entries. Every transaction auto-posted to the right ledger.", category: "modules", icon: Calculator, brandColor: "slate", module: "Accounts" },
  { id: 10, hook: "Requisition to vendor payment.", subtext: "Procurement on autopilot. 3-way matching, GRN verification, auto approvals.", category: "modules", icon: ShoppingCart, brandColor: "lime", module: "Procurement" },

  // ── AI / Tabeebi (11-15) ──
  { id: 11, hook: "Meet Tabeebi.", subtext: "Your AI doctor that never sleeps. 24/7 symptom assessment, triage & guidance in Urdu & English.", category: "ai", icon: Bot, brandColor: "pink" },
  { id: 12, hook: "AI drug interaction alerts could save a life today.", subtext: "Real-time checks against the entire prescription. Contraindications flagged before dispensing.", category: "ai", icon: ShieldAlert, brandColor: "rose" },
  { id: 13, hook: "Tabeebi pre-screens patients.", subtext: "So doctors focus on what matters. AI-collected history, vitals summary, and preliminary assessment.", category: "ai", icon: Brain, brandColor: "fuchsia" },
  { id: 14, hook: "AI-powered billing codes from diagnosis.", subtext: "No more guessing. Automatic ICD-10 and procedure code suggestions from clinical notes.", category: "ai", icon: Receipt, brandColor: "violet" },
  { id: 15, hook: "Predictive analytics that spot trends before you ask.", subtext: "Patient flow forecasting, revenue predictions, and resource utilization insights.", category: "ai", icon: TrendingUp, brandColor: "purple" },

  // ── Workflow / Process (16-20) ──
  { id: 16, hook: "Walk-in to walkout in 15 minutes.", subtext: "Registration → Token → Vitals → Consultation → Prescription → Billing. One flow.", category: "workflows", icon: ArrowRight, brandColor: "blue" },
  { id: 17, hook: "The complete procurement cycle in 6 steps.", subtext: "Requisition → Approval → PO → GRN → 3-Way Match → Payment. Fully automated.", category: "workflows", icon: Package, brandColor: "emerald" },
  { id: 18, hook: "How a single prescription flows.", subtext: "Doctor prescribes → Pharmacy receives → Stock checked → Dispensed → Billed. Seamlessly.", category: "workflows", icon: FileText, brandColor: "teal" },
  { id: 19, hook: "From blood donor to transfusion.", subtext: "Zero errors. Donation → Testing → Cross-match → Issue → Transfusion monitoring.", category: "workflows", icon: Droplets, brandColor: "red" },
  { id: 20, hook: "Nurse shift handover.", subtext: "Nothing falls through the cracks. Vitals, meds, alerts — all handed over digitally.", category: "workflows", icon: ClipboardCheck, brandColor: "sky" },

  // ── Stats / Impact (21-25) ──
  { id: 21, hook: "45 min → 15 min", subtext: "Average patient visit time with AI pre-screening. That's 3x faster throughput.", category: "stats", icon: Clock, brandColor: "amber" },
  { id: 22, hook: "20+ modules. 1 platform. Zero paper.", subtext: "Every department connected. Every workflow digitized. One unified system.", category: "stats", icon: Layers, brandColor: "teal" },
  { id: 23, hook: "40% fewer no-shows.", subtext: "With automated SMS reminders, WhatsApp confirmations, and easy rescheduling.", category: "stats", icon: Bell, brandColor: "orange" },
  { id: 24, hook: "99.5% three-way match accuracy.", subtext: "PO vs GRN vs Invoice — automated reconciliation that virtually eliminates errors.", category: "stats", icon: Target, brandColor: "emerald" },
  { id: 25, hook: "24/7 operations.", subtext: "Because healthcare never stops. Cloud-based, always available, always secure.", category: "stats", icon: Activity, brandColor: "red" },

  // ── Brand / CTA (26-30) ──
  { id: 26, hook: "AI-Powered Hospital Management System.", subtext: "Built for Pakistan. Localized billing, CNIC integration, Urdu support, PKR currency.", category: "brand", icon: Flag, brandColor: "emerald" },
  { id: 27, hook: "The future of healthcare is here.", subtext: "Are you ready? AI diagnostics, smart workflows, predictive analytics — all in one platform.", category: "brand", icon: Rocket, brandColor: "purple" },
  { id: 28, hook: "Stop managing chaos.", subtext: "Start managing health. HealthOS 24 brings order to every department, every shift, every patient.", category: "brand", icon: Zap, brandColor: "amber" },
  { id: 29, hook: "From 5-bed clinic to 500-bed hospital.", subtext: "HealthOS scales with you. Multi-branch, multi-role, multi-everything.", category: "brand", icon: Building2, brandColor: "blue" },
  { id: 30, hook: "Book your free demo today.", subtext: "See how HealthOS 24 can transform your hospital operations. Visit healthos.com", category: "brand", icon: Globe, brandColor: "teal" },
];

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ChevronDown } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";
import { DocCover, DocPageWrapper, SectionTitle, SubSection } from "@/components/shared-docs/DocPageWrapper";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

const MODULE_TITLE = "Demo FAQ Guide";
const TOTAL_PAGES = 6;

interface FaqItem {
  q: string;
  a: string;
}

const generalFaqs: FaqItem[] = [
  { q: "What is HealthOS 24?", a: "HealthOS 24 is an AI-powered, cloud-based Hospital Management System (HMS) designed for clinics, polyclinics, and hospitals. It covers OPD, IPD, Surgery, Lab, Radiology, Pharmacy, HR, Finance, and more — all in one unified platform." },
  { q: "Who is HealthOS 24 built for?", a: "Small clinics (1-5 doctors), polyclinics, multi-branch hospital groups, dental clinics, dialysis centers, and diagnostic labs across the UAE, KSA, and beyond." },
  { q: "How long does implementation take?", a: "A single clinic can go live in 2-4 hours. Multi-branch hospitals typically take 2-4 weeks including data migration, staff training, and workflow customization." },
  { q: "Is HealthOS 24 cloud-based or on-premise?", a: "Primarily cloud-based (SaaS) for zero infrastructure cost. On-premise deployment is available for hospitals that require it due to regulatory or data sovereignty requirements." },
  { q: "Does HealthOS 24 work offline?", a: "Yes. Critical functions like patient check-in, token generation, and prescription printing work offline. Data syncs automatically when the connection is restored." },
  { q: "What languages does it support?", a: "English, Arabic (RTL), and Urdu. The entire interface — including reports, invoices, and patient communications — can switch languages instantly." },
];

const clinicalFaqs: FaqItem[] = [
  { q: "How does the OPD workflow work?", a: "Patient Registration → Token/Queue → Vitals Check-in → Doctor Consultation (with AI-assisted notes) → Prescription → Pharmacy Dispensing → Billing → Checkout. The entire flow is digitized and tracked." },
  { q: "Can doctors access patient history on mobile?", a: "Yes. HealthOS 24 is fully responsive. Doctors can view complete patient EMR, lab results, radiology images, and past prescriptions on any mobile device." },
  { q: "Does it support e-Prescriptions?", a: "Yes. Prescriptions are generated digitally with drug interaction checks, dosage suggestions, and can be sent directly to the pharmacy module or printed with barcodes." },
  { q: "How does IPD admission work?", a: "Emergency/OPD referral → Bed Selection (visual ward map) → Admission → Doctor Rounds → Nursing Notes → Vitals Monitoring → Discharge Summary → Final Billing." },
  { q: "Is there surgery/OT management?", a: "Complete OT module: scheduling, pre-op checklists, anesthesia records, live surgery timer, instrument tracking, PACU recovery scoring, and post-op notes." },
  { q: "Does the Lab module support LOINC codes?", a: "Yes. Lab tests can be mapped to LOINC codes, results auto-validated with reference ranges, and critical values trigger automatic alerts to physicians." },
];

const operationsFaqs: FaqItem[] = [
  { q: "How does pharmacy inventory work?", a: "Real-time stock tracking with batch/expiry management, auto-reorder alerts, GRN processing, supplier management, and POS with barcode scanning. Supports controlled substance tracking." },
  { q: "Can multiple branches share data?", a: "Yes. Multi-branch architecture allows shared patient records, centralized reporting, inter-branch stock transfers, and consolidated financial statements while maintaining branch-level autonomy." },
  { q: "How does billing and insurance work?", a: "Supports cash, insurance, and corporate billing. Insurance claims can be submitted electronically (NPHIES for KSA). Split billing, package pricing, and discount management included." },
  { q: "Is there a patient self-service portal?", a: "Yes. Patients can check queue status, view appointments, access lab results, and receive notifications via SMS/WhatsApp — all without logging in for basic functions." },
  { q: "Does it handle HR and payroll?", a: "Complete HR suite: employee management, attendance (biometric integration), leave management, payroll processing, recruitment pipeline, training tracking, and compliance/license expiry alerts." },
  { q: "How does the finance module work?", a: "Double-entry accounting with chart of accounts, journal entries, accounts receivable/payable, bank reconciliation, P&L statements, balance sheets, and department-wise cost center tracking." },
];

const technicalFaqs: FaqItem[] = [
  { q: "Is patient data secure?", a: "256-bit AES encryption at rest and in transit. HIPAA-compliant design, role-based access control (RBAC), complete audit logging, and data isolation per organization. Regular security audits conducted." },
  { q: "What about KSA compliance?", a: "Built-in support for NPHIES (insurance), ZATCA (e-invoicing), Wasfaty (e-prescriptions), Nafath (national ID), HESN (infection reporting), and Tatmeen (drug tracking)." },
  { q: "Can it integrate with existing lab machines?", a: "Yes. HL7/FHIR integration support for lab analyzers, PACS systems for radiology, and biometric devices for HR attendance. Custom API integrations available." },
  { q: "What is the uptime guarantee?", a: "99.9% uptime SLA with redundant cloud infrastructure, automatic failover, daily backups with 30-day retention, and 24/7 monitoring." },
  { q: "Is there an API for custom integrations?", a: "Full REST API with webhook support. Third-party systems can integrate for patient data exchange, appointment booking, lab result retrieval, and billing synchronization." },
  { q: "How is data backed up?", a: "Automated daily backups stored in geographically separate data centers. Point-in-time recovery available. Organizations can also export their data at any time in standard formats." },
];

const pricingFaqs: FaqItem[] = [
  { q: "What does HealthOS 24 cost?", a: "Flexible pricing based on facility size: Starter (1-3 doctors), Professional (4-15 doctors), and Enterprise (16+ doctors / hospitals). Contact sales for a custom quote tailored to your workflows." },
  { q: "Is there a free trial?", a: "Yes. We offer a 14-day full-featured trial with sample data pre-loaded so you can explore every module. No credit card required." },
  { q: "What's included in the subscription?", a: "All modules, unlimited patients, cloud hosting, automatic updates, data backups, email support, and onboarding training. Premium plans include 24/7 phone support and dedicated account manager." },
  { q: "Are there any setup fees?", a: "No setup fees for standard deployments. Data migration from existing systems is included free of charge. Custom integrations may have one-time development fees." },
  { q: "Can I add modules later?", a: "Yes. Start with the modules you need and add more as your facility grows. Specialty modules (Dental, Dialysis) can be activated anytime without disrupting existing workflows." },
];

const FaqBlock = ({ items }: { items: FaqItem[] }) => (
  <div style={{ fontSize: 13 }}>
    {items.map((faq, i) => (
      <div key={i} style={{ marginBottom: 14, borderLeft: '3px solid #10b981', paddingLeft: 12 }}>
        <p style={{ fontWeight: 600, color: '#111827', marginBottom: 3 }}>{faq.q}</p>
        <p style={{ color: '#4b5563', lineHeight: 1.5 }}>{faq.a}</p>
      </div>
    ))}
  </div>
);

const DemoFaqDocumentation = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!printRef.current || downloading) return;
    setDownloading(true);
    try {
      const pages = printRef.current.querySelectorAll('.proposal-page');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      for (let i = 0; i < pages.length; i++) {
        const canvas = await toPng(pages[i] as HTMLElement, { quality: 0.95, pixelRatio: 2 });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas, 'PNG', 0, 0, 210, 297);
      }
      pdf.save('HealthOS24_Demo_FAQ_Guide.pdf');
    } catch (e) { console.error(e); }
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/documentation")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <HealthOS24Logo variant="full" size="sm" />
        <Button size="sm" onClick={handleDownloadPdf} disabled={downloading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Download className="h-4 w-4" /> {downloading ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      <div ref={printRef} className="flex flex-col items-center gap-8 py-8">
        {/* Page 1: Cover */}
        <DocCover title="Demo FAQ Guide" subtitle="Common questions & answers for HealthOS 24 demonstrations" features="General • Clinical Workflows • Operations • Technical • Pricing & Licensing" />

        {/* Page 2: General */}
        <DocPageWrapper pageNumber={2} totalPages={TOTAL_PAGES} moduleTitle={MODULE_TITLE}>
          <SectionTitle icon="❓" title="General Questions" subtitle="Overview, setup, and platform basics" />
          <FaqBlock items={generalFaqs} />
        </DocPageWrapper>

        {/* Page 3: Clinical */}
        <DocPageWrapper pageNumber={3} totalPages={TOTAL_PAGES} moduleTitle={MODULE_TITLE}>
          <SectionTitle icon="🩺" title="Clinical Workflow Questions" subtitle="OPD, IPD, Surgery, Lab & Radiology" />
          <FaqBlock items={clinicalFaqs} />
        </DocPageWrapper>

        {/* Page 4: Operations */}
        <DocPageWrapper pageNumber={4} totalPages={TOTAL_PAGES} moduleTitle={MODULE_TITLE}>
          <SectionTitle icon="⚙️" title="Operations & Management" subtitle="Pharmacy, HR, Finance & Multi-branch" />
          <FaqBlock items={operationsFaqs} />
        </DocPageWrapper>

        {/* Page 5: Technical */}
        <DocPageWrapper pageNumber={5} totalPages={TOTAL_PAGES} moduleTitle={MODULE_TITLE}>
          <SectionTitle icon="🔒" title="Technical & Compliance" subtitle="Security, integrations, KSA compliance & infrastructure" />
          <FaqBlock items={technicalFaqs} />
        </DocPageWrapper>

        {/* Page 6: Pricing */}
        <DocPageWrapper pageNumber={6} totalPages={TOTAL_PAGES} moduleTitle={MODULE_TITLE}>
          <SectionTitle icon="💰" title="Pricing & Licensing" subtitle="Plans, trials, and what's included" />
          <FaqBlock items={pricingFaqs} />

          <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f0fdf4', borderRadius: 12, border: '1px solid #a7f3d0', textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#059669', marginBottom: 4 }}>Ready to see it in action?</p>
            <p style={{ fontSize: 13, color: '#4b5563' }}>Book a free personalized demo at <strong>healthos24.com</strong> or call <strong>+971 506802430</strong></p>
          </div>
        </DocPageWrapper>
      </div>
    </div>
  );
};

export default DemoFaqDocumentation;

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

export default function SystemOverview() {
  const logoRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!logoRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(logoRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 3,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = "healthos24-logo.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">

        <header className="space-y-3 border-b border-border pb-8">
          <h1 className="text-3xl font-bold tracking-tight">Smart HMS — Complete System Overview</h1>
          <p className="text-muted-foreground">
            A comprehensive Hospital Management System covering clinical, administrative, financial, and ancillary operations — built for hospitals, clinics, and multi-branch healthcare organizations.
          </p>
        </header>

        {/* Downloadable Logo */}
        <section className="flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-10">
          <div ref={logoRef} className="bg-white p-8 rounded-xl">
            <HealthOS24Logo size="xl" showTagline />
          </div>
          <Button onClick={handleDownload} disabled={downloading} className="gap-2">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Generating..." : "Download Logo as PNG"}
          </Button>
        </section>

        {/* 1. CORE */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">1. Core Modules</h2>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">1.1 Patient Management</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Complete patient registration with demographics, contact details, insurance information, and medical history. Unique MR numbers are auto-generated per organization. Supports guardian information for minors, CNIC/NIC-based lookup, and patient search by name, phone, or MR number. Patient profiles include visit history, billing summary, lab results, and prescriptions all in one place.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">1.2 Appointments & Queue Management</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Appointment scheduling with date, time, doctor selection, and appointment type (new visit, follow-up, referral, walk-in). Automatic token number generation per doctor per day. Queue management with real-time status tracking (waiting, in-progress, completed, no-show). Self-service kiosk support for patient check-in with token printing. Public queue display screens for waiting rooms. Priority-based queue ordering. Check-in workflow with vitals recording, chief complaint capture, and payment verification.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">1.3 OPD / Consultations</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Full outpatient consultation workflow: doctor queue with patient list, clinical notes with SOAP format, diagnosis recording (ICD-10 support), prescription writing with medicine search, dosage, frequency, and duration. Follow-up scheduling. Referral to specialists or departments. Integration with lab orders, imaging orders, and pharmacy for direct prescription fulfillment. Consultation history view per patient. Vital signs recording during consultation. Templates for common diagnoses and prescriptions.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">1.4 Billing & Payments</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Invoice generation for consultations, procedures, lab tests, imaging, pharmacy, and IPD charges. Multiple payment methods (cash, card, bank transfer, online). Payment splitting and partial payments. Discount and waiver management with approval workflow. Session-based billing for cashiers with daily closing and reconciliation. Receipt printing and reprinting. Patient payment history and outstanding balances. Insurance claim tracking. Refund processing. Doctor settlement and commission tracking.</p>
          </div>
        </section>

        {/* 2. CLINICAL */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">2. Clinical Modules</h2>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">2.1 IPD / Inpatient Admissions</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Complete inpatient management: admission registration with admission type (emergency, elective, transfer), ward and bed allocation, bed management dashboard showing occupancy by ward. Bed transfers between wards with reason tracking. Doctor assignment (admitting, attending, referring). Clinical notes and progress tracking. Nursing care plans and medication administration records. Discharge workflow with discharge summary, instructions, follow-up scheduling, and final billing. Deposit collection and tracking. Estimated cost management.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">2.2 Emergency / ER</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Emergency registration with triage classification (resuscitation, emergent, urgent, less urgent, non-urgent) using ESI color coding. Rapid patient registration for unknown/unconscious patients. Ambulance alert management with ETA tracking and pre-hospital care details. ER-specific clinical documentation. Conversion to IPD admission or OPD follow-up. Real-time ER dashboard with patient count by triage level. Public ER display for ambulance status.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">2.3 Operation Theatre</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Surgery scheduling with OT room allocation and conflict detection. Pre-operative assessment and checklists. Surgical team assignment (surgeon, anesthetist, nurses, technicians). Anesthesia records with detailed intra-operative monitoring (vitals log, fluid I/O, blood loss, medications). Surgery notes and findings documentation. Post-operative care instructions. OT room status management (available, occupied, cleaning, maintenance). Surgery billing integration. Instrument and supply tracking per surgery.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">2.4 ANC / Maternity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Antenatal care records with visit tracking, gestational age calculation, obstetric history (gravida, para, abortion, living). Vital monitoring (blood pressure, weight, hemoglobin, blood sugar). Fetal assessment (heart rate, movements, presentation, lie). Vaccination tracking (TT1, TT2). Lab results integration (HIV, HBsAg, VDRL, blood group). Risk categorization and referral management. Birth plan documentation. Expected delivery date calculation from LMP and ultrasound.</p>
          </div>
        </section>

        {/* 3. ANCILLARY */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">3. Ancillary & Diagnostic Modules</h2>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">3.1 Laboratory</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Lab test catalog management with test categories, normal ranges, and pricing. Lab order creation from OPD, IPD, and ER. Sample collection tracking with barcode generation. Result entry with normal/abnormal flagging. Result publishing workflow with technician entry and pathologist verification. Published results accessible to ordering doctors in real-time. Patient-facing lab report portal with MR number lookup. Lab order payment integration. Batch result entry for efficiency. Lab workload dashboard.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">3.2 Radiology / Imaging</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Imaging modality management (X-ray, CT, MRI, Ultrasound, etc.). Imaging order creation from consultations. Scheduling and queue management for imaging departments. Result/report entry by radiologist with findings, impression, and recommendations. Image attachment support. Result publishing and notification to ordering doctor. Payment integration for imaging services. Imaging workload tracking.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">3.3 Pharmacy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Medicine catalog with generic names, brand names, formulations, and strength. Inventory management with batch tracking, expiry date monitoring, and stock level alerts. Prescription fulfillment from OPD and IPD orders. Medicine dispensing with automatic stock deduction. Store-level inventory (main store, OT pharmacy, ward pharmacy). Stock transfers between stores. Purchase order management. Goods received notes (GRN). Stock adjustments for damage, expiry, and write-offs. Minimum stock level alerts. Medicine interaction warnings.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">3.4 Pharmacy POS</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Point-of-sale terminal for over-the-counter pharmacy sales. Quick medicine search and barcode scanning. Cart management with quantity, discount, and tax calculation. Multiple payment methods. Session management with opening/closing balance. Daily sales reports. Receipt printing. Walk-in customer sales without patient registration. Integration with pharmacy inventory for real-time stock updates.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">3.5 Blood Bank</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Donor registration and management with health screening. Blood donation recording with bag number, volume, and donation type. Blood inventory management by blood group and component (whole blood, packed RBCs, plasma, platelets). Cross-matching and compatibility testing. Blood request management from surgery and IPD. Transfusion recording with reaction monitoring. Blood unit tracking from donation to transfusion. Expiry monitoring and disposal tracking. Donor eligibility rules and deferral management.</p>
          </div>
        </section>

        {/* 4. INVENTORY */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">4. Inventory & Warehouse</h2>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">4.1 Inventory Management</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Centralized inventory item catalog with item codes, categories, units of measurement, and reorder levels. Multi-store inventory tracking. Purchase request and purchase order workflow with approval chains. Vendor management with vendor codes, contact details, and payment terms. Goods received notes (GRN) with quality inspection. Stock requisitions between departments. Stock transfers between stores/branches. Stock adjustments for damage, loss, and corrections. Cycle count management for physical verification. Return-to-vendor (RTV) processing. Minimum/maximum stock alerts. Batch and expiry tracking.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">4.2 Warehouse Management</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Warehouse order management for multi-branch supply chain. Pick list generation for order fulfillment. Packing slip creation and verification. Shipment tracking with dispatch and delivery status. Zone and bin location management within warehouses. Warehouse-to-branch distribution workflow. Shipment cost tracking with automatic journal entry posting. Multi-warehouse support for organizations with central procurement. Dock and gate management. Shift handover logs. Safety incident recording. Warehouse KPI dashboard for receiving efficiency, put-away rate, and order accuracy.</p>
          </div>
        </section>

        {/* 5. FINANCE */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">5. Finance & Accounts</h2>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">5.1 Financial Accounting</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Full double-entry accounting system. Chart of Accounts with hierarchical structure (4 levels: category, group, sub-group, posting account). Account types: Assets, Liabilities, Equity, Revenue, Expenses. Journal entry creation with automatic entry number generation. Posting and unposting workflow. Auto-generated journal entries from billing, payroll, expenses, and stock write-offs. Bank account management with reconciliation. Bank transaction recording. Vendor payment tracking with payment numbers. Financial reports: Trial Balance, Profit and Loss, Balance Sheet, Cash Flow. Period-based reporting. Branch-level and organization-level accounting.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">5.2 Expense Management</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Expense recording by category (petty cash, refunds, staff advances, miscellaneous). Automatic journal entry posting for each expense. Branch-level expense tracking. Expense approval workflow. Daily expense summary in billing session closing.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">5.3 Donation Management</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Financial donor registration with donor numbers. Donation recording with donation types, amounts, and payment methods. Donation receipt generation and printing. Recurring donation schedule management. Donation campaign creation and tracking. Campaign-specific public donation pages. Donor communication and thank-you letters. Donation reports and analytics. Designed for NGO and charitable hospitals.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">5.4 Doctor Settlements</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Doctor commission and fee settlement tracking. Settlement period management. Revenue breakdown per doctor (consultations, procedures, surgeries). Settlement number generation. Payment processing and history. Supports percentage-based and fixed-fee commission models.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">5.5 Insurance & Claims</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Insurance provider management. Patient insurance policy tracking. Pre-authorization workflow. Claim submission with claim numbers. Claim status tracking (submitted, approved, rejected, partially approved). Claim amount reconciliation. Insurance-based billing with co-pay calculation. Corporate/panel billing support.</p>
          </div>
        </section>

        {/* 6. HR */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">6. HR & Administration</h2>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">6.1 HR / Employee Management</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Employee registration with personal details, employment information, department assignment, and designation. Employee code generation. Document management (CNIC, certificates, contracts). Shift management with multiple shift patterns. Attendance tracking with biometric device integration, manual check-in/out, and GPS-based location capture. Late arrival and early departure calculation. Overtime tracking. Attendance correction requests with approval workflow. Leave management with leave types, balances, requests, and approvals. Holiday calendar management. Employee self-service portal for viewing schedule, attendance, leaves, and payslips.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">6.2 Payroll</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Salary structure management with basic salary, allowances, and deductions. Monthly payroll processing with automatic attendance-based calculations. Payslip generation with detailed breakdown. Payroll approval workflow. Automatic journal entry posting for salary expenses. Payroll reports and summaries. Tax deduction support. Loan and advance deduction tracking.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">6.3 Doctor Management</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Doctor profiles with specialization, qualification, license number, and consultation fee. Doctor schedule management with available days and time slots. OPD department assignment. Doctor-wise appointment limits. Consultation fee configuration. Doctor availability status. Performance tracking and patient volume analytics.</p>
          </div>
        </section>

        {/* 7. SYSTEM */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">7. System & Administration</h2>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">7.1 Multi-Organization & Multi-Branch</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Multi-tenant architecture supporting multiple independent organizations. Each organization can have multiple branches. Branch-level data isolation with organization-level aggregation. Branch-specific settings for services, fees, and schedules. Cross-branch reporting at organization level. Super admin dashboard for system-wide management.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">7.2 Role-Based Access Control</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">25+ predefined roles covering all hospital departments: Super Admin, Organization Admin, Branch Admin, Doctor, Surgeon, Anesthetist, Nurse (General, OPD, IPD, OT), Receptionist, Pharmacist (Main, OT), Lab Technician, Radiologist, Radiology Technician, Blood Bank Technician, Accountant, Finance Manager, HR Manager, HR Officer, Store Manager, OT Technician, Warehouse Admin, Warehouse User. Granular permission system with 100+ individual permissions. Role-permission mapping with grant/deny. Per-organization permission customization. Multi-role support per user.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">7.3 Services & Fee Management</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Service catalog management with categories (consultation, procedure, lab, imaging, room charges, etc.). Service pricing with branch-level overrides. Service packages and bundles. Tax configuration per service. Service-wise revenue tracking. Department-based service grouping.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">7.4 Settings & Configuration</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Organization profile management (name, logo, contact, address). Branch configuration. Module activation/deactivation per organization. Language settings with multi-language support (English, Urdu, Arabic). Notification preferences. Print template customization. User management with role assignment. Audit logging for all critical operations. System preferences for date format, currency, and time zone.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">7.5 Medical Certificates</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Digital medical certificate generation: fitness certificates, sick leave certificates, disability certificates, death certificates, and custom certificates. Pre-built templates with doctor signature. PDF generation and printing. Certificate numbering and tracking.</p>
          </div>
        </section>

        {/* 8. REPORTS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">8. Reports & Analytics</h2>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">8.1 Reports Hub</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Centralized reporting dashboard with categorized reports. Organization-level reports: revenue summary, patient volume, department utilization. Branch comparison reports. Financial reports: daily collections, monthly revenue, expense analysis, profit and loss. Clinical reports: doctor performance, patient demographics, disease patterns. Operational reports: appointment statistics, average wait times, bed occupancy rates. HR reports: attendance summary, leave utilization, payroll summary. Inventory reports: stock status, consumption patterns, expiry alerts. Custom date range filtering. Export to PDF and Excel. Visual charts and graphs with trend analysis.</p>
          </div>
        </section>

        {/* 9. AI & DIGITAL */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">9. AI & Digital Features</h2>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">9.1 Tabeebi AI Doctor</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">AI-powered patient-facing health assistant supporting text and voice interaction in English, Urdu, and Arabic. Symptom assessment and triage guidance. Health education and medication information. Conversation history tracking. Context-aware responses based on patient profile. Voice-to-text and text-to-speech capabilities.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">9.2 Self-Service Kiosk</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Touch-screen kiosk application for patient self-check-in. Patient lookup by MR number or phone. Doctor and department selection. Automatic token generation and printing. Queue position display. Multi-language interface. Secure kiosk authentication with dedicated kiosk accounts. Remote kiosk configuration and management.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">9.3 Public Displays</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Real-time public display screens for hospital waiting areas. Queue display showing current token, next tokens, and doctor room information. ER display showing ambulance alerts and triage status. Auto-rotating layouts. Full-screen mode for TV/monitor mounting. No authentication required for display screens.</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">9.4 Mobile App (Capacitor)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Native mobile application built with Capacitor for iOS and Android. Push notifications for appointments, lab results, and queue updates. Biometric authentication support. Local notification scheduling. Mobile-optimized interface for all modules. Offline-capable for critical features.</p>
          </div>
        </section>

        {/* 10. TECH */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">10. Technology Stack</h2>

          <div className="space-y-1">
            <h3 className="text-lg font-medium">10.1 Architecture</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Frontend built with React, TypeScript, and Tailwind CSS using Vite as the build tool. Backend powered by Supabase (PostgreSQL database, Edge Functions, Row-Level Security, real-time subscriptions). Authentication via Supabase Auth with email/password and magic links. File storage via Supabase Storage for documents, images, and attachments. AI features powered by Lovable AI Gateway. Mobile apps built with Capacitor. State management via TanStack React Query. UI components built on Radix UI primitives with shadcn/ui. Charts and analytics powered by Recharts. PDF generation with jsPDF. Barcode generation with JsBarcode.</p>
          </div>
        </section>

        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          Smart HMS by HealthOS 24 — All rights reserved.
        </footer>
      </div>
    </div>
  );
}

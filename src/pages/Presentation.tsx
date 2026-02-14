import { useState, useRef, useCallback } from "react";
import { FileDown, Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { TitleSlide } from "@/components/presentation/TitleSlide";
import { FeaturesOverviewSlide } from "@/components/presentation/FeaturesOverviewSlide";
import { ModuleSlide } from "@/components/presentation/ModuleSlide";
import { OTDashboardSlide } from "@/components/presentation/OTDashboardSlide";
import { WorkflowSlide } from "@/components/presentation/WorkflowSlide";
import { ProcurementSlide } from "@/components/presentation/ProcurementSlide";
import { WarehouseSlide } from "@/components/presentation/WarehouseSlide";
import { CaseStudiesSlide } from "@/components/presentation/CaseStudiesSlide";
import { LabNetworkSlide } from "@/components/presentation/LabNetworkSlide";
import { IntegrationSlide } from "@/components/presentation/IntegrationSlide";
import { ComplianceSlide } from "@/components/presentation/ComplianceSlide";
import { TimelineSlide } from "@/components/presentation/TimelineSlide";
import { CTASlide } from "@/components/presentation/CTASlide";
import {
  PatientRegistrationScreen,
  AppointmentScreen,
  DoctorDashboardScreen,
  LabScreen,
  PharmacyScreen,
  BillingScreen,
  ReportsScreen,
  POSScreen,
  HRScreen,
  AccountsScreen,
  NursingScreen,
  RadiologyScreen,
  InventoryScreen,
  IPDScreen,
  EmergencyScreen,
  OTScreen,
  BloodBankScreen,
  DoctorWalletScreen,
  DoctorCompensationScreen,
  ProcurementScreen,
} from "@/components/landing/ProductScreenshots";
import { Users, Calendar, Stethoscope, FlaskConical, Pill, Receipt, BarChart3, Store, UserCog, Calculator, HeartPulse, ScanLine, Warehouse, Hotel, Siren, Scissors, Droplet, Wallet, BadgePercent, Truck } from "lucide-react";

// Features data for slides
const features = [
  {
    id: 'patients',
    icon: Users,
    label: 'Patients',
    title: 'Complete Patient Lifecycle Management',
    description: 'Register patients in seconds with CNIC auto-fill and smart duplicate detection. Maintain complete medical history including allergies, chronic conditions, surgeries, and family medical linkages. QR codes enable instant check-in at reception. Store insurance details, upload documents securely, and track patient journey across all departments with unique MRN.',
    highlights: ['CNIC Auto-fill', 'QR Check-in', 'Medical History', 'Family Linkage', 'Document Uploads'],
    screenshot: PatientRegistrationScreen,
  },
  {
    id: 'appointments',
    icon: Calendar,
    label: 'Appointments',
    title: 'Smart Scheduling & Queue Management',
    description: 'Token-based queue system with real-time TV display boards showing current and upcoming tokens. Interactive calendar grid for scheduling follow-ups, managing walk-ins, and enabling online patient self-booking. Automated SMS/Email reminders reduce no-shows by 40%. Waitlist management automatically fills cancellation gaps and notifies waiting patients.',
    highlights: ['Token Queue', 'SMS Reminders', 'Online Booking', 'Calendar Grid', 'No-Show Analytics'],
    screenshot: AppointmentScreen,
  },
  {
    id: 'consultation',
    icon: Stethoscope,
    label: 'OPD',
    title: 'Complete OPD Workflow from Vitals to Checkout',
    description: 'Nurse stations record vitals with auto-calculated BMI, blood pressure trends, and growth charts for pediatrics. Doctors access complete patient history, allergies, and chronic conditions at a glance. Create e-prescriptions with real-time drug interaction alerts, order labs and imaging with one click, and generate professional visit summaries.',
    highlights: ['Nurse Vitals Station', 'Clinical Templates', 'Drug Interaction Alerts', 'Lab/Imaging Orders', 'Visit Tracking'],
    screenshot: DoctorDashboardScreen,
  },
  {
    id: 'emergency',
    icon: Siren,
    label: 'Emergency',
    title: 'Rapid Emergency & Casualty Care',
    description: 'Handle critical cases with speed and precision. Triage patients with 5-level severity scoring (Red/Orange/Yellow/Green/Blue) that auto-prioritizes the queue. Track trauma cases with injury body-map documentation and Glasgow Coma Scale. Receive ambulance alerts with pre-hospital data for advance preparation.',
    highlights: ['5-Level Triage', 'Trauma Tracking', 'Ambulance Alerts', 'Fast Admission', 'ICU/OT Handoff'],
    screenshot: EmergencyScreen,
  },
  {
    id: 'ot',
    icon: Scissors,
    label: 'OT',
    title: 'Comprehensive Surgical Workflow & Live Monitoring',
    description: 'Manage surgeries from scheduling to recovery with 7-tab clinical documentation: Safety Checklist (WHO guidelines), Digital Consent with signature capture, Pre-Op Medication management, Anesthesia records with real-time vitals monitoring, Surgical notes with procedure templates, Consumables tracking, and Post-Op Orders.',
    highlights: ['Live Surgery Dashboard', 'Digital Consent', 'Anesthesia Records', 'Consumable Tracking', 'PACU Management'],
    screenshot: OTScreen,
  },
  {
    id: 'ipd',
    icon: Hotel,
    label: 'IPD',
    title: 'Complete Inpatient & Discharge Billing',
    description: 'Manage the full inpatient journey from admission to discharge with financial transparency. Collect deposits upfront and allocate beds in real-time with visual ward maps. Track daily room charges automatically with configurable ward-wise rates. Consolidate pharmacy credits, lab orders, procedure charges, and service fees into running bills.',
    highlights: ['Deposit Management', 'Room Charge Sync', 'Running Bills', 'Pharmacy Credits', 'Discharge Invoice'],
    screenshot: IPDScreen,
  },
  {
    id: 'nursing',
    icon: HeartPulse,
    label: 'Nursing',
    title: 'Comprehensive Nursing & Ward Care',
    description: 'Empower nurses with digital tools for exceptional patient care. Monitor vitals in real-time with trend analysis and auto-alerts for abnormal values. Administer medications with eMAR barcode verification ensuring right patient, right drug, right dose, right route, right time (5 Rights). Document nursing notes per shift with structured templates.',
    highlights: ['Vitals Monitoring', 'eMAR Barcode', 'Shift Handover', 'Critical Alerts', 'Nursing Notes'],
    screenshot: NursingScreen,
  },
  {
    id: 'laboratory',
    icon: FlaskConical,
    label: 'Laboratory',
    title: 'End-to-End Lab Workflow',
    description: 'Order tests during consultations with pre-built panels (CBC, LFT, RFT, Lipid Profile, Thyroid). Track samples with barcodes from collection to result. Enter results using structured templates with auto-calculated derived values. Auto-flag abnormal values with age/gender-specific reference ranges highlighted in red/yellow.',
    highlights: ['Test Panels', 'Barcode Tracking', 'Result Templates', 'Abnormal Flags', 'Critical Alerts'],
    screenshot: LabScreen,
  },
  {
    id: 'radiology',
    icon: ScanLine,
    label: 'Radiology',
    title: 'Complete Diagnostic Imaging',
    description: 'Streamline radiology from order to report. Manage X-ray, ultrasound, CT, MRI, and special procedure requests from consultations with modality-specific worklists. Technicians capture images and upload to PACS-compatible archive with study-level organization. Radiologists use structured reporting templates with measurement tools.',
    highlights: ['Modality Worklists', 'PACS Storage', 'Structured Reports', 'STAT Alerts', 'Image Sharing'],
    screenshot: RadiologyScreen,
  },
  {
    id: 'bloodbank',
    icon: Droplet,
    label: 'Blood Bank',
    title: 'Complete Blood Bank Management',
    description: 'Manage donors with eligibility screening questionnaires, deferral tracking, and complete donation history. Track blood inventory by group (A/B/AB/O, Rh+/-) with real-time availability dashboard and expiry alerts. Perform cross-matching and compatibility tests with structured result entry.',
    highlights: ['Donor Management', 'Blood Inventory', 'Cross-Matching', 'Transfusion Tracking', 'Reaction Reporting'],
    screenshot: BloodBankScreen,
  },
  {
    id: 'pharmacy',
    icon: Pill,
    label: 'Pharmacy',
    title: 'Inventory, Dispensing & Drug Safety',
    description: 'Track medicine stock by batch number and expiry date with automated alerts 30/60/90 days before expiration. Dispense prescriptions with barcode scanning for accuracy and real-time drug interaction checks against patient allergies and current medications. Manage multiple suppliers with price comparison and order history.',
    highlights: ['Batch Tracking', 'Expiry Alerts', 'Drug Interactions', 'Supplier Management', 'Controlled Drugs'],
    screenshot: PharmacyScreen,
  },
  {
    id: 'pos',
    icon: Store,
    label: 'POS',
    title: 'Retail Point-of-Sale for Pharmacy',
    description: 'Fast barcode scanning checkout for walk-in customers with instant product lookup. Accept multiple payment methods: Cash, Card (Visa/Mastercard), JazzCash, EasyPaisa, and bank transfers. Automatic inventory deduction on every sale prevents overselling. Flexible discount options with tax calculations.',
    highlights: ['Barcode Scan', 'Multi-Payment', 'Live Inventory', 'Sales Analytics', 'Discount Management'],
    screenshot: POSScreen,
  },
  {
    id: 'billing',
    icon: Receipt,
    label: 'Billing',
    title: 'Flexible Invoicing & Collections',
    description: 'Generate service-based invoices for consultations, labs, imaging, procedures, and pharmacy with itemized breakdowns. Accept multiple payment methods with partial payment support and balance tracking. Submit insurance claims electronically with panel rates and authorization tracking.',
    highlights: ['Multi-Payment', 'Insurance Claims', 'Partial Payments', 'Credit Limits', 'Collection Reminders'],
    screenshot: BillingScreen,
  },
  {
    id: 'wallet',
    icon: Wallet,
    label: 'Doctor Wallet',
    title: 'Automated Clinician Earnings & Payouts',
    description: 'Automated earning calculations for every consultation, surgery, IPD visit, and procedure. Database triggers credit doctor wallets in real-time upon patient payment confirmation. Track OPD consultations at per-visit rates, IPD daily visit fees, surgical fees by procedure complexity, and anesthesia charges.',
    highlights: ['Auto-Credit Triggers', 'Real-Time Balance', 'Payroll Integration', 'Earning Reports', 'Bulk Settlement'],
    screenshot: DoctorWalletScreen,
  },
  {
    id: 'compensation',
    icon: BadgePercent,
    label: 'Compensation',
    title: 'Flexible Doctor Fee & Share Configuration',
    description: 'Configure complex compensation plans for clinicians with full flexibility. Set patient-facing consultation fees alongside doctor share percentages in a single view. Support multiple compensation models: fixed salary, per-consultation fee, revenue share percentage, or hybrid combinations.',
    highlights: ['Fee vs Share Split', 'Hybrid Plans', 'Surgery Fees', 'Anesthesia Rates', 'Auto-Sync Salary'],
    screenshot: DoctorCompensationScreen,
  },
  {
    id: 'accounts',
    icon: Calculator,
    label: 'Accounts',
    title: 'Full-Fledged Financial Management',
    description: 'Double-entry accounting designed for healthcare with automated real-time posting. Billing module auto-posts patient invoices and payment receipts. Pharmacy POS auto-posts daily sales and COGS. Inventory GRN verification auto-creates Accounts Payable entries.',
    highlights: ['Auto Journal Posting', 'Chart of Accounts', 'AR/AP Management', 'Financial Statements', 'Bank Reconciliation'],
    screenshot: AccountsScreen,
  },
  {
    id: 'procurement',
    icon: Truck,
    label: 'Procurement',
    title: 'End-to-End Procurement & Vendor Management',
    description: 'Complete supply chain from requisition to payment in one unified workflow. Create Purchase Orders for medicines and general supplies from a single interface with item-vendor mapping for best pricing. Track vendor performance with quality ratings and delivery timelines.',
    highlights: ['Unified PO', 'GRN Verification', 'Stock Routing', 'Vendor Payments', 'AP Integration'],
    screenshot: ProcurementScreen,
  },
  {
    id: 'inventory',
    icon: Warehouse,
    label: 'Inventory',
    title: 'Centralized Stock Control & Requisitions',
    description: 'Take control of your hospital supply chain with centralized inventory management. Maintain item master with categories, units, and reorder levels. Track stock movements across departments with full audit trail. Handle department stock requisitions with multi-level approval workflows. Manage multiple warehouse sub-stores (Medical, Surgical, Dental, Equipment) with patient entitlement-based dispensing.',
    highlights: ['Item Master', 'Stock Requisitions', 'Approval Workflows', 'Reorder Alerts', 'Multi-Warehouse', 'Patient Entitlement'],
    screenshot: InventoryScreen,
  },
  {
    id: 'reports',
    icon: BarChart3,
    label: 'Reports',
    title: 'Data-Driven Insights & Analytics',
    description: 'Track revenue trends, patient visit patterns, and department performance with interactive dashboards. Visualize data with charts, graphs, and heat maps. Build custom reports with drag-and-drop report builder selecting fields from any module. Export reports to Excel for external analysis.',
    highlights: ['Revenue Charts', 'Excel Export', 'Custom Reports', 'Department KPIs', 'Scheduled Delivery'],
    screenshot: ReportsScreen,
  },
  {
    id: 'hr',
    icon: UserCog,
    label: 'HR',
    title: 'Complete Workforce Management',
    description: 'Manage your healthcare workforce from recruitment to retirement with specialized clinician support. Maintain employee profiles with credentials, licenses, and specializations. Configure doctor compensation with fee/share percentages linked to wallet earnings. Auto-generate duty rosters.',
    highlights: ['Doctor Compensation', 'Wallet Payouts', 'Biometric Attendance', 'Loan Management', 'Payroll Processing'],
    screenshot: HRScreen,
  },
];

const TOTAL_SLIDES = 32;

const Presentation = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true);

    try {
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const container = printContainerRef.current;
      if (!container) return;

      const slideElements = container.querySelectorAll(".slide");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfWidth = 297;
      const pdfHeight = 210;

      for (let i = 0; i < slideElements.length; i++) {
        const el = slideElements[i] as HTMLElement;

        // Store original styles
        const origStyles = {
          width: el.style.width,
          height: el.style.height,
          minHeight: el.style.minHeight,
          maxWidth: el.style.maxWidth,
          overflow: el.style.overflow,
          margin: el.style.margin,
          borderRadius: el.style.borderRadius,
          border: el.style.border,
          boxShadow: el.style.boxShadow,
        };

        // Force fixed dimensions for capture
        const pixelWidth = 1123;
        const pixelHeight = 794;
        el.style.width = `${pixelWidth}px`;
        el.style.height = `${pixelHeight}px`;
        el.style.minHeight = `${pixelHeight}px`;
        el.style.maxWidth = `${pixelWidth}px`;
        el.style.overflow = 'hidden';
        el.style.margin = '0';
        el.style.borderRadius = '0';
        el.style.border = 'none';
        el.style.boxShadow = 'none';

        await new Promise((resolve) => setTimeout(resolve, 200));

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: pixelWidth,
          height: pixelHeight,
          windowWidth: pixelWidth,
          windowHeight: pixelHeight,
        });

        // Restore original styles
        Object.assign(el.style, origStyles);

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save("HealthOS24-Presentation.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .slide {
            width: 297mm;
            height: 210mm;
            page-break-after: always;
            padding: 15mm;
            box-sizing: border-box;
            overflow: hidden;
          }
          
          .slide:last-child {
            page-break-after: avoid;
          }
        }
        
        @media screen {
          .slide {
            width: 100%;
            max-width: 1200px;
            min-height: 675px;
            margin: 0 auto 2rem;
            padding: 2rem;
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
            background: hsl(var(--background));
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            position: relative;
          }
        }
      `}</style>

      {/* Toolbar (hidden in print) */}
      <div className="no-print sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">HealthOS Presentation</h1>
              <p className="text-xs text-muted-foreground">{TOTAL_SLIDES} slides • Enhanced Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions (hidden in print) */}
      <div className="no-print bg-muted/50 border-b border-border px-4 py-3">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            💡 Click <strong>"Download PDF"</strong> to save as a real PDF file, or <strong>"Print"</strong> to open your browser's print dialog.
          </p>
        </div>
      </div>

      {/* Slides Container */}
      <div className="bg-muted/30 min-h-screen">
        <div ref={printContainerRef} className="py-8 px-4">
          <TitleSlide />
          <FeaturesOverviewSlide />
          {features.map((feature, index) => (
            <ModuleSlide
              key={feature.id}
              feature={feature}
              slideNumber={index + 3}
              totalSlides={TOTAL_SLIDES}
            />
          ))}
          <OTDashboardSlide />
          <WorkflowSlide />
          <ProcurementSlide />
          <WarehouseSlide />
          <CaseStudiesSlide />
          <LabNetworkSlide />
          <IntegrationSlide />
          <ComplianceSlide />
          <TimelineSlide />
          <CTASlide />
        </div>
      </div>
    </>
  );
};

export default Presentation;

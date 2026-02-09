import { useState } from 'react';
import { Users, Calendar, Stethoscope, FlaskConical, Pill, Receipt, BarChart3, Store, UserCog, Calculator, HeartPulse, ScanLine, Warehouse, Hotel, Siren, Scissors, Droplet, Wallet, BadgePercent, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedSection } from './AnimatedSection';
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
} from './ProductScreenshots';

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
    description: 'Nurse stations record vitals with auto-calculated BMI, blood pressure trends, and growth charts for pediatrics. Doctors access complete patient history, allergies, and chronic conditions at a glance. Create e-prescriptions with real-time drug interaction alerts, order labs and imaging with one click, and generate professional visit summaries. Each visit tracked with unique Visit ID (OPD-YYYYMMDD-TOKEN) across all touchpoints for complete audit trail.',
    highlights: ['Nurse Vitals Station', 'Clinical Templates', 'Drug Interaction Alerts', 'Lab/Imaging Orders', 'Visit Tracking'],
    screenshot: DoctorDashboardScreen,
  },
  {
    id: 'emergency',
    icon: Siren,
    label: 'Emergency',
    title: 'Rapid Emergency & Casualty Care',
    description: 'Handle critical cases with speed and precision. Triage patients with 5-level severity scoring (Red/Orange/Yellow/Green/Blue) that auto-prioritizes the queue. Track trauma cases with injury body-map documentation and Glasgow Coma Scale. Receive ambulance alerts with pre-hospital data for advance preparation. Fast-track emergency admissions bypass regular workflows, and seamless ICU/OT handoffs include complete patient status and medication list.',
    highlights: ['5-Level Triage', 'Trauma Tracking', 'Ambulance Alerts', 'Fast Admission', 'ICU/OT Handoff'],
    screenshot: EmergencyScreen,
  },
  {
    id: 'ot',
    icon: Scissors,
    label: 'OT',
    title: 'Comprehensive Surgical Workflow & Live Monitoring',
    description: 'Manage surgeries from scheduling to recovery with 7-tab clinical documentation: Safety Checklist (WHO guidelines), Digital Consent with signature capture, Pre-Op Medication management, Anesthesia records with real-time vitals monitoring, Surgical notes with procedure templates, Consumables and instrument count tracking, and Post-Op Orders. Live Surgery Dashboard provides synchronized timers and role-specific views for Surgeons (notes), Anesthetists (vitals), and OT Nurses (counts). PACU management tracks recovery scores for safe discharge.',
    highlights: ['Live Surgery Dashboard', 'Digital Consent', 'Anesthesia Records', 'Consumable Tracking', 'PACU Management'],
    screenshot: OTScreen,
  },
  {
    id: 'ipd',
    icon: Hotel,
    label: 'IPD',
    title: 'Complete Inpatient & Discharge Billing',
    description: 'Manage the full inpatient journey from admission to discharge with financial transparency. Collect deposits upfront and allocate beds in real-time with visual ward maps. Track daily room charges automatically with configurable ward-wise rates. Consolidate pharmacy credits, lab orders, procedure charges, and service fees into running bills visible to patients and staff. One-click discharge generates comprehensive summaries with itemized invoices. Balance calculation automatically accounts for deposits, partial payments, and insurance settlements.',
    highlights: ['Deposit Management', 'Room Charge Sync', 'Running Bills', 'Pharmacy Credits', 'Discharge Invoice'],
    screenshot: IPDScreen,
  },
  {
    id: 'nursing',
    icon: HeartPulse,
    label: 'Nursing',
    title: 'Comprehensive Nursing & Ward Care',
    description: 'Empower nurses with digital tools for exceptional patient care. Monitor vitals in real-time with trend analysis and auto-alerts for abnormal values. Administer medications with eMAR barcode verification ensuring right patient, right drug, right dose, right route, right time (5 Rights). Document nursing notes per shift with structured templates. Manage bed allocations with visual ward maps, and receive critical alerts for patient safety. Shift handover reports ensure continuity of care.',
    highlights: ['Vitals Monitoring', 'eMAR Barcode', 'Shift Handover', 'Critical Alerts', 'Nursing Notes'],
    screenshot: NursingScreen,
  },
  {
    id: 'laboratory',
    icon: FlaskConical,
    label: 'Laboratory',
    title: 'End-to-End Lab Workflow',
    description: 'Order tests during consultations with pre-built panels (CBC, LFT, RFT, Lipid Profile, Thyroid). Track samples with barcodes from collection to result. Enter results using structured templates with auto-calculated derived values. Auto-flag abnormal values with age/gender-specific reference ranges highlighted in red/yellow. Generate professional reports with hospital letterhead. Critical value alerts ensure urgent cases are prioritized and physicians are notified immediately.',
    highlights: ['Test Panels', 'Barcode Tracking', 'Result Templates', 'Abnormal Flags', 'Critical Alerts'],
    screenshot: LabScreen,
  },
  {
    id: 'radiology',
    icon: ScanLine,
    label: 'Radiology',
    title: 'Complete Diagnostic Imaging',
    description: 'Streamline radiology from order to report. Manage X-ray, ultrasound, CT, MRI, and special procedure requests from consultations with modality-specific worklists. Technicians capture images and upload to PACS-compatible archive with study-level organization. Radiologists use structured reporting templates with measurement tools and comparison to prior studies. Alert physicians instantly for critical findings like pneumothorax or stroke. Share images securely with patients and referring doctors.',
    highlights: ['Modality Worklists', 'PACS Storage', 'Structured Reports', 'STAT Alerts', 'Image Sharing'],
    screenshot: RadiologyScreen,
  },
  {
    id: 'bloodbank',
    icon: Droplet,
    label: 'Blood Bank',
    title: 'Complete Blood Bank Management',
    description: 'Manage donors with eligibility screening questionnaires, deferral tracking, and complete donation history. Track blood inventory by group (A/B/AB/O, Rh+/-) with real-time availability dashboard and expiry alerts. Perform cross-matching and compatibility tests with structured result entry. Monitor transfusions with pre-transfusion patient vitals and post-transfusion reaction surveillance. Document any adverse reactions for safety reporting and regulatory compliance.',
    highlights: ['Donor Management', 'Blood Inventory', 'Cross-Matching', 'Transfusion Tracking', 'Reaction Reporting'],
    screenshot: BloodBankScreen,
  },
  {
    id: 'pharmacy',
    icon: Pill,
    label: 'Pharmacy',
    title: 'Inventory, Dispensing & Drug Safety',
    description: 'Track medicine stock by batch number and expiry date with automated alerts 30/60/90 days before expiration. Dispense prescriptions with barcode scanning for accuracy and real-time drug interaction checks against patient allergies and current medications. Manage multiple suppliers with price comparison and order history. Handle returns with proper documentation and controlled substance logs for regulatory compliance. Automatic reorder point alerts prevent stockouts.',
    highlights: ['Batch Tracking', 'Expiry Alerts', 'Drug Interactions', 'Supplier Management', 'Controlled Drugs'],
    screenshot: PharmacyScreen,
  },
  {
    id: 'pos',
    icon: Store,
    label: 'POS',
    title: 'Retail Point-of-Sale for Pharmacy',
    description: 'Fast barcode scanning checkout for walk-in customers with instant product lookup. Accept multiple payment methods: Cash, Card (Visa/Mastercard), JazzCash, EasyPaisa, and bank transfers. Automatic inventory deduction on every sale prevents overselling. Flexible discount options (percentage, fixed amount, or promotional codes) with tax calculations. Daily sales analytics with top-selling products, hourly trends, and cashier performance. Low stock alerts trigger automatic reorder suggestions.',
    highlights: ['Barcode Scan', 'Multi-Payment', 'Live Inventory', 'Sales Analytics', 'Discount Management'],
    screenshot: POSScreen,
  },
  {
    id: 'billing',
    icon: Receipt,
    label: 'Billing',
    title: 'Flexible Invoicing & Collections',
    description: 'Generate service-based invoices for consultations, labs, imaging, procedures, and pharmacy with itemized breakdowns. Accept multiple payment methods with partial payment support and balance tracking. Submit insurance claims electronically with panel rates and authorization tracking. Manage patient credit limits for corporate clients and VIP patients. Track outstanding balances with aging reports (30/60/90 days) and send automated collection reminders via SMS. Integrate with Accounts Receivable for real-time financial visibility.',
    highlights: ['Multi-Payment', 'Insurance Claims', 'Partial Payments', 'Credit Limits', 'Collection Reminders'],
    screenshot: BillingScreen,
  },
  {
    id: 'wallet',
    icon: Wallet,
    label: 'Doctor Wallet',
    title: 'Automated Clinician Earnings & Payouts',
    description: 'Automated earning calculations for every consultation, surgery, IPD visit, and procedure. Database triggers credit doctor wallets in real-time upon patient payment confirmation. Track OPD consultations at per-visit rates, IPD daily visit fees, surgical fees by procedure complexity, and anesthesia charges. View detailed earning history with patient names, procedures, and commission percentages. Seamlessly integrate with monthly payroll for bulk settlements or request on-demand payouts. Export earning reports for tax purposes.',
    highlights: ['Auto-Credit Triggers', 'Real-Time Balance', 'Payroll Integration', 'Earning Reports', 'Bulk Settlement'],
    screenshot: DoctorWalletScreen,
  },
  {
    id: 'compensation',
    icon: BadgePercent,
    label: 'Compensation',
    title: 'Flexible Doctor Fee & Share Configuration',
    description: 'Configure complex compensation plans for clinicians with full flexibility. Set patient-facing consultation fees alongside doctor share percentages in a single view. Support multiple compensation models: fixed salary, per-consultation fee, revenue share percentage, or hybrid combinations. Configure different rates for OPD consultations, IPD visits, surgeries, and anesthesia services. Auto-sync doctor compensation with HR salary tables for unified payroll. Real-time earnings calculator shows doctors their exact take-home amount before every transaction.',
    highlights: ['Fee vs Share Split', 'Hybrid Plans', 'Surgery Fees', 'Anesthesia Rates', 'Auto-Sync Salary'],
    screenshot: DoctorCompensationScreen,
  },
  {
    id: 'accounts',
    icon: Calculator,
    label: 'Accounts',
    title: 'Full-Fledged Financial Management',
    description: 'Double-entry accounting designed for healthcare with automated real-time posting. Billing module auto-posts patient invoices and payment receipts. Pharmacy POS auto-posts daily sales and COGS. Inventory GRN verification auto-creates Accounts Payable entries. Manage comprehensive Chart of Accounts with Assets, Liabilities, Equity, Revenue, and Expenses categories. Track Accounts Receivable from patients and insurers, and Accounts Payable to vendors. Reconcile bank accounts, generate financial statements (P&L, Balance Sheet, Cash Flow), and ensure GST/tax compliance with automated calculations.',
    highlights: ['Auto Journal Posting', 'Chart of Accounts', 'AR/AP Management', 'Financial Statements', 'Bank Reconciliation'],
    screenshot: AccountsScreen,
  },
  {
    id: 'procurement',
    icon: Truck,
    label: 'Procurement',
    title: 'End-to-End Procurement & Vendor Management',
    description: 'Complete supply chain from requisition to payment in one unified workflow. Create Purchase Orders for medicines and general supplies from a single interface with item-vendor mapping for best pricing. Track vendor performance with quality ratings and delivery timelines. Receive goods with GRN verification matching quantities against PO and checking batch/expiry details. Verified GRNs automatically route items to appropriate stock tables (pharmacy or general inventory) and create Accounts Payable entries. Close the loop through Vendor Payments with full ledger reconciliation.',
    highlights: ['Unified PO', 'GRN Verification', 'Stock Routing', 'Vendor Payments', 'AP Integration'],
    screenshot: ProcurementScreen,
  },
  {
    id: 'inventory',
    icon: Warehouse,
    label: 'Inventory',
    title: 'Centralized Stock Control & Requisitions',
    description: 'Take control of your hospital supply chain with centralized inventory management. Maintain item master with categories, units, and reorder levels. Track stock movements across departments with full audit trail. Handle department stock requisitions with multi-level approval workflows. Monitor consumption patterns and identify slow-moving items. Receive goods with verification against purchase orders. Maintain optimal inventory levels with automated reorder alerts when stock falls below minimum threshold. Track expiry dates for perishable supplies.',
    highlights: ['Item Master', 'Stock Requisitions', 'Approval Workflows', 'Reorder Alerts', 'Expiry Tracking'],
    screenshot: InventoryScreen,
  },
  {
    id: 'reports',
    icon: BarChart3,
    label: 'Reports',
    title: 'Data-Driven Insights & Analytics',
    description: 'Track revenue trends, patient visit patterns, and department performance with interactive dashboards. Visualize data with charts, graphs, and heat maps. Build custom reports with drag-and-drop report builder selecting fields from any module. Export reports to Excel for external analysis and board presentations. Monitor key performance indicators (KPIs) like average revenue per patient, bed occupancy rate, and doctor productivity. Schedule automated report delivery to stakeholders via email.',
    highlights: ['Revenue Charts', 'Excel Export', 'Custom Reports', 'Department KPIs', 'Scheduled Delivery'],
    screenshot: ReportsScreen,
  },
  {
    id: 'hr',
    icon: UserCog,
    label: 'HR',
    title: 'Complete Workforce Management',
    description: 'Manage your healthcare workforce from recruitment to retirement with specialized clinician support. Maintain employee profiles with credentials, licenses, and specializations. Configure doctor compensation with fee/share percentages linked to wallet earnings. Auto-generate duty rosters considering shift patterns, leave requests, and staff preferences. Track attendance with biometric device integration and geo-fencing for field staff. Process leave approvals with balance tracking and coverage verification. Run payroll with automatic inclusion of doctor wallet earnings, overtime calculations, tax deductions, and loan EMI recovery.',
    highlights: ['Doctor Compensation', 'Wallet Payouts', 'Biometric Attendance', 'Loan Management', 'Payroll Processing'],
    screenshot: HRScreen,
  },
];

export const FeaturesTabs = () => {
  const [activeTab, setActiveTab] = useState('patients');

  const activeFeature = features.find((f) => f.id === activeTab)!;
  const ScreenshotComponent = activeFeature.screenshot;

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            All-in-One Platform
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Run Your Hospital
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            20 integrated modules working together seamlessly. Click to explore each feature in detail.
          </p>
        </AnimatedSection>

        {/* Tab buttons - horizontal scroll on mobile */}
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="relative">
            {/* Fade indicators for mobile */}
            <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-muted/50 to-transparent z-10 pointer-events-none md:hidden" />
            <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-muted/50 to-transparent z-10 pointer-events-none md:hidden" />
            
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:flex-wrap md:justify-center md:overflow-visible px-2 md:px-0">
              {features.map((feature) => {
                const Icon = feature.icon;
                const isActive = activeTab === feature.id;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveTab(feature.id)}
                    className={cn(
                      'snap-start flex-shrink-0 flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                        : 'bg-card border hover:bg-accent hover:scale-105'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{feature.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* Content area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Screenshot - show first on mobile */}
          <AnimatedSection animation="fade-left" delay={300} key={activeTab + '-screen'} className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl opacity-50" />
              <div className="relative max-w-md mx-auto lg:max-w-none">
                <ScreenshotComponent />
              </div>
            </div>
          </AnimatedSection>

          {/* Description */}
          <AnimatedSection animation="fade-right" delay={200} key={activeTab + '-text'} className="order-2 lg:order-1">
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">{activeFeature.title}</h3>
              {/* Shorter description on mobile */}
              <p className="text-sm md:text-lg text-muted-foreground line-clamp-4 md:line-clamp-none">
                {activeFeature.description}
              </p>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {activeFeature.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="px-2 md:px-3 py-1 md:py-1.5 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-medium"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

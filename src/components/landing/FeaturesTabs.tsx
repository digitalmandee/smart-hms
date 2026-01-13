import { useState } from 'react';
import { Users, Calendar, Stethoscope, FlaskConical, Pill, Receipt, BarChart3, Store, UserCog, Calculator, HeartPulse, ScanLine, Warehouse, Hotel } from 'lucide-react';
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
} from './ProductScreenshots';

const features = [
  {
    id: 'patients',
    icon: Users,
    label: 'Patients',
    title: 'Complete Patient Lifecycle Management',
    description: 'Register patients in seconds with CNIC auto-fill. Maintain complete medical history, allergies, chronic conditions, and family linkages. QR codes enable instant check-in at reception. Store insurance details and upload documents securely.',
    highlights: ['CNIC Auto-fill', 'QR Check-in', 'Medical History', 'Family Linkage', 'Document Uploads'],
    screenshot: PatientRegistrationScreen,
  },
  {
    id: 'appointments',
    icon: Calendar,
    label: 'Appointments',
    title: 'Smart Scheduling & Queue Management',
    description: 'Token-based queue system with real-time display boards. Schedule follow-ups, manage walk-ins, and enable online patient self-booking. Automated SMS/Email reminders reduce no-shows. Waitlist management fills cancellation gaps automatically.',
    highlights: ['Token Queue', 'SMS Reminders', 'Online Booking', 'Waitlist', 'No-Show Analytics'],
    screenshot: AppointmentScreen,
  },
  {
    id: 'consultation',
    icon: Stethoscope,
    label: 'Consultation',
    title: 'Streamlined Clinical Documentation',
    description: 'Document vitals with auto-calculated BMI, record symptoms and diagnosis using clinical templates, create e-prescriptions with drug interaction alerts, and order labs/imaging - all in one seamless workflow. Auto-generated visit summaries for patients.',
    highlights: ['Vitals & BMI', 'E-Prescription', 'Drug Alerts', 'Lab Orders', 'Clinical Templates'],
    screenshot: DoctorDashboardScreen,
  },
  {
    id: 'ipd',
    icon: Hotel,
    label: 'IPD',
    title: 'Complete Inpatient Management',
    description: 'Manage the full inpatient journey from admission to discharge. Allocate beds in real-time, track daily doctor rounds with orders, monitor patient movements between departments, generate running bills with room charges, and streamline discharge with comprehensive summaries.',
    highlights: ['Admission', 'Bed Management', 'Daily Rounds', 'Running Bills', 'Discharge'],
    screenshot: IPDScreen,
  },
  {
    id: 'nursing',
    icon: HeartPulse,
    label: 'Nursing',
    title: 'Comprehensive Nursing & Ward Care',
    description: 'Empower nurses with digital tools for exceptional patient care. Monitor vitals in real-time with trend analysis, administer medications with eMAR barcode verification, document nursing notes per shift, manage bed allocations, and receive critical alerts for patient safety.',
    highlights: ['Vitals Monitoring', 'eMAR', 'Ward Management', 'Shift Handover', 'Critical Alerts'],
    screenshot: NursingScreen,
  },
  {
    id: 'laboratory',
    icon: FlaskConical,
    label: 'Laboratory',
    title: 'End-to-End Lab Workflow',
    description: 'Order tests during consultations with pre-built panels (CBC, LFT, RFT). Track samples with barcodes, enter results using structured templates, auto-flag abnormal values with reference ranges, and generate professional reports. Critical value alerts ensure urgent cases are prioritized.',
    highlights: ['Test Panels', 'Barcode Tracking', 'Result Templates', 'Abnormal Flags', 'Critical Alerts'],
    screenshot: LabScreen,
  },
  {
    id: 'radiology',
    icon: ScanLine,
    label: 'Radiology',
    title: 'Complete Diagnostic Imaging',
    description: 'Streamline radiology from order to report. Manage X-ray, ultrasound, CT, and MRI requests from consultations. Store images in PACS-compatible archive, enable structured radiologist reporting with templates, and alert physicians instantly for critical findings.',
    highlights: ['Imaging Orders', 'PACS Storage', 'Radiologist Reports', 'STAT Alerts', 'Image Sharing'],
    screenshot: RadiologyScreen,
  },
  {
    id: 'pharmacy',
    icon: Pill,
    label: 'Pharmacy',
    title: 'Inventory, Dispensing & Drug Safety',
    description: 'Track medicine stock by batch and expiry with automated alerts. Dispense prescriptions with barcode scanning and drug interaction checks. Manage suppliers, handle returns, and maintain controlled substance logs for compliance.',
    highlights: ['Batch Tracking', 'Expiry Alerts', 'Drug Interactions', 'Supplier Management', 'Controlled Drugs'],
    screenshot: PharmacyScreen,
  },
  {
    id: 'pos',
    icon: Store,
    label: 'POS',
    title: 'Retail Point-of-Sale for Pharmacy',
    description: 'Fast barcode scanning checkout for walk-in customers. Accept Cash, Card, JazzCash, EasyPaisa payments. Automatic inventory deduction on every sale, flexible discounts, tax calculations, and daily sales analytics with top-selling products.',
    highlights: ['Barcode Scan', 'Multi-Payment', 'Live Inventory', 'Sales Analytics', 'Low Stock Alerts'],
    screenshot: POSScreen,
  },
  {
    id: 'billing',
    icon: Receipt,
    label: 'Billing',
    title: 'Flexible Invoicing & Collections',
    description: 'Generate service-based invoices for consultations, labs, and pharmacy. Accept multiple payment methods with partial payment support. Submit insurance claims, manage patient credit limits, track outstanding balances, and send automated collection reminders.',
    highlights: ['Multi-Payment', 'Insurance Claims', 'Partial Payments', 'Credit Limits', 'Collection Reminders'],
    screenshot: BillingScreen,
  },
  {
    id: 'accounts',
    icon: Calculator,
    label: 'Accounts',
    title: 'Full-Fledged Financial Management',
    description: 'Double-entry accounting designed for healthcare. Manage general ledger with chart of accounts, track receivables and payables, reconcile bank accounts, generate financial statements (P&L, Balance Sheet, Cash Flow), and ensure GST/tax compliance.',
    highlights: ['General Ledger', 'Bank Reconciliation', 'Financial Statements', 'Tax Compliance', 'Budget Tracking'],
    screenshot: AccountsScreen,
  },
  {
    id: 'inventory',
    icon: Warehouse,
    label: 'Inventory',
    title: 'Centralized Procurement & Stock Control',
    description: 'Take control of your hospital supply chain. Create and track purchase orders, manage vendor relationships with performance ratings, handle department stock requisitions with approvals, receive goods with verification, and maintain optimal inventory levels with reorder alerts.',
    highlights: ['Purchase Orders', 'Vendor Management', 'Stock Requisitions', 'Goods Receipt', 'Reorder Alerts'],
    screenshot: InventoryScreen,
  },
  {
    id: 'reports',
    icon: BarChart3,
    label: 'Reports',
    title: 'Data-Driven Insights & Analytics',
    description: 'Track revenue trends, patient visit patterns, and department performance. Visualize data with charts and graphs. Export reports to Excel for external analysis. Make informed decisions with real-time dashboards.',
    highlights: ['Revenue Charts', 'Excel Export', 'Trend Analysis', 'Department KPIs', 'Custom Reports'],
    screenshot: ReportsScreen,
  },
  {
    id: 'hr',
    icon: UserCog,
    label: 'HR',
    title: 'Complete Workforce Management',
    description: 'Manage your healthcare workforce from recruitment to retirement. Maintain employee profiles with credentials, auto-generate duty rosters, track attendance with biometric integration, process leave approvals, run payroll with tax calculations, and conduct performance reviews.',
    highlights: ['Duty Rosters', 'Biometric Attendance', 'Leave Approval', 'Payroll', 'Performance Reviews'],
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
            14 integrated modules working together seamlessly. Click to explore each feature in detail.
          </p>
        </AnimatedSection>

        {/* Tab buttons */}
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeTab === feature.id;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-card border hover:bg-accent hover:scale-105'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {feature.label}
                </button>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Content area */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Description */}
          <AnimatedSection animation="fade-right" delay={200} key={activeTab + '-text'}>
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">{activeFeature.title}</h3>
              <p className="text-lg text-muted-foreground">{activeFeature.description}</p>
              <div className="flex flex-wrap gap-2">
                {activeFeature.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Right: Screenshot */}
          <AnimatedSection animation="fade-left" delay={300} key={activeTab + '-screen'}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl opacity-50" />
              <div className="relative">
                <ScreenshotComponent />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

import { useState } from 'react';
import { Users, Calendar, Stethoscope, FlaskConical, Pill, Receipt, BarChart3, Store, UserCog, Calculator, HeartPulse, ScanLine } from 'lucide-react';
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
} from './ProductScreenshots';

const features = [
  {
    id: 'patients',
    icon: Users,
    label: 'Patients',
    title: 'Smart Patient Management',
    description: 'Register patients in seconds with CNIC lookup. Complete medical history, QR codes for quick check-in, and family linkage.',
    highlights: ['CNIC Auto-fill', 'QR Check-in', 'Medical History'],
    screenshot: PatientRegistrationScreen,
  },
  {
    id: 'appointments',
    icon: Calendar,
    label: 'Appointments',
    title: 'Effortless Scheduling',
    description: 'Smart queue management with token system. Schedule follow-ups, manage walk-ins, and send SMS reminders automatically.',
    highlights: ['Token Queue', 'SMS Reminders', 'Walk-in Support'],
    screenshot: AppointmentScreen,
  },
  {
    id: 'consultation',
    icon: Stethoscope,
    label: 'Consultation',
    title: 'Clinical Documentation',
    description: 'Document symptoms, vitals, diagnosis, and prescriptions in one flow. Access patient history instantly during consultations.',
    highlights: ['Vitals Tracking', 'E-Prescription', 'History Access'],
    screenshot: DoctorDashboardScreen,
  },
  {
    id: 'nursing',
    icon: HeartPulse,
    label: 'Nursing',
    title: 'Complete Nursing Care',
    description: 'Empower nurses with digital tools for patient care. Monitor vitals in real-time, administer medications with barcode verification, document care notes, and manage ward operations efficiently.',
    highlights: ['Vitals Monitoring', 'eMAR', 'Ward Management'],
    screenshot: NursingScreen,
  },
  {
    id: 'laboratory',
    icon: FlaskConical,
    label: 'Laboratory',
    title: 'Complete Lab Workflow',
    description: 'Order tests during consultations, track samples, enter results with templates, and generate professional reports with reference ranges and abnormal value highlighting.',
    highlights: ['Test Ordering', 'Sample Tracking', 'Result Entry'],
    screenshot: LabScreen,
  },
  {
    id: 'radiology',
    icon: ScanLine,
    label: 'Radiology',
    title: 'Diagnostic Imaging Workflow',
    description: 'Streamline radiology operations from order to report. Manage X-ray, ultrasound, and CT scan requests, store images digitally, and enable radiologists to create structured reports with critical finding alerts.',
    highlights: ['Imaging Orders', 'PACS Storage', 'Radiologist Reports'],
    screenshot: RadiologyScreen,
  },
  {
    id: 'pharmacy',
    icon: Pill,
    label: 'Pharmacy',
    title: 'Inventory & Dispensing',
    description: 'Track medicine stock by batch and expiry. Dispense prescriptions with barcode scanning. Get low stock alerts.',
    highlights: ['Batch Tracking', 'Expiry Alerts', 'Barcode Scan'],
    screenshot: PharmacyScreen,
  },
  {
    id: 'pos',
    icon: Store,
    label: 'POS',
    title: 'POS with Inventory Tracking',
    description: 'Complete retail solution for pharmacy walk-in sales. Fast barcode scanning, multiple payment options, automatic inventory deduction, real-time stock tracking, and detailed sales analytics.',
    highlights: ['Barcode Scan', 'Live Inventory', 'Sales Analytics'],
    screenshot: POSScreen,
  },
  {
    id: 'billing',
    icon: Receipt,
    label: 'Billing',
    title: 'Flexible Payments',
    description: 'Generate invoices instantly. Accept Cash, JazzCash, EasyPaisa, or Cards. Track outstanding balances and print receipts.',
    highlights: ['Multi-Payment', 'Auto Invoice', 'Balance Tracking'],
    screenshot: BillingScreen,
  },
  {
    id: 'accounts',
    icon: Calculator,
    label: 'Accounts',
    title: 'Complete Financial Management',
    description: 'Full-fledged accounting for hospitals. Manage ledgers, track receivables and payables, reconcile bank accounts, generate financial statements, and ensure tax compliance.',
    highlights: ['General Ledger', 'Financial Reports', 'Tax Compliance'],
    screenshot: AccountsScreen,
  },
  {
    id: 'reports',
    icon: BarChart3,
    label: 'Reports',
    title: 'Actionable Insights',
    description: 'Track revenue, patient visits, and popular services. Export reports to Excel. Make data-driven decisions.',
    highlights: ['Revenue Charts', 'Excel Export', 'Trend Analysis'],
    screenshot: ReportsScreen,
  },
  {
    id: 'hr',
    icon: UserCog,
    label: 'HR',
    title: 'Complete Workforce Management',
    description: 'From recruitment to retirement - manage your entire healthcare workforce. Handle employee profiles, shift scheduling, attendance tracking, leave approvals, payroll processing, and performance reviews.',
    highlights: ['Shift Scheduling', 'Payroll', 'Leave Management', 'Performance Reviews'],
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
            Everything You Need to Run Your Clinic
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Six integrated modules working together seamlessly. Click to explore each feature.
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

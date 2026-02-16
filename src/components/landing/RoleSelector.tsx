import { useState } from 'react';
import { Stethoscope, UserCheck, Pill, Shield, Users, Receipt, FlaskConical, UserCog, Calculator, HeartPulse, ScanLine, Warehouse } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedSection } from './AnimatedSection';

const roles = [
  {
    id: 'doctor',
    icon: Stethoscope,
    title: 'Doctor',
    color: 'from-primary to-primary/80',
    tasks: [
      'View patient queue with chief complaints and medical alerts',
      'Access complete medical history, allergies, and past visits',
      'Document symptoms, vitals, diagnosis with clinical templates',
      'Create e-prescriptions with drug interaction warnings',
      'Order lab tests and imaging studies directly',
      'Schedule follow-up appointments with reminders',
    ],
    stats: { saved: '2 hours/day', patients: '40+ patients' },
  },
  {
    id: 'nurse',
    icon: HeartPulse,
    title: 'Nurse',
    color: 'from-rose-500 to-rose-600',
    tasks: [
      'Monitor patient vitals with real-time trend analysis',
      'Administer medications with eMAR barcode verification',
      'Document nursing notes and care observations per shift',
      'Manage bed allocations, occupancy, and patient transfers',
      'Generate digital shift handover with critical alerts',
      'Receive immediate notifications for vital abnormalities',
    ],
    stats: { errors: '95% fewer med errors', time: '2x faster docs' },
  },
  {
    id: 'receptionist',
    icon: UserCheck,
    title: 'Receptionist',
    color: 'from-blue-500 to-blue-600',
    tasks: [
      'Register new patients in seconds with CNIC auto-fill',
      'Generate tokens for walk-ins and scheduled visits',
      'Schedule, reschedule, and manage appointments',
      'Check-in patients instantly with QR code scan',
      'Collect payments and print professional receipts',
      'View waitlist and manage cancellation slots',
    ],
    stats: { saved: '3 hours/day', registrations: '100+ patients' },
  },
  {
    id: 'pharmacist',
    icon: Pill,
    title: 'Pharmacist',
    color: 'from-pink-500 to-pink-600',
    tasks: [
      'View prescription queue in real-time with priorities',
      'Check medicine availability by batch and expiry date',
      'Dispense with barcode scanning and verification',
      'Get drug interaction and patient allergy alerts',
      'Auto-deduct inventory on dispensing or POS sale',
      'Track controlled substances with documentation',
    ],
    stats: { saved: '90% fewer errors', speed: '2x faster' },
  },
  {
    id: 'lab_tech',
    icon: FlaskConical,
    title: 'Lab Technician',
    color: 'from-violet-500 to-violet-600',
    tasks: [
      'View pending lab orders queue with priorities',
      'Collect samples with barcode tracking',
      'Enter test results using structured templates',
      'Flag abnormal and critical values automatically',
      'Generate professional reports with reference ranges',
      'Send critical alerts to ordering physicians',
    ],
    stats: { accuracy: '99.9%', speed: '3x faster' },
  },
  {
    id: 'radiologist',
    icon: ScanLine,
    title: 'Radiologist',
    color: 'from-cyan-500 to-cyan-600',
    tasks: [
      'Review imaging worklist with STAT priorities',
      'View and analyze diagnostic images in PACS viewer',
      'Create structured reports using reporting templates',
      'Flag critical findings for immediate physician action',
      'Share images securely with referring doctors',
      'Track turnaround time and productivity metrics',
    ],
    stats: { turnaround: '50% faster reports', accuracy: 'Zero lost images' },
  },
  {
    id: 'accountant',
    icon: Calculator,
    title: 'Accountant',
    color: 'from-emerald-500 to-emerald-600',
    tasks: [
      'Record journal entries and manage general ledger',
      'Track accounts receivable with aging analysis',
      'Process vendor payments and manage payables',
      'Reconcile bank statements across multiple accounts',
      'Generate P&L, Balance Sheet, Cash Flow statements',
      'Prepare GST/tax returns and compliance reports',
    ],
    stats: { accuracy: '100% audit-ready', reports: 'Real-time' },
  },
  {
    id: 'store_manager',
    icon: Warehouse,
    title: 'Store Manager',
    color: 'from-amber-500 to-amber-600',
    tasks: [
      'Manage central store inventory and stock levels',
      'Create and process purchase orders with vendors',
      'Approve department stock requisitions',
      'Track vendor deliveries and verify goods receipt',
      'Monitor reorder points and prevent stockouts',
      'Generate procurement spending and analysis reports',
    ],
    stats: { savings: '20% cost reduction', stockouts: '95% fewer' },
  },
  {
    id: 'hr_manager',
    icon: UserCog,
    title: 'HR Manager',
    color: 'from-indigo-500 to-indigo-600',
    tasks: [
      'Manage employee profiles, credentials, and documents',
      'Create and publish duty rosters and shift schedules',
      'Track attendance with biometric integration',
      'Process leave requests with multi-level approval',
      'Run monthly payroll with tax calculations',
      'Conduct performance reviews and appraisals',
    ],
    stats: { saved: '5 hours/week', accuracy: '99% payroll' },
  },
  {
    id: 'admin',
    icon: Shield,
    title: 'Admin',
    color: 'from-purple-500 to-purple-600',
    tasks: [
      'View organization-wide revenue and patient analytics',
      'Manage staff accounts, roles, and permissions',
      'Configure clinic/hospital settings and preferences',
      'Monitor outstanding payments and collections',
      'Generate and export comprehensive reports to Excel',
      'Audit user activity and access logs',
    ],
    stats: { visibility: '100% oversight', reports: 'Real-time' },
  },
];

export const RoleSelector = () => {
  const [activeRole, setActiveRole] = useState('doctor');

  const currentRole = roles.find((r) => r.id === activeRole)!;
  const Icon = currentRole.icon;

  return (
    <section id="roles" className="py-20 bg-muted/30">
      <div className="container mx-auto">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Role-Based Access
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tailored for Every Team Member
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            10 specialized roles with customizable permissions. Each user sees exactly what they need - no clutter, no confusion, just productivity.
          </p>
        </AnimatedSection>

        {/* Role buttons - horizontal scroll on mobile */}
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="relative">
            {/* Fade indicators for mobile */}
            <div className="absolute left-0 top-0 bottom-4 w-6 bg-gradient-to-r from-muted/50 to-transparent z-10 pointer-events-none md:hidden" />
            <div className="absolute right-0 top-0 bottom-4 w-6 bg-gradient-to-l from-muted/50 to-transparent z-10 pointer-events-none md:hidden" />
            
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:flex-wrap md:justify-center md:overflow-visible px-2 md:px-0 mb-6 md:mb-10">
              {roles.map((role) => {
                const RoleIcon = role.icon;
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    className={cn(
                      'snap-start flex-shrink-0 flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all duration-300',
                      isActive
                        ? `bg-gradient-to-r ${role.color} text-white shadow-lg scale-105`
                        : 'bg-card border hover:bg-accent'
                    )}
                  >
                    <RoleIcon className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="whitespace-nowrap">{role.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* Role details */}
        <AnimatedSection animation="scale-in" delay={200} key={activeRole}>
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl border shadow-soft-lg overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${currentRole.color} p-6 text-white`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{currentRole.title} Dashboard</h3>
                    <p className="text-white/80">What a {currentRole.title.toLowerCase()} can do</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Tasks */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Key Capabilities
                    </h4>
                    <ul className="space-y-3">
                      {currentRole.tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-primary text-xs font-bold">{i + 1}</span>
                          </div>
                          <span className="text-muted-foreground">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Stats */}
                  <div className="space-y-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-primary" />
                      Impact
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(currentRole.stats).map(([key, value]) => (
                        <div key={key} className="bg-muted/50 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-primary">{value}</div>
                          <div className="text-sm text-muted-foreground capitalize">{key.replace('_', ' ')}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Pro tip:</span> Permissions are fully customizable. 
                        Enable or disable any feature per role to match your organization's needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

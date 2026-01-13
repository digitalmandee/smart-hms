import { useState } from 'react';
import { Stethoscope, UserCheck, Pill, Shield, Users, Receipt, FlaskConical, UserCog, Calculator, HeartPulse, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedSection } from './AnimatedSection';

const roles = [
  {
    id: 'doctor',
    icon: Stethoscope,
    title: 'Doctor',
    color: 'from-primary to-primary/80',
    tasks: [
      'View patient queue with chief complaints',
      'Access complete medical history instantly',
      'Document symptoms, vitals, and diagnosis',
      'Create e-prescriptions with drug database',
      'Schedule follow-up appointments',
    ],
    stats: { saved: '2 hours/day', patients: '40+ patients' },
  },
  {
    id: 'nurse',
    icon: HeartPulse,
    title: 'Nurse',
    color: 'from-rose-500 to-rose-600',
    tasks: [
      'Monitor patient vitals and vital trends',
      'Administer medications with barcode scan',
      'Document nursing notes per shift',
      'Manage bed allocations and transfers',
      'Generate shift handover reports',
    ],
    stats: { errors: '95% fewer medication errors', time: '2x faster documentation' },
  },
  {
    id: 'receptionist',
    icon: UserCheck,
    title: 'Receptionist',
    color: 'from-blue-500 to-blue-600',
    tasks: [
      'Register new patients in seconds',
      'Generate tokens for walk-ins',
      'Schedule and reschedule appointments',
      'Check-in patients with QR scan',
      'Collect payments and print receipts',
    ],
    stats: { saved: '3 hours/day', registrations: '100+ patients' },
  },
  {
    id: 'pharmacist',
    icon: Pill,
    title: 'Pharmacist',
    color: 'from-pink-500 to-pink-600',
    tasks: [
      'View prescription queue in real-time',
      'Check medicine availability by batch',
      'Dispense with barcode scanning',
      'Get low stock and expiry alerts',
      'Auto-deduct inventory on dispensing',
    ],
    stats: { saved: '90% fewer errors', speed: '2x faster' },
  },
  {
    id: 'lab_tech',
    icon: FlaskConical,
    title: 'Lab Technician',
    color: 'from-violet-500 to-violet-600',
    tasks: [
      'View pending lab orders queue',
      'Collect samples and update status',
      'Enter test results using templates',
      'Flag abnormal values automatically',
      'Generate and print lab reports',
    ],
    stats: { accuracy: '99.9%', speed: '3x faster' },
  },
  {
    id: 'radiologist',
    icon: ScanLine,
    title: 'Radiologist',
    color: 'from-cyan-500 to-cyan-600',
    tasks: [
      'Review imaging worklist and priorities',
      'View and analyze diagnostic images',
      'Create structured reports with findings',
      'Flag critical findings for immediate action',
      'Share images with referring doctors',
    ],
    stats: { turnaround: '50% faster reports', accuracy: 'Zero lost images' },
  },
  {
    id: 'accountant',
    icon: Calculator,
    title: 'Accountant',
    color: 'from-emerald-500 to-emerald-600',
    tasks: [
      'Record journal entries and manage ledgers',
      'Track accounts receivable and payables',
      'Reconcile bank statements daily',
      'Generate P&L, Balance Sheet reports',
      'Prepare GST/tax compliance reports',
    ],
    stats: { accuracy: '100% audit-ready', reports: 'Real-time' },
  },
  {
    id: 'hr_manager',
    icon: UserCog,
    title: 'HR Manager',
    color: 'from-indigo-500 to-indigo-600',
    tasks: [
      'Manage employee profiles and documents',
      'Create and publish duty rosters',
      'Track attendance and approve leaves',
      'Process monthly payroll',
      'Generate salary slips and HR reports',
    ],
    stats: { saved: '5 hours/week', accuracy: '99% payroll' },
  },
  {
    id: 'admin',
    icon: Shield,
    title: 'Admin',
    color: 'from-purple-500 to-purple-600',
    tasks: [
      'View revenue and patient analytics',
      'Manage staff accounts and permissions',
      'Configure clinic settings',
      'Monitor outstanding payments',
      'Export reports to Excel',
    ],
    stats: { visibility: '100% oversight', reports: 'Real-time' },
  },
];

export const RoleSelector = () => {
  const [activeRole, setActiveRole] = useState('doctor');

  const currentRole = roles.find((r) => r.id === activeRole)!;
  const Icon = currentRole.icon;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Role-Based Access
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tailored for Every Team Member
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each role sees exactly what they need. No clutter. No confusion. Just productivity.
          </p>
        </AnimatedSection>

        {/* Role buttons */}
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {roles.map((role) => {
              const RoleIcon = role.icon;
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                    isActive
                      ? `bg-gradient-to-r ${role.color} text-white shadow-lg scale-105`
                      : 'bg-card border hover:bg-accent'
                  )}
                >
                  <RoleIcon className="h-5 w-5" />
                  {role.title}
                </button>
              );
            })}
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
                        Enable or disable any feature per role.
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

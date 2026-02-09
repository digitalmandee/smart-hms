import { Check, X, Minus } from 'lucide-react';
import { AnimatedSection, StaggerChildren } from './AnimatedSection';

const comparisons = [
  // Patient Management
  {
    category: 'Patient Management',
    feature: 'Patient registration',
    paper: '5-10 min/patient',
    spreadsheet: '3-5 min/patient',
    smartHMS: '30 seconds',
    highlight: true,
  },
  {
    feature: 'Patient lookup',
    paper: 'Search through files',
    spreadsheet: 'Ctrl+F in sheets',
    smartHMS: 'Instant search',
    highlight: false,
  },
  {
    feature: 'Medical history access',
    paper: 'File room trips',
    spreadsheet: 'Multiple tabs',
    smartHMS: 'One-click view',
    highlight: true,
  },
  {
    feature: 'Patient ID cards',
    paper: 'Handwritten slips',
    spreadsheet: 'Not possible',
    smartHMS: 'QR code auto-print',
    highlight: false,
  },
  // Clinical Operations
  {
    category: 'Clinical Operations',
    feature: 'Prescription writing',
    paper: 'Handwritten (illegible)',
    spreadsheet: 'Not applicable',
    smartHMS: 'Digital with drug alerts',
    highlight: true,
  },
  {
    feature: 'Lab order processing',
    paper: 'Paper slips lost',
    spreadsheet: 'Manual tracking',
    smartHMS: 'Auto-routed to lab',
    highlight: false,
  },
  {
    feature: 'Drug interaction check',
    paper: 'Doctor memory only',
    spreadsheet: 'Not possible',
    smartHMS: 'Automatic warnings',
    highlight: true,
  },
  {
    feature: 'Vitals documentation',
    paper: 'Written in files',
    spreadsheet: 'Manual entry',
    smartHMS: 'Auto BMI calculation',
    highlight: false,
  },
  // Queue & Appointments
  {
    category: 'Queue & Appointments',
    feature: 'Token management',
    paper: 'Handwritten tokens',
    spreadsheet: 'Not possible',
    smartHMS: 'Auto-generated queue',
    highlight: true,
  },
  {
    feature: 'Wait time display',
    paper: 'Verbal updates only',
    spreadsheet: 'Not possible',
    smartHMS: 'Live TV display',
    highlight: false,
  },
  {
    feature: 'Appointment reminders',
    paper: 'Manual phone calls',
    spreadsheet: 'Manual phone calls',
    smartHMS: 'Auto SMS/WhatsApp',
    highlight: true,
  },
  {
    feature: 'No-show tracking',
    paper: 'No record kept',
    spreadsheet: 'Manual notes',
    smartHMS: 'Automatic flagging',
    highlight: false,
  },
  // Pharmacy & Inventory
  {
    category: 'Pharmacy & Inventory',
    feature: 'Medicine stock check',
    paper: 'Physical count',
    spreadsheet: 'Outdated data',
    smartHMS: 'Real-time levels',
    highlight: true,
  },
  {
    feature: 'Expiry tracking',
    paper: 'Monthly manual check',
    spreadsheet: 'Conditional format',
    smartHMS: 'Auto alerts 90 days',
    highlight: false,
  },
  {
    feature: 'Reorder alerts',
    paper: 'Staff memory',
    spreadsheet: 'Manual check',
    smartHMS: 'Automatic notifications',
    highlight: true,
  },
  {
    feature: 'Batch traceability',
    paper: 'Impossible',
    spreadsheet: 'Complex formulas',
    smartHMS: 'Full audit trail',
    highlight: false,
  },
  // Billing & Finance
  {
    category: 'Billing & Finance',
    feature: 'Invoice generation',
    paper: '10-15 min/invoice',
    spreadsheet: '5-8 min/invoice',
    smartHMS: 'One-click auto',
    highlight: true,
  },
  {
    feature: 'Billing errors',
    paper: '15-20% error rate',
    spreadsheet: '8-12% error rate',
    smartHMS: 'Less than 1%',
    highlight: false,
  },
  {
    feature: 'Payment tracking',
    paper: 'Manual ledger',
    spreadsheet: 'Pivot tables',
    smartHMS: 'Real-time dashboard',
    highlight: true,
  },
  {
    feature: 'Daily collection report',
    paper: '2-3 hours end of day',
    spreadsheet: '30-45 minutes',
    smartHMS: 'Instant anytime',
    highlight: false,
  },
  // Reporting & Analytics
  {
    category: 'Reporting & Analytics',
    feature: 'Revenue reports',
    paper: 'Days to compile',
    spreadsheet: 'Hours of work',
    smartHMS: 'One-click export',
    highlight: true,
  },
  {
    feature: 'Patient visit trends',
    paper: 'Not tracked',
    spreadsheet: 'Manual charts',
    smartHMS: 'Auto dashboards',
    highlight: false,
  },
  {
    feature: 'Doctor performance',
    paper: 'No visibility',
    spreadsheet: 'Basic counts',
    smartHMS: 'Detailed metrics',
    highlight: true,
  },
  // Security & Compliance
  {
    category: 'Security & Compliance',
    feature: 'Data backup',
    paper: 'Fire/flood risk',
    spreadsheet: 'Manual USB backup',
    smartHMS: 'Automatic cloud',
    highlight: true,
  },
  {
    feature: 'Access control',
    paper: 'Anyone can read',
    spreadsheet: 'Password sharing',
    smartHMS: 'Role-based access',
    highlight: false,
  },
  {
    feature: 'Audit trail',
    paper: 'Not possible',
    spreadsheet: 'No tracking',
    smartHMS: 'Complete log',
    highlight: true,
  },
  {
    feature: 'Multi-branch access',
    paper: 'Courier files',
    spreadsheet: 'Dropbox sharing',
    smartHMS: 'Instant sync',
    highlight: false,
  },
];

const getBadgeStyle = (value: string) => {
  const lower = value.toLowerCase();
  if (lower.includes('not ') || lower.includes('impossible') || lower.includes('fire') || lower.includes('anyone') || lower.includes('courier') || lower.includes('illegible') || lower.includes('lost') || lower.includes('no ') || lower.includes('memory only')) {
    return 'text-destructive bg-destructive/10';
  }
  if (lower.includes('manual') || lower.includes('hours') || lower.includes('min') || lower.includes('%') || lower.includes('complex') || lower.includes('outdated') || lower.includes('basic') || lower.includes('sharing') || lower.includes('trips') || lower.includes('verbal') || lower.includes('physical') || lower.includes('staff') || lower.includes('monthly') || lower.includes('pivot') || lower.includes('formulas') || lower.includes('tabs') || lower.includes('handwritten')) {
    return 'text-warning-foreground bg-warning/10';
  }
  return 'text-success bg-success/10';
};

interface ComparisonRow {
  category?: string;
  feature: string;
  paper: string;
  spreadsheet: string;
  smartHMS: string;
  highlight: boolean;
}

export const ComparisonTable = () => {
  return (
    <section id="compare" className="py-20 bg-background">
      <div className="container mx-auto px-5 sm:px-6 lg:px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Why Switch?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            HealthOS 24 vs. Traditional Methods
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A detailed comparison across 24 real-world scenarios. See exactly where you're losing time and money.
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <div className="max-w-6xl mx-auto overflow-hidden">
            {/* Desktop table */}
            <div className="hidden lg:block bg-card rounded-2xl border shadow-soft overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b bg-muted">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold text-destructive/80">📋 Paper/Registers</th>
                      <th className="text-center p-4 font-semibold text-warning-foreground">📊 Excel/Sheets</th>
                      <th className="text-center p-4 font-semibold text-primary">✨ HealthOS 24</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(comparisons as ComparisonRow[]).map((row, i) => (
                      <>
                        {row.category && (
                          <tr key={`cat-${i}`} className="bg-muted/70">
                            <td colSpan={4} className="p-3 font-bold text-foreground">
                              {row.category}
                            </td>
                          </tr>
                        )}
                        <tr key={i} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${row.highlight ? 'bg-primary/5' : ''}`}>
                          <td className="p-4 font-medium text-sm">{row.feature}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs ${getBadgeStyle(row.paper)}`}>
                              {row.paper}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs ${getBadgeStyle(row.spreadsheet)}`}>
                              {row.spreadsheet}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-3 py-1 rounded-full text-xs text-primary bg-primary/10 font-medium">
                              {row.smartHMS}
                            </span>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tablet/Mobile view with categories */}
            <div className="lg:hidden space-y-6">
              {['Patient Management', 'Clinical Operations', 'Queue & Appointments', 'Pharmacy & Inventory', 'Billing & Finance', 'Reporting & Analytics', 'Security & Compliance'].map(category => {
                const categoryItems = (comparisons as ComparisonRow[]).filter(
                  (item, idx) => {
                    const catIdx = (comparisons as ComparisonRow[]).findIndex(c => c.category === category);
                    const nextCatIdx = (comparisons as ComparisonRow[]).findIndex((c, i) => i > catIdx && c.category);
                    return idx >= catIdx && (nextCatIdx === -1 || idx < nextCatIdx);
                  }
                );
                
                return (
                  <div key={category} className="bg-card rounded-xl border overflow-hidden">
                    <div className="bg-muted/70 p-3 font-bold text-sm">{category}</div>
                    <div className="divide-y">
                      {categoryItems.map((row, i) => (
                        <div key={i} className={`p-3 sm:p-4 ${row.highlight ? 'bg-primary/5' : ''}`}>
                          <h4 className="font-medium text-xs sm:text-sm mb-2 sm:mb-3">{row.feature}</h4>
                          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
                            <div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Paper</div>
                              <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs leading-tight ${getBadgeStyle(row.paper)}`}>
                                {row.paper}
                              </span>
                            </div>
                            <div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Excel</div>
                              <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs leading-tight ${getBadgeStyle(row.spreadsheet)}`}>
                                {row.spreadsheet}
                              </span>
                            </div>
                            <div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">HealthOS</div>
                              <span className="inline-block px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs leading-tight text-primary bg-primary/10 font-medium">
                                {row.smartHMS}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* Stats summary */}
        <AnimatedSection animation="fade-up" delay={300} className="mt-12">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">24</div>
              <div className="text-sm text-muted-foreground">Features Compared</div>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-success">4+ hrs</div>
              <div className="text-sm text-muted-foreground">Daily Time Saved</div>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Fewer Errors</div>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-success">100%</div>
              <div className="text-sm text-muted-foreground">Data Security</div>
            </div>
          </div>
        </AnimatedSection>

        {/* Bottom summary */}
        <AnimatedSection animation="fade-up" delay={400} className="mt-12">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Ready to Make the Switch?</h3>
            <p className="text-white/90 mb-6">
              Join 500+ healthcare facilities across UAE and Pakistan who've upgraded from paper and Excel.
            </p>
            <a 
              href="/auth/signup" 
              className="inline-block bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-white/90 transition-colors"
            >
              Start Free 14-Day Trial
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

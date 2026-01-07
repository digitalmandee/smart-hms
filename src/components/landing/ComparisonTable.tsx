import { Check, X, Minus } from 'lucide-react';
import { AnimatedSection, StaggerChildren } from './AnimatedSection';

const comparisons = [
  {
    feature: 'Patient lookup time',
    paper: '5+ minutes',
    spreadsheet: '2-3 minutes',
    smartHMS: '2 seconds',
    highlight: true,
  },
  {
    feature: 'Prescription legibility',
    paper: 'Often unclear',
    spreadsheet: 'N/A',
    smartHMS: '100% digital',
    highlight: false,
  },
  {
    feature: 'Billing errors',
    paper: '15-20%',
    spreadsheet: '5-10%',
    smartHMS: '<1%',
    highlight: true,
  },
  {
    feature: 'Stock tracking',
    paper: 'Manual count',
    spreadsheet: 'Manual entry',
    smartHMS: 'Real-time auto',
    highlight: false,
  },
  {
    feature: 'Report generation',
    paper: 'Hours/days',
    spreadsheet: '30+ minutes',
    smartHMS: 'Instant',
    highlight: true,
  },
  {
    feature: 'Data backup',
    paper: 'None',
    spreadsheet: 'Manual',
    smartHMS: 'Automatic cloud',
    highlight: false,
  },
  {
    feature: 'Multi-branch access',
    paper: 'Impossible',
    spreadsheet: 'Complex',
    smartHMS: 'Built-in',
    highlight: false,
  },
  {
    feature: 'SMS reminders',
    paper: 'Manual calls',
    spreadsheet: 'Manual calls',
    smartHMS: 'Automatic',
    highlight: true,
  },
];

const getBadgeStyle = (value: string) => {
  const lower = value.toLowerCase();
  if (lower.includes('none') || lower.includes('impossible') || lower.includes('manual') || lower.includes('unclear')) {
    return 'text-destructive bg-destructive/10';
  }
  if (lower.includes('complex') || lower.includes('hours') || lower.includes('minutes') || lower.includes('%')) {
    return 'text-warning-foreground bg-warning/10';
  }
  return 'text-success bg-success/10';
};

export const ComparisonTable = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Why Switch?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            SmartHMS vs. Traditional Methods
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how much time and money you're losing with paper registers and Excel sheets.
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <div className="max-w-5xl mx-auto overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block bg-card rounded-2xl border shadow-soft overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">Paper/Registers</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">Excel/Sheets</th>
                    <th className="text-center p-4 font-semibold text-primary">SmartHMS</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, i) => (
                    <tr key={i} className={`border-b last:border-0 ${row.highlight ? 'bg-primary/5' : ''}`}>
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${getBadgeStyle(row.paper)}`}>
                          {row.paper}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${getBadgeStyle(row.spreadsheet)}`}>
                          {row.spreadsheet}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-full text-sm text-primary bg-primary/10 font-medium">
                          {row.smartHMS}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {comparisons.slice(0, 5).map((row, i) => (
                <div key={i} className={`bg-card rounded-xl border p-4 ${row.highlight ? 'border-primary/50' : ''}`}>
                  <h4 className="font-semibold mb-3">{row.feature}</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Paper</div>
                      <span className={`px-2 py-0.5 rounded text-xs ${getBadgeStyle(row.paper)}`}>
                        {row.paper}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Excel</div>
                      <span className={`px-2 py-0.5 rounded text-xs ${getBadgeStyle(row.spreadsheet)}`}>
                        {row.spreadsheet}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">SmartHMS</div>
                      <span className="px-2 py-0.5 rounded text-xs text-primary bg-primary/10 font-medium">
                        {row.smartHMS}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Bottom summary */}
        <AnimatedSection animation="fade-up" delay={400} className="mt-12">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">The Bottom Line</h3>
            <p className="text-white/90 mb-6">
              Clinics using SmartHMS save an average of <span className="font-bold">4+ hours daily</span> and reduce 
              billing errors by <span className="font-bold">95%</span>.
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

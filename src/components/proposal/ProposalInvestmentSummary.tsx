import { Activity, Calculator, TrendingUp, Calendar, Phone, Mail, Globe } from "lucide-react";

export const ProposalInvestmentSummary = () => {
  const yearOneBreakdown = [
    { label: "One-Time Setup & Onboarding", amount: "PKR 250,000" },
    { label: "Monthly Subscription (12 months)", amount: "PKR 10,200,000", note: "PKR 850,000 × 12" },
  ];

  const totalYear1 = "PKR 10,450,000";

  const roiHighlights = [
    { metric: "30%", label: "Revenue Leakage Reduction", description: "Through automated billing & charge capture" },
    { metric: "50%", label: "Administrative Time Saved", description: "With paperless workflows & automation" },
    { metric: "40%", label: "Faster Report Turnaround", description: "Real-time lab & radiology integration" },
    { metric: "99.9%", label: "System Uptime", description: "Enterprise-grade AWS infrastructure" },
  ];

  const paymentTerms = [
    "Setup fee: 100% payable upon contract signing",
    "Monthly subscription: Payable in advance by the 1st of each month",
    "Contract duration: Minimum 12 months",
    "Annual renewal: Subject to 5% annual escalation",
  ];

  return (
    <div className="proposal-page flex flex-col bg-background p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">HealthOS</span>
        </div>
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          04 / 05
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="w-16 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Investment Summary</h2>
        <p className="text-muted-foreground">
          Year 1 investment breakdown and expected returns
        </p>
      </div>

      {/* Year 1 Cost Breakdown */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <div className="bg-muted/50 px-6 py-3 border-b border-border flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Year 1 Cost Breakdown</h3>
        </div>
        <div className="p-6">
          {yearOneBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <span className="font-medium text-foreground">{item.label}</span>
                {item.note && <span className="text-xs text-muted-foreground ml-2">({item.note})</span>}
              </div>
              <span className="text-lg font-semibold text-foreground">{item.amount}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-primary">
            <span className="text-xl font-bold text-foreground">Total Year 1 Investment</span>
            <span className="text-2xl font-bold text-primary">{totalYear1}</span>
          </div>
        </div>
      </div>

      {/* ROI Highlights */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Expected ROI Highlights</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {roiHighlights.map((item, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{item.metric}</div>
              <div className="text-sm font-medium text-foreground mb-1">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Terms */}
      <div className="bg-muted/30 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Payment Terms</h3>
        </div>
        <ul className="space-y-2">
          {paymentTerms.map((term, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              {term}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl p-8 border border-primary/20">
          <h3 className="text-xl font-bold text-foreground mb-2">Ready to Transform Your Hospital?</h3>
          <p className="text-muted-foreground mb-4">Contact us to schedule a demo or discuss your requirements</p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Phone className="h-4 w-4 text-primary" />
              <span>+971 506802430</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>info@devmine.co</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Globe className="h-4 w-4 text-primary" />
              <span>smarthms.devmine.co</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS - Pricing & Commercials</span>
        <span>smarthms.devmine.co</span>
      </div>
    </div>
  );
};

import { 
  ClipboardList, 
  FileText, 
  Truck, 
  Package, 
  FileSpreadsheet, 
  Banknote, 
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { AnimatedSection, StaggerChildren } from './AnimatedSection';

const procurementSteps = [
  {
    icon: ClipboardList,
    number: '01',
    title: 'Requisition',
    description: 'Department submits stock request with item specifications and urgency level',
    detail: 'Low stock alerts trigger automatic requisitions',
    role: 'Store Manager',
    roleColor: 'bg-blue-500',
    systemAction: 'Stock level monitoring',
  },
  {
    icon: FileText,
    number: '02',
    title: 'Purchase Order',
    description: 'Unified PO created for medicines & supplies. Vendor selected from approved list',
    detail: 'Multi-level approval workflow with budget checks',
    role: 'Procurement',
    roleColor: 'bg-violet-500',
    systemAction: 'Vendor price comparison',
  },
  {
    icon: Truck,
    number: '03',
    title: 'Goods Received',
    description: 'GRN verification: quantity check, expiry dates, batch numbers recorded',
    detail: 'Partial receipts supported with variance tracking',
    role: 'Store Keeper',
    roleColor: 'bg-orange-500',
    systemAction: 'Quality inspection checklist',
  },
  {
    icon: Package,
    number: '04',
    title: 'Stock Update',
    description: 'Verified items auto-routed to Pharmacy or General Inventory with location tracking',
    detail: 'FIFO/FEFO inventory management applied',
    role: 'System',
    roleColor: 'bg-emerald-500',
    systemAction: 'Automatic stock routing',
  },
  {
    icon: FileSpreadsheet,
    number: '05',
    title: 'Accounts Payable',
    description: 'GRN creates AP liability. Invoice matched with PO for payment scheduling',
    detail: '3-way matching: PO vs GRN vs Vendor Invoice',
    role: 'Accounts',
    roleColor: 'bg-rose-500',
    systemAction: 'Aging reports generated',
  },
  {
    icon: Banknote,
    number: '06',
    title: 'Vendor Payment',
    description: 'Payment processed via bank/cheque. AP cleared, ledger entries posted automatically',
    detail: 'Debit AP, Credit Bank with full audit trail',
    role: 'Finance',
    roleColor: 'bg-success',
    systemAction: 'Bank reconciliation ready',
  },
];

export const ProcurementCycleDiagram = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
      <div className="container mx-auto">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-violet-500/10 text-violet-600 rounded-full text-sm font-medium mb-4">
            Supply Chain
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Complete Procurement Cycle
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From requisition to vendor payment — every step automated with full audit trail and real-time ledger integration.
          </p>
        </AnimatedSection>

        {/* Desktop: Horizontal 2-row flow */}
        <div className="hidden lg:block">
          {/* First row: Steps 1-3 */}
          <StaggerChildren
            staggerDelay={150}
            className="grid grid-cols-3 gap-6 mb-8"
          >
            {procurementSteps.slice(0, 3).map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative">
                  <div className="bg-card border rounded-xl p-6 h-full shadow-soft hover:shadow-md transition-shadow">
                    {/* Step number */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl ${step.roleColor} flex items-center justify-center text-white shadow-lg mb-4`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    
                    {/* Title & Description */}
                    <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    
                    {/* System Action */}
                    <div className="flex items-center gap-1.5 text-xs bg-muted/50 rounded-lg px-2.5 py-1.5 mb-3">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      <span className="text-muted-foreground">{step.systemAction}</span>
                    </div>
                    
                    {/* Role Badge */}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${step.roleColor}`} />
                      <span className="text-xs font-medium text-muted-foreground">{step.role}</span>
                    </div>
                  </div>
                  
                  {/* Arrow to next */}
                  {index < 2 && (
                    <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </StaggerChildren>

          {/* Connector arrow between rows */}
          <div className="flex justify-end pr-[16.67%] mb-8">
            <div className="flex items-center gap-2 text-muted-foreground/40">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-muted-foreground/30" />
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-muted-foreground/30" />
            </div>
          </div>

          {/* Second row: Steps 4-6 (reversed order for flow) */}
          <StaggerChildren
            staggerDelay={150}
            className="grid grid-cols-3 gap-6"
          >
            {procurementSteps.slice(3, 6).map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative">
                  <div className="bg-card border rounded-xl p-6 h-full shadow-soft hover:shadow-md transition-shadow">
                    {/* Step number */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl ${step.roleColor} flex items-center justify-center text-white shadow-lg mb-4`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    
                    {/* Title & Description */}
                    <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    
                    {/* System Action */}
                    <div className="flex items-center gap-1.5 text-xs bg-muted/50 rounded-lg px-2.5 py-1.5 mb-3">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      <span className="text-muted-foreground">{step.systemAction}</span>
                    </div>
                    
                    {/* Role Badge */}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${step.roleColor}`} />
                      <span className="text-xs font-medium text-muted-foreground">{step.role}</span>
                    </div>
                  </div>
                  
                  {/* Arrow to next */}
                  {index < 2 && (
                    <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </StaggerChildren>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="lg:hidden">
          <StaggerChildren staggerDelay={100} className="space-y-4">
            {procurementSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title}>
                  <div className="flex gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-xl ${step.roleColor} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {index < procurementSteps.length - 1 && (
                        <div className="w-0.5 h-16 bg-gradient-to-b from-muted-foreground/30 to-transparent mt-2" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary">{step.number}</span>
                        <h4 className="font-semibold">{step.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs bg-muted/50 rounded px-2 py-1">
                          <Zap className="h-3 w-3 text-primary" />
                          <span>{step.systemAction}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${step.roleColor}`} />
                          <span className="text-xs text-muted-foreground">{step.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </StaggerChildren>
        </div>

        {/* Summary Stats */}
        <AnimatedSection animation="fade-up" delay={400} className="mt-16">
          <div className="bg-card border rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-2xl font-bold">24 hrs</span>
                </div>
                <p className="text-sm text-muted-foreground">Average PO Processing Time</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-2xl font-bold">99.5%</span>
                </div>
                <p className="text-sm text-muted-foreground">3-Way Matching Accuracy</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-violet-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-2xl font-bold">Zero</span>
                </div>
                <p className="text-sm text-muted-foreground">Manual Ledger Entries</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

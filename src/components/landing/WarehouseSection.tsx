import { Building2, Package, Pill, Wrench, ArrowRight, Shield, Users, ScanLine, Warehouse, ClipboardList, FileText, Calculator } from 'lucide-react';
import { AnimatedSection, StaggerChildren } from './AnimatedSection';
import { Badge } from '@/components/ui/badge';

const subStores = [
  { name: 'Medical Store', icon: Pill, color: 'bg-blue-500/10 text-blue-600', dotColor: 'bg-blue-500' },
  { name: 'Surgical Store', icon: Wrench, color: 'bg-green-500/10 text-green-600', dotColor: 'bg-green-500' },
  { name: 'Dental Store', icon: ScanLine, color: 'bg-orange-500/10 text-orange-600', dotColor: 'bg-orange-500' },
  { name: 'Equipment Store', icon: Package, color: 'bg-purple-500/10 text-purple-600', dotColor: 'bg-purple-500' },
];

const entitlementFlow = [
  { label: 'ID Scan / Lookup', icon: ScanLine },
  { label: 'Category Check', icon: Shield },
  { label: 'Auto-Route', icon: ArrowRight },
];

const entitlementCategories = [
  { type: 'Entitled', items: ['Serving Personnel', 'Retired Personnel', 'Dependents'], color: 'text-success bg-success/10', result: 'Free Dispensing' },
  { type: 'Non-Entitled', items: ['Civilian Patients', 'Walk-in Customers'], color: 'text-primary bg-primary/10', result: 'Auto-Billing' },
];

const integrationSteps = [
  { icon: ClipboardList, title: 'Sub-Store Indent', desc: 'Department raises demand', module: 'Warehouse' },
  { icon: FileText, title: 'Auto PO', desc: 'PO from approved indent', module: 'Procurement' },
  { icon: Package, title: 'GRN & Stock', desc: 'Verify & route to bin/rack', module: 'Inventory' },
  { icon: Pill, title: 'Dispensing', desc: 'Entitlement-based routing', module: 'Warehouse' },
  { icon: Calculator, title: 'Accounts', desc: 'AP entry & billing revenue', module: 'Accounts' },
];

const comparisons = [
  { workflow: 'Patient entitlement check', traditional: 'Manual card verification', healthos: 'Auto ID-based entitlement lookup' },
  { workflow: 'Medicine indent from sub-store', traditional: 'Paper-based demand forms', healthos: 'Digital indent with approval workflow' },
  { workflow: 'Stock visibility across stores', traditional: 'Physical stock count', healthos: 'Real-time dashboard across all sub-stores' },
  { workflow: 'Non-entitled billing', traditional: 'Manual ledger entries', healthos: 'Auto-route to billing vs free dispensing' },
  { workflow: 'Expiry management', traditional: 'Monthly physical checks', healthos: 'Auto alerts 30/60/90 days before expiry' },
  { workflow: 'Inter-store transfers', traditional: 'Manual register entries', healthos: 'Digital transfer with auto stock update' },
  { workflow: 'Indent to PO conversion', traditional: 'Separate departments, no link', healthos: 'Auto-PO from approved indent' },
  { workflow: 'GRN to sub-store routing', traditional: 'Manual allocation', healthos: 'Auto-route to correct sub-store with bin assignment' },
];

const stats = [
  { value: '5', label: 'Modules Connected' },
  { value: '4+', label: 'Entitlement Categories' },
  { value: '100%', label: 'Real-time Visibility' },
];

export const WarehouseSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-600 rounded-full text-sm font-medium mb-4">
            Enterprise Supply Chain
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Warehouse Management & Patient Entitlement
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Multi-warehouse sub-store management with intelligent patient entitlement-based dispensing, fully integrated with Procurement, Inventory & Accounts.
          </p>
        </AnimatedSection>

        {/* Two Column: Warehouse Hierarchy + Entitlement Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {/* Left: Warehouse Hierarchy */}
          <AnimatedSection animation="fade-right" delay={100}>
            <div className="bg-card border rounded-2xl p-6 h-full">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-indigo-600" />
                Warehouse Sub-Store Hierarchy
              </h3>
              <div className="flex flex-col items-center">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-6 py-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold text-foreground">Central Store</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Master inventory & allocation</p>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="w-3/4 h-px bg-border" />
                <div className="grid grid-cols-2 gap-3 w-full mt-2">
                  {subStores.map((store) => {
                    const Icon = store.icon;
                    return (
                      <div key={store.name} className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border">
                        <div className={`p-1.5 rounded-md ${store.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{store.name}</p>
                          <p className="text-[10px] text-muted-foreground">Bin/Rack tracking</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right: Patient Entitlement Flow */}
          <AnimatedSection animation="fade-left" delay={200}>
            <div className="bg-card border rounded-2xl p-6 h-full">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Patient Entitlement Engine
              </h3>
              <div className="flex items-center justify-center gap-3 mb-6">
                {entitlementFlow.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                          <Icon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 text-center">{step.label}</span>
                      </div>
                      {i < entitlementFlow.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3">
                {entitlementCategories.map((cat) => (
                  <div key={cat.type} className="border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className={cat.color}>{cat.type}</Badge>
                      <span className="text-xs font-medium text-indigo-600">→ {cat.result}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item) => (
                        <span key={item} className="text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Connected Supply Chain Flow */}
        <AnimatedSection animation="fade-up" delay={250} className="max-w-5xl mx-auto mb-16">
          <div className="bg-card border rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-center mb-2">Connected Supply Chain</h3>
            <p className="text-sm text-muted-foreground text-center mb-8">End-to-end flow linking 5 modules seamlessly</p>

            {/* Desktop: Horizontal */}
            <div className="hidden lg:flex items-start justify-between relative">
              {integrationSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex items-center">
                    <div className="flex flex-col items-center text-center w-32">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-3">
                        <Icon className="h-7 w-7 text-indigo-600" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                      <p className="text-[11px] text-muted-foreground mb-2">{step.desc}</p>
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{step.module}</span>
                    </div>
                    {i < integrationSteps.length - 1 && (
                      <div className="flex items-center px-1 mt-[-40px]">
                        <div className="w-8 h-0.5 bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/10" />
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile: Vertical */}
            <div className="lg:hidden space-y-4">
              {integrationSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title}>
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        {i < integrationSteps.length - 1 && (
                          <div className="w-0.5 h-8 bg-gradient-to-b from-muted-foreground/30 to-transparent mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{step.title}</h4>
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{step.module}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* Comparison Grid */}
        <AnimatedSection animation="fade-up" delay={300}>
          <div className="max-w-5xl mx-auto mb-12">
            <h3 className="text-xl font-bold text-center mb-6">Traditional vs. HealthOS 24</h3>
            <div className="hidden md:block bg-card border rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted border-b">
                    <th className="text-left p-4 font-semibold text-sm">Workflow</th>
                    <th className="text-center p-4 font-semibold text-sm text-destructive/80">Traditional</th>
                    <th className="text-center p-4 font-semibold text-sm text-primary">HealthOS 24</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm font-medium">{row.workflow}</td>
                      <td className="p-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-xs text-destructive bg-destructive/10">
                          {row.traditional}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-xs text-primary bg-primary/10 font-medium">
                          {row.healthos}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-3">
              {comparisons.map((row, i) => (
                <div key={i} className="bg-card border rounded-xl p-4">
                  <h4 className="font-medium text-sm mb-2">{row.workflow}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">Traditional</div>
                      <span className="text-[11px] text-destructive bg-destructive/10 px-2 py-0.5 rounded">{row.traditional}</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">HealthOS 24</div>
                      <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded font-medium">{row.healthos}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Stats */}
        <AnimatedSection animation="fade-up" delay={400}>
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card border rounded-xl p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-indigo-600">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

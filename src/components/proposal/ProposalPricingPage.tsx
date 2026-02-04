import { Server, Users, Database, Shield, Headphones, Settings, Check } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ProposalPricingPage = () => {
  const monthlyIncludes = [
    { icon: HealthOS24Logo, item: "Complete HealthOS 24 System", detail: "All 50 modules" },
    { icon: Server, item: "AWS Cloud Hosting", detail: "Tier-1 Infrastructure" },
    { icon: Database, item: "System Requests", detail: "Up to 2,000,000/month" },
    { icon: Users, item: "Active Users", detail: "Up to 50 users" },
    { icon: Database, item: "Patient Profiles", detail: "Up to 500 profiles" },
    { icon: Shield, item: "Security & Backups", detail: "Daily automated backups" },
    { icon: Headphones, item: "Technical Support", detail: "Email & phone support" },
    { icon: Settings, item: "Maintenance", detail: "Updates & patches" },
  ];

  const setupIncludes = [
    { item: "System Deployment", detail: "Cloud infrastructure setup" },
    { item: "Configuration", detail: "Hospital workflow customization" },
    { item: "User & Role Setup", detail: "25+ role configurations" },
    { item: "Employee Training", detail: "Included first time, after that onsite" },
    { item: "Go-Live Support", detail: "On-site and remote assistance" },
  ];

  return (
    <div className="proposal-page flex flex-col bg-background p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <HealthOS24Logo variant="full" size="sm" />
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">09 / 10</span>
      </div>

      {/* Title */}
      <div className="mb-4">
        <div className="w-16 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full mb-3" />
        <h2 className="text-2xl font-bold text-foreground mb-1">Pricing Details</h2>
        <p className="text-sm text-muted-foreground">Transparent pricing with everything included</p>
      </div>

      {/* Monthly Subscription Table */}
      <div className="mb-4">
        <div className="bg-primary text-primary-foreground rounded-t-xl px-5 py-3 flex items-center justify-between">
          <h3 className="font-semibold">Monthly Subscription Fee</h3>
          <div className="text-right">
            <span className="text-xl font-bold">PKR 380,000</span>
            <span className="text-primary-foreground/80 ml-2 text-sm">/ Month</span>
          </div>
        </div>
        <div className="border border-t-0 border-border rounded-b-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold py-2 text-sm">What's Included</TableHead>
                <TableHead className="font-semibold text-right py-2 text-sm">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyIncludes.map((row, index) => {
                const Icon = row.icon;
                return (
                  <TableRow key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-primary/10">
                          {index === 0 ? (
                            <span className="text-xs font-bold text-primary">24</span>
                          ) : (
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>
                        <span className="font-medium text-sm">{row.item}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground py-2 text-sm">{row.detail}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* One-Time Setup Table */}
      <div className="flex-1">
        <div className="bg-blue-600 text-white rounded-t-xl px-5 py-3 flex items-center justify-between">
          <h3 className="font-semibold">One-Time Setup & Onboarding Fee</h3>
          <div className="text-right">
            <span className="text-xl font-bold">PKR 180,000</span>
            <span className="text-white/80 ml-2 text-sm">(One-Time)</span>
          </div>
        </div>
        <div className="border border-t-0 border-border rounded-b-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold py-2 text-sm">What's Included</TableHead>
                <TableHead className="font-semibold text-right py-2 text-sm">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {setupIncludes.map((row, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-blue-500/10">
                        <Check className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <span className="font-medium text-sm">{row.item}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground py-2 text-sm">{row.detail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary Note */}
      <div className="mt-4 bg-muted/30 rounded-xl p-3 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Total First Month:</span> PKR 560,000 (Setup + First Month
          Subscription)
        </p>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS 24 Proposal</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
};

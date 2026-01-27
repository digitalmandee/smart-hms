import { Activity, Server, Users, Database, Shield, Headphones, Settings, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const ProposalPricingPage = () => {
  const monthlyIncludes = [
    { icon: Activity, item: "Complete HealthOS System", detail: "All 50 modules" },
    { icon: Server, item: "AWS Cloud Hosting", detail: "Tier-1 Infrastructure" },
    { icon: Database, item: "System Requests", detail: "Up to 2,000,000/month" },
    { icon: Users, item: "Active Users", detail: "Up to 50 users" },
    { icon: Database, item: "Patient Profiles", detail: "Up to 500 profiles" },
    { icon: Shield, item: "Security & Backups", detail: "Automated daily backups" },
    { icon: Activity, item: "Monitoring", detail: "24/7 system monitoring" },
    { icon: Headphones, item: "Technical Support", detail: "Email & phone support" },
    { icon: Settings, item: "Maintenance", detail: "Regular updates & patches" },
  ];

  const setupIncludes = [
    { item: "System Deployment", detail: "Cloud infrastructure setup" },
    { item: "Configuration", detail: "Hospital workflow customization" },
    { item: "User & Role Setup", detail: "25+ role configurations" },
    { 
      item: "Department Training", 
      details: ["Doctors & Consultants", "Nursing Staff", "Admin & Reception", "Billing & Accounts"] 
    },
    { item: "Go-Live Support", detail: "On-site and remote assistance" },
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
          03 / 05
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="w-16 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Pricing Details</h2>
        <p className="text-muted-foreground">
          Transparent pricing with everything included
        </p>
      </div>

      {/* Monthly Subscription Table */}
      <div className="mb-6">
        <div className="bg-primary text-primary-foreground rounded-t-xl px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Monthly Subscription Fee</h3>
          <div className="text-right">
            <span className="text-2xl font-bold">PKR 850,000</span>
            <span className="text-primary-foreground/80 ml-2">/ Month</span>
          </div>
        </div>
        <div className="border border-t-0 border-border rounded-b-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">What's Included</TableHead>
                <TableHead className="font-semibold text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyIncludes.map((row, index) => {
                const Icon = row.icon;
                return (
                  <TableRow key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{row.item}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground py-3">
                      {row.detail}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* One-Time Setup Table */}
      <div className="flex-1">
        <div className="bg-blue-600 text-white rounded-t-xl px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">One-Time Setup & Onboarding Fee</h3>
          <div className="text-right">
            <span className="text-2xl font-bold">PKR 250,000</span>
            <span className="text-white/80 ml-2">(One-Time)</span>
          </div>
        </div>
        <div className="border border-t-0 border-border rounded-b-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">What's Included</TableHead>
                <TableHead className="font-semibold text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {setupIncludes.map((row, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-blue-500/10">
                        <Check className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{row.item}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground py-3">
                    {'details' in row ? (
                      <div className="space-y-1">
                        {row.details.map((d, i) => (
                          <div key={i} className="text-xs">• {d}</div>
                        ))}
                      </div>
                    ) : (
                      row.detail
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

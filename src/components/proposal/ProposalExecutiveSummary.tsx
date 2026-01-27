import { Activity, CheckCircle2, Target, TrendingUp, Shield } from "lucide-react";

export const ProposalExecutiveSummary = () => {
  const highlights = [
    { icon: Target, label: "50+ Modules", description: "Comprehensive hospital coverage" },
    { icon: TrendingUp, label: "255+ Features", description: "End-to-end functionality" },
    { icon: Shield, label: "25+ Roles", description: "Granular access control" },
    { icon: CheckCircle2, label: "Cloud-Native", description: "AWS Tier-1 infrastructure" },
  ];

  const valueProps = [
    "Unified platform eliminating data silos across departments",
    "Real-time dashboards for instant operational visibility",
    "Automated billing reducing revenue leakage by up to 30%",
    "Paperless workflows improving staff efficiency",
    "Compliance-ready with audit trails and security controls",
    "Scalable architecture supporting multi-branch operations",
  ];

  return (
    <div className="proposal-page flex flex-col bg-background p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">HealthOS</span>
        </div>
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          02 / 10
        </span>
      </div>

      {/* Title */}
      <div className="mb-8">
        <div className="w-16 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Executive Summary</h2>
        <p className="text-muted-foreground">
          A comprehensive overview of the HealthOS Hospital Management System
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground">{item.label}</h4>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </div>
          );
        })}
      </div>

      {/* System Overview */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">System Overview</h3>
        <p className="text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">HealthOS</span> is a next-generation, 
          cloud-native Hospital Management System designed specifically for healthcare facilities 
          in the Middle East and South Asia. Built on enterprise-grade AWS infrastructure, 
          HealthOS delivers a unified platform that seamlessly integrates clinical operations, 
          diagnostics, pharmacy, billing, and administrative functions into a single, 
          intelligent ecosystem.
        </p>
      </div>

      {/* Value Propositions */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-foreground mb-4">Key Value Propositions</h3>
        <div className="grid grid-cols-2 gap-3">
          {valueProps.map((prop, index) => (
            <div key={index} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{prop}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS Proposal</span>
        <span>smarthms.devmine.co</span>
      </div>
    </div>
  );
};

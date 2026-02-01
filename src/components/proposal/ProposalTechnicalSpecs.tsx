import { Cloud, Shield, Database, Globe, Server, Lock, FileCode, Smartphone } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

const specs = [
  {
    icon: Cloud,
    title: "Cloud Architecture",
    color: "blue",
    items: [
      { label: "Infrastructure", value: "AWS Tier-1 (Mumbai Region)" },
      { label: "Uptime SLA", value: "99.9% monthly availability" },
      { label: "Auto-Scaling", value: "Dynamic resource allocation" },
      { label: "CDN", value: "CloudFront global edge caching" },
      { label: "Disaster Recovery", value: "Multi-AZ failover" },
    ],
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    color: "green",
    items: [
      { label: "Encryption", value: "AES-256 at rest, TLS 1.3 in transit" },
      { label: "Authentication", value: "2FA, SSO, session management" },
      { label: "Role-Based Access", value: "25+ granular role templates" },
      { label: "Audit Trails", value: "Complete action logging" },
      { label: "Compliance Ready", value: "HIPAA, ISO 27001 aligned" },
    ],
  },
  {
    icon: Database,
    title: "Data Management",
    color: "purple",
    items: [
      { label: "Database", value: "PostgreSQL with read replicas" },
      { label: "Backups", value: "Automated daily, 30-day retention" },
      { label: "Interoperability", value: "HL7 FHIR ready" },
      { label: "API", value: "RESTful APIs with OAuth 2.0" },
      { label: "Data Export", value: "CSV, Excel, PDF formats" },
    ],
  },
  {
    icon: Globe,
    title: "Access & Deployment",
    color: "orange",
    items: [
      { label: "Access", value: "Web-based, no installation" },
      { label: "Browsers", value: "Chrome, Edge, Safari, Firefox" },
      { label: "Mobile", value: "Responsive design, PWA support" },
      { label: "Multi-Branch", value: "Centralized or distributed" },
      { label: "Offline Mode", value: "Critical functions available" },
    ],
  },
];

const colorClasses: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-600" },
  green: { bg: "bg-green-500/10", text: "text-green-600" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-600" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-600" },
};

export const ProposalTechnicalSpecs = () => {
  return (
    <div className="proposal-page flex flex-col bg-background p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <HealthOS24Logo variant="full" size="md" />
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          08 / 10
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="w-16 h-1 bg-gradient-to-r from-slate-500 to-slate-400 rounded-full mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Technical Specifications</h2>
        <p className="text-muted-foreground">Enterprise-grade infrastructure and security</p>
      </div>

      {/* Specs Grid */}
      <div className="flex-1 grid grid-cols-2 gap-5">
        {specs.map((spec, index) => {
          const Icon = spec.icon;
          const colors = colorClasses[spec.color];
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-lg ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                <h3 className="font-semibold text-foreground">{spec.title}</h3>
              </div>
              <div className="space-y-2">
                {spec.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tech Stack Summary */}
      <div className="mt-6 bg-muted/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">React + Node.js</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Supabase Auth</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileCode className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">TypeScript</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">PWA Ready</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS 24 Proposal</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
};

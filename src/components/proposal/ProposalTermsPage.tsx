import { FileText, Shield, Clock, Database, AlertCircle } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

export const ProposalTermsPage = () => {
  const sections = [
    {
      icon: Clock,
      title: "Contract Duration",
      items: [
        "Initial contract term: 12 months from go-live date",
        "Auto-renewal for subsequent 12-month periods unless terminated",
        "90-day written notice required for non-renewal",
        "Early termination subject to remaining contract value",
      ],
    },
    {
      icon: Shield,
      title: "Service Level Agreement (SLA)",
      items: [
        "System uptime guarantee: 99.9% monthly availability",
        "Scheduled maintenance: Sundays 2:00 AM - 6:00 AM PKT",
        "Critical issue response: Within 1 hour",
        "Standard issue response: Within 4 business hours",
        "Feature requests: Reviewed quarterly",
      ],
    },
    {
      icon: Database,
      title: "Data Ownership & Security",
      items: [
        "All patient and operational data remains property of the hospital",
        "Data encrypted at rest (AES-256) and in transit (TLS 1.3)",
        "Daily automated backups with 30-day retention",
        "Data export available in standard formats upon request",
        "Complete data deletion within 30 days of contract termination",
      ],
    },
    {
      icon: AlertCircle,
      title: "Limitations & Exclusions",
      items: [
        "Custom development beyond standard modules quoted separately",
        "Third-party integrations (LIS, PACS, etc.) require separate assessment",
        "On-site support beyond go-live phase billed at PKR 15,000/day",
        "Additional user licenses: PKR 5,000/user/month beyond 50 users",
        "Additional patient profiles: PKR 100/profile/month beyond 500",
      ],
    },
  ];

  return (
    <div className="proposal-page flex flex-col bg-background p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <HealthOS24Logo variant="full" size="md" />
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          10 / 10
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="w-16 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Terms & Conditions</h2>
        <p className="text-muted-foreground">
          Key contractual terms for your reference
        </p>
      </div>

      {/* Terms Sections */}
      <div className="flex-1 grid grid-cols-2 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-muted/30 rounded-xl p-4 flex items-start gap-3">
        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Disclaimer</p>
          <p>
            This proposal is valid for 30 days from the date of issue. Pricing and terms are subject 
            to change based on final scope assessment. A detailed Master Service Agreement (MSA) will 
            be provided upon acceptance of this proposal.
          </p>
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

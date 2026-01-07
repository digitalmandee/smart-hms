import { 
  Shield, 
  Server, 
  Building2, 
  Clock, 
  Lock, 
  RefreshCw,
  Headphones,
  Zap
} from "lucide-react";

const benefits = [
  {
    icon: Clock,
    stat: "99.9%",
    label: "Uptime",
    description: "Enterprise-grade reliability with redundant infrastructure",
  },
  {
    icon: Shield,
    stat: "HIPAA",
    label: "Compliant Design",
    description: "Built with healthcare data protection standards in mind",
  },
  {
    icon: Building2,
    stat: "Multi-Tenant",
    label: "Architecture",
    description: "Secure data isolation between organizations",
  },
  {
    icon: Lock,
    stat: "256-bit",
    label: "Encryption",
    description: "Bank-level security for all patient data",
  },
  {
    icon: RefreshCw,
    stat: "Real-time",
    label: "Sync",
    description: "Instant updates across all devices and branches",
  },
  {
    icon: Server,
    stat: "Daily",
    label: "Backups",
    description: "Automated backups with point-in-time recovery",
  },
  {
    icon: Headphones,
    stat: "24/7",
    label: "Support",
    description: "Round-the-clock assistance for enterprise plans",
  },
  {
    icon: Zap,
    stat: "<100ms",
    label: "Response Time",
    description: "Lightning-fast performance globally",
  },
];

export const BenefitsSection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for
            <span className="text-primary"> Enterprise Healthcare</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Security, reliability, and performance you can trust with your most sensitive data.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit) => (
            <div
              key={benefit.label}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center"
            >
              <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{benefit.stat}</div>
              <div className="text-sm font-medium text-primary mb-2">{benefit.label}</div>
              <p className="text-xs text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

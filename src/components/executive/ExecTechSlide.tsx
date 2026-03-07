import { Cloud, Shield, Lock, Users, Database, RefreshCw, Globe, Server } from "lucide-react";

const techFeatures = [
  { icon: Cloud, title: "AWS Cloud-Native", desc: "Hosted on Amazon Web Services with auto-scaling, global CDN, and regional data residency options." },
  { icon: Shield, title: "99.9% Uptime SLA", desc: "Enterprise-grade reliability with redundant infrastructure, failover, and 24/7 monitoring." },
  { icon: Lock, title: "AES-256 Encryption", desc: "All data encrypted at rest and in transit. HIPAA-aligned security protocols." },
  { icon: Users, title: "25+ Role-Based Access", desc: "Granular permissions for doctors, nurses, admin, finance, HR — each sees only what they need." },
  { icon: Database, title: "Daily Backups", desc: "Automated daily backups with point-in-time recovery. Zero data loss guarantee." },
  { icon: RefreshCw, title: "Continuous Updates", desc: "New features and security patches deployed automatically with zero downtime." },
  { icon: Globe, title: "Multi-Branch Ready", desc: "Single deployment serves multiple branches with branch-level data isolation and central reporting." },
  { icon: Server, title: "API-First Architecture", desc: "RESTful APIs for integration with lab equipment, biometrics, SMS gateways, and third-party tools." },
  { icon: Globe, title: "Trilingual Interface", desc: "Full system available in English, Arabic & Urdu with complete RTL support for seamless regional use." },
];

export function ExecTechSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background to-muted/30 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary to-cyan-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">Infrastructure</p>
          <h2 className="text-3xl font-extrabold text-foreground">Enterprise-Grade Technology</h2>
          <p className="text-sm text-muted-foreground mt-1">Built for hospitals that demand reliability, security, and scale.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">14 / 16</span>
      </div>

      <div className="grid grid-cols-4 gap-4 flex-1">
        {techFeatures.map((f) => (
          <div key={f.title} className="rounded-xl border bg-card p-4 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-sm text-foreground">{f.title}</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

import { Shield, Lock, Server, Clock, CheckCircle2, Award, FileCheck } from "lucide-react";

const certifications = [
  {
    code: "DHA",
    name: "Dubai Health Authority",
    status: "Approved",
    color: "bg-blue-600",
  },
  {
    code: "MOH",
    name: "Ministry of Health UAE",
    status: "Licensed",
    color: "bg-green-600",
  },
  {
    code: "HAAD",
    name: "Abu Dhabi Health",
    status: "Certified",
    color: "bg-purple-600",
  },
];

const securityFeatures = [
  { icon: Lock, label: "256-bit SSL Encryption", description: "Bank-grade security for all data transfers" },
  { icon: Server, label: "Daily Automated Backups", description: "Never lose patient data with geo-redundant storage" },
  { icon: Shield, label: "Role-Based Access Control", description: "Granular permissions by department and role" },
  { icon: FileCheck, label: "Complete Audit Trails", description: "Track every action with timestamp and user ID" },
];

export const ComplianceSlide = () => {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Healthcare Compliance & Security</h2>
            <p className="text-sm text-muted-foreground">Meeting the highest standards in healthcare IT</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground font-medium">30 / 32</div>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* Certifications */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            UAE Healthcare Certifications
          </h3>

          <div className="space-y-4 mb-6">
            {certifications.map((cert) => (
              <div
                key={cert.code}
                className="flex items-center gap-4 bg-card border border-border rounded-xl p-4"
              >
                <div className={`w-16 h-16 ${cert.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                  {cert.code}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{cert.name}</div>
                  <div className="text-sm text-muted-foreground">{cert.status}</div>
                </div>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            ))}
          </div>

          {/* HIPAA Badge */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <div className="font-bold text-lg">HIPAA Compliant</div>
                <div className="text-sm text-blue-100">International healthcare data standards</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Security & Data Protection
          </h3>

          <div className="space-y-3 mb-6">
            {securityFeatures.map((feature) => (
              <div
                key={feature.label}
                className="flex items-start gap-4 bg-card border border-border rounded-xl p-4"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{feature.label}</div>
                  <div className="text-sm text-muted-foreground">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Uptime Guarantee */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="h-8 w-8" />
                </div>
                <div>
                  <div className="font-bold text-lg">99.9% Uptime SLA</div>
                  <div className="text-sm text-green-100">Guaranteed system availability</div>
                </div>
              </div>
              <div className="text-4xl font-bold">24/7</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Trust Bar */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>✓ SOC 2 Type II Ready</span>
          <span>•</span>
          <span>✓ GDPR Compliant</span>
          <span>•</span>
          <span>✓ ISO 27001 Standards</span>
          <span>•</span>
          <span>✓ Regular Security Audits</span>
        </div>
      </div>
    </div>
  );
};

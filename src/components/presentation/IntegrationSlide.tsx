import { 
  FlaskConical, ScanLine, Fingerprint, MessageSquare, CreditCard, 
  Cloud, Database, Lock, Zap, CheckCircle2, Link2, Activity 
} from "lucide-react";

const integrations = [
  {
    category: "Laboratory",
    icon: FlaskConical,
    color: "bg-blue-500",
    items: ["LIS/LIMS Integration", "HL7 FHIR Support", "Barcode Readers", "Auto Result Import"],
  },
  {
    category: "Imaging",
    icon: ScanLine,
    color: "bg-purple-500",
    items: ["PACS Connectivity", "DICOM Viewers", "Modality Worklists", "Study Archive"],
  },
  {
    category: "Devices",
    icon: Fingerprint,
    color: "bg-teal-500",
    items: ["Biometric Attendance", "Vital Monitors", "Label Printers", "Barcode Scanners"],
  },
  {
    category: "Communication",
    icon: MessageSquare,
    color: "bg-green-500",
    items: ["SMS Gateway", "WhatsApp Business", "Email Notifications", "Push Alerts"],
  },
  {
    category: "Payments",
    icon: CreditCard,
    color: "bg-orange-500",
    items: ["Card Terminals", "JazzCash/EasyPaisa", "Bank Transfer", "Insurance EDI"],
  },
  {
    category: "Cloud",
    icon: Cloud,
    color: "bg-indigo-500",
    items: ["AWS/Azure Hosting", "CDN Delivery", "Auto Backups", "Disaster Recovery"],
  },
];

export const IntegrationSlide = () => {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Gradient Header Bar */}
      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Link2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Integration Ecosystem</h2>
            <p className="text-sm text-muted-foreground">Seamlessly Connect with Your Existing Infrastructure</p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
          29 / 32
        </span>
      </div>

      {/* Integration Grid */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div
              key={integration.category}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${integration.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">{integration.category}</h3>
              </div>
              <div className="space-y-2">
                {integration.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* API & Security Highlights */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold">REST API</div>
              <div className="text-xs text-muted-foreground">Full API Access</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
            <Lock className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold">OAuth 2.0</div>
              <div className="text-xs text-muted-foreground">Secure Auth</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold">Webhooks</div>
              <div className="text-xs text-muted-foreground">Real-time Events</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold">99.9% SLA</div>
              <div className="text-xs text-muted-foreground">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS 24 - AI-Powered Hospital Management System</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
};

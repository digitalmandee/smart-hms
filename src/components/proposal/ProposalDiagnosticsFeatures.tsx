import { FlaskConical, TestTube, FileText, BarChart3, Scan, Image, Droplets, GitMerge } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

const modules = [
  { icon: FlaskConical, name: "Laboratory Information System (LIS)", features: ["500+ test catalog", "Auto-calculated panels", "Reference ranges by age/gender", "Critical value alerts"] },
  { icon: TestTube, name: "Sample Tracking", features: ["Barcode labeling", "Collection status", "TAT monitoring", "Rejection handling"] },
  { icon: FileText, name: "Result Entry", features: ["Manual & analyzer import", "Delta checks", "Approval workflow", "Amendment audit"] },
  { icon: BarChart3, name: "Lab Reporting", features: ["Customizable templates", "Cumulative reports", "Graphical trends", "PDF/print output"] },
  { icon: Scan, name: "Radiology Information System (RIS)", features: ["Modality scheduling", "Protocol assignment", "Technician worklist", "Report dictation"] },
  { icon: Image, name: "PACS Integration", features: ["DICOM viewer", "Image sharing", "Prior study comparison", "Cloud archive"] },
  { icon: Droplets, name: "Blood Bank", features: ["Donor registry", "Component separation", "Expiry tracking", "Cross-match records"] },
  { icon: GitMerge, name: "Cross-Match & Transfusion", features: ["Compatibility testing", "Transfusion reactions", "Issue & return logs", "Inventory sync"] },
];

export const ProposalDiagnosticsFeatures = () => {
  return (
    <div className="proposal-page flex flex-col bg-background p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <HealthOS24Logo variant="full" size="md" />
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          04 / 10
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Diagnostics & Laboratory</h2>
        <p className="text-muted-foreground">8 modules for comprehensive diagnostic services</p>
      </div>

      {/* Modules Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-4 flex gap-4">
              <div className="p-2.5 rounded-lg bg-blue-500/10 h-fit">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm mb-1">{mod.name}</h4>
                <ul className="space-y-0.5">
                  {mod.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS 24 Proposal</span>
        <span>healthos24.com</span>
      </div>
    </div>
  );
};

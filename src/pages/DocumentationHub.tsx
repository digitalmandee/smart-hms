import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

const modules = [
  { title: "OPD — Outpatient", desc: "Appointments, consultation, prescriptions, checkout", path: "/opd-documentation", icon: "🩺", pages: 8 },
  { title: "IPD — Inpatient", desc: "Admission, bed management, rounds, nursing, discharge", path: "/ipd-documentation", icon: "🏥", pages: 8 },
  { title: "Surgery / OT", desc: "Scheduling, pre-op, anesthesia, live surgery, PACU", path: "/ot-documentation", icon: "🔬", pages: 7 },
  { title: "Laboratory", desc: "Orders, sample collection, results, validation", path: "/lab-documentation", icon: "🧪", pages: 5 },
  { title: "Radiology", desc: "Imaging orders, reporting, PACS integration", path: "/radiology-documentation", icon: "📡", pages: 5 },
  { title: "Pharmacy", desc: "POS, inventory, dispensing, procurement, reports", path: "/pharmacy-documentation", icon: "💊", pages: 18 },
  { title: "Warehouse / WMS", desc: "GRN, picking, packing, shipping, cycle count", path: "/warehouse-documentation", icon: "🏭", pages: 6 },
  { title: "Finance / Accounts", desc: "Chart of accounts, journals, billing, P&L", path: "/finance-documentation", icon: "💰", pages: 6 },
  { title: "HR & Payroll", desc: "Employees, attendance, payroll, recruitment", path: "/hr-documentation", icon: "👥", pages: 6 },
  { title: "Dialysis", desc: "Sessions, vitals monitoring, machines, scheduling", path: "/dialysis-documentation", icon: "🫘", pages: 6 },
  { title: "Dental", desc: "3D tooth chart, treatments, procedures, imaging", path: "/dental-documentation", icon: "🦷", pages: 6 },
  { title: "KSA Compliance", desc: "NPHIES, ZATCA, Wasfaty, Nafath, HESN, Tatmeen", path: "/ksa-documentation", icon: "🇸🇦", pages: 12 },
];

const DocumentationHub = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2"><ArrowLeft className="h-4 w-4" />Back to Home</Button>
          <HealthOS24Logo variant="full" size="sm" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Documentation Center</h1>
          <p className="text-lg text-muted-foreground">Downloadable PDF guides for every HealthOS 24 module</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map(m => (
            <Card key={m.path} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(m.path)}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{m.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{m.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>{m.pages} pages</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentationHub;

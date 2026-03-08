import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Activity, Droplets, AlertTriangle } from "lucide-react";

export default function DialysisReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dialysis Reports"
        description="Adequacy metrics, infection rates, and access statistics"
        breadcrumbs={[{ label: "Dialysis", href: "/app/dialysis" }, { label: "Reports" }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Kt/V Adequacy</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">Monthly Kt/V adequacy report will be generated from completed sessions. Target Kt/V ≥ 1.2 for adequate dialysis.</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Infection Rates</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">Track catheter-related bloodstream infections (CRBSI) and vascular access infection rates per 1000 catheter-days.</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5" />Vascular Access</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">Distribution of access types (AV Fistula, Graft, Catheter). Target: ≥65% AV Fistula prevalence.</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Session Summary</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">Session completion rates, missed sessions, complications, and average UF removal per month.</p></CardContent>
        </Card>
      </div>
    </div>
  );
}

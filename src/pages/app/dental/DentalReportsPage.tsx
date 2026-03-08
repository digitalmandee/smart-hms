import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, Users, TrendingUp } from "lucide-react";

export default function DentalReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dental Reports"
        description="Revenue, procedure analytics, and dentist productivity"
        breadcrumbs={[{ label: "Dental", href: "/app/dental" }, { label: "Reports" }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Revenue by Procedure</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">Revenue breakdown by procedure type (Scaling, RCT, Extraction, Crown, Implant) with monthly trends.</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Dentist Productivity</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">Procedures completed per dentist, average treatment time, and patient satisfaction scores.</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Treatment Completion</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">Treatment plan completion rates, follow-up compliance, and recall response rates.</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Patient Demographics</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">Age distribution, common conditions, and treatment trends by demographics.</p></CardContent>
        </Card>
      </div>
    </div>
  );
}

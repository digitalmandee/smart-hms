import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

export default function OrganizationReportsPage() {
  const navigate = useNavigate();

  const reports = [
    { title: "Revenue Summary", description: "Organization-wide revenue across all branches", icon: DollarSign, path: "/app/reports/revenue" },
    { title: "Patient Statistics", description: "Patient volume and demographics", icon: Users, path: "/app/reports/patients" },
    { title: "Branch Performance", description: "Compare performance across branches", icon: BarChart3, path: "/app/reports/branches" },
    { title: "Growth Trends", description: "Historical trends and projections", icon: TrendingUp, path: "/app/reports/trends" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold">Organization Reports</h1>
          <p className="text-muted-foreground">Analytics and reports across all branches</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(report.path)}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg"><report.icon className="h-6 w-6 text-primary" /></div>
              <div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Advanced analytics and custom reports are being developed</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">More detailed reporting features including custom report builders, scheduled reports, and data exports will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

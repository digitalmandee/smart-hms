import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Bed, 
  Users, 
  TrendingUp, 
  FileText, 
  Download,
  Calendar,
  Clock,
  Activity
} from "lucide-react";
import { useIPDStats } from "@/hooks/useIPD";

const IPDReportsPage = () => {
  const { data: stats, isLoading } = useIPDStats();

  const reports = [
    {
      title: "Bed Occupancy Report",
      description: "Daily, weekly, and monthly bed occupancy statistics",
      icon: Bed,
      color: "text-blue-500",
    },
    {
      title: "Admission Statistics",
      description: "Admission trends by ward, department, and diagnosis",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Discharge Summary Report",
      description: "Discharge statistics and average length of stay",
      icon: FileText,
      color: "text-purple-500",
    },
    {
      title: "Ward-wise Census",
      description: "Current patient census by ward and bed type",
      icon: Users,
      color: "text-orange-500",
    },
    {
      title: "Average Length of Stay",
      description: "ALOS by department, diagnosis, and doctor",
      icon: Clock,
      color: "text-pink-500",
    },
    {
      title: "Daily Movement Report",
      description: "Admissions, discharges, and transfers per day",
      icon: Activity,
      color: "text-teal-500",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="IPD Reports"
        description="Generate and view inpatient department reports"
      />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bed className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Beds</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : stats?.totalBeds || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : stats?.occupiedBeds || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : stats?.totalBeds 
                    ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Admissions</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : stats?.todayAdmissions || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <report.icon className={`h-8 w-8 ${report.color}`} />
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IPDReportsPage;

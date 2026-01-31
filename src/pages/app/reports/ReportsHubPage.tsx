import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Calendar,
  Stethoscope,
  TestTube,
  Siren,
  Bed,
  Pill,
  Package,
  Receipt,
  DollarSign,
  TrendingUp,
  FileText,
  ArrowRight,
  Ticket,
  Clock,
  UserCheck,
  Shield,
} from "lucide-react";

interface ReportCard {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  module: string;
  color: string;
}

const clinicalReports: ReportCard[] = [
  {
    title: "Clinic Reports",
    description: "Token summary, daily collections, doctor earnings, peak hours analysis",
    icon: Ticket,
    path: "/app/clinic/reports",
    module: "OPD",
    color: "bg-blue-500",
  },
  {
    title: "Patient Reports",
    description: "Demographics, registration trends, patient statistics",
    icon: Users,
    path: "/app/patients/reports",
    module: "Patients",
    color: "bg-green-500",
  },
  {
    title: "Appointment Reports",
    description: "Booking trends, status breakdown, no-show analysis",
    icon: Calendar,
    path: "/app/appointments/reports",
    module: "Appointments",
    color: "bg-purple-500",
  },
  {
    title: "Doctor Reports",
    description: "Consultation volume, performance metrics, revenue per doctor",
    icon: Stethoscope,
    path: "/app/opd/reports",
    module: "OPD",
    color: "bg-indigo-500",
  },
  {
    title: "Lab Reports",
    description: "Order volume, turnaround time analysis, test categories",
    icon: TestTube,
    path: "/app/lab/reports",
    module: "Lab",
    color: "bg-cyan-500",
  },
  {
    title: "Radiology Reports",
    description: "Imaging volume by modality, TAT analysis, technician performance",
    icon: Stethoscope,
    path: "/app/radiology/reports",
    module: "Radiology",
    color: "bg-teal-500",
  },
  {
    title: "ER Reports",
    description: "Triage levels, arrival modes, disposition summary",
    icon: Siren,
    path: "/app/emergency/reports",
    module: "Emergency",
    color: "bg-red-500",
  },
];

const operationalReports: ReportCard[] = [
  {
    title: "IPD Reports",
    description: "Bed occupancy, admission trends, discharge statistics",
    icon: Bed,
    path: "/app/ipd/reports",
    module: "IPD",
    color: "bg-amber-500",
  },
  {
    title: "OT/Surgery Reports",
    description: "Surgery volume, surgeon performance, OT room utilization",
    icon: Stethoscope,
    path: "/app/ot/reports",
    module: "OT",
    color: "bg-violet-500",
  },
  {
    title: "Pharmacy Reports",
    description: "Sales trends, inventory value, top products",
    icon: Pill,
    path: "/app/pharmacy/reports",
    module: "Pharmacy",
    color: "bg-pink-500",
  },
  {
    title: "Inventory Reports",
    description: "Stock levels, reorder alerts, usage patterns",
    icon: Package,
    path: "/app/inventory/reports",
    module: "Inventory",
    color: "bg-orange-500",
  },
];

const financialReports: ReportCard[] = [
  {
    title: "Billing Reports",
    description: "Revenue analysis, payment collection, outstanding dues",
    icon: Receipt,
    path: "/app/billing/reports",
    module: "Billing",
    color: "bg-emerald-500",
  },
  {
    title: "Insurance Claims Report",
    description: "Claims status, rejection analysis, insurance company performance",
    icon: Shield,
    path: "/app/billing/claims-report",
    module: "Insurance",
    color: "bg-sky-500",
  },
  {
    title: "Department Revenue",
    description: "Revenue breakdown by OPD, IPD, Lab, Pharmacy, Surgery",
    icon: BarChart3,
    path: "/app/reports/department-revenue",
    module: "Finance",
    color: "bg-blue-600",
  },
  {
    title: "Shift-wise Collection",
    description: "Morning, Evening, Night shift revenue and cashier analysis",
    icon: Clock,
    path: "/app/reports/shift-collection",
    module: "Finance",
    color: "bg-amber-500",
  },
  {
    title: "Financial Reports",
    description: "Trial balance, P&L statement, balance sheet",
    icon: DollarSign,
    path: "/app/accounts/reports",
    module: "Accounts",
    color: "bg-teal-500",
  },
];

const hrReports: ReportCard[] = [
  {
    title: "HR Reports",
    description: "Employee statistics, workforce analytics, department distribution",
    icon: Users,
    path: "/app/hr/reports",
    module: "HR",
    color: "bg-violet-500",
  },
  {
    title: "Employee Performance",
    description: "Attendance rates, punctuality, and productivity metrics",
    icon: UserCheck,
    path: "/app/hr/reports/performance",
    module: "HR",
    color: "bg-green-500",
  },
  {
    title: "Attendance Reports",
    description: "Attendance trends, late arrivals, department-wise analysis",
    icon: Clock,
    path: "/app/hr/attendance/reports",
    module: "HR",
    color: "bg-slate-500",
  },
  {
    title: "Payroll Reports",
    description: "Salary trends, deductions, monthly payroll summary",
    icon: DollarSign,
    path: "/app/hr/payroll/reports",
    module: "HR",
    color: "bg-lime-500",
  },
];

const managementReports: ReportCard[] = [
  {
    title: "Executive Dashboard",
    description: "Complete hospital overview - revenue, departments, P&L summary",
    icon: TrendingUp,
    path: "/app/reports/executive",
    module: "Management",
    color: "bg-gradient-to-r from-purple-500 to-indigo-500",
  },
];

const ReportCardItem = ({ report }: { report: ReportCard }) => {
  const navigate = useNavigate();
  const Icon = report.icon;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer" onClick={() => navigate(report.path)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-lg ${report.color} text-white`}>
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {report.module}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
          {report.title}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {report.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-primary/10">
          View Report
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

const ReportSection = ({ title, reports }: { title: string; reports: ReportCard[] }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <BarChart3 className="h-5 w-5 text-primary" />
      <h2 className="text-xl font-semibold">{title}</h2>
      <Badge variant="outline">{reports.length} Reports</Badge>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map((report) => (
        <ReportCardItem key={report.path} report={report} />
      ))}
    </div>
  </div>
);

export default function ReportsHubPage() {
  const totalReports = clinicalReports.length + operationalReports.length + financialReports.length + hrReports.length + managementReports.length;

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Reports Hub</h1>
        <p className="text-muted-foreground">Access all reports and analytics from one central location</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalReports}</p>
                <p className="text-sm text-muted-foreground">Available Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">Report Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/20">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">CSV & Print</p>
                <p className="text-sm text-muted-foreground">Export Options</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Sections */}
      <ReportSection title="Management & Executive" reports={managementReports} />
      <ReportSection title="Clinical Reports" reports={clinicalReports} />
      <ReportSection title="Operational Reports" reports={operationalReports} />
      <ReportSection title="HR & Staff Reports" reports={hrReports} />
      <ReportSection title="Financial Reports" reports={financialReports} />
    </div>
  );
}

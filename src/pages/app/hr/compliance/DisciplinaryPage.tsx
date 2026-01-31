import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useDepartments } from "@/hooks/useHR";
import { AlertTriangle, Search, FileWarning, AlertCircle, Plus, Eye, FileText, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ACTION_TYPES = [
  { value: "verbal_warning", label: "Verbal Warning", severity: "low" },
  { value: "written_warning", label: "Written Warning", severity: "medium" },
  { value: "final_warning", label: "Final Warning", severity: "high" },
  { value: "suspension", label: "Suspension", severity: "high" },
  { value: "termination", label: "Termination", severity: "critical" },
];

export default function DisciplinaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedActionType, setSelectedActionType] = useState<string>("all");
  
  const { data: departments, isLoading: loadingDepts } = useDepartments();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Low</Badge>;
      case "medium":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Medium</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">High</Badge>;
      case "critical":
        return <Badge className="bg-red-600 text-white hover:bg-red-600">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disciplinary Actions"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Compliance", href: "/app/hr/compliance" },
          { label: "Disciplinary" }
        ]}
        actions={
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Button>
        }
      />

      {/* Coming Soon Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Coming Soon:</strong> The Disciplinary Actions module is under development. 
          This feature will allow you to track employee incidents, issue warnings, and manage 
          disciplinary procedures with full audit trails.
        </AlertDescription>
      </Alert>

      {/* Stats Cards - Placeholder */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileWarning className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Actions</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Warnings</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Type Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        {ACTION_TYPES.map((action) => (
          <Card key={action.value}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-2xl font-bold mt-1">0</p>
                </div>
                {getSeverityBadge(action.severity)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Table Placeholder */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Disciplinary Records
              </CardTitle>
              <CardDescription>Track and manage employee disciplinary actions</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  disabled
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedActionType} onValueChange={setSelectedActionType} disabled>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {ACTION_TYPES.map((action) => (
                    <SelectItem key={action.value} value={action.value}>{action.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileWarning className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Disciplinary Records</p>
            <p className="text-sm mt-1">
              The disciplinary actions module will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, Clock, CheckCircle, XCircle, Loader2, FileText } from "lucide-react";
import { useResignations, useCreateResignation, useUpdateResignation } from "@/hooks/useExitManagement";
import { useEmployees } from "@/hooks/useEmployees";
import { format, differenceInDays } from "date-fns";

const STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "completed", label: "Completed" },
];

const REASON_OPTIONS = [
  { value: "personal", label: "Personal Reasons" },
  { value: "better_opportunity", label: "Better Opportunity" },
  { value: "relocation", label: "Relocation" },
  { value: "health", label: "Health Issues" },
  { value: "family", label: "Family Reasons" },
  { value: "career_change", label: "Career Change" },
  { value: "retirement", label: "Retirement" },
  { value: "dissatisfaction", label: "Job Dissatisfaction" },
  { value: "other", label: "Other" },
];

export default function ResignationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [formData, setFormData] = useState({
    employee_id: "",
    resignation_date: new Date().toISOString().split("T")[0],
    last_working_date: "",
    reason: "personal",
    reason_details: "",
    notice_period_days: 30,
  });

  const { data: resignations, isLoading } = useResignations(statusFilter || undefined);
  const { data: employees } = useEmployees();
  const createResignation = useCreateResignation();
  const updateResignation = useUpdateResignation();

  const pendingCount = resignations?.filter((r) => r.status === "submitted" || r.status === "acknowledged").length || 0;
  const acceptedCount = resignations?.filter((r) => r.status === "accepted").length || 0;
  const completedCount = resignations?.filter((r) => r.status === "completed").length || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createResignation.mutateAsync(formData);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      resignation_date: new Date().toISOString().split("T")[0],
      last_working_date: "",
      reason: "personal",
      reason_details: "",
      notice_period_days: 30,
    });
  };

  const handleStatusChange = async (resignationId: string, newStatus: string) => {
    try {
      await updateResignation.mutateAsync({ id: resignationId, status: newStatus });
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      acknowledged: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      withdrawn: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  const getEmployeeName = (id: string) => {
    const emp = employees?.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name || ""}` : "Unknown";
  };

  const getEmployeeNumber = (id: string) => {
    const emp = employees?.find((e) => e.id === id);
    return emp?.employee_number || "";
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Resignations"
        description="Manage employee resignations and exit process"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Exit Management", href: "/app/hr/exit" },
          { label: "Resignations" },
        ]}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Resignation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Record Resignation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee *</Label>
                  <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.filter((e) => e.status === "active").map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.employee_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resignation Date *</Label>
                    <Input
                      type="date"
                      value={formData.resignation_date}
                      onChange={(e) => setFormData({ ...formData, resignation_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Working Date *</Label>
                    <Input
                      type="date"
                      value={formData.last_working_date}
                      onChange={(e) => setFormData({ ...formData, last_working_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Select value={formData.reason} onValueChange={(v) => setFormData({ ...formData, reason: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REASON_OPTIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notice Period (Days)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.notice_period_days}
                      onChange={(e) => setFormData({ ...formData, notice_period_days: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Details / Notes</Label>
                  <Textarea
                    value={formData.reason_details}
                    onChange={(e) => setFormData({ ...formData, reason_details: e.target.value })}
                    placeholder="Additional details about the resignation..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createResignation.isPending}>
                    {createResignation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Record Resignation
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Resignations</p>
                <p className="text-2xl font-bold">{resignations?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{acceptedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resignations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resignation Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Emp. Number</TableHead>
                <TableHead>Resignation Date</TableHead>
                <TableHead>Last Working Date</TableHead>
                <TableHead>Notice Period</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : resignations && resignations.length > 0 ? (
                resignations.map((resignation) => (
                  <TableRow key={resignation.id}>
                    <TableCell className="font-medium">{getEmployeeName(resignation.employee_id)}</TableCell>
                    <TableCell>{getEmployeeNumber(resignation.employee_id)}</TableCell>
                    <TableCell>{format(new Date(resignation.resignation_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{format(new Date(resignation.last_working_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {differenceInDays(new Date(resignation.last_working_date), new Date(resignation.resignation_date))} days
                    </TableCell>
                    <TableCell className="capitalize">{resignation.primary_reason?.replace("_", " ") || "-"}</TableCell>
                    <TableCell>{getStatusBadge(resignation.status)}</TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={resignation.status}
                        onValueChange={(v) => handleStatusChange(resignation.id, v)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No resignations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEmployees, useDepartments } from "@/hooks/useHR";
import { useMedicalFitnessRecords, useCreateMedicalFitnessRecord } from "@/hooks/useCompliance";
import { HeartPulse, Search, Users, AlertTriangle, CheckCircle, Clock, Plus } from "lucide-react";
import { differenceInDays, format } from "date-fns";

export default function MedicalFitnessPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { data: fitnessRecords, isLoading: loadingRecords } = useMedicalFitnessRecords();
  const createRecord = useCreateMedicalFitnessRecord();

  const [form, setForm] = useState({
    employee_id: "",
    examination_date: "",
    examination_type: "annual" as const,
    examiner_name: "",
    examiner_facility: "",
    fitness_status: "fit" as const,
    restrictions: "",
    next_examination_date: "",
  });

  const getEmployeeName = (empId: string) => {
    const emp = employees?.find(e => e.id === empId);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const getEmployeeNumber = (empId: string) => {
    return employees?.find(e => e.id === empId)?.employee_number || "";
  };

  const getEmployeeDept = (empId: string) => {
    return employees?.find(e => e.id === empId)?.department_id || null;
  };

  const getDepartmentName = (deptId: string | null) => {
    if (!deptId) return "N/A";
    return departments?.find(d => d.id === deptId)?.name || "Unknown";
  };

  const getRecordStatus = (record: any) => {
    if (!record.next_examination_date) return "valid";
    const days = differenceInDays(new Date(record.next_examination_date), new Date());
    if (days < 0) return "expired";
    if (days <= 30) return "expiring";
    return "valid";
  };

  const enrichedRecords = fitnessRecords?.map(record => ({
    ...record,
    status: getRecordStatus(record),
    daysLeft: record.next_examination_date 
      ? differenceInDays(new Date(record.next_examination_date), new Date()) 
      : null,
  })) || [];

  const filteredRecords = enrichedRecords.filter(record => {
    const empName = getEmployeeName(record.employee_id).toLowerCase();
    const empNum = getEmployeeNumber(record.employee_id).toLowerCase();
    const matchesSearch = empName.includes(searchQuery.toLowerCase()) || empNum.includes(searchQuery.toLowerCase());
    const deptId = getEmployeeDept(record.employee_id);
    const matchesDept = selectedDepartment === "all" || deptId === selectedDepartment;
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const expiredCount = enrichedRecords.filter(e => e.status === "expired").length;
  const expiringCount = enrichedRecords.filter(e => e.status === "expiring").length;
  const validCount = enrichedRecords.filter(e => e.status === "valid").length;

  const isLoading = loadingEmployees || loadingDepts || loadingRecords;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Valid</Badge>;
      case "expiring": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Expiring Soon</Badge>;
      case "expired": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Expired</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getFitnessStatusBadge = (status: string) => {
    switch (status) {
      case "fit": return <Badge className="bg-green-100 text-green-700">Fit</Badge>;
      case "fit_with_restrictions": return <Badge className="bg-blue-100 text-blue-700">Fit (Restricted)</Badge>;
      case "temporarily_unfit": return <Badge className="bg-amber-100 text-amber-700">Temp. Unfit</Badge>;
      case "permanently_unfit": return <Badge className="bg-red-100 text-red-700">Perm. Unfit</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const handleSubmit = () => {
    if (!form.employee_id || !form.examination_date || !form.fitness_status) return;
    createRecord.mutate({
      employee_id: form.employee_id,
      examination_date: form.examination_date,
      examination_type: form.examination_type,
      examiner_name: form.examiner_name || null,
      examiner_facility: form.examiner_facility || null,
      fitness_status: form.fitness_status,
      restrictions: form.restrictions || null,
      next_examination_date: form.next_examination_date || null,
    }, {
      onSuccess: () => {
        setShowAddDialog(false);
        setForm({ employee_id: "", examination_date: "", examination_type: "annual", examiner_name: "", examiner_facility: "", fitness_status: "fit", restrictions: "", next_examination_date: "" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Fitness Examinations"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Compliance", href: "/app/hr/compliance" },
          { label: "Medical Fitness" }
        ]}
        actions={
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Examination
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{enrichedRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valid</p>
                <p className="text-2xl font-bold">{validCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiring (30 days)</p>
                <p className="text-2xl font-bold">{expiringCount}</p>
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
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">{expiredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <HeartPulse className="h-5 w-5" />
                Medical Fitness Records
              </CardTitle>
              <CardDescription>Manage employee medical examination records</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept) => (<SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HeartPulse className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Medical Fitness Records</p>
              <p className="text-sm mt-1">Click "Record Examination" to add a new record.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Exam Date</TableHead>
                  <TableHead>Next Exam</TableHead>
                  <TableHead>Fitness Status</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getEmployeeName(record.employee_id)}</p>
                        <p className="text-xs text-muted-foreground">{getEmployeeNumber(record.employee_id)}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getDepartmentName(getEmployeeDept(record.employee_id))}</TableCell>
                    <TableCell className="capitalize">{record.examination_type?.replace('_', ' ')}</TableCell>
                    <TableCell>{format(new Date(record.examination_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {record.next_examination_date ? (
                        <div>
                          <p>{format(new Date(record.next_examination_date), "MMM d, yyyy")}</p>
                          {record.daysLeft !== null && record.daysLeft >= 0 && (
                            <p className="text-xs text-muted-foreground">{record.daysLeft} days left</p>
                          )}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{getFitnessStatusBadge(record.fitness_status)}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Medical Examination</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Employee *</Label>
              <Select value={form.employee_id} onValueChange={(v) => setForm(f => ({ ...f, employee_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees?.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_number})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Exam Date *</Label>
                <Input type="date" value={form.examination_date} onChange={(e) => setForm(f => ({ ...f, examination_date: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Exam Type</Label>
                <Select value={form.examination_type} onValueChange={(v: any) => setForm(f => ({ ...f, examination_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="pre_employment">Pre-Employment</SelectItem>
                    <SelectItem value="return_to_work">Return to Work</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Examiner Name</Label>
                <Input value={form.examiner_name} onChange={(e) => setForm(f => ({ ...f, examiner_name: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Facility</Label>
                <Input value={form.examiner_facility} onChange={(e) => setForm(f => ({ ...f, examiner_facility: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fitness Status *</Label>
                <Select value={form.fitness_status} onValueChange={(v: any) => setForm(f => ({ ...f, fitness_status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fit">Fit</SelectItem>
                    <SelectItem value="fit_with_restrictions">Fit with Restrictions</SelectItem>
                    <SelectItem value="temporarily_unfit">Temporarily Unfit</SelectItem>
                    <SelectItem value="permanently_unfit">Permanently Unfit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Next Exam Date</Label>
                <Input type="date" value={form.next_examination_date} onChange={(e) => setForm(f => ({ ...f, next_examination_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Restrictions / Notes</Label>
              <Textarea value={form.restrictions} onChange={(e) => setForm(f => ({ ...f, restrictions: e.target.value }))} placeholder="Any restrictions or conditions..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createRecord.isPending || !form.employee_id || !form.examination_date}>
              {createRecord.isPending ? "Saving..." : "Save Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

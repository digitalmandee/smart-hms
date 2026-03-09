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
import { useVaccinationRecords, useCreateVaccinationRecord } from "@/hooks/useCompliance";
import { Syringe, Search, Users, CheckCircle, Clock, Plus } from "lucide-react";
import { differenceInDays, format } from "date-fns";

const VACCINE_TYPES = [
  "Hepatitis B", "Influenza", "Tetanus (Td/Tdap)", "MMR", "COVID-19",
  "Varicella", "Meningococcal", "Other"
];

export default function VaccinationsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedVaccine, setSelectedVaccine] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { data: vaccinations, isLoading: loadingVax } = useVaccinationRecords();
  const createRecord = useCreateVaccinationRecord();

  const [form, setForm] = useState({
    employee_id: "",
    vaccine_name: "",
    dose_number: 1,
    administered_date: "",
    administered_by: "",
    batch_number: "",
    next_due_date: "",
    notes: "",
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

  const records = vaccinations || [];

  const filteredRecords = records.filter(record => {
    const empName = getEmployeeName(record.employee_id).toLowerCase();
    const empNum = getEmployeeNumber(record.employee_id).toLowerCase();
    const matchesSearch = empName.includes(searchQuery.toLowerCase()) || empNum.includes(searchQuery.toLowerCase());
    const deptId = getEmployeeDept(record.employee_id);
    const matchesDept = selectedDepartment === "all" || deptId === selectedDepartment;
    const matchesVaccine = selectedVaccine === "all" || record.vaccine_name === selectedVaccine;
    return matchesSearch && matchesDept && matchesVaccine;
  });

  const totalRecords = records.length;
  const uniqueEmployees = new Set(records.map(r => r.employee_id)).size;
  const dueRecords = records.filter(r => r.next_due_date && differenceInDays(new Date(r.next_due_date), new Date()) <= 30 && differenceInDays(new Date(r.next_due_date), new Date()) >= 0).length;
  const overdueRecords = records.filter(r => r.next_due_date && differenceInDays(new Date(r.next_due_date), new Date()) < 0).length;

  const isLoading = loadingEmployees || loadingDepts || loadingVax;

  const handleSubmit = () => {
    if (!form.employee_id || !form.vaccine_name || !form.administered_date) return;
    createRecord.mutate({
      employee_id: form.employee_id,
      vaccine_name: form.vaccine_name,
      dose_number: form.dose_number,
      administered_date: form.administered_date,
      administered_by: form.administered_by || null,
      batch_number: form.batch_number || null,
      next_due_date: form.next_due_date || null,
      notes: form.notes || null,
    }, {
      onSuccess: () => {
        setShowAddDialog(false);
        setForm({ employee_id: "", vaccine_name: "", dose_number: 1, administered_date: "", administered_by: "", batch_number: "", next_due_date: "", notes: "" });
      }
    });
  };

  const getDueBadge = (nextDueDate: string | null) => {
    if (!nextDueDate) return null;
    const days = differenceInDays(new Date(nextDueDate), new Date());
    if (days < 0) return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Overdue</Badge>;
    if (days <= 30) return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Due Soon</Badge>;
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Vaccinations"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Compliance", href: "/app/hr/compliance" },
          { label: "Vaccinations" }
        ]}
        actions={
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Vaccination
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10"><Syringe className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10"><Users className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Employees Vaccinated</p>
                <p className="text-2xl font-bold">{uniqueEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10"><Clock className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Due Soon (30d)</p>
                <p className="text-2xl font-bold">{dueRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-red-500/10"><CheckCircle className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueRecords}</p>
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
              <CardTitle className="text-lg flex items-center gap-2"><Syringe className="h-5 w-5" /> Vaccination Records</CardTitle>
              <CardDescription>Individual employee vaccination records</CardDescription>
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
                  {departments?.map(dept => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedVaccine} onValueChange={setSelectedVaccine}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Vaccines" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vaccines</SelectItem>
                  {VACCINE_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
              <Syringe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Vaccination Records</p>
              <p className="text-sm mt-1">Click "Record Vaccination" to add a new record.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Vaccine</TableHead>
                  <TableHead>Dose #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Batch #</TableHead>
                  <TableHead>Next Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getEmployeeName(record.employee_id)}</p>
                        <p className="text-xs text-muted-foreground">{getEmployeeNumber(record.employee_id)}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getDepartmentName(getEmployeeDept(record.employee_id))}</TableCell>
                    <TableCell className="font-medium">{record.vaccine_name}</TableCell>
                    <TableCell>{record.dose_number}</TableCell>
                    <TableCell>{format(new Date(record.administered_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{record.batch_number || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {record.next_due_date ? format(new Date(record.next_due_date), "MMM d, yyyy") : "—"}
                        {getDueBadge(record.next_due_date)}
                      </div>
                    </TableCell>
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
          <DialogHeader><DialogTitle>Record Vaccination</DialogTitle></DialogHeader>
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
                <Label>Vaccine Name *</Label>
                <Select value={form.vaccine_name} onValueChange={(v) => setForm(f => ({ ...f, vaccine_name: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select vaccine" /></SelectTrigger>
                  <SelectContent>
                    {VACCINE_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Dose #</Label>
                <Input type="number" min={1} value={form.dose_number} onChange={(e) => setForm(f => ({ ...f, dose_number: parseInt(e.target.value) || 1 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date Administered *</Label>
                <Input type="date" value={form.administered_date} onChange={(e) => setForm(f => ({ ...f, administered_date: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Administered By</Label>
                <Input value={form.administered_by} onChange={(e) => setForm(f => ({ ...f, administered_by: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Batch Number</Label>
                <Input value={form.batch_number} onChange={(e) => setForm(f => ({ ...f, batch_number: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Next Due Date</Label>
                <Input type="date" value={form.next_due_date} onChange={(e) => setForm(f => ({ ...f, next_due_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createRecord.isPending || !form.employee_id || !form.vaccine_name || !form.administered_date}>
              {createRecord.isPending ? "Saving..." : "Save Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

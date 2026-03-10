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
import { useDisciplinaryActions, useCreateDisciplinaryAction } from "@/hooks/useCompliance";
import { AlertTriangle, Search, FileWarning, AlertCircle, Plus, Eye, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const ACTION_TYPES = [
  { value: "verbal_warning", label: "Verbal Warning", severity: "low" },
  { value: "written_warning", label: "Written Warning", severity: "medium" },
  { value: "final_warning", label: "Final Warning", severity: "high" },
  { value: "suspension", label: "Suspension", severity: "high" },
  { value: "demotion", label: "Demotion", severity: "high" },
  { value: "termination", label: "Termination", severity: "critical" },
];

export default function DisciplinaryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedActionType, setSelectedActionType] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { data: actions, isLoading: loadingActions } = useDisciplinaryActions();
  const createAction = useCreateDisciplinaryAction();

  const [form, setForm] = useState({
    employee_id: "",
    action_type: "verbal_warning" as const,
    incident_date: "",
    incident_description: "",
    policy_violated: "",
    action_taken: "",
    issued_date: new Date().toISOString().split('T')[0],
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

  const records = actions || [];

  const filteredRecords = records.filter(record => {
    const empName = getEmployeeName(record.employee_id).toLowerCase();
    const empNum = getEmployeeNumber(record.employee_id).toLowerCase();
    const matchesSearch = empName.includes(searchQuery.toLowerCase()) || empNum.includes(searchQuery.toLowerCase());
    const deptId = getEmployeeDept(record.employee_id);
    const matchesDept = selectedDepartment === "all" || deptId === selectedDepartment;
    const matchesAction = selectedActionType === "all" || record.action_type === selectedActionType;
    return matchesSearch && matchesDept && matchesAction;
  });

  const totalCount = records.length;
  const pendingAck = records.filter(r => !r.employee_acknowledged).length;
  const appealCount = records.filter(r => r.appeal_submitted).length;
  const warningCount = records.filter(r => ["verbal_warning", "written_warning", "final_warning"].includes(r.action_type)).length;

  const isLoading = loadingEmployees || loadingDepts || loadingActions;

  const getSeverityBadge = (actionType: string) => {
    const action = ACTION_TYPES.find(a => a.value === actionType);
    const severity = action?.severity || "low";
    switch (severity) {
      case "low": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{action?.label}</Badge>;
      case "medium": return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{action?.label}</Badge>;
      case "high": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{action?.label}</Badge>;
      case "critical": return <Badge className="bg-red-600 text-white hover:bg-red-600">{action?.label}</Badge>;
      default: return <Badge variant="secondary">{actionType}</Badge>;
    }
  };

  const handleSubmit = () => {
    if (!form.employee_id || !form.incident_date || !form.incident_description || !form.action_taken) return;
    createAction.mutate({
      employee_id: form.employee_id,
      action_type: form.action_type,
      incident_date: form.incident_date,
      incident_description: form.incident_description,
      policy_violated: form.policy_violated || null,
      action_taken: form.action_taken,
      issued_date: form.issued_date,
    }, {
      onSuccess: () => {
        setShowAddDialog(false);
        setForm({ employee_id: "", action_type: "verbal_warning", incident_date: "", incident_description: "", policy_violated: "", action_taken: "", issued_date: new Date().toISOString().split('T')[0] });
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disciplinary Actions"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Compliance", href: "/app/hr/compliance" },
          { label: "Disciplinary" }
        ]}
        actions={
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10"><FileWarning className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10"><AlertCircle className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Acknowledgment</p>
                <p className="text-2xl font-bold">{pendingAck}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10"><Eye className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Appeals</p>
                <p className="text-2xl font-bold">{appealCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-red-500/10"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Active Warnings</p>
                <p className="text-2xl font-bold">{warningCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Type Summary */}
      <div className="grid gap-4 md:grid-cols-6">
        {ACTION_TYPES.map(action => {
          const count = records.filter(r => r.action_type === action.value).length;
          return (
            <Card key={action.value}>
              <CardContent className="pt-4 pb-4">
                <div className="text-center">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Disciplinary Records</CardTitle>
              <CardDescription>Track and manage employee disciplinary actions</CardDescription>
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
              <Select value={selectedActionType} onValueChange={setSelectedActionType}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Actions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {ACTION_TYPES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
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
              <FileWarning className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Disciplinary Records</p>
              <p className="text-sm mt-1">Click "New Incident" to record a disciplinary action.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Action Type</TableHead>
                  <TableHead>Incident Date</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Policy Violated</TableHead>
                  <TableHead>Acknowledged</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableCell>{getSeverityBadge(record.action_type)}</TableCell>
                    <TableCell>{format(new Date(record.incident_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{format(new Date(record.issued_date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{record.policy_violated || "—"}</TableCell>
                    <TableCell>
                      {record.employee_acknowledged 
                        ? <Badge className="bg-green-100 text-green-700">Yes</Badge>
                        : <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => {
                        const empName = getEmployeeName(record.employee_id);
                        const actionLabel = ACTION_TYPES.find(a => a.value === record.action_type)?.label || record.action_type;
                        // Navigate to HR Letters with pre-filled context
                        navigate("/app/hr/letters", { state: { 
                          prefill: true,
                          letter_type: "warning_letter",
                          subject: `${actionLabel} - ${empName}`,
                          body: `Dear ${empName},\n\nThis letter serves as a formal ${actionLabel.toLowerCase()} regarding the incident on ${format(new Date(record.incident_date), "MMMM d, yyyy")}.\n\nIncident: ${record.incident_description}\n\n${record.policy_violated ? `Policy Violated: ${record.policy_violated}\n\n` : ""}Action Taken: ${record.action_taken}\n\nPlease acknowledge receipt of this letter.\n\nRegards,\nHR Department`
                        }});
                      }}>
                        <FileText className="h-3 w-3 mr-1" />Generate Letter
                      </Button>
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
          <DialogHeader><DialogTitle>Record Disciplinary Action</DialogTitle></DialogHeader>
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
                <Label>Action Type *</Label>
                <Select value={form.action_type} onValueChange={(v: any) => setForm(f => ({ ...f, action_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Incident Date *</Label>
                <Input type="date" value={form.incident_date} onChange={(e) => setForm(f => ({ ...f, incident_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Incident Description *</Label>
              <Textarea value={form.incident_description} onChange={(e) => setForm(f => ({ ...f, incident_description: e.target.value }))} placeholder="Describe the incident..." />
            </div>
            <div className="grid gap-2">
              <Label>Policy Violated</Label>
              <Input value={form.policy_violated} onChange={(e) => setForm(f => ({ ...f, policy_violated: e.target.value }))} placeholder="e.g. Code of Conduct Section 4.2" />
            </div>
            <div className="grid gap-2">
              <Label>Action Taken *</Label>
              <Textarea value={form.action_taken} onChange={(e) => setForm(f => ({ ...f, action_taken: e.target.value }))} placeholder="Describe the action taken..." />
            </div>
            <div className="grid gap-2">
              <Label>Issued Date</Label>
              <Input type="date" value={form.issued_date} onChange={(e) => setForm(f => ({ ...f, issued_date: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createAction.isPending || !form.employee_id || !form.incident_date || !form.incident_description || !form.action_taken}>
              {createAction.isPending ? "Saving..." : "Save Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

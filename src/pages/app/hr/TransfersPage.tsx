import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useTransfers, useCreateTransfer, useUpdateTransferStatus } from "@/hooks/useTransfers";
import { useEmployees, useDepartments } from "@/hooks/useHR";
import { Plus, ArrowRightLeft, CheckCircle, XCircle, Clock, Play } from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<string, { color: string; icon: any }> = {
  requested: { color: "bg-blue-100 text-blue-800", icon: Clock },
  approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
  executed: { color: "bg-purple-100 text-purple-800", icon: Play },
};

export default function TransfersPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: transfers, isLoading } = useTransfers(statusFilter !== "all" ? statusFilter : undefined);
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const createTransfer = useCreateTransfer();
  const updateStatus = useUpdateTransferStatus();

  const [form, setForm] = useState({
    employee_id: "", from_department_id: "", to_department_id: "",
    transfer_date: new Date().toISOString().split("T")[0],
    effective_date: "", reason: "",
  });

  const handleSubmit = () => {
    if (!form.employee_id || !form.to_department_id || !form.transfer_date) return;
    createTransfer.mutate({
      ...form,
      from_department_id: form.from_department_id || undefined,
      effective_date: form.effective_date || undefined,
    }, {
      onSuccess: () => {
        setShowDialog(false);
        setForm({ employee_id: "", from_department_id: "", to_department_id: "", transfer_date: new Date().toISOString().split("T")[0], effective_date: "", reason: "" });
      },
    });
  };

  const handleEmployeeChange = (empId: string) => {
    const emp = employees?.find((e: any) => e.id === empId);
    setForm(f => ({ ...f, employee_id: empId, from_department_id: emp?.department_id || "" }));
  };

  const stats = {
    total: transfers?.length || 0,
    requested: transfers?.filter((t: any) => t.status === "requested").length || 0,
    approved: transfers?.filter((t: any) => t.status === "approved").length || 0,
    executed: transfers?.filter((t: any) => t.status === "executed").length || 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Employee Transfers" description="Manage staff transfers between departments and branches"
        actions={<Button onClick={() => setShowDialog(true)}><Plus className="h-4 w-4 mr-2" />New Transfer</Button>} />
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Transfers", value: stats.total, icon: ArrowRightLeft, color: "text-primary" },
          { label: "Pending", value: stats.requested, icon: Clock, color: "text-amber-600" },
          { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-green-600" },
          { label: "Executed", value: stats.executed, icon: Play, color: "text-purple-600" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>
                <s.icon className={`h-8 w-8 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transfer Records</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="executed">Executed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !transfers?.length ? (
            <div className="text-center py-8 text-muted-foreground">No transfer records found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Transfer Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t: any) => {
                  const sc = statusConfig[t.status] || statusConfig.requested;
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        {t.employee?.first_name} {t.employee?.last_name}
                        <div className="text-xs text-muted-foreground">{t.employee?.employee_number}</div>
                      </TableCell>
                      <TableCell>{t.from_department?.name || "—"}</TableCell>
                      <TableCell>{t.to_department?.name || "—"}</TableCell>
                      <TableCell>{format(new Date(t.transfer_date), "dd MMM yyyy")}</TableCell>
                      <TableCell><Badge className={sc.color}>{t.status}</Badge></TableCell>
                      <TableCell>
                        {t.status === "requested" && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: t.id, status: "approved" })}>
                              <CheckCircle className="h-3 w-3 mr-1" />Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: t.id, status: "rejected" })}>
                              <XCircle className="h-3 w-3 mr-1" />Reject
                            </Button>
                          </div>
                        )}
                        {t.status === "approved" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: t.id, status: "executed" })}>
                            <Play className="h-3 w-3 mr-1" />Execute
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Transfer Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee *</Label>
              <Select value={form.employee_id} onValueChange={handleEmployeeChange}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees?.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_number})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>From Department</Label>
                <Select value={form.from_department_id} onValueChange={v => setForm(f => ({ ...f, from_department_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Current dept" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>To Department *</Label>
                <Select value={form.to_department_id} onValueChange={v => setForm(f => ({ ...f, to_department_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Target dept" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Transfer Date *</Label><Input type="date" value={form.transfer_date} onChange={e => setForm(f => ({ ...f, transfer_date: e.target.value }))} /></div>
              <div><Label>Effective Date</Label><Input type="date" value={form.effective_date} onChange={e => setForm(f => ({ ...f, effective_date: e.target.value }))} /></div>
            </div>
            <div><Label>Reason</Label><Textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Reason for transfer" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createTransfer.isPending}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

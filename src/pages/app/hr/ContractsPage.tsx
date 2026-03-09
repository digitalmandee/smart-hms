import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEmployeeContracts, useCreateContract, useUpdateContractStatus, CONTRACT_TYPES } from "@/hooks/useContracts";
import { useEmployees } from "@/hooks/useHR";
import { useTranslation } from "@/lib/i18n";
import { FileText, Plus, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { format, parseISO, differenceInDays, isBefore } from "date-fns";

export default function ContractsPage() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    employee_id: "", contract_type: "permanent", start_date: "",
    end_date: "", probation_end_date: "", salary_amount: "", notes: "",
  });

  const { data: contracts, isLoading } = useEmployeeContracts();
  const { data: employees } = useEmployees();
  const createContract = useCreateContract();
  const updateStatus = useUpdateContractStatus();

  const handleCreate = async () => {
    await createContract.mutateAsync({
      employee_id: form.employee_id,
      contract_type: form.contract_type,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
      probation_end_date: form.probation_end_date || undefined,
      salary_amount: form.salary_amount ? Number(form.salary_amount) : undefined,
      notes: form.notes || undefined,
    });
    setIsDialogOpen(false);
    setForm({ employee_id: "", contract_type: "permanent", start_date: "", end_date: "", probation_end_date: "", salary_amount: "", notes: "" });
  };

  if (isLoading) {
    return <div className="space-y-6"><PageHeader title="Contract Management" description="Track employee contracts" /><Skeleton className="h-64" /></div>;
  }

  const today = new Date();
  const active = (contracts || []).filter((c: any) => c.status === "active").length;
  const expiring = (contracts || []).filter((c: any) => c.end_date && differenceInDays(parseISO(c.end_date), today) <= 30 && differenceInDays(parseISO(c.end_date), today) >= 0).length;
  const probation = (contracts || []).filter((c: any) => c.probation_end_date && !c.is_probation_completed).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Contract Management" subtitle="Track employee contracts, renewals, and probation periods">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Contract</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Contract</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Employee</Label>
                <Select value={form.employee_id} onValueChange={v => setForm({ ...form, employee_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>{(employees || []).map(e => <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_number})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Contract Type</Label>
                <Select value={form.contract_type} onValueChange={v => setForm({ ...form, contract_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CONTRACT_TYPES.map(ct => <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
                <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Probation End</Label><Input type="date" value={form.probation_end_date} onChange={e => setForm({ ...form, probation_end_date: e.target.value })} /></div>
                <div><Label>Salary Amount</Label><Input type="number" value={form.salary_amount} onChange={e => setForm({ ...form, salary_amount: e.target.value })} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button className="w-full" onClick={handleCreate} disabled={createContract.isPending || !form.employee_id || !form.start_date}>
                {createContract.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Create Contract
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{(contracts || []).length}</div><p className="text-sm text-muted-foreground">Total Contracts</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-600">{active}</div><p className="text-sm text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-amber-600">{expiring}</div><p className="text-sm text-muted-foreground">Expiring Soon</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-blue-600">{probation}</div><p className="text-sm text-muted-foreground">In Probation</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Probation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(contracts || []).length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No contracts found</TableCell></TableRow>
              ) : (
                (contracts || []).map((contract: any) => {
                  const isExpiringSoon = contract.end_date && differenceInDays(parseISO(contract.end_date), today) <= 30 && differenceInDays(parseISO(contract.end_date), today) >= 0;
                  const isExpired = contract.end_date && isBefore(parseISO(contract.end_date), today);

                  return (
                    <TableRow key={contract.id} className={isExpired ? "bg-destructive/5" : isExpiringSoon ? "bg-amber-500/5" : ""}>
                      <TableCell>
                        <div>{contract.employee?.first_name} {contract.employee?.last_name}</div>
                        <div className="text-xs text-muted-foreground">{contract.employee?.employee_number}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{CONTRACT_TYPES.find(c => c.value === contract.contract_type)?.label || contract.contract_type}</Badge></TableCell>
                      <TableCell>{format(parseISO(contract.start_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{contract.end_date ? format(parseISO(contract.end_date), "MMM d, yyyy") : "—"}</TableCell>
                      <TableCell>
                        {contract.probation_end_date ? (
                          <div className="flex items-center gap-1">
                            {contract.is_probation_completed ? (
                              <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>
                            ) : (
                              <Badge variant="outline" className="border-amber-500 text-amber-600">
                                {format(parseISO(contract.probation_end_date), "MMM d")}
                              </Badge>
                            )}
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={contract.status === "active" ? "default" : contract.status === "expired" ? "destructive" : "secondary"}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contract.probation_end_date && !contract.is_probation_completed && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: contract.id, is_probation_completed: true })}>
                            <CheckCircle className="h-4 w-4 mr-1" />Confirm
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

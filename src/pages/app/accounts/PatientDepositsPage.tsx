import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { usePatientDeposits, useCreatePatientDeposit } from "@/hooks/usePatientDeposits";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export default function PatientDepositsPage() {
  const { data: deposits, isLoading } = usePatientDeposits();
  const createMutation = useCreatePatientDeposit();
  const { formatCurrency } = useCurrencyFormatter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patient_id: "", amount: "", type: "deposit", notes: "", reference_number: "" });

  const handleCreate = () => {
    createMutation.mutate({
      patient_id: form.patient_id,
      amount: parseFloat(form.amount),
      type: form.type,
      notes: form.notes,
      reference_number: form.reference_number,
    }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ patient_id: "", amount: "", type: "deposit", notes: "", reference_number: "" });
      },
    });
  };

  const totalDeposits = (deposits || []).filter((d: any) => d.type === "deposit").reduce((s: number, d: any) => s + Number(d.amount), 0);
  const totalRefunds = (deposits || []).filter((d: any) => d.type === "refund").reduce((s: number, d: any) => s + Number(d.amount), 0);
  const totalApplied = (deposits || []).filter((d: any) => d.type === "applied").reduce((s: number, d: any) => s + Number(d.amount), 0);
  const outstanding = totalDeposits - totalRefunds - totalApplied;

  return (
    <div>
      <PageHeader
        title="Patient Deposits"
        description="Manage advance deposits, refunds, and patient wallet"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Patient Deposits" },
        ]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Record Deposit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Patient Deposit</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Patient ID</Label>
                  <Input value={form.patient_id} onChange={e => setForm(p => ({ ...p, patient_id: e.target.value }))} placeholder="Patient UUID" />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit (Receive)</SelectItem>
                      <SelectItem value="refund">Refund (Return)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <Label>Reference #</Label>
                  <Input value={form.reference_number} onChange={e => setForm(p => ({ ...p, reference_number: e.target.value }))} placeholder="Receipt or reference number" />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes" />
                </div>
                <Button onClick={handleCreate} disabled={!form.patient_id || !form.amount || createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "Recording..." : "Record"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Deposits</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600 flex items-center gap-2"><ArrowDownCircle className="h-5 w-5" />{formatCurrency(totalDeposits)}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Refunds</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600 flex items-center gap-2"><ArrowUpCircle className="h-5 w-5" />{formatCurrency(totalRefunds)}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Applied to Invoices</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalApplied)}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Outstanding Balance</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600 flex items-center gap-2"><Wallet className="h-5 w-5" />{formatCurrency(outstanding)}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" />Deposit Transactions</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(deposits || []).map((dep: any) => (
                    <TableRow key={dep.id}>
                      <TableCell>{format(new Date(dep.created_at), "dd MMM yyyy")}</TableCell>
                      <TableCell>{dep.patients ? `${dep.patients.first_name} ${dep.patients.last_name}` : dep.patient_id?.slice(0, 8)}</TableCell>
                      <TableCell>
                        <Badge variant={dep.type === "deposit" ? "default" : dep.type === "refund" ? "destructive" : "secondary"}>
                          {dep.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(dep.amount)}</TableCell>
                      <TableCell>{dep.reference_number || "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{dep.notes || "—"}</TableCell>
                      <TableCell><Badge variant="outline">{dep.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {(!deposits || deposits.length === 0) && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No deposits recorded</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

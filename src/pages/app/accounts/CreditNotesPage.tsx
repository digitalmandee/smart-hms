import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle, FileText } from "lucide-react";
import { useCreditNotes, useCreateCreditNote, useApproveCreditNote } from "@/hooks/useCreditNotes";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreditNotesPage() {
  const { data: notes, isLoading } = useCreditNotes();
  const createMutation = useCreateCreditNote();
  const approveMutation = useApproveCreditNote();
  const { formatCurrency } = useCurrencyFormatter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", tax_amount: "", reason: "", note_type: "credit" });

  const handleCreate = () => {
    createMutation.mutate({
      amount: parseFloat(form.amount),
      tax_amount: parseFloat(form.tax_amount || "0"),
      reason: form.reason,
      note_type: form.note_type,
    }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ amount: "", tax_amount: "", reason: "", note_type: "credit" });
      },
    });
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "default";
    if (s === "draft") return "secondary";
    return "outline";
  };

  return (
    <div>
      <PageHeader
        title="Credit & Debit Notes"
        description="Issue credit notes for refunds, returns, or adjustments"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Credit Notes" },
        ]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Note</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Credit/Debit Note</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Select value={form.note_type} onValueChange={v => setForm(p => ({ ...p, note_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit Note</SelectItem>
                      <SelectItem value="debit">Debit Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <Label>Tax Amount</Label>
                  <Input type="number" value={form.tax_amount} onChange={e => setForm(p => ({ ...p, tax_amount: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <Label>Reason</Label>
                  <Textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for credit/debit note" />
                </div>
                <Button onClick={handleCreate} disabled={!form.amount || createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "Creating..." : "Create Note"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />All Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Note #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(notes || []).map((note: any) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-mono text-sm">{note.credit_note_number}</TableCell>
                    <TableCell>
                      <Badge variant={note.note_type === "debit" ? "destructive" : "default"}>
                        {note.note_type === "debit" ? "Debit" : "Credit"}
                      </Badge>
                    </TableCell>
                    <TableCell>{note.invoices?.invoice_number || "—"}</TableCell>
                    <TableCell>{note.patients ? `${note.patients.first_name} ${note.patients.last_name}` : "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(note.total_amount)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{note.reason || "—"}</TableCell>
                    <TableCell><Badge variant={statusColor(note.status) as any}>{note.status}</Badge></TableCell>
                    <TableCell>{format(new Date(note.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      {note.status === "draft" && (
                        <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(note.id)} disabled={approveMutation.isPending}>
                          <CheckCircle className="h-3 w-3 mr-1" />Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!notes || notes.length === 0) && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No credit/debit notes found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

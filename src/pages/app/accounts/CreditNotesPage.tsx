import { useState, useEffect } from "react";
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
import { Plus, CheckCircle, FileText, Search } from "lucide-react";
import { useCreditNotes, useCreateCreditNote, useApproveCreditNote } from "@/hooks/useCreditNotes";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientSearch } from "@/components/appointments/PatientSearch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/components/appointments/PatientSearch";

interface SelectedPatient {
  id: string;
  first_name: string;
  last_name: string | null;
  patient_number: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
}

interface InvoiceOption {
  id: string;
  invoice_number: string;
  total_amount: number;
  patient_id: string;
  patients: { first_name: string; last_name: string | null } | null;
}

function InvoiceSelector({ onSelect, selectedInvoice, patientId }: {
  onSelect: (inv: InvoiceOption | null) => void;
  selectedInvoice: InvoiceOption | null;
  patientId?: string;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<InvoiceOption[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { profile } = useAuth();
  const { formatCurrency } = useCurrencyFormatter();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const doSearch = async () => {
      if (!profile?.organization_id || debouncedSearch.length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        let query = supabase
          .from("invoices")
          .select("id, invoice_number, total_amount, patient_id, patients(first_name, last_name)")
          .eq("organization_id", profile.organization_id)
          .ilike("invoice_number", `%${debouncedSearch}%`)
          .limit(10);
        if (patientId) query = query.eq("patient_id", patientId);
        const { data, error } = await query;
        if (error) throw error;
        setResults((data as any) || []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    doSearch();
  }, [debouncedSearch, profile?.organization_id, patientId]);

  if (selectedInvoice) {
    return (
      <Card className="p-3 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium font-mono text-sm">{selectedInvoice.invoice_number}</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(selectedInvoice.total_amount)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>Change</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoice number..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          className="pl-10"
        />
      </div>
      {showResults && search.length >= 2 && (
        <Card className="absolute z-50 w-full mt-1 max-h-48 overflow-auto shadow-lg">
          {isSearching ? (
            <div className="p-3 text-center text-muted-foreground text-sm">Searching...</div>
          ) : results.length > 0 ? (
            <div className="p-1">
              {results.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => { onSelect(inv); setSearch(""); setShowResults(false); }}
                  className="w-full p-2 text-left hover:bg-muted rounded-md text-sm transition-colors"
                >
                  <span className="font-mono font-medium">{inv.invoice_number}</span>
                  <span className="text-muted-foreground ml-2">{formatCurrency(inv.total_amount)}</span>
                  {inv.patients && <span className="text-muted-foreground ml-2">— {inv.patients.first_name} {inv.patients.last_name}</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-muted-foreground text-sm">No invoices found</div>
          )}
        </Card>
      )}
      {showResults && <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)} />}
    </div>
  );
}

export default function CreditNotesPage() {
  const { data: notes, isLoading } = useCreditNotes();
  const createMutation = useCreateCreditNote();
  const approveMutation = useApproveCreditNote();
  const { formatCurrency } = useCurrencyFormatter();
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceOption | null>(null);
  const [form, setForm] = useState({ amount: "", tax_amount: "", reason: "", note_type: "credit" });

  const resetForm = () => {
    setSelectedPatient(null);
    setSelectedInvoice(null);
    setForm({ amount: "", tax_amount: "", reason: "", note_type: "credit" });
  };

  const handleInvoiceSelect = (inv: InvoiceOption | null) => {
    setSelectedInvoice(inv);
    if (inv && inv.patients) {
      setSelectedPatient({
        id: inv.patient_id,
        first_name: inv.patients.first_name,
        last_name: inv.patients.last_name,
        patient_number: "",
        phone: null,
        date_of_birth: null,
        gender: null,
      });
    }
  };

  const handleCreate = () => {
    createMutation.mutate({
      amount: parseFloat(form.amount),
      tax_amount: parseFloat(form.tax_amount || "0"),
      reason: form.reason,
      note_type: form.note_type,
      invoice_id: selectedInvoice?.id,
      patient_id: selectedPatient?.id,
    }, {
      onSuccess: () => {
        setOpen(false);
        resetForm();
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
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Note</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Credit/Debit Note</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Invoice (Optional)</Label>
                  <InvoiceSelector
                    onSelect={handleInvoiceSelect}
                    selectedInvoice={selectedInvoice}
                    patientId={selectedPatient?.id}
                  />
                </div>
                <div>
                  <Label>Patient (Optional)</Label>
                  <PatientSearch
                    onSelect={(patient) => setSelectedPatient(patient)}
                    selectedPatient={selectedPatient}
                  />
                </div>
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

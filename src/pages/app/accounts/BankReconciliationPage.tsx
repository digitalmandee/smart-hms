import { useState, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CheckCircle, XCircle, Link, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ParsedRow {
  date: string;
  description: string;
  debit: number;
  credit: number;
  reference?: string;
  matchedTxId?: string;
  status: "unmatched" | "matched" | "manual";
}

export default function BankReconciliationPage() {
  const { profile } = useAuth();
  const { formatCurrency } = useCurrencyFormatter();
  const qc = useQueryClient();
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);

  // Bank accounts
  const { data: bankAccounts } = useQuery({
    queryKey: ["bank-accounts-list", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("id, bank_name, account_number, current_balance")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Bank transactions (existing)
  const { data: bankTxns, isLoading: txnLoading } = useQuery({
    queryKey: ["bank-transactions", selectedBank],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_transactions")
        .select("*")
        .eq("bank_account_id", selectedBank)
        .order("transaction_date", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedBank,
  });

  // Parse CSV
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split("\n").filter(l => l.trim());
        const rows: ParsedRow[] = [];
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
          if (cols.length >= 3) {
            rows.push({
              date: cols[0] || "",
              description: cols[1] || "",
              debit: parseFloat(cols[2]) || 0,
              credit: parseFloat(cols[3]) || 0,
              reference: cols[4] || "",
              status: "unmatched",
            });
          }
        }

        // Auto-match by amount + date
        if (bankTxns) {
          rows.forEach(row => {
            const match = bankTxns.find(tx =>
              !tx.is_reconciled &&
              tx.transaction_date === row.date &&
              (Math.abs(tx.debit_amount - row.debit) < 0.01 || Math.abs(tx.credit_amount - row.credit) < 0.01)
            );
            if (match) {
              row.matchedTxId = match.id;
              row.status = "matched";
            }
          });
        }

        setParsedRows(rows);
        toast.success(`Parsed ${rows.length} rows, ${rows.filter(r => r.status === "matched").length} auto-matched`);
      } catch {
        toast.error("Failed to parse CSV file");
      }
      setImporting(false);
    };
    reader.readAsText(file);
  }, [bankTxns]);

  // Reconcile matched transactions
  const reconcileMutation = useMutation({
    mutationFn: async () => {
      const matched = parsedRows.filter(r => r.matchedTxId);
      for (const row of matched) {
        await supabase
          .from("bank_transactions")
          .update({
            is_reconciled: true,
            reconciled_at: new Date().toISOString(),
            reconciled_by: profile!.id,
          })
          .eq("id", row.matchedTxId!);
      }
      return matched.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} transactions reconciled`);
      qc.invalidateQueries({ queryKey: ["bank-transactions"] });
      setParsedRows([]);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reconciledCount = (bankTxns || []).filter((t: any) => t.is_reconciled).length;
  const unreconciledCount = (bankTxns || []).filter((t: any) => !t.is_reconciled).length;
  const selectedAccount = bankAccounts?.find(b => b.id === selectedBank);

  return (
    <div>
      <PageHeader
        title="Bank Reconciliation"
        description="Import bank statements and reconcile transactions"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Bank Reconciliation" },
        ]}
      />

      <div className="space-y-4">
        {/* Bank Selection */}
        <Card>
          <CardContent className="pt-6 flex items-center gap-4 flex-wrap">
            <div>
              <Label>Bank Account</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="w-[300px]"><SelectValue placeholder="Select bank account" /></SelectTrigger>
                <SelectContent>
                  {(bankAccounts || []).map((ba: any) => (
                    <SelectItem key={ba.id} value={ba.id}>{ba.bank_name} — {ba.account_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedAccount && (
              <div className="ml-auto text-right">
                <p className="text-sm text-muted-foreground">Book Balance</p>
                <p className="text-xl font-bold">{formatCurrency(selectedAccount.current_balance)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedBank && (
          <>
            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{(bankTxns || []).length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <p className="text-sm text-muted-foreground">Reconciled</p>
                  <p className="text-2xl font-bold">{reconciledCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <XCircle className="h-5 w-5 mx-auto mb-1 text-destructive" />
                  <p className="text-sm text-muted-foreground">Unreconciled</p>
                  <p className="text-2xl font-bold">{unreconciledCount}</p>
                </CardContent>
              </Card>
            </div>

            {/* CSV Import */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Import Bank Statement</CardTitle>
                <CardDescription>Upload a CSV with columns: Date, Description, Debit, Credit, Reference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Input type="file" accept=".csv" onChange={handleFileUpload} disabled={importing} />
                  {parsedRows.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{parsedRows.length} rows</Badge>
                      <Badge variant="default">{parsedRows.filter(r => r.status === "matched").length} matched</Badge>
                      <Button onClick={() => reconcileMutation.mutate()} disabled={reconcileMutation.isPending}>
                        <RefreshCw className="h-4 w-4 mr-2" />Reconcile Matched
                      </Button>
                    </div>
                  )}
                </div>

                {parsedRows.length > 0 && (
                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedRows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.description}</TableCell>
                          <TableCell className="text-right">{row.debit > 0 ? formatCurrency(row.debit) : ""}</TableCell>
                          <TableCell className="text-right">{row.credit > 0 ? formatCurrency(row.credit) : ""}</TableCell>
                          <TableCell>{row.reference || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={row.status === "matched" ? "default" : "destructive"}>
                              {row.status === "matched" ? "Auto-Matched" : "Unmatched"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Existing Transactions */}
            <Card>
              <CardHeader><CardTitle>Bank Transactions</CardTitle></CardHeader>
              <CardContent>
                {txnLoading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead>Reconciled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(bankTxns || []).slice(0, 50).map((tx: any) => (
                        <TableRow key={tx.id}>
                          <TableCell>{format(new Date(tx.transaction_date), "dd MMM yyyy")}</TableCell>
                          <TableCell>{tx.description || "—"}</TableCell>
                          <TableCell className="font-mono text-sm">{tx.reference_number || "—"}</TableCell>
                          <TableCell className="text-right">{tx.debit_amount > 0 ? formatCurrency(tx.debit_amount) : ""}</TableCell>
                          <TableCell className="text-right">{tx.credit_amount > 0 ? formatCurrency(tx.credit_amount) : ""}</TableCell>
                          <TableCell>
                            {tx.is_reconciled ? (
                              <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Yes</Badge>
                            ) : (
                              <Badge variant="secondary">No</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!bankTxns || bankTxns.length === 0) && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No transactions found</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

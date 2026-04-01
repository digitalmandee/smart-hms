import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccounts, useAccount, useAccountLedger } from "@/hooks/useAccounts";

const GeneralLedgerPage = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });

  const { data: allAccounts = [], isLoading: accountsLoading } = useAccounts({ isActive: true });
  const accounts = allAccounts.filter((a) => !a.is_header);
  
  const hasValidDateRange = dateRange.from && dateRange.to;
  const { data: ledgerEntries = [], isLoading: ledgerLoading } = useAccountLedger(
    selectedAccountId || undefined,
    hasValidDateRange ? dateRange : undefined
  );

  const { data: selectedAccount } = useAccount(selectedAccountId || undefined);

  const isDebitNormal = selectedAccount?.account_type?.is_debit_normal ?? true;

  // Calculate running balance from opening balance
  const entriesWithBalance = useMemo(() => {
    let runningBalance = selectedAccount?.opening_balance || 0;
    return ledgerEntries.map((entry: any) => {
      const debit = entry.debit_amount || 0;
      const credit = entry.credit_amount || 0;
      if (isDebitNormal) {
        runningBalance += debit - credit;
      } else {
        runningBalance += credit - debit;
      }
      return { ...entry, running_balance: runningBalance };
    });
  }, [ledgerEntries, selectedAccount?.opening_balance, isDebitNormal]);

  const totalDebits = entriesWithBalance.reduce((sum: number, e: any) => sum + (e.debit_amount || 0), 0);
  const totalCredits = entriesWithBalance.reduce((sum: number, e: any) => sum + (e.credit_amount || 0), 0);

  const refBadgeColor = (type: string | null) => {
    const colors: Record<string, string> = {
      invoice: "bg-blue-100 text-blue-800",
      payment: "bg-green-100 text-green-800",
      expense: "bg-orange-100 text-orange-800",
      payroll: "bg-purple-100 text-purple-800",
      adjustment: "bg-yellow-100 text-yellow-800",
      opening_balance: "bg-gray-100 text-gray-800",
    };
    return colors[type || ""] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Ledger"
        description="View account transaction history"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label>Account</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_number} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedAccountId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {selectedAccount?.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Account: {selectedAccount?.account_number}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-xl font-bold">
                  {formatCurrency(selectedAccount?.current_balance || 0)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {ledgerLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading ledger...
              </div>
            ) : entriesWithBalance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found for this account</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Entry #</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Opening Balance Row */}
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell>—</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>Opening Balance</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(selectedAccount?.opening_balance || 0)}
                    </TableCell>
                  </TableRow>
                  {entriesWithBalance.map((entry: any, index: number) => (
                    <TableRow key={entry.id || index}>
                      <TableCell>
                        {entry.journal_entry?.entry_date
                          ? format(new Date(entry.journal_entry.entry_date), "dd MMM yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.journal_entry?.entry_number || "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {entry.description || entry.journal_entry?.description || "-"}
                      </TableCell>
                      <TableCell>
                        {entry.journal_entry?.reference_type && (
                          <Badge variant="outline" className={`text-xs ${refBadgeColor(entry.journal_entry.reference_type)}`}>
                            {entry.journal_entry.reference_type}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.debit_amount > 0
                          ? formatCurrency(entry.debit_amount)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.credit_amount > 0
                          ? formatCurrency(entry.credit_amount)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(entry.running_balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="font-bold">
                    <TableCell colSpan={4}>Totals</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalDebits)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalCredits)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entriesWithBalance[entriesWithBalance.length - 1]?.running_balance || selectedAccount?.opening_balance || 0)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeneralLedgerPage;

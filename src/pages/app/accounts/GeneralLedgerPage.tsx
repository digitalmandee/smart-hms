import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccounts, useAccountLedger } from "@/hooks/useAccounts";

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

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

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
            ) : ledgerEntries.length === 0 ? (
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
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry: any, index: number) => (
                    <TableRow key={entry.id || index}>
                      <TableCell>
                        {entry.entry_date
                          ? format(new Date(entry.entry_date), "dd MMM yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.entry_number || "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {entry.description || "-"}
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
                        {formatCurrency(entry.running_balance || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeneralLedgerPage;

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import { useAccounts, useAccount, useAccountLedger, type Account } from "@/hooks/useAccounts";
import { supabase } from "@/integrations/supabase/client";

/** Recursively collect all descendant posting (non-header) account IDs */
function getDescendantPostingIds(parentId: string, allAccounts: Account[]): string[] {
  const children = allAccounts.filter((a) => a.parent_account_id === parentId);
  const ids: string[] = [];
  for (const child of children) {
    if (child.is_header) {
      ids.push(...getDescendantPostingIds(child.id, allAccounts));
    } else {
      ids.push(child.id);
    }
  }
  return ids;
}

function getSourceDocumentPath(referenceType: string | null, referenceId: string | null): string | null {
  if (!referenceType || !referenceId) return null;
  switch (referenceType) {
    case "invoice": return `/app/billing/invoices/${referenceId}`;
    case "payment": return `/app/billing/invoices/${referenceId}`;
    case "payroll": return `/app/hr/payroll/${referenceId}`;
    case "expense": return `/app/accounts/expenses`;
    case "vendor_payment": return `/app/accounts/vendor-payments/${referenceId}`;
    case "grn": return `/app/warehouse/grn/${referenceId}`;
    case "patient_deposit": return `/app/accounts/patient-deposits`;
    case "donation": return `/app/donations`;
    case "pharmacy_pos": return `/app/pharmacy/pos`;
    case "credit_note": return `/app/accounts/credit-notes`;
    case "surgery": return `/app/clinical/surgeries/${referenceId}`;
    default: return null;
  }
}

const GeneralLedgerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const journalParam = searchParams.get("journal");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });

  const { data: allAccounts = [], isLoading: accountsLoading } = useAccounts({ isActive: true });

  // Auto-select account when navigated with ?journal= param
  useEffect(() => {
    if (journalParam && !selectedAccountId && allAccounts.length > 0) {
      supabase
        .from("journal_entry_lines")
        .select("account_id")
        .eq("journal_entry_id", journalParam)
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setSelectedAccountId(data[0].account_id);
          }
        });
    }
  }, [journalParam, selectedAccountId, allAccounts.length]);

  const selectedAccount = allAccounts.find((a) => a.id === selectedAccountId);
  const isHeaderSelected = selectedAccount?.is_header ?? false;

  // Resolve the account IDs to query
  const queryAccountIds = useMemo(() => {
    if (!selectedAccountId) return undefined;
    if (!isHeaderSelected) return selectedAccountId; // single posting account
    const descendantIds = getDescendantPostingIds(selectedAccountId, allAccounts);
    return descendantIds.length > 0 ? descendantIds : undefined;
  }, [selectedAccountId, isHeaderSelected, allAccounts]);

  const hasValidDateRange = dateRange.from && dateRange.to;
  const { data: ledgerEntries = [], isLoading: ledgerLoading } = useAccountLedger(
    queryAccountIds,
    hasValidDateRange ? dateRange : undefined
  );

  // For single posting account, also fetch via useAccount for opening balance
  const { data: singleAccountDetail } = useAccount(!isHeaderSelected ? selectedAccountId || undefined : undefined);

  const isDebitNormal = isHeaderSelected
    ? (selectedAccount?.account_type?.is_debit_normal ?? true)
    : (singleAccountDetail?.account_type?.is_debit_normal ?? true);

  // Opening balance: sum of all descendant opening balances for headers, or single account
  const openingBalance = useMemo(() => {
    if (!selectedAccountId) return 0;
    if (!isHeaderSelected) return singleAccountDetail?.opening_balance || 0;
    const descendantIds = getDescendantPostingIds(selectedAccountId, allAccounts);
    return allAccounts
      .filter((a) => descendantIds.includes(a.id))
      .reduce((sum, a) => sum + (a.opening_balance || 0), 0);
  }, [selectedAccountId, isHeaderSelected, singleAccountDetail, allAccounts]);

  // Calculate running balance from opening balance
  const entriesWithBalance = useMemo(() => {
    let runningBalance = openingBalance;
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
  }, [ledgerEntries, openingBalance, isDebitNormal]);

  const totalDebits = entriesWithBalance.reduce((sum: number, e: any) => sum + (e.debit_amount || 0), 0);
  const totalCredits = entriesWithBalance.reduce((sum: number, e: any) => sum + (e.credit_amount || 0), 0);

  // Current balance: for headers sum descendants, for posting use account detail
  const currentBalance = useMemo(() => {
    if (!selectedAccountId) return 0;
    if (!isHeaderSelected) return singleAccountDetail?.current_balance || 0;
    const descendantIds = getDescendantPostingIds(selectedAccountId, allAccounts);
    return allAccounts
      .filter((a) => descendantIds.includes(a.id))
      .reduce((sum, a) => sum + (a.current_balance || 0), 0);
  }, [selectedAccountId, isHeaderSelected, singleAccountDetail, allAccounts]);

  const refBadgeColor = (type: string | null) => {
    const colors: Record<string, string> = {
      invoice: "bg-blue-100 text-blue-800",
      payment: "bg-green-100 text-green-800",
      expense: "bg-orange-100 text-orange-800",
      payroll: "bg-purple-100 text-purple-800",
      adjustment: "bg-yellow-100 text-yellow-800",
      opening_balance: "bg-gray-100 text-gray-800",
      patient_deposit: "bg-teal-100 text-teal-800",
      deposit_application: "bg-indigo-100 text-indigo-800",
    };
    return colors[type || ""] || "bg-muted text-muted-foreground";
  };

  // Group accounts by category for dropdown
  const groupedAccounts = useMemo(() => {
    const groups: Record<string, Account[]> = {};
    allAccounts.forEach((account) => {
      const cat = account.account_type?.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(account);
    });
    return groups;
  }, [allAccounts]);

  const categoryLabels: Record<string, string> = {
    asset: "Assets",
    liability: "Liabilities",
    equity: "Equity",
    revenue: "Revenue",
    expense: "Expenses",
    other: "Other",
  };

  const levelPrefix = (level: number) => {
    if (level <= 1) return "";
    return "\u00A0\u00A0".repeat(level - 1);
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
                  {Object.entries(groupedAccounts).map(([cat, accts]) => (
                    <div key={cat}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {categoryLabels[cat] || cat}
                      </div>
                      {accts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <span className="flex items-center gap-1">
                            <span>{levelPrefix(account.account_level)}</span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {account.account_number}
                            </span>
                            <span>{account.name}</span>
                            {account.is_header && (
                              <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">
                                Group
                              </Badge>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </div>
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
                <CardTitle className="text-lg flex items-center gap-2">
                  {selectedAccount?.name}
                  {isHeaderSelected && (
                    <Badge variant="secondary" className="text-xs">
                      Rolled-up View
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Account: {selectedAccount?.account_number}
                  {isHeaderSelected && " (includes all child accounts)"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-xl font-bold">
                  {formatCurrency(currentBalance)}
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
                    {isHeaderSelected && <TableHead>Account</TableHead>}
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
                    {isHeaderSelected && <TableCell>—</TableCell>}
                    <TableCell>Opening Balance</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(openingBalance)}
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
                      {isHeaderSelected && (
                        <TableCell className="text-xs">
                          <span className="font-mono text-muted-foreground">
                            {entry.account?.account_number}
                          </span>{" "}
                          {entry.account?.name}
                        </TableCell>
                      )}
                      <TableCell className="max-w-[200px] truncate">
                        {entry.description || entry.journal_entry?.description || "-"}
                      </TableCell>
                      <TableCell>
                        {entry.journal_entry?.reference_type && (
                          <Badge
                            variant="outline"
                            className={`text-xs cursor-pointer hover:opacity-80 ${refBadgeColor(entry.journal_entry.reference_type)}`}
                            onClick={() => {
                              const path = getSourceDocumentPath(entry.journal_entry.reference_type, entry.journal_entry.reference_id);
                              if (path) navigate(path);
                            }}
                          >
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
                    <TableCell colSpan={isHeaderSelected ? 5 : 4}>Totals</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalDebits)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalCredits)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entriesWithBalance[entriesWithBalance.length - 1]?.running_balance || openingBalance)}
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
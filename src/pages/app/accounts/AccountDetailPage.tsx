import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccount, useAccountLedger } from "@/hooks/useAccounts";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: account, isLoading: accountLoading } = useAccount(id);
  const { data: ledgerEntries, isLoading: ledgerLoading } = useAccountLedger(
    id,
    dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate running balance
  let runningBalance = account?.opening_balance || 0;
  const entriesWithBalance = ledgerEntries?.map((entry) => {
    const debit = entry.debit_amount || 0;
    const credit = entry.credit_amount || 0;
    
    // For debit-normal accounts (assets, expenses): debit increases, credit decreases
    // For credit-normal accounts (liabilities, equity, revenue): credit increases, debit decreases
    const isDebitNormal = account?.account_type?.is_debit_normal ?? true;
    
    if (isDebitNormal) {
      runningBalance += debit - credit;
    } else {
      runningBalance += credit - debit;
    }
    
    return {
      ...entry,
      running_balance: runningBalance,
    };
  }) || [];

  const categoryColors: Record<string, string> = {
    asset: "bg-blue-100 text-blue-800",
    liability: "bg-red-100 text-red-800",
    equity: "bg-purple-100 text-purple-800",
    revenue: "bg-green-100 text-green-800",
    expense: "bg-orange-100 text-orange-800",
  };

  if (accountLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">Account not found</h2>
        <Button variant="link" onClick={() => navigate("/app/accounts/chart-of-accounts")}>
          Back to Chart of Accounts
        </Button>
      </div>
    );
  }

  const totalDebits = entriesWithBalance.reduce((sum, e) => sum + (e.debit_amount || 0), 0);
  const totalCredits = entriesWithBalance.reduce((sum, e) => sum + (e.credit_amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={account.name}
        description={`Account #${account.account_number}`}
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Chart of Accounts", href: "/app/accounts/chart-of-accounts" },
          { label: account.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/accounts/chart-of-accounts")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => navigate(`/app/accounts/chart-of-accounts/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        }
      />

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(account.current_balance)}</p>
              </div>
              {account.current_balance >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Opening Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(account.opening_balance)}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Account Type</p>
              <p className="text-lg font-semibold">{account.account_type?.name}</p>
              <Badge className={categoryColors[account.account_type?.category || "asset"]}>
                {account.account_type?.category}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={account.is_active ? "default" : "secondary"}>
                  {account.is_active ? "Active" : "Inactive"}
                </Badge>
                {account.is_system && (
                  <Badge variant="outline">System</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      {account.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="mt-1">{account.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Ledger Entries */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Account Ledger</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[150px]"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[150px]"
              />
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {ledgerLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : entriesWithBalance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found for this account.
            </div>
          ) : (
            <>
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
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={4} className="font-medium">
                      Opening Balance
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(account.opening_balance)}
                    </TableCell>
                  </TableRow>
                  
                  {entriesWithBalance.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {entry.journal_entry?.entry_date
                          ? format(new Date(entry.journal_entry.entry_date), "dd MMM yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="font-mono">
                        {entry.journal_entry?.entry_number}
                      </TableCell>
                      <TableCell>
                        {entry.description || entry.journal_entry?.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {entry.journal_entry?.reference_type || "manual"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(entry.running_balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Totals Row */}
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell colSpan={4}>Totals</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(totalDebits)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(totalCredits)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(account.current_balance)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

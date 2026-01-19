import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Building2, RefreshCw, ArrowUpRight, ArrowDownLeft, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export default function BankAccountsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");

  // Fetch bank accounts
  const { data: bankAccounts, isLoading, refetch } = useQuery({
    queryKey: ["bank-accounts", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select(`
          *,
          branch:branches(id, name)
        `)
        .order("is_default", { ascending: false })
        .order("bank_name", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch recent transactions
  const { data: recentTransactions } = useQuery({
    queryKey: ["bank-transactions-recent", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_transactions")
        .select(`
          *,
          bank_account:bank_accounts(id, bank_name, account_number)
        `)
        .order("transaction_date", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-PK', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const filteredAccounts = bankAccounts?.filter((acc) => {
    return (
      !search ||
      acc.bank_name.toLowerCase().includes(search.toLowerCase()) ||
      acc.account_number.toLowerCase().includes(search.toLowerCase())
    );
  }) || [];

  // Summary calculations
  const totalBalance = filteredAccounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
  const activeAccounts = filteredAccounts.filter((acc) => acc.is_active).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank & Cash"
        description="Manage bank accounts, cash positions, and reconciliation"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Bank & Cash" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => navigate("/app/accounts/bank-accounts/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <div className="text-sm text-muted-foreground">Total Cash Position</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{activeAccounts}</div>
            </div>
            <div className="text-sm text-muted-foreground">Active Bank Accounts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">{recentTransactions?.length || 0}</div>
            </div>
            <div className="text-sm text-muted-foreground">Recent Transactions</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by bank name or account number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Accounts</CardTitle>
            <CardDescription>All registered bank accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/app/accounts/bank-accounts/${acc.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {acc.bank_name}
                          {acc.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {acc.account_number} • {acc.account_type}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(acc.current_balance || 0)}</div>
                      <div className="text-xs text-muted-foreground">
                        {acc.is_active ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAccounts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No bank accounts found.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest bank transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent transactions.
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions?.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${txn.credit_amount > 0 ? "bg-green-100" : "bg-red-100"}`}>
                        {txn.credit_amount > 0 ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {txn.description || "Transaction"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {txn.bank_account?.bank_name} • {format(new Date(txn.transaction_date), "dd MMM")}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold ${txn.credit_amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {txn.credit_amount > 0 ? "+" : "-"}
                      {formatCurrency(txn.credit_amount || txn.debit_amount || 0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

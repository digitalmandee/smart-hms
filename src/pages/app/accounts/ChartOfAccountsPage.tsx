import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Download, Upload, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTree } from "@/components/accounts/AccountTree";
import { useAccountsTree, useToggleAccountStatus, type Account } from "@/hooks/useAccounts";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChartOfAccountsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);

  const { data: accountsTree, flatData: accounts, isLoading, refetch } = useAccountsTree({
    isActive: showInactive ? undefined : true,
  });

  const toggleStatus = useToggleAccountStatus();

  // Filter accounts based on search and category
  const filteredAccounts = accountsTree?.filter((account) => {
    const matchesSearch =
      !search ||
      account.name.toLowerCase().includes(search.toLowerCase()) ||
      account.account_number.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory =
      categoryFilter === "all" || account.account_type?.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const handleSelectAccount = (account: Account) => {
    navigate(`/app/accounts/chart-of-accounts/${account.id}`);
  };

  const handleEditAccount = (account: Account) => {
    navigate(`/app/accounts/chart-of-accounts/${account.id}/edit`);
  };

  const handleToggleStatus = (account: Account) => {
    toggleStatus.mutate({ id: account.id, is_active: !account.is_active });
  };

  // Summary stats
  const totalAccounts = accounts?.length || 0;
  const activeAccounts = accounts?.filter((a) => a.is_active).length || 0;
  const categoryCounts = accounts?.reduce((counts, account) => {
    const category = account.account_type?.category || "other";
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts"
        description="Manage your organization's chart of accounts"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Chart of Accounts" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => navigate("/app/accounts/chart-of-accounts/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalAccounts}</div>
            <div className="text-sm text-muted-foreground">Total Accounts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{categoryCounts.asset || 0}</div>
            <div className="text-sm text-muted-foreground">Assets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{categoryCounts.liability || 0}</div>
            <div className="text-sm text-muted-foreground">Liabilities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{categoryCounts.equity || 0}</div>
            <div className="text-sm text-muted-foreground">Equity</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{categoryCounts.revenue || 0}</div>
            <div className="text-sm text-muted-foreground">Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">{categoryCounts.expense || 0}</div>
            <div className="text-sm text-muted-foreground">Expenses</div>
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
                placeholder="Search by name or account number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="asset">Assets</SelectItem>
                <SelectItem value="liability">Liabilities</SelectItem>
                <SelectItem value="equity">Equity</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showInactive ? "secondary" : "outline"}
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? "Hide Inactive" : "Show Inactive"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <AccountTree
              accounts={filteredAccounts}
              onSelect={handleSelectAccount}
              onEdit={handleEditAccount}
              onToggleStatus={handleToggleStatus}
              showActions={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

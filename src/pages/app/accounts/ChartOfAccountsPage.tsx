import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw } from "lucide-react";
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
import { AccountTree } from "@/components/accounts/AccountTree";
import { useAccountsTree, useToggleAccountStatus, useAccountTypes, type Account } from "@/hooks/useAccounts";
import { Skeleton } from "@/components/ui/skeleton";

const categoryLabels: Record<string, string> = {
  asset: "Assets",
  liability: "Liabilities",
  equity: "Equity",
  revenue: "Revenue",
  expense: "Expenses",
};

const categoryColors: Record<string, string> = {
  asset: "text-blue-600",
  liability: "text-red-600",
  equity: "text-purple-600",
  revenue: "text-green-600",
  expense: "text-orange-600",
};

export default function ChartOfAccountsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);

  const { data: accountTypes } = useAccountTypes();
  const { data: accountsTree, flatData: accounts, isLoading, refetch } = useAccountsTree({
    isActive: showInactive ? undefined : true,
  });

  const toggleStatus = useToggleAccountStatus();

  // Get unique categories from account types
  const categories = useMemo(() => {
    if (!accountTypes) return [];
    const uniqueCategories = [...new Set(accountTypes.map((t) => t.category))];
    return uniqueCategories.sort((a, b) => {
      const order = ["asset", "liability", "equity", "revenue", "expense"];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [accountTypes]);

  // Recursive filter that keeps parents if any descendant matches
  const filterTree = (accounts: Account[]): Account[] => {
    return accounts.reduce<Account[]>((result, account) => {
      const matchesSearch =
        !search ||
        account.name.toLowerCase().includes(search.toLowerCase()) ||
        account.account_number.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory =
        categoryFilter === "all" || account.account_type?.category === categoryFilter;

      const matchesLevel =
        levelFilter === "all" || account.account_level === Number(levelFilter);

      const filteredChildren = account.children ? filterTree(account.children) : [];
      
      const selfMatches = matchesSearch && matchesCategory && matchesLevel;
      
      if (selfMatches || filteredChildren.length > 0) {
        result.push({ ...account, children: filteredChildren });
      }
      return result;
    }, []);
  };

  const filteredAccounts = accountsTree ? filterTree(accountsTree) : [];

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
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {categoryLabels[category] || category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1 - Category</SelectItem>
                <SelectItem value="2">Level 2 - Sub-group</SelectItem>
                <SelectItem value="3">Level 3 - Control</SelectItem>
                <SelectItem value="4">Level 4 - Detail</SelectItem>
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAccountTypes, type AccountType } from "@/hooks/useAccounts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categoryColors: Record<string, string> = {
  asset: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  liability: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  equity: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  revenue: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  expense: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

const categoryLabels: Record<string, string> = {
  asset: "Assets",
  liability: "Liabilities",
  equity: "Equity",
  revenue: "Revenue",
  expense: "Expenses",
};

export default function AccountTypesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: accountTypes, isLoading, refetch } = useAccountTypes();

  const deleteAccountType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("account_types")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-types"] });
      toast.success("Account type deleted successfully");
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const filteredTypes = accountTypes?.filter((type) => {
    const matchesSearch =
      !search ||
      type.name.toLowerCase().includes(search.toLowerCase()) ||
      type.code.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory =
      categoryFilter === "all" || type.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Group by category
  const groupedTypes = filteredTypes.reduce((groups, type) => {
    if (!groups[type.category]) {
      groups[type.category] = [];
    }
    groups[type.category].push(type);
    return groups;
  }, {} as Record<string, AccountType[]>);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Types"
        description="Manage account types and categories for your chart of accounts"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Account Types" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => navigate("/app/accounts/types/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
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
          </div>
        </CardContent>
      </Card>

      {/* Account Types Table */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedTypes).map(([category, types]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className={categoryColors[category]}>
                  {categoryLabels[category] || category}
                </Badge>
                <span className="text-muted-foreground text-sm font-normal">
                  ({types.length} types)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Normal Balance</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-mono">{type.code}</TableCell>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {type.is_debit_normal ? "Debit" : "Credit"}
                        </Badge>
                      </TableCell>
                      <TableCell>{type.sort_order}</TableCell>
                      <TableCell>
                        {type.is_system ? (
                          <Badge variant="secondary">System</Badge>
                        ) : (
                          <Badge variant="outline">Custom</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/app/accounts/types/${type.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!type.is_system && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(type.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}

      {!isLoading && Object.keys(groupedTypes).length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No account types found. Create your first account type to get started.
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Account Type"
        description="Are you sure you want to delete this account type? This action cannot be undone."
        onConfirm={() => deleteId && deleteAccountType.mutate(deleteId)}
      />
    </div>
  );
}

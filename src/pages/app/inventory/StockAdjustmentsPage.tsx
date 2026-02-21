import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { ListFilterBar } from "@/components/inventory/ListFilterBar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useState, useMemo } from "react";

const typeLabels: Record<string, string> = {
  increase: "Increase",
  decrease: "Decrease",
  expired: "Expired",
  damaged: "Damaged",
  write_off: "Write-Off",
  internal_usage: "Internal Usage",
  transfer_in: "Transfer In",
  transfer_out: "Transfer Out",
};

export default function StockAdjustmentsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: adjustments, isLoading } = useQuery({
    queryKey: ["stock-adjustments-page", profile?.organization_id, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("stock_adjustments")
        .select(`
          *,
          item:inventory_items(id, item_code, name),
          adjusted_by_profile:profiles!stock_adjustments_adjusted_by_fkey(id, full_name)
        `)
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false })
        .limit(200);

      if (typeFilter !== "all") {
        query = query.eq("adjustment_type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const filteredAdjustments = useMemo(() => {
    if (!adjustments || !search) return adjustments || [];
    const q = search.toLowerCase();
    return adjustments.filter((adj: any) =>
      (adj.item?.name || "").toLowerCase().includes(q) ||
      (adj.item?.item_code || "").toLowerCase().includes(q) ||
      (adj.reason || "").toLowerCase().includes(q)
    );
  }, [adjustments, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Adjustments"
        description="View and create stock adjustments for write-offs, expired, damaged items"
      />

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <ListFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by item name or code...">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="increase">Increase</SelectItem>
              <SelectItem value="decrease">Decrease</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
              <SelectItem value="write_off">Write-Off</SelectItem>
              <SelectItem value="internal_usage">Internal Usage</SelectItem>
            </SelectContent>
          </Select>
        </ListFilterBar>

        <Button onClick={() => navigate("/app/inventory/stock-adjustments/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Adjustment
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Adjusted By</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdjustments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2" />
                  No adjustments found
                </TableCell>
              </TableRow>
            ) : (
              filteredAdjustments.map((adj: any) => (
                <TableRow key={adj.id}>
                  <TableCell className="font-medium">
                    {adj.item?.name || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        adj.adjustment_type === "increase" || adj.adjustment_type === "transfer_in"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {typeLabels[adj.adjustment_type] || adj.adjustment_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{adj.quantity}</TableCell>
                  <TableCell className="max-w-xs truncate">{adj.reason || "—"}</TableCell>
                  <TableCell>{adj.adjusted_by_profile?.full_name || "—"}</TableCell>
                  <TableCell>{format(new Date(adj.created_at), "MMM dd, yyyy")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListFilterBar } from "@/components/inventory/ListFilterBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";

const STATUS_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  confirmed: "default",
  picking: "outline",
  packing: "outline",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

export default function WarehouseOrdersListPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["warehouse-orders", profile?.organization_id, search],
    queryFn: async () => {
      let q = (supabase as any).from("warehouse_orders")
        .select("*, items:warehouse_order_items(count)")
        .eq("organization_id", profile!.organization_id)
        .order("created_at", { ascending: false });
      if (search) q = q.ilike("customer_name", `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const filtered = statusFilter === "all" ? orders : orders?.filter((o: any) => o.status === statusFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.warehouseOrders")}
        description={t("nav.warehouseOrdersDesc")}
        actions={
          <Button asChild>
            <Link to="/app/inventory/warehouse-orders/new"><Plus className="mr-2 h-4 w-4" />New Order</Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <ListFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by customer...">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </ListFilterBar>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Required Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link to={`/app/inventory/warehouse-orders/${order.id}`} className="font-medium text-primary hover:underline">
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{format(new Date(order.order_date), "dd MMM yyyy")}</TableCell>
                  <TableCell>{order.required_date ? format(new Date(order.required_date), "dd MMM yyyy") : "—"}</TableCell>
                  <TableCell>{order.items?.[0]?.count || 0}</TableCell>
                  <TableCell><Badge variant={STATUS_COLORS[order.status] || "secondary"}>{order.status}</Badge></TableCell>
                </TableRow>
              ))}
              {(!filtered || filtered.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No warehouse orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

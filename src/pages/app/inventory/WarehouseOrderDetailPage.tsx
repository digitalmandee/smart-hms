import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Package, CheckCircle2, Truck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

export default function WarehouseOrderDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["warehouse-order", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("warehouse_orders")
        .select("*, items:warehouse_order_items(*, item:inventory_items(name, item_code))")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await (supabase as any)
        .from("warehouse_orders")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["warehouse-order", id] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64" /></div>;
  if (!order) return (
    <div className="text-center py-12">
      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold">Order not found</h2>
      <Button variant="outline" className="mt-4" onClick={() => navigate("/app/inventory/warehouse-orders")}>Back</Button>
    </div>
  );

  const nextStatus: Record<string, string> = {
    draft: "confirmed",
    confirmed: "picking",
    picking: "packing",
    packing: "shipped",
    shipped: "delivered",
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`Order: ${order.order_number}`} description={`Created ${format(new Date(order.created_at), "dd MMM yyyy")}`} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/app/inventory/warehouse-orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        {nextStatus[order.status] && (
          <Button onClick={() => updateStatus.mutate(nextStatus[order.status])}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as {nextStatus[order.status]}
          </Button>
        )}
        {order.status === "confirmed" && (
          <Button variant="secondary" onClick={() => navigate(`/app/inventory/picking/new?order_id=${order.id}`)}>
            <Truck className="mr-2 h-4 w-4" />Generate Pick List
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Order Info</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Order #</p><p className="font-medium">{order.order_number}</p></div>
            <div><p className="text-sm text-muted-foreground">Status</p><Badge>{order.status}</Badge></div>
            <div><p className="text-sm text-muted-foreground">Order Date</p><p className="font-medium">{format(new Date(order.order_date), "dd MMM yyyy")}</p></div>
            <div><p className="text-sm text-muted-foreground">Required Date</p><p className="font-medium">{order.required_date ? format(new Date(order.required_date), "dd MMM yyyy") : "—"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{order.customer_name}</p></div>
            <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{order.customer_phone || "—"}</p></div>
            <div><p className="text-sm text-muted-foreground">Address</p><p className="font-medium">{order.customer_address || "—"}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Ordered</TableHead>
                <TableHead className="text-center">Picked</TableHead>
                <TableHead className="text-center">Packed</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item?.name || item.item_id}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-center">{item.picked_quantity}</TableCell>
                  <TableCell className="text-center">{item.packed_quantity}</TableCell>
                  <TableCell>{item.notes || "—"}</TableCell>
                </TableRow>
              ))}
              {(!order.items || order.items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No items added yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap">{order.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}

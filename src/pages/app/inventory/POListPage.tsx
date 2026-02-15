import { useState } from "react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, ClipboardPen } from "lucide-react";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { POStatusBadge } from "@/components/inventory/POStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type POStatus = Database["public"]["Enums"]["po_status"];

export default function POListPage() {
  const { formatCurrency } = useCurrencyFormatter();
  const [statusFilter, setStatusFilter] = useState<POStatus | "all">("all");
  const { data: purchaseOrders, isLoading } = usePurchaseOrders(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage purchase orders"
        actions={
          <Button asChild>
            <Link to="/app/inventory/purchase-orders/new">
              <Plus className="mr-2 h-4 w-4" />
              New PO
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as POStatus | "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="partially_received">Partially Received</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : purchaseOrders?.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardPen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No purchase orders found</h3>
              <p className="text-muted-foreground">
                {statusFilter ? "Try a different filter" : "Create your first purchase order"}
              </p>
              <Button asChild className="mt-4">
                <Link to="/app/inventory/purchase-orders/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New PO
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                   <TableHead>Vendor</TableHead>
                   <TableHead>Warehouse</TableHead>
                   <TableHead>Order Date</TableHead>
                   <TableHead>Expected Delivery</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders?.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>
                      <Link
                        to={`/app/inventory/purchase-orders/${po.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {po.po_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                       <div>
                         <p className="font-medium">{po.vendor?.name}</p>
                         <p className="text-xs text-muted-foreground">{po.vendor?.vendor_code}</p>
                       </div>
                     </TableCell>
                     <TableCell className="text-muted-foreground">{(po as any).store?.name || "—"}</TableCell>
                     <TableCell>{format(new Date(po.order_date), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      {po.expected_delivery_date 
                        ? format(new Date(po.expected_delivery_date), "dd MMM yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <POStatusBadge status={po.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(po.total_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, Truck, RotateCcw } from "lucide-react";
import { useRTV, useApproveRTV, useShipRTV, useCompleteRTV } from "@/hooks/useReturnToVendor";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { format } from "date-fns";

const STATUS_BADGES: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  approved: "default",
  shipped: "default",
  completed: "outline",
  cancelled: "destructive",
};

export default function RTVDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { formatCurrency } = useCurrencyFormatter();
  const { data: rtv, isLoading } = useRTV(id || "");
  const approveMutation = useApproveRTV();
  const shipMutation = useShipRTV();
  const completeMutation = useCompleteRTV();

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-64" /></div>;
  if (!rtv) return <div className="text-center py-12"><RotateCcw className="mx-auto h-12 w-12 text-muted-foreground" /><p className="mt-4">Return not found</p></div>;

  const totalValue = rtv.items?.reduce((sum, i) => sum + i.quantity * i.unit_cost, 0) || 0;

  return (
    <div className="space-y-6">
      <PageHeader title={`RTV: ${rtv.rtv_number}`} description={`Return to ${rtv.vendor?.name}`} />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/app/inventory/rtv")}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        {rtv.status === "draft" && (
          <Button onClick={() => approveMutation.mutate(rtv.id)} disabled={approveMutation.isPending}>
            <CheckCircle2 className="mr-2 h-4 w-4" />Approve
          </Button>
        )}
        {rtv.status === "approved" && (
          <Button onClick={() => shipMutation.mutate(rtv.id)} disabled={shipMutation.isPending}>
            <Truck className="mr-2 h-4 w-4" />Mark Shipped
          </Button>
        )}
        {rtv.status === "shipped" && (
          <Button onClick={() => completeMutation.mutate(rtv.id)} disabled={completeMutation.isPending}>
            <CheckCircle2 className="mr-2 h-4 w-4" />Complete
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Return Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">RTV Number</p><p className="font-medium">{rtv.rtv_number}</p></div>
              <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={STATUS_BADGES[rtv.status]}>{rtv.status}</Badge></div>
              <div><p className="text-sm text-muted-foreground">Return Date</p><p className="font-medium">{format(new Date(rtv.return_date), "dd MMM yyyy")}</p></div>
              <div><p className="text-sm text-muted-foreground">GRN Reference</p><p className="font-medium">{rtv.grn?.grn_number || "—"}</p></div>
              <div><p className="text-sm text-muted-foreground">Created By</p><p className="font-medium">{rtv.created_by_profile?.full_name || "—"}</p></div>
              <div><p className="text-sm text-muted-foreground">Total Value</p><p className="font-medium text-lg">{formatCurrency(totalValue)}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vendor Details</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{rtv.vendor?.name}</p>
            <p className="text-sm text-muted-foreground">{rtv.vendor?.vendor_code}</p>
            {rtv.reason && <div className="mt-4"><p className="text-sm text-muted-foreground">Return Reason</p><p>{rtv.reason}</p></div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Return Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rtv.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><div><p className="font-medium">{item.item?.name}</p><p className="text-xs text-muted-foreground">{item.item?.item_code}</p></div></TableCell>
                  <TableCell>{item.batch_number || "—"}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.quantity * item.unit_cost)}</TableCell>
                  <TableCell>{item.reason || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {rtv.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap">{rtv.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}

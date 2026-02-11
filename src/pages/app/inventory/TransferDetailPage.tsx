import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, Truck, PackageCheck } from "lucide-react";
import { useStoreTransfer, useApproveTransfer, useDispatchTransfer, useReceiveTransfer } from "@/hooks/useStoreTransfers";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  in_transit: "bg-purple-100 text-purple-800",
  received: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function TransferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: transfer, isLoading } = useStoreTransfer(id!);
  const approve = useApproveTransfer();
  const dispatch = useDispatchTransfer();
  const receive = useReceiveTransfer();

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>;
  if (!transfer) return <p>Transfer not found</p>;

  const handleApprove = () => approve.mutate(transfer.id);
  const handleDispatch = () => {
    const items = transfer.items?.map((i) => ({ id: i.id!, quantity_sent: i.quantity_requested })) || [];
    dispatch.mutate({ id: transfer.id, items });
  };
  const handleReceive = () => {
    const items = transfer.items?.map((i) => ({ id: i.id!, quantity_received: i.quantity_sent })) || [];
    receive.mutate({ id: transfer.id, items });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Transfer ${transfer.transfer_number}`}
        description={`${transfer.from_store?.name} → ${transfer.to_store?.name}`}
        actions={
          <div className="flex gap-2">
            {transfer.status === "draft" && (
              <Button onClick={handleApprove} disabled={approve.isPending}>
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
            )}
            {transfer.status === "approved" && (
              <Button onClick={handleDispatch} disabled={dispatch.isPending}>
                <Truck className="mr-2 h-4 w-4" /> Dispatch
              </Button>
            )}
            {transfer.status === "in_transit" && (
              <Button onClick={handleReceive} disabled={receive.isPending}>
                <PackageCheck className="mr-2 h-4 w-4" /> Receive
              </Button>
            )}
          </div>
        }
      />
      <Button variant="outline" onClick={() => navigate("/app/inventory/transfers")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Transfer Details
            <Badge className={statusColors[transfer.status] || ""} variant="secondary">
              {transfer.status.replace("_", " ")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-muted-foreground">From</p><p className="font-medium">{transfer.from_store?.name}</p></div>
            <div><p className="text-muted-foreground">To</p><p className="font-medium">{transfer.to_store?.name}</p></div>
            <div><p className="text-muted-foreground">Requested By</p><p className="font-medium">{transfer.requested_by_profile?.full_name || "—"}</p></div>
            <div><p className="text-muted-foreground">Date</p><p className="font-medium">{format(new Date(transfer.created_at), "dd MMM yyyy")}</p></div>
          </div>
          {transfer.notes && <p className="mt-4 text-sm text-muted-foreground">{transfer.notes}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Requested</TableHead>
                <TableHead className="text-center">Sent</TableHead>
                <TableHead className="text-center">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfer.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.item?.name}</p>
                    <p className="text-xs text-muted-foreground">{item.item?.item_code}</p>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity_requested}</TableCell>
                  <TableCell className="text-center">{item.quantity_sent}</TableCell>
                  <TableCell className="text-center">{item.quantity_received}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

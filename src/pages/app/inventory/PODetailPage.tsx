import { useNavigate, useParams } from "react-router-dom";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganizations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, Printer, Edit, CheckCircle, XCircle, Send, 
  PackageCheck, Loader2 
} from "lucide-react";
import { 
  usePurchaseOrder, 
  useApprovePurchaseOrder, 
  useSubmitPurchaseOrder,
  useMarkPOAsOrdered,
  useCancelPurchaseOrder 
} from "@/hooks/usePurchaseOrders";
import { POStatusBadge } from "@/components/inventory/POStatusBadge";
import { PrintablePO } from "@/components/inventory/PrintablePO";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { usePrint } from "@/hooks/usePrint";
import { useOrganizationBranding } from "@/hooks/useOrganizationBranding";

export default function PODetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { formatCurrency } = useCurrencyFormatter();
  const { profile } = useAuth();
  const { data: organization } = useOrganization(profile?.organization_id);

  const { data: po, isLoading } = usePurchaseOrder(id || "");
  const approveMutation = useApprovePurchaseOrder();
  const submitMutation = useSubmitPurchaseOrder();
  const orderMutation = useMarkPOAsOrdered();
  const cancelMutation = useCancelPurchaseOrder();

  const { printRef, handlePrint } = usePrint();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Purchase order not found</h3>
        <Button asChild className="mt-4">
          <Link to="/app/inventory/purchase-orders">Back to List</Link>
        </Button>
      </div>
    );
  }

  const canEdit = po.status === "draft";
  const canSubmit = po.status === "draft";
  const canApprove = po.status === "pending_approval";
  const canMarkOrdered = po.status === "approved";
  const canReceive = ["ordered", "partially_received"].includes(po.status);
  const canCancel = ["draft", "pending_approval", "approved"].includes(po.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={po.po_number}
        description={`Purchase order for ${po.vendor?.name}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" onClick={() => handlePrint({ title: po?.po_number || "Purchase Order" })}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            {canEdit && (
              <Button asChild>
                <Link to={`/app/inventory/purchase-orders/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        }
      />

      {/* Status and Actions */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Status:</span>
            <POStatusBadge status={po.status} />
          </div>
          <div className="flex gap-2">
            {canSubmit && (
              <Button 
                onClick={() => submitMutation.mutate(po.id)}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                Submit for Approval
              </Button>
            )}
            {canApprove && (
              <Button 
                onClick={() => approveMutation.mutate(po.id)}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            )}
            {canMarkOrdered && (
              <Button 
                onClick={() => orderMutation.mutate(po.id)}
                disabled={orderMutation.isPending}
              >
                {orderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                Mark as Ordered
              </Button>
            )}
            {canReceive && (
              <Button asChild>
                <Link to={`/app/inventory/grn/new?poId=${po.id}`}>
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Receive Goods
                </Link>
              </Button>
            )}
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Purchase Order?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The purchase order will be marked as cancelled.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep PO</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => cancelMutation.mutate(po.id)}
                      className="bg-destructive text-destructive-foreground"
                    >
                      Cancel PO
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PO Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{format(new Date(po.order_date), "dd MMMM yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Delivery</p>
                <p className="font-medium">
                  {po.expected_delivery_date 
                    ? format(new Date(po.expected_delivery_date), "dd MMMM yyyy")
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{po.branch?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created By</p>
                <p className="font-medium">{po.created_by_profile?.full_name || "-"}</p>
              </div>
              {po.approved_by_profile && (
                <div>
                  <p className="text-sm text-muted-foreground">Approved By</p>
                  <p className="font-medium">{po.approved_by_profile.full_name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{po.vendor?.name}</p>
              <p className="text-sm text-muted-foreground">{po.vendor?.vendor_code}</p>
              {po.vendor?.address && (
                <p className="text-sm">{po.vendor.address}</p>
              )}
              {po.vendor?.phone && (
                <p className="text-sm">{po.vendor.phone}</p>
              )}
              {po.vendor?.email && (
                <p className="text-sm text-primary">{po.vendor.email}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-center">Tax %</TableHead>
                <TableHead className="text-center">Disc %</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items?.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {item.item_type === 'medicine' ? item.medicine?.name : item.item?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.item_type === 'medicine' 
                          ? `${item.medicine?.generic_name || ''} • ${item.medicine?.unit || ''}`
                          : `${item.item?.item_code || ''} • ${item.item?.unit_of_measure || ''}`}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell className="text-center">{item.tax_percent}%</TableCell>
                  <TableCell className="text-center">{item.discount_percent}%</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.total_price)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={item.received_quantity >= item.quantity ? "text-green-600" : ""}>
                      {item.received_quantity || 0} / {item.quantity}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(po.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span>{formatCurrency(po.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount:</span>
                <span>{formatCurrency(po.discount_amount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Grand Total:</span>
                <span>{formatCurrency(po.total_amount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {(po.terms || po.notes) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {po.terms && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terms & Conditions</p>
                <p className="mt-1 whitespace-pre-line">{po.terms}</p>
              </div>
            )}
            {po.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="mt-1 whitespace-pre-line">{po.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hidden Printable */}
      <div className="hidden">
        <PrintablePO ref={printRef} po={po} organizationName={organization?.name || "Organization"} />
      </div>
    </div>
  );
}

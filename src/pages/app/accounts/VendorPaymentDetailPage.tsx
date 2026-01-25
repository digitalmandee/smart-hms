import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Printer, CheckCircle, XCircle, Building2, FileText, Banknote } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
import { useVendorPayment, useApproveVendorPayment, useCancelVendorPayment } from "@/hooks/useVendorPayments";
import { formatCurrencyFull as formatCurrency } from "@/lib/currency";

export default function VendorPaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: payment, isLoading } = useVendorPayment(id || "");
  const approvePayment = useApproveVendorPayment();
  const cancelPayment = useCancelVendorPayment();

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending Approval", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approved", className: "bg-blue-100 text-blue-800" },
      paid: { label: "Paid & Posted", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
    };
    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={`${config.className} text-lg px-4 py-1`}>{config.label}</Badge>;
  };

  const handleApprove = async () => {
    if (id) {
      await approvePayment.mutateAsync(id);
    }
  };

  const handleCancel = async () => {
    if (id) {
      await cancelPayment.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Payment Not Found</h2>
        <p className="text-muted-foreground mt-2">The payment record could not be found.</p>
        <Button className="mt-4" onClick={() => navigate("/app/accounts/vendor-payments")}>
          Back to Payments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Payment ${payment.payment_number}`}
        description={`Payment to ${payment.vendor?.name}`}
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Vendor Payments", href: "/app/accounts/vendor-payments" },
          { label: payment.payment_number },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print Voucher
            </Button>
            
            {payment.status === "pending" && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Post
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Payment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will post the payment to the general ledger:
                        <br />• Debit: Accounts Payable
                        <br />• Credit: Cash/Bank
                        <br /><br />
                        Amount: {formatCurrency(payment.amount)}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleApprove}>
                        Approve & Post
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Payment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will cancel the payment record. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Payment</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleCancel}
                        className="bg-destructive text-destructive-foreground"
                      >
                        Cancel Payment
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        }
      />

      {/* Status Banner */}
      <Card className={`border-l-4 ${
        payment.status === "paid" ? "border-l-green-500 bg-green-50 dark:bg-green-950" :
        payment.status === "pending" ? "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950" :
        payment.status === "cancelled" ? "border-l-red-500 bg-red-50 dark:bg-red-950" :
        "border-l-blue-500"
      }`}>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            {getStatusBadge(payment.status)}
            <div>
              <p className="text-2xl font-bold">{formatCurrency(payment.amount)}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(payment.payment_date), "dd MMMM yyyy")}
              </p>
            </div>
          </div>
          {payment.status === "paid" && payment.approved_by_profile && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Approved by</p>
              <p className="font-medium">{payment.approved_by_profile.full_name}</p>
              {payment.approved_at && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(payment.approved_at), "dd MMM yyyy HH:mm")}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendor Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Vendor Name</p>
                <p className="font-medium">{payment.vendor?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendor Code</p>
                <p className="font-mono">{payment.vendor?.vendor_code || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p>{payment.vendor?.contact_person || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Payment Number</p>
                <p className="font-mono font-medium">{payment.payment_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Date</p>
                <p>{format(new Date(payment.payment_date), "dd MMMM yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p>{payment.payment_method?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reference Number</p>
                <p>{payment.reference_number || "-"}</p>
              </div>
              {payment.bank_account && (
                <>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Bank Account</p>
                    <p>{payment.bank_account.bank_name} - {payment.bank_account.account_number}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reference Documents */}
        {(payment.grn || payment.purchase_order) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reference Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
          {payment.grn && (
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">GRN: {payment.grn.grn_number}</p>
                    <p className="text-sm text-muted-foreground">
                      Invoice: {payment.grn.invoice_number || "N/A"} • 
                      Total: {formatCurrency(payment.grn.invoice_amount || 0)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/app/inventory/grn/${payment.grn?.id}`)}
                  >
                    View GRN
                  </Button>
                </div>
              )}
              {payment.purchase_order && (
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">PO: {payment.purchase_order.po_number}</p>
                    <p className="text-sm text-muted-foreground">
                      Total: {formatCurrency(payment.purchase_order.total_amount || 0)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/app/inventory/purchase-orders/${payment.purchase_order?.id}`)}
                  >
                    View PO
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {payment.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{payment.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Journal Entry Link */}
        {payment.journal_entry_id && (
          <Card>
            <CardHeader>
              <CardTitle>Accounting Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <p className="font-medium text-green-700 dark:text-green-300">Posted to General Ledger</p>
                  <p className="text-sm text-muted-foreground">
                    Journal Entry created and posted
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/app/accounts/journal-entries/${payment.journal_entry_id}`)}
                >
                  View Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

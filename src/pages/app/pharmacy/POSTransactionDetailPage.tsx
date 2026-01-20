import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { usePOSTransaction, useVoidTransaction } from "@/hooks/usePOS";
import { usePrint } from "@/hooks/usePrint";
import { POSReceiptPreview } from "@/components/pharmacy/POSReceiptPreview";
import { format } from "date-fns";
import { ArrowLeft, Printer, XCircle, User, Phone, Clock, CreditCard } from "lucide-react";

export default function POSTransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { printRef, handlePrint } = usePrint();

  const { data: transaction, isLoading } = usePOSTransaction(id || "");
  const voidMutation = useVoidTransaction();

  const handleVoid = () => {
    if (!id) return;
    voidMutation.mutate({ transactionId: id, reason: "Voided by user" }, {
      onSuccess: () => navigate("/app/pharmacy/pos/transactions"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Transaction not found</p>
        <Button variant="link" onClick={() => navigate("/app/pharmacy/pos/transactions")}>
          Back to Transactions
        </Button>
      </div>
    );
  }

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    paid: "default",
    pending: "secondary",
    refunded: "outline",
    voided: "destructive",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Transaction ${transaction.transaction_number}`}
        description={`Created on ${format(new Date(transaction.created_at), "PPP 'at' p")}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/pharmacy/pos/transactions")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" onClick={() => handlePrint({ title: "POS Receipt" })}>
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
            {transaction.status === 'paid' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Void Transaction
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Void this transaction?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will restore all inventory and reverse the cash balance.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleVoid}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Void Transaction
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaction Details</CardTitle>
                <Badge variant={statusVariants[transaction.status] || "secondary"}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="font-medium">{transaction.customer_name || "Walk-in"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{transaction.customer_phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-medium">{format(new Date(transaction.created_at), "h:mm a")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cashier</p>
                    <p className="font-medium">{transaction.creator?.full_name || "Unknown"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(transaction.items || []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.medicine_name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.batch_number}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">Rs. {Number(item.unit_price).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {item.discount_percent > 0 ? `${item.discount_percent}%` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.tax_percent > 0 ? `${item.tax_percent}%` : "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rs. {Number(item.line_total).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs. {Number(transaction.subtotal).toFixed(2)}</span>
                </div>
                {transaction.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Discount</span>
                    <span>- Rs. {Number(transaction.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                {transaction.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>Rs. {Number(transaction.tax_amount).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Rs. {Number(transaction.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(transaction.payments || []).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium capitalize">
                        {payment.payment_method.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.reference_number || "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rs. {Number(payment.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Receipt Preview */}
        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={printRef}>
                <POSReceiptPreview transaction={transaction} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

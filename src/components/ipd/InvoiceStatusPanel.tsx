import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Receipt,
  Printer,
  ExternalLink,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { QuickPaymentDialog } from "./QuickPaymentDialog";

interface InvoiceStatusPanelProps {
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  depositAmount?: number;
  status: string;
  onPaymentRecorded?: () => void;
}

export function InvoiceStatusPanel({
  invoiceId,
  invoiceNumber,
  totalAmount,
  paidAmount,
  depositAmount = 0,
  status,
  onPaymentRecorded,
}: InvoiceStatusPanelProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Calculate balance considering deposit
  const effectivePaid = Math.max(paidAmount, depositAmount);
  const balance = totalAmount - effectivePaid;
  const refundDue = effectivePaid > totalAmount ? effectivePaid - totalAmount : 0;
  const isPaid = status === "paid" || balance <= 0;
  const hasRefund = refundDue > 0;

  const getStatusBadge = () => {
    if (hasRefund) {
      return (
        <Badge className="bg-info/10 text-info border-info">
          <AlertCircle className="h-3 w-3 mr-1" />
          Refund Due
        </Badge>
      );
    }
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-success/10 text-success border-success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "partially_paid":
        return (
          <Badge className="bg-warning/10 text-warning border-warning">
            <Clock className="h-3 w-3 mr-1" />
            Partially Paid
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <>
      <Card className={hasRefund ? "border-info/50 bg-info/5" : isPaid ? "border-success/50 bg-success/5" : "border-warning/50 bg-warning/5"}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Invoice: {invoiceNumber}
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Financial Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Charges:</span>
              <span className="font-medium">Rs. {totalAmount.toLocaleString()}</span>
            </div>
            {depositAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit Collected:</span>
                <span className="font-medium text-success">Rs. {depositAmount.toLocaleString()}</span>
              </div>
            )}
            {paidAmount > 0 && paidAmount !== depositAmount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-medium text-success">Rs. {paidAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between">
              {hasRefund ? (
                <>
                  <span className="font-medium text-info">Refund Due to Patient:</span>
                  <span className="font-bold text-info">Rs. {refundDue.toLocaleString()}</span>
                </>
              ) : balance > 0 ? (
                <>
                  <span className="font-medium text-destructive">Balance Due:</span>
                  <span className="font-bold text-destructive">Rs. {balance.toLocaleString()}</span>
                </>
              ) : (
                <>
                  <span className="font-medium text-success">Status:</span>
                  <span className="font-bold text-success">Fully Settled</span>
                </>
              )}
            </div>
          </div>

          {/* Refund Alert */}
          {hasRefund && (
            <div className="p-3 bg-info/10 rounded-lg border border-info/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-info mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-info">Refund Required</p>
                  <p className="text-muted-foreground">
                    Patient deposited Rs. {depositAmount.toLocaleString()} but charges are only Rs. {totalAmount.toLocaleString()}. 
                    Please process a refund of Rs. {refundDue.toLocaleString()}.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!isPaid && !hasRefund && (
              <Button onClick={() => setShowPaymentDialog(true)} className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to={`/app/billing/invoices/${invoiceId}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Invoice
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/app/billing/invoices/${invoiceId}?print=true`}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <QuickPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        invoiceId={invoiceId}
        invoiceNumber={invoiceNumber}
        balanceAmount={balance > 0 ? balance : 0}
        onSuccess={() => {
          setShowPaymentDialog(false);
          onPaymentRecorded?.();
        }}
      />
    </>
  );
}

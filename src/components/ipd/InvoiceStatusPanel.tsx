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
  status: string;
  onPaymentRecorded?: () => void;
}

export function InvoiceStatusPanel({
  invoiceId,
  invoiceNumber,
  totalAmount,
  paidAmount,
  status,
  onPaymentRecorded,
}: InvoiceStatusPanelProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  const balance = totalAmount - paidAmount;
  const isPaid = status === "paid" || balance <= 0;

  const getStatusBadge = () => {
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
      <Card className={isPaid ? "border-success/50 bg-success/5" : "border-warning/50 bg-warning/5"}>
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
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-semibold">Rs. {totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Paid</p>
              <p className="font-semibold text-success">Rs. {paidAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Balance</p>
              <p className={`font-semibold ${balance > 0 ? 'text-destructive' : 'text-success'}`}>
                Rs. {balance.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isPaid && (
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
        balanceAmount={balance}
        onSuccess={() => {
          setShowPaymentDialog(false);
          onPaymentRecorded?.();
        }}
      />
    </>
  );
}

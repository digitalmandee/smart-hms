import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientBillingHistory } from "@/hooks/useBilling";
import { usePatientPharmacyCredits, usePatientCreditBalance } from "@/hooks/usePharmacyCredits";
import { PharmacyCreditPaymentModal } from "./PharmacyCreditPaymentModal";
import { format } from "date-fns";
import { 
  Receipt, 
  CreditCard, 
  Plus, 
  ChevronRight, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Pill,
  Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientBillingHistoryProps {
  patientId: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  paid: { label: "Paid", variant: "default", icon: CheckCircle2 },
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  partially_paid: { label: "Partial", variant: "outline", icon: AlertTriangle },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
  draft: { label: "Draft", variant: "outline", icon: Clock },
  refunded: { label: "Refunded", variant: "secondary", icon: XCircle },
};

export function PatientBillingHistory({ patientId }: PatientBillingHistoryProps) {
  const { data, isLoading } = usePatientBillingHistory(patientId);
  const { data: pharmacyCredits = [], isLoading: creditsLoading } = usePatientPharmacyCredits(patientId);
  const { data: creditBalance } = usePatientCreditBalance(patientId);
  const [selectedCredit, setSelectedCredit] = useState<typeof pharmacyCredits[0] | null>(null);

  if (isLoading || creditsLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const { invoices, payments, summary } = data || { invoices: [], payments: [], summary: null };
  const pendingCredits = pharmacyCredits.filter(c => c.status !== "paid");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.totalInvoices || 0}</p>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">Rs. {(summary?.totalPaid || 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">Rs. {(summary?.totalOutstanding || 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Outstanding</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pharmacy Credits Card */}
        <Card className={creditBalance?.total ? "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Pill className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">Rs. {(creditBalance?.total || 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Pharmacy Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-center">
            <Link to={`/app/billing/invoices/new?patientId=${patientId}`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoices
          </CardTitle>
          <CardDescription>All billing invoices for this patient</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No invoices yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => {
                const status = statusConfig[invoice.status || "pending"];
                const StatusIcon = status.icon;
                const balance = Number(invoice.total_amount || 0) - Number(invoice.paid_amount || 0);

                return (
                  <Link
                    key={invoice.id}
                    to={`/app/billing/invoices/${invoice.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          invoice.status === "paid" ? "bg-success/10" :
                          invoice.status === "pending" ? "bg-warning/10" :
                          "bg-muted"
                        )}>
                          <StatusIcon className={cn(
                            "h-5 w-5",
                            invoice.status === "paid" ? "text-success" :
                            invoice.status === "pending" ? "text-warning" :
                            "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.invoice_date ? format(new Date(invoice.invoice_date), "MMM dd, yyyy") : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">Rs. {Number(invoice.total_amount || 0).toLocaleString()}</p>
                          {balance > 0 && invoice.status !== "cancelled" && (
                            <p className="text-sm text-destructive">Due: Rs. {balance.toLocaleString()}</p>
                          )}
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pharmacy Credits Section */}
      {pendingCredits.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-amber-600" />
              Pharmacy Credits (Pay Later)
            </CardTitle>
            <CardDescription>Outstanding credit purchases from pharmacy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingCredits.map((credit) => {
                const outstanding = credit.amount - credit.paid_amount;
                const isOverdue = credit.due_date && new Date(credit.due_date) < new Date();
                
                return (
                  <div
                    key={credit.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      isOverdue && "border-red-200 bg-red-50/50 dark:bg-red-950/20"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isOverdue ? "bg-red-100 dark:bg-red-900/30" : "bg-amber-100 dark:bg-amber-900/30"
                      )}>
                        <Pill className={cn(
                          "h-5 w-5",
                          isOverdue ? "text-red-600" : "text-amber-600"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium">
                          {credit.transaction?.transaction_number || "Pharmacy Credit"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {credit.created_at ? format(new Date(credit.created_at), "MMM dd, yyyy") : "-"}
                          {credit.due_date && (
                            <span className={isOverdue ? "text-red-600 ml-2" : "ml-2"}>
                              • Due: {format(new Date(credit.due_date), "MMM dd")}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-amber-600">Rs. {outstanding.toLocaleString()}</p>
                        {credit.paid_amount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Paid: Rs. {credit.paid_amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Badge variant={isOverdue ? "destructive" : "secondary"}>
                        {isOverdue ? "Overdue" : credit.status === "partial" ? "Partial" : "Pending"}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedCredit(credit)}
                      >
                        <Banknote className="h-4 w-4 mr-1" />
                        Pay
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>All payments received from this patient</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No payments recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-success/10">
                      <CreditCard className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {(payment.payment_method as any)?.name || "Cash"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.payment_date ? format(new Date(payment.payment_date), "MMM dd, yyyy 'at' h:mm a") : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-success">+Rs. {Number(payment.amount).toLocaleString()}</p>
                      {payment.reference_number && (
                        <p className="text-xs text-muted-foreground">Ref: {payment.reference_number}</p>
                      )}
                    </div>
                    <Link to={`/app/billing/invoices/${payment.invoice_id}`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PharmacyCreditPaymentModal
        open={!!selectedCredit}
        onClose={() => setSelectedCredit(null)}
        credit={selectedCredit}
      />
    </div>
  );
}
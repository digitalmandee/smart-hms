import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientBillingHistory } from "@/hooks/useBilling";
import { usePatientPharmacyCredits, usePatientCreditBalance } from "@/hooks/usePharmacyCredits";
import { usePatientDeposits, useDepositBalance } from "@/hooks/usePatientDeposits";
import { PharmacyCreditPaymentModal } from "./PharmacyCreditPaymentModal";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
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
  Banknote,
  Wallet
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

const depositTypeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  deposit: { label: "Deposit", color: "text-emerald-600", icon: Wallet },
  applied: { label: "Applied", color: "text-blue-600", icon: CheckCircle2 },
  refund: { label: "Refund", color: "text-orange-600", icon: XCircle },
};

export function PatientBillingHistory({ patientId }: PatientBillingHistoryProps) {
  const { data, isLoading } = usePatientBillingHistory(patientId);
  const { data: pharmacyCredits = [], isLoading: creditsLoading } = usePatientPharmacyCredits(patientId);
  const { data: creditBalance } = usePatientCreditBalance(patientId);
  const { data: deposits = [], isLoading: depositsLoading } = usePatientDeposits(patientId);
  const { data: depositBalance } = useDepositBalance(patientId);
  const { formatCurrency } = useCurrencyFormatter();
  const [selectedCredit, setSelectedCredit] = useState<typeof pharmacyCredits[0] | null>(null);

  if (isLoading || creditsLoading || depositsLoading) {
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
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
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
                <p className="text-2xl font-bold">{formatCurrency(summary?.totalPaid || 0)}</p>
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
                <p className="text-2xl font-bold text-destructive">{formatCurrency(summary?.totalOutstanding || 0)}</p>
                <p className="text-sm text-muted-foreground">Outstanding</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Balance Card */}
        <Card className={depositBalance?.balance ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(depositBalance?.balance || 0)}</p>
                <p className="text-sm text-muted-foreground">Deposit Balance</p>
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
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(creditBalance?.total || 0)}</p>
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

      {/* Deposits Section */}
      {deposits.length > 0 && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              Deposits & Advances
            </CardTitle>
            <CardDescription>All deposits and advances for this patient</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deposits.map((deposit: any) => {
                const typeConf = depositTypeConfig[deposit.type] || depositTypeConfig.deposit;
                const TypeIcon = typeConf.icon;
                const isCompleted = deposit.status === "completed";

                return (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        deposit.type === "deposit" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                        deposit.type === "applied" ? "bg-blue-100 dark:bg-blue-900/30" :
                        "bg-orange-100 dark:bg-orange-900/30"
                      )}>
                        <TypeIcon className={cn("h-5 w-5", typeConf.color)} />
                      </div>
                      <div>
                        <p className="font-medium">
                          {deposit.type === "deposit" ? "Deposit Received" :
                           deposit.type === "applied" ? "Deposit Applied" :
                           "Deposit Refund"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {deposit.created_at ? format(new Date(deposit.created_at), "MMM dd, yyyy 'at' h:mm a") : "-"}
                          {deposit.notes && <span className="ml-2">• {deposit.notes}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={cn("font-medium", typeConf.color)}>
                          {deposit.type === "deposit" ? "+" : "-"}{formatCurrency(Number(deposit.amount))}
                        </p>
                        {deposit.reference_number && (
                          <p className="text-xs text-muted-foreground">Ref: {deposit.reference_number}</p>
                        )}
                      </div>
                      <Badge variant={isCompleted ? "default" : "secondary"}>
                        {isCompleted ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                          <p className="font-medium">{formatCurrency(Number(invoice.total_amount || 0))}</p>
                          {balance > 0 && invoice.status !== "cancelled" && (
                            <p className="text-sm text-destructive">Due: {formatCurrency(balance)}</p>
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
                        <p className="font-medium text-amber-600">{formatCurrency(outstanding)}</p>
                        {credit.paid_amount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Paid: {formatCurrency(credit.paid_amount)}
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
                      <p className="font-medium text-success">+{formatCurrency(Number(payment.amount))}</p>
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

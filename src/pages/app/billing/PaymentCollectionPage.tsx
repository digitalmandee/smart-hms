import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInvoice, useRecordPayment, PaymentWithMethod } from "@/hooks/useBilling";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireSession } from "@/hooks/useRequireSession";
import { PaymentMethodSelector } from "@/components/billing/PaymentMethodSelector";
import { PrintableReceipt } from "@/components/billing/PrintableReceipt";
import { SessionRequiredGuard } from "@/components/billing/SessionRequiredGuard";
import { SessionStatusBanner } from "@/components/billing/SessionStatusBanner";
import { ArrowLeft, CreditCard, Printer, CheckCircle, Wallet, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { usePrint } from "@/hooks/usePrint";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useDepositBalance } from "@/hooks/usePatientDeposits";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface PaymentSplit {
  id: string;
  amount: number;
  paymentMethodId: string;
  referenceNumber: string;
}

export default function PaymentCollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { printRef, handlePrint } = usePrint();
  const { formatCurrency } = useCurrencyFormatter();

  // Session requirement for payment collection
  const { hasActiveSession, session, isLoading: sessionLoading } = useRequireSession("reception");

  const { data: invoice, isLoading } = useInvoice(id);
  const { data: organizations } = useOrganizations();
  const recordPaymentMutation = useRecordPayment();
  const { data: depositData } = useDepositBalance(invoice?.patient?.id);

  // Query deposit applications for this invoice
  const { data: depositApplications } = useQuery({
    queryKey: ["deposit-applications-for-invoice", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_deposits")
        .select("amount")
        .eq("invoice_id", id!)
        .eq("type", "applied")
        .eq("status", "completed");
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const depositAppliedOnInvoice = (depositApplications || []).reduce(
    (sum, d) => sum + Number(d.amount), 0
  );

  const [amount, setAmount] = useState<number>(0);
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [recordedPayment, setRecordedPayment] = useState<PaymentWithMethod | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splits, setSplits] = useState<PaymentSplit[]>([
    { id: crypto.randomUUID(), amount: 0, paymentMethodId: "", referenceNumber: "" },
    { id: crypto.randomUUID(), amount: 0, paymentMethodId: "", referenceNumber: "" },
  ]);

  const organization = organizations?.find((o) => o.id === profile?.organization_id);

  const balance = invoice
    ? (invoice.total_amount || 0) - (invoice.paid_amount || 0)
    : 0;

  // Initialize amount when invoice loads
  useState(() => {
    if (invoice && amount === 0) {
      setAmount(balance);
    }
  });

  const splitsTotal = splits.reduce((s, sp) => s + (sp.amount || 0), 0);

  const addSplit = () => {
    setSplits(prev => [...prev, { id: crypto.randomUUID(), amount: 0, paymentMethodId: "", referenceNumber: "" }]);
  };

  const removeSplit = (splitId: string) => {
    if (splits.length <= 2) return;
    setSplits(prev => prev.filter(s => s.id !== splitId));
  };

  const updateSplit = (splitId: string, field: keyof PaymentSplit, value: any) => {
    setSplits(prev => prev.map(s => s.id === splitId ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async () => {
    if (!id) return;

    if (isSplitPayment) {
      // Validate splits
      const validSplits = splits.filter(s => s.amount > 0 && s.paymentMethodId);
      if (validSplits.length < 2) {
        toast.error("Add at least 2 payment methods with amounts");
        return;
      }
      if (Math.abs(splitsTotal - amount) > 0.01) {
        toast.error(`Split amounts (${formatCurrency(splitsTotal)}) must equal payment amount (${formatCurrency(amount)})`);
        return;
      }

      // Record each split as a separate payment
      let lastResult: any = null;
      for (const split of validSplits) {
        lastResult = await recordPaymentMutation.mutateAsync({
          invoiceId: id,
          amount: split.amount,
          paymentMethodId: split.paymentMethodId,
          billingSessionId: session?.id,
          referenceNumber: split.referenceNumber || undefined,
          notes: notes ? `${notes} (Split payment)` : "Split payment",
        });
      }

      setRecordedPayment({
        ...lastResult,
        payment_method: { name: "Split Payment" } as any,
        received_by_profile: { full_name: profile?.full_name || "Staff" },
      });
    } else {
      if (!paymentMethodId || amount <= 0) return;

      const result = await recordPaymentMutation.mutateAsync({
        invoiceId: id,
        amount,
        paymentMethodId,
        billingSessionId: session?.id,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      });

      setRecordedPayment({
        ...result,
        payment_method: { name: "Payment" } as any,
        received_by_profile: { full_name: profile?.full_name || "Staff" },
      });
    }
    setShowSuccess(true);
  };

  if (isLoading || sessionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Block payment collection if no active session
  if (!hasActiveSession) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Record Payment"
          description="Payment collection requires an active billing session"
          actions={
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          }
        />
        <SessionRequiredGuard
          counterType="reception"
          message="Open a billing session to collect payments. This ensures all transactions are tracked for your shift."
        />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Invoice not found</p>
        <Button variant="link" onClick={() => navigate("/app/billing/invoices")}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Payment Recorded"
          description="Payment has been successfully recorded"
        />

        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">{formatCurrency(amount)}</h2>
            <p className="text-muted-foreground">
              Payment recorded for {invoice.invoice_number}
            </p>

            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={() => handlePrint({ title: "Payment Receipt" })}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/app/billing/invoices/${id}`)}
              >
                View Invoice
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/app/billing/invoices")}
              >
                Back to Invoices
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hidden Receipt for Printing */}
        {recordedPayment && (
          <div className="hidden">
            <PrintableReceipt
              ref={printRef}
              payment={recordedPayment}
              invoice={{
                invoice_number: invoice.invoice_number,
                total_amount: invoice.total_amount || 0,
                paid_amount: (invoice.paid_amount || 0) + amount,
              }}
              patient={invoice.patient}
              organization={organization || undefined}
              depositApplied={depositAppliedOnInvoice}
              depositAvailable={depositData ? depositData.balance + depositAppliedOnInvoice : undefined}
              remainingDeposit={depositData?.balance}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record Payment"
        description={`Payment for ${invoice.invoice_number}`}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Session Status Banner */}
      <SessionStatusBanner counterType="reception" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invoice Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice #</span>
              <span className="font-mono">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Patient</span>
              <span>
                {invoice.patient.first_name} {invoice.patient.last_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>
                {format(
                  new Date(invoice.invoice_date || invoice.created_at),
                  "MMM dd, yyyy"
                )}
              </span>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span>{formatCurrency(Number(invoice.total_amount))}</span>
              </div>
              <div className="flex justify-between text-success">
                <span>Already Paid</span>
                <span>{formatCurrency(Number(invoice.paid_amount))}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Balance Due</span>
                <span className="text-destructive">
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Balance Info */}
        {depositData && depositData.balance > 0 && (
          <Card className="border-emerald-500/50 bg-emerald-500/5 lg:col-span-2">
            <CardContent className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-emerald-600">
                    Available Deposit: {formatCurrency(depositData.balance)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This patient has a deposit balance that can be applied
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!invoice?.patient?.id || !id) return;
                  const applyAmt = Math.min(depositData.balance, balance);
                  
                  // Create "applied" deposit record — triggers GL: DR LIA-DEP-001, CR AR-001
                  const { error: depError } = await supabase
                    .from("patient_deposits")
                    .insert({
                      organization_id: profile!.organization_id!,
                      branch_id: profile!.branch_id,
                      created_by: profile!.id,
                      patient_id: invoice.patient.id,
                      amount: applyAmt,
                      type: "applied",
                      invoice_id: id,
                      notes: `Applied to ${invoice.invoice_number}`,
                    })
                    .select();
                  
                  if (depError) {
                    toast.error(depError.message);
                    return;
                  }

                  // Directly update invoice (no payment record — no cash movement)
                  const newPaid = (invoice.paid_amount || 0) + applyAmt;
                  const newStatus = newPaid >= (invoice.total_amount || 0) ? "paid" : "partially_paid";
                  await supabase
                    .from("invoices")
                    .update({ paid_amount: newPaid, status: newStatus })
                    .eq("id", id);

                  toast.success(`Deposit of ${formatCurrency(applyAmt)} applied to invoice`);
                  // Reload
                  window.location.reload();
                }}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Apply Deposit
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Amount *</Label>
              <Input
                type="number"
                min="0"
                max={balance}
                step="0.01"
                value={amount || ""}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder={`Max: ${formatCurrency(balance)}`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max payable: {formatCurrency(balance)}
              </p>
            </div>

            {/* Split Payment Toggle */}
            <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
              <Label htmlFor="split-toggle" className="cursor-pointer text-sm font-medium">
                Split Payment
              </Label>
              <Switch
                id="split-toggle"
                checked={isSplitPayment}
                onCheckedChange={setIsSplitPayment}
              />
            </div>

            {!isSplitPayment ? (
              <>
                <div>
                  <Label>Payment Method *</Label>
                  <PaymentMethodSelector
                    value={paymentMethodId}
                    onValueChange={setPaymentMethodId}
                  />
                </div>

                <div>
                  <Label>Reference Number (Optional)</Label>
                  <Input
                    placeholder="Transaction ID, Check number, etc."
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {splits.map((split, idx) => (
                  <div key={split.id} className="p-3 border rounded-lg space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Method {idx + 1}</span>
                      {splits.length > 2 && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSplit(split.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Amount</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={split.amount || ""}
                          onChange={(e) => updateSplit(split.id, "amount", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Method</Label>
                        <PaymentMethodSelector
                          value={split.paymentMethodId}
                          onValueChange={(v) => updateSplit(split.id, "paymentMethodId", v)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Reference (Optional)</Label>
                      <Input
                        placeholder="Ref #"
                        value={split.referenceNumber}
                        onChange={(e) => updateSplit(split.id, "referenceNumber", e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <Button variant="outline" size="sm" className="w-full" onClick={addSplit}>
                  <Plus className="mr-2 h-3 w-3" />
                  Add Method
                </Button>

                {/* Split summary */}
                <div className={`text-sm text-right font-medium ${Math.abs(splitsTotal - amount) > 0.01 ? "text-destructive" : "text-success"}`}>
                  Split Total: {formatCurrency(splitsTotal)} / {formatCurrency(amount)}
                  {Math.abs(splitsTotal - amount) > 0.01 && (
                    <p className="text-xs">Amounts must match</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={
                (isSplitPayment
                  ? splits.filter(s => s.amount > 0 && s.paymentMethodId).length < 2 || Math.abs(splitsTotal - amount) > 0.01
                  : !paymentMethodId) ||
                amount <= 0 ||
                amount > balance ||
                recordPaymentMutation.isPending
              }
            >
              {recordPaymentMutation.isPending
                ? "Recording..."
                : `Record ${formatCurrency(amount)} Payment`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

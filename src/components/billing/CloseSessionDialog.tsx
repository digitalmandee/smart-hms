import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useSession,
  useCloseSession,
  useSessionTransactions,
  CashDenominations,
  calculateDenominationTotal,
} from "@/hooks/useBillingSessions";
import { CashDenominationInput } from "./CashDenominationInput";
import { formatCurrency } from "@/lib/currency";
import {
  Clock,
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";

interface CloseSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onSuccess?: () => void;
}

export function CloseSessionDialog({
  open,
  onOpenChange,
  sessionId,
  onSuccess,
}: CloseSessionDialogProps) {
  const [denominations, setDenominations] = useState<CashDenominations>({});
  const [actualCash, setActualCash] = useState<number>(0);
  const [discrepancyReason, setDiscrepancyReason] = useState("");
  const [notes, setNotes] = useState("");

  const { data: session, isLoading } = useSession(sessionId);
  const { data: transactions } = useSessionTransactions(sessionId);
  const closeSessionMutation = useCloseSession();

  // Calculate expected cash from session data
  const expectedCash = (session?.opening_cash || 0) + 
    (transactions?.reduce((sum, t: any) => {
      const methodName = t.payment_method?.name?.toLowerCase() || '';
      if (methodName.includes('cash')) {
        return sum + Number(t.amount);
      }
      return sum;
    }, 0) || 0);

  const difference = actualCash - expectedCash;
  const hasDiscrepancy = Math.abs(difference) > 0;

  const handleDenominationChange = (denom: CashDenominations, total: number) => {
    setDenominations(denom);
    setActualCash(total);
  };

  const handleSubmit = async () => {
    if (hasDiscrepancy && !discrepancyReason.trim()) {
      return; // Require explanation for discrepancy
    }

    await closeSessionMutation.mutateAsync({
      sessionId,
      actualCash,
      cashDenominations: denominations,
      discrepancyReason: hasDiscrepancy ? discrepancyReason : undefined,
      notes: notes || undefined,
    });

    onOpenChange(false);
    onSuccess?.();
  };

  if (isLoading || !session) {
    return null;
  }

  // Calculate payment method totals from transactions
  const paymentTotals = transactions?.reduce(
    (acc: any, t: any) => {
      const methodName = t.payment_method?.name?.toLowerCase() || '';
      const amount = Number(t.amount);

      if (methodName.includes('cash')) acc.cash += amount;
      else if (methodName.includes('card') || methodName.includes('credit') || methodName.includes('debit'))
        acc.card += amount;
      else if (methodName.includes('upi') || methodName.includes('online')) acc.upi += amount;
      else acc.other += amount;

      return acc;
    },
    { cash: 0, card: 0, upi: 0, other: 0 }
  ) || { cash: 0, card: 0, upi: 0, other: 0 };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Close Session: {session.session_number}
          </DialogTitle>
          <DialogDescription>
            Count your cash drawer and close this billing session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Session Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Opened At:</span>
                  <p className="font-medium">
                    {format(new Date(session.opened_at), 'MMM dd, yyyy hh:mm a')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Transactions:</span>
                  <p className="font-medium">{transactions?.length || 0} payments</p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    Opening Cash:
                  </span>
                  <span>{formatCurrency(session.opening_cash)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Cash Collected:
                  </span>
                  <span>{formatCurrency(paymentTotals.cash)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card Payments:
                  </span>
                  <span>{formatCurrency(paymentTotals.card)}</span>
                </div>
                {paymentTotals.upi > 0 && (
                  <div className="flex justify-between items-center">
                    <span>UPI/Online:</span>
                    <span>{formatCurrency(paymentTotals.upi)}</span>
                  </div>
                )}
                {paymentTotals.other > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Other:</span>
                    <span>{formatCurrency(paymentTotals.other)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-semibold border-t pt-2">
                  <span>Expected Cash in Drawer:</span>
                  <span className="text-lg">{formatCurrency(expectedCash)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Denomination Input */}
          <CashDenominationInput
            value={denominations}
            onChange={handleDenominationChange}
            expectedCash={expectedCash}
          />

          {/* Discrepancy Warning */}
          {hasDiscrepancy && (
            <Card className={difference > 0 ? 'border-warning' : 'border-destructive'}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`h-5 w-5 flex-shrink-0 ${
                      difference > 0 ? 'text-warning' : 'text-destructive'
                    }`}
                  />
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">
                      {difference > 0
                        ? `Cash Excess: +${formatCurrency(difference)}`
                        : `Cash Short: ${formatCurrency(difference)}`}
                    </p>
                    <div>
                      <Label htmlFor="discrepancyReason">
                        Explain this discrepancy *
                      </Label>
                      <Textarea
                        id="discrepancyReason"
                        value={discrepancyReason}
                        onChange={(e) => setDiscrepancyReason(e.target.value)}
                        placeholder="Please explain why the cash count doesn't match..."
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Perfect Match */}
          {!hasDiscrepancy && actualCash > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Cash count matches exactly!</span>
            </div>
          )}

          {/* Closing Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Closing Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any remarks about this session..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              closeSessionMutation.isPending ||
              actualCash === 0 ||
              (hasDiscrepancy && !discrepancyReason.trim())
            }
          >
            {closeSessionMutation.isPending ? 'Closing...' : 'Close Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
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
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation();
  const [denominations, setDenominations] = useState<CashDenominations>({});
  const [actualCash, setActualCash] = useState<number>(0);
  const [discrepancyReason, setDiscrepancyReason] = useState("");
  const [notes, setNotes] = useState("");

  const { data: session, isLoading } = useSession(sessionId);
  const { data: transactions } = useSessionTransactions(sessionId);
  const closeSessionMutation = useCloseSession();

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
      return;
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
            {t('billing.closeSessionTitle')}: {session.session_number}
          </DialogTitle>
          <DialogDescription>
            {t('billing.closeSessionDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                {t('billing.sessionSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('billing.openedAt')}:</span>
                  <p className="font-medium">
                    {format(new Date(session.opened_at), 'MMM dd, yyyy hh:mm a')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('billing.transactions')}:</span>
                  <p className="font-medium">{transactions?.length || 0} {t('billing.payments')}</p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    {t('billing.openingCash')}:
                  </span>
                  <span>{formatCurrency(session.opening_cash)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {t('billing.cashCollectedSession')}:
                  </span>
                  <span>{formatCurrency(paymentTotals.cash)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {t('billing.cardPayments')}:
                  </span>
                  <span>{formatCurrency(paymentTotals.card)}</span>
                </div>
                {paymentTotals.upi > 0 && (
                  <div className="flex justify-between items-center">
                    <span>{t('billing.upiOnline')}:</span>
                    <span>{formatCurrency(paymentTotals.upi)}</span>
                  </div>
                )}
                {paymentTotals.other > 0 && (
                  <div className="flex justify-between items-center">
                    <span>{t('billing.other')}:</span>
                    <span>{formatCurrency(paymentTotals.other)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-semibold border-t pt-2">
                  <span>{t('billing.expectedCashInDrawer')}:</span>
                  <span className="text-lg">{formatCurrency(expectedCash)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <CashDenominationInput
            value={denominations}
            onChange={handleDenominationChange}
            expectedCash={expectedCash}
          />

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
                        ? `${t('billing.cashExcess')}: +${formatCurrency(difference)}`
                        : `${t('billing.cashShort')}: ${formatCurrency(difference)}`}
                    </p>
                    <div>
                      <Label htmlFor="discrepancyReason">
                        {t('billing.explainDiscrepancy')} *
                      </Label>
                      <Textarea
                        id="discrepancyReason"
                        value={discrepancyReason}
                        onChange={(e) => setDiscrepancyReason(e.target.value)}
                        placeholder={t('billing.discrepancyPlaceholder')}
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!hasDiscrepancy && actualCash > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{t('billing.cashCountMatches')}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">{t('billing.closingNotes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('billing.closingRemarksPlaceholder')}
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
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              closeSessionMutation.isPending ||
              actualCash === 0 ||
              (hasDiscrepancy && !discrepancyReason.trim())
            }
          >
            {closeSessionMutation.isPending ? t('billing.closing') : t('billing.closeSession')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

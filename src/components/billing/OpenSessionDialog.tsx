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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOpenSession, CounterType, getCurrentShift } from "@/hooks/useBillingSessions";
import { formatCurrency } from "@/lib/currency";
import { Clock, DollarSign, Monitor } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface OpenSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCounterType?: CounterType;
  onSuccess?: () => void;
}

export function OpenSessionDialog({
  open,
  onOpenChange,
  defaultCounterType = 'reception',
  onSuccess,
}: OpenSessionDialogProps) {
  const { t } = useTranslation();
  const [counterType, setCounterType] = useState<CounterType>(defaultCounterType);
  const [openingCash, setOpeningCash] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const openSessionMutation = useOpenSession();
  const currentShift = getCurrentShift();

  const COUNTER_TYPES: { value: CounterType; label: string }[] = [
    { value: 'reception', label: t('billing.counterReception') },
    { value: 'opd', label: t('billing.counterOpd') },
    { value: 'ipd', label: t('billing.counterIpd') },
    { value: 'pharmacy', label: t('billing.counterPharmacy') },
    { value: 'er', label: t('billing.counterEr') },
  ];

  const SHIFT_LABELS: Record<string, string> = {
    morning: t('billing.shiftMorning'),
    evening: t('billing.shiftEvening'),
    night: t('billing.shiftNight'),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await openSessionMutation.mutateAsync({
      counterType,
      openingCash,
      notes: notes || undefined,
    });

    setOpeningCash(0);
    setNotes("");
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            {t('billing.openBillingSession')}
          </DialogTitle>
          <DialogDescription>
            {t('billing.openSessionDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t('billing.currentShift')}</p>
              <p className="text-sm text-muted-foreground">
                {SHIFT_LABELS[currentShift]}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="counterType">{t('billing.counterType')} *</Label>
            <Select
              value={counterType}
              onValueChange={(v) => setCounterType(v as CounterType)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('billing.counterType')} />
              </SelectTrigger>
              <SelectContent>
                {COUNTER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openingCash" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('billing.openingCashBalance')} *
            </Label>
            <Input
              id="openingCash"
              type="number"
              min="0"
              step="1"
              value={openingCash || ''}
              onChange={(e) => setOpeningCash(parseFloat(e.target.value) || 0)}
              placeholder={t('billing.enterCashInDrawer')}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t('billing.cashInDrawer')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('billing.notesOptional')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('billing.openingRemarks')}
              rows={2}
            />
          </div>

          <div className="rounded-lg border p-3 bg-primary/5">
            <p className="text-sm">
              <strong>{t('billing.startingWith')}:</strong> {formatCurrency(openingCash)}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={openSessionMutation.isPending}>
              {openSessionMutation.isPending ? t('billing.opening') : t('billing.openBillingSession')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

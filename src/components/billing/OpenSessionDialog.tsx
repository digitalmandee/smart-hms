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

interface OpenSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCounterType?: CounterType;
  onSuccess?: () => void;
}

const COUNTER_TYPES: { value: CounterType; label: string }[] = [
  { value: 'reception', label: 'Reception / Front Desk' },
  { value: 'opd', label: 'OPD Counter' },
  { value: 'ipd', label: 'IPD Billing' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'er', label: 'Emergency' },
];

const SHIFT_LABELS = {
  morning: 'Morning (6 AM - 2 PM)',
  evening: 'Evening (2 PM - 10 PM)',
  night: 'Night (10 PM - 6 AM)',
};

export function OpenSessionDialog({
  open,
  onOpenChange,
  defaultCounterType = 'reception',
  onSuccess,
}: OpenSessionDialogProps) {
  const [counterType, setCounterType] = useState<CounterType>(defaultCounterType);
  const [openingCash, setOpeningCash] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const openSessionMutation = useOpenSession();
  const currentShift = getCurrentShift();

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
            Open Billing Session
          </DialogTitle>
          <DialogDescription>
            Start a new billing session to collect payments. You must close this session
            at the end of your shift.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Current Shift</p>
              <p className="text-sm text-muted-foreground">
                {SHIFT_LABELS[currentShift]}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="counterType">Counter Type *</Label>
            <Select
              value={counterType}
              onValueChange={(v) => setCounterType(v as CounterType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select counter type" />
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
              Opening Cash Balance *
            </Label>
            <Input
              id="openingCash"
              type="number"
              min="0"
              step="1"
              value={openingCash || ''}
              onChange={(e) => setOpeningCash(parseFloat(e.target.value) || 0)}
              placeholder="Enter cash in drawer"
              required
            />
            <p className="text-xs text-muted-foreground">
              Count all cash in your drawer before starting (float + any previous balance)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any opening remarks..."
              rows={2}
            />
          </div>

          <div className="rounded-lg border p-3 bg-primary/5">
            <p className="text-sm">
              <strong>Starting with:</strong> {formatCurrency(openingCash)}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={openSessionMutation.isPending}>
              {openSessionMutation.isPending ? 'Opening...' : 'Open Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOpenSession } from "@/hooks/usePOSSessions";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";

interface POSSessionOpenDialogProps {
  open: boolean;
  onSessionOpened: () => void;
}

export function POSSessionOpenDialog({ open, onSessionOpened }: POSSessionOpenDialogProps) {
  const [openingBalance, setOpeningBalance] = useState("");
  const { profile } = useAuth();
  const openSessionMutation = useOpenSession();

  const handleSubmit = () => {
    const balance = parseFloat(openingBalance) || 0;
    openSessionMutation.mutate(
      { openingBalance: balance },
      { onSuccess: () => onSessionOpened() }
    );
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Open Register
          </DialogTitle>
          <DialogDescription>
            Count your cash drawer and enter the opening balance to begin your shift.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Cashier: <strong className="text-foreground">{profile?.full_name}</strong></span>
            <span>{format(new Date(), "PPP h:mm a")}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening-balance">Opening Cash Balance</Label>
            <Input
              id="opening-balance"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              autoFocus
              className="text-lg font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter the total cash in your drawer before starting sales.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={openSessionMutation.isPending}
            className="w-full"
          >
            {openSessionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Open Register
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

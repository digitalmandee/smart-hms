import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCloseSession } from "@/hooks/usePOSSessions";
import { POSSession, POSTransaction } from "@/hooks/usePOS";
import { Loader2, Lock, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface POSSessionCloseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: POSSession;
  transactions: POSTransaction[];
}

export function POSSessionCloseDialog({
  open,
  onOpenChange,
  session,
  transactions,
}: POSSessionCloseDialogProps) {
  const [closingBalance, setClosingBalance] = useState("");
  const [notes, setNotes] = useState("");
  const closeSessionMutation = useCloseSession();

  const completedTxns = transactions.filter(t => t.status === "completed");
  const totalSales = completedTxns.reduce((s, t) => s + Number(t.total_amount), 0);

  // Calculate cash sales from payments
  const cashSales = completedTxns.reduce((sum, t) => {
    const cashPayments = (t.payments || []).filter(p => p.payment_method === "cash");
    return sum + cashPayments.reduce((s, p) => s + Number(p.amount), 0);
  }, 0);

  const cardSales = completedTxns.reduce((sum, t) => {
    const cardPayments = (t.payments || []).filter(p => p.payment_method === "card");
    return sum + cardPayments.reduce((s, p) => s + Number(p.amount), 0);
  }, 0);

  const mobileSales = completedTxns.reduce((sum, t) => {
    const mobilePayments = (t.payments || []).filter(p =>
      ["jazzcash", "easypaisa"].includes(p.payment_method)
    );
    return sum + mobilePayments.reduce((s, p) => s + Number(p.amount), 0);
  }, 0);

  const openingBalance = Number(session.opening_balance) || 0;
  const expectedCash = openingBalance + cashSales;
  const closingVal = parseFloat(closingBalance) || 0;
  const cashDifference = closingVal - expectedCash;

  const handleSubmit = () => {
    closeSessionMutation.mutate(
      {
        sessionId: session.id,
        closingBalance: closingVal,
        notes: notes || undefined,
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Close Register
          </DialogTitle>
          <DialogDescription>
            Review session summary and enter your closing cash count.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Session Summary */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground">Total Transactions</p>
                <p className="text-xl font-bold">{completedTxns.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground">Total Sales</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalSales)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Breakdown */}
          <Card>
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-sm">Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Cash Sales</span>
                <span className="font-mono">{formatCurrency(cashSales)}</span>
              </div>
              <div className="flex justify-between">
                <span>Card Sales</span>
                <span className="font-mono">{formatCurrency(cardSales)}</span>
              </div>
              <div className="flex justify-between">
                <span>Mobile Payments</span>
                <span className="font-mono">{formatCurrency(mobileSales)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Cash Reconciliation */}
          <Card>
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-sm">Cash Reconciliation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Opening Balance</span>
                <span className="font-mono">{formatCurrency(openingBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>+ Cash Sales</span>
                <span className="font-mono">{formatCurrency(cashSales)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>Expected Cash</span>
                <span className="font-mono">{formatCurrency(expectedCash)}</span>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="closing-balance">Actual Closing Cash</Label>
                <Input
                  id="closing-balance"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(e.target.value)}
                  className="text-lg font-mono"
                />
              </div>

              {closingBalance && (
                <div className="flex justify-between items-center text-sm font-medium border-t pt-2">
                  <span>Cash Difference</span>
                  <Badge
                    variant={cashDifference === 0 ? "default" : "destructive"}
                    className="font-mono"
                  >
                    {cashDifference > 0 && <ArrowUp className="h-3 w-3 mr-1" />}
                    {cashDifference < 0 && <ArrowDown className="h-3 w-3 mr-1" />}
                    {cashDifference === 0 && <Minus className="h-3 w-3 mr-1" />}
                    {formatCurrency(Math.abs(cashDifference))}
                    {cashDifference > 0 ? " Over" : cashDifference < 0 ? " Short" : ""}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="close-notes">Notes (Optional)</Label>
            <Textarea
              id="close-notes"
              placeholder="Any notes about this session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={closeSessionMutation.isPending || !closingBalance}
            variant="destructive"
          >
            {closeSessionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Close Register
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

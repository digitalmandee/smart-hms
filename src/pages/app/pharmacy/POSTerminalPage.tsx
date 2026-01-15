import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { POSSessionWidget } from "@/components/pharmacy/POSSessionWidget";
import { POSProductSearch } from "@/components/pharmacy/POSProductSearch";
import { POSCart } from "@/components/pharmacy/POSCart";
import { POSPaymentModal } from "@/components/pharmacy/POSPaymentModal";
import { POSReceiptPreview } from "@/components/pharmacy/POSReceiptPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  useActiveSession, 
  useOpenSession, 
  useCloseSession,
  useCreateTransaction,
  CartItem,
  PaymentEntry,
  POSTransaction,
} from "@/hooks/usePOS";
import { usePrint } from "@/hooks/usePrint";
import { toast } from "sonner";
import { Keyboard } from "lucide-react";

export default function POSTerminalPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOpenSessionDialog, setShowOpenSessionDialog] = useState(false);
  const [showCloseSessionDialog, setShowCloseSessionDialog] = useState(false);
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [completedTransaction, setCompletedTransaction] = useState<POSTransaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const { handlePrint } = usePrint();

  const { data: activeSession, isLoading: sessionLoading } = useActiveSession();
  const openSessionMutation = useOpenSession();
  const closeSessionMutation = useCloseSession();
  const createTransactionMutation = useCreateTransaction();

  // Focus barcode input when session is active
  useEffect(() => {
    if (activeSession && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [activeSession]);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.unit_price;
    const lineDiscount = lineSubtotal * (item.discount_percent / 100);
    return sum + (lineSubtotal - lineDiscount);
  }, 0);

  const taxAmount = cart.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.unit_price;
    const lineDiscount = lineSubtotal * (item.discount_percent / 100);
    const taxableAmount = lineSubtotal - lineDiscount;
    return sum + (taxableAmount * (item.tax_percent / 100));
  }, 0);

  const totalAmount = subtotal + taxAmount - discountAmount;

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.inventory_id === item.inventory_id);
      if (existing) {
        if (existing.quantity + item.quantity > item.available_quantity) {
          toast.error(`Only ${item.available_quantity} available in stock`);
          return prev;
        }
        return prev.map(i =>
          i.inventory_id === item.inventory_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const handleUpdateQuantity = (inventoryId: string, quantity: number) => {
    setCart(prev =>
      prev.map(item =>
        item.inventory_id === inventoryId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.available_quantity)) }
          : item
      )
    );
  };

  const handleRemoveItem = (inventoryId: string) => {
    setCart(prev => prev.filter(item => item.inventory_id !== inventoryId));
  };

  const handleClearCart = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscountAmount(0);
  };

  const handleOpenSession = () => {
    const balance = parseFloat(openingBalance);
    if (isNaN(balance) || balance < 0) {
      toast.error("Please enter a valid opening balance");
      return;
    }
    openSessionMutation.mutate(balance, {
      onSuccess: () => {
        setShowOpenSessionDialog(false);
        setOpeningBalance("");
      },
    });
  };

  const handleCloseSession = () => {
    if (!activeSession) return;
    
    const balance = parseFloat(closingBalance);
    if (isNaN(balance) || balance < 0) {
      toast.error("Please enter a valid closing balance");
      return;
    }
    
    closeSessionMutation.mutate({
      sessionId: activeSession.id,
      closingBalance: balance,
      notes: closingNotes,
    }, {
      onSuccess: () => {
        setShowCloseSessionDialog(false);
        setClosingBalance("");
        setClosingNotes("");
        handleClearCart();
      },
    });
  };

  const handlePaymentComplete = (payments: PaymentEntry[]) => {
    if (!activeSession || cart.length === 0) return;

    createTransactionMutation.mutate({
      sessionId: activeSession.id,
      items: cart,
      payments,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      discountAmount,
    }, {
      onSuccess: (transaction) => {
        setShowPaymentModal(false);
        setCompletedTransaction(transaction);
        setShowReceipt(true);
        handleClearCart();
      },
    });
  };

  const handlePrintReceipt = () => {
    handlePrint('pos-receipt');
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="POS Terminal"
        subtitle="Retail point of sale for walk-in customers"
      />

      {/* Session Widget */}
      <POSSessionWidget
        session={activeSession || null}
        onOpenSession={() => setShowOpenSessionDialog(true)}
        onCloseSession={() => setShowCloseSessionDialog(true)}
        isLoading={openSessionMutation.isPending || closeSessionMutation.isPending}
      />

      {activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Product Search - Left Side */}
          <div className="lg:col-span-2 space-y-4">
            {/* Hidden barcode input */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Keyboard className="h-4 w-4" />
              <span>Barcode scanner ready - scan or search below</span>
              <input
                ref={barcodeInputRef}
                type="text"
                className="sr-only"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Handle barcode scan
                  }
                }}
              />
            </div>

            <POSProductSearch onAddToCart={handleAddToCart} />
          </div>

          {/* Cart - Right Side */}
          <div className="space-y-4">
            {/* Customer Info */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Customer Info (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div>
                  <Label htmlFor="customerName" className="text-xs">Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone" className="text-xs">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="h-8"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cart */}
            <POSCart
              items={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              subtotal={subtotal}
              taxAmount={taxAmount}
              discountAmount={discountAmount}
              totalAmount={totalAmount}
              onDiscountChange={setDiscountAmount}
              onCheckout={() => setShowPaymentModal(true)}
              isProcessing={createTransactionMutation.isPending}
            />
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">No Active Session</h3>
            <p className="text-muted-foreground">
              Please open a POS session to start processing sales.
            </p>
            <Button onClick={() => setShowOpenSessionDialog(true)}>
              Open Session
            </Button>
          </div>
        </Card>
      )}

      {/* Open Session Dialog */}
      <Dialog open={showOpenSessionDialog} onOpenChange={setShowOpenSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open POS Session</DialogTitle>
            <DialogDescription>
              Enter the opening cash balance in your drawer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Opening Balance (Rs.)</Label>
              <Input
                id="openingBalance"
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpenSessionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleOpenSession}
              disabled={openSessionMutation.isPending}
            >
              {openSessionMutation.isPending ? "Opening..." : "Open Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Session Dialog */}
      <Dialog open={showCloseSessionDialog} onOpenChange={setShowCloseSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close POS Session</DialogTitle>
            <DialogDescription>
              Count your cash drawer and enter the closing balance.
              {activeSession && (
                <span className="block mt-2 font-medium text-foreground">
                  Expected Balance: Rs. {Number(activeSession.expected_balance || 0).toFixed(2)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="closingBalance">Actual Closing Balance (Rs.)</Label>
              <Input
                id="closingBalance"
                type="number"
                value={closingBalance}
                onChange={(e) => setClosingBalance(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closingNotes">Notes (Optional)</Label>
              <Input
                id="closingNotes"
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                placeholder="Any discrepancy notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseSessionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCloseSession}
              disabled={closeSessionMutation.isPending}
            >
              {closeSessionMutation.isPending ? "Closing..." : "Close Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <POSPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        totalAmount={totalAmount}
        onPaymentComplete={handlePaymentComplete}
        isProcessing={createTransactionMutation.isPending}
      />

      {/* Receipt Preview */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sale Complete</DialogTitle>
          </DialogHeader>
          {completedTransaction && (
            <POSReceiptPreview
              transaction={completedTransaction}
              items={cart}
              onPrint={handlePrintReceipt}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceipt(false)}>
              Close
            </Button>
            <Button onClick={handlePrintReceipt}>
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

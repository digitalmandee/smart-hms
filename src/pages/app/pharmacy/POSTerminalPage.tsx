import { useState, useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { POSProductSearch } from "@/components/pharmacy/POSProductSearch";
import { POSCart } from "@/components/pharmacy/POSCart";
import { POSPaymentModal } from "@/components/pharmacy/POSPaymentModal";
import { POSReceiptPreview } from "@/components/pharmacy/POSReceiptPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  useCreateTransaction,
  CartItem,
  POSTransaction,
  POSPayment,
} from "@/hooks/usePOS";
import { usePrint } from "@/hooks/usePrint";
import { useAuth } from "@/contexts/AuthContext";
import { Keyboard, AlertTriangle } from "lucide-react";

export default function POSTerminalPage() {
  const { profile } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<POSTransaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const { printRef, handlePrint } = usePrint();

  const hasBranch = !!profile?.branch_id;
  const createTransactionMutation = useCreateTransaction();

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.selling_price;
    const lineDiscount = lineSubtotal * (item.discount_percent / 100);
    return sum + (lineSubtotal - lineDiscount);
  }, 0);

  const taxAmount = cart.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.selling_price;
    const lineDiscount = lineSubtotal * (item.discount_percent / 100);
    const taxableAmount = lineSubtotal - lineDiscount;
    return sum + (taxableAmount * (item.tax_percent / 100));
  }, 0);

  const discountAmount = subtotal * (discountPercent / 100);
  const totalAmount = subtotal + taxAmount - discountAmount;

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.inventory_id === item.inventory_id);
      if (existing) {
        if (existing.quantity + item.quantity > item.available_quantity) {
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

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.available_quantity)) }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscountPercent(0);
  };

  const handlePaymentComplete = (payments: Omit<POSPayment, "id" | "transaction_id">[]) => {
    if (cart.length === 0) return;

    createTransactionMutation.mutate({
      items: cart,
      payments: payments.map(p => ({
        payment_method: p.payment_method,
        amount: p.amount,
        reference_number: p.reference_number || undefined,
        notes: p.notes || undefined,
      })),
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
    handlePrint({ title: "POS Receipt" });
  };

  // Show error if no branch assigned
  if (!hasBranch) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="POS Terminal"
          description="Retail point of sale for walk-in customers"
        />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Branch Not Assigned</AlertTitle>
          <AlertDescription>
            Your user account is not assigned to a branch. Please contact your administrator 
            to assign you to a branch before using the POS terminal.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="POS Terminal"
        description="Retail point of sale for walk-in customers"
      />

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
            subtotal={subtotal}
            discountPercent={discountPercent}
            discountAmount={discountAmount}
            taxAmount={taxAmount}
            total={totalAmount}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onDiscountChange={setDiscountPercent}
            onCheckout={() => setShowPaymentModal(true)}
            disabled={createTransactionMutation.isPending}
          />
        </div>
      </div>

      {/* Payment Modal */}
      <POSPaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={totalAmount}
        subtotal={subtotal}
        discountAmount={discountAmount}
        taxAmount={taxAmount}
        customerName={customerName}
        customerPhone={customerPhone}
        onCustomerNameChange={setCustomerName}
        onCustomerPhoneChange={setCustomerPhone}
        onConfirmPayment={handlePaymentComplete}
        isProcessing={createTransactionMutation.isPending}
      />

      {/* Receipt Preview */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sale Complete</DialogTitle>
          </DialogHeader>
          {completedTransaction && (
            <div ref={printRef}>
              <POSReceiptPreview transaction={completedTransaction} />
            </div>
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

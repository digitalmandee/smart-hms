import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { POSProductSearch } from "@/components/pharmacy/POSProductSearch";
import { POSCart } from "@/components/pharmacy/POSCart";
import { POSPaymentModal } from "@/components/pharmacy/POSPaymentModal";
import { POSReceiptPreview } from "@/components/pharmacy/POSReceiptPreview";
import { POSPatientSearch } from "@/components/pharmacy/POSPatientSearch";
import { POSHeldTransactionsDialog } from "@/components/pharmacy/POSHeldTransactions";
import { POSOrderReview } from "@/components/pharmacy/POSOrderReview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useHoldTransaction } from "@/hooks/useHeldTransactions";
import { PatientForPOS } from "@/hooks/usePatientPrescriptionsForPOS";
import { usePrint } from "@/hooks/usePrint";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationModules } from "@/hooks/useOrganizationModules";
import { 
  Heart, 
  Keyboard, 
  AlertTriangle, 
  Pause, 
  History, 
  Settings, 
  Printer,
  X,
  User,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";

export default function POSTerminalPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: enabledModules } = useOrganizationModules(profile?.organization_id);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showOrderReview, setShowOrderReview] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<POSTransaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientForPOS | null>(null);
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const { printRef, handlePrint } = usePrint();

  const hasBranch = !!profile?.branch_id;
  const createTransactionMutation = useCreateTransaction();
  const holdTransactionMutation = useHoldTransaction();
  
  // Check if patients module is enabled - if not, use standalone mode
  const isPatientsModuleEnabled = enabledModules?.includes("patients");
  const isStandaloneMode = !isPatientsModuleEnabled;

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

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
    setSelectedPatient(null);
  };

  const handleHoldTransaction = () => {
    if (cart.length === 0) return;
    holdTransactionMutation.mutate({
      cartItems: cart,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      patientId: selectedPatient?.id,
      discountPercent,
    }, {
      onSuccess: () => handleClearCart(),
    });
  };

  const handleRecallTransaction = (items: CartItem[], name?: string, phone?: string, patientId?: string) => {
    setCart(items);
    setCustomerName(name || "");
    setCustomerPhone(phone || "");
  };

  const handlePatientSelect = (patient: PatientForPOS | null) => {
    setSelectedPatient(patient);
    if (patient) {
      setCustomerName(`${patient.first_name} ${patient.last_name}`);
      setCustomerPhone(patient.phone || "");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowOrderReview(true);
  };

  const handleProceedToPayment = () => {
    setShowOrderReview(false);
    setShowPaymentModal(true);
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
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header Bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/app/pharmacy")}
            className="lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">POS Terminal</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Retail Point of Sale</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleHoldTransaction}
            disabled={cart.length === 0 || holdTransactionMutation.isPending}
            className="hidden sm:flex"
          >
            <Pause className="h-4 w-4 mr-1" />
            Hold
          </Button>
          <POSHeldTransactionsDialog onRecall={handleRecallTransaction} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app/pharmacy/settings")}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Products */}
        <div className="flex-1 lg:flex-[2] flex flex-col overflow-hidden border-r">
          {/* Barcode Scanner Indicator */}
          <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Keyboard className="h-4 w-4" />
            <span className="hidden sm:inline">Barcode scanner ready</span>
            <span className="sm:hidden">Scanner ready</span>
            <input
              ref={barcodeInputRef}
              type="text"
              className="absolute opacity-0 pointer-events-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Handle barcode scan
                }
              }}
            />
          </div>

          {/* Product Search */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <POSProductSearch onAddToCart={handleAddToCart} />
              
              {/* Patient Search for Prescription Lookup - only show if patients module is enabled */}
              {!isStandaloneMode && (
                <POSPatientSearch
                  onAddToCart={handleAddToCart}
                  onPatientSelect={handlePatientSelect}
                  selectedPatient={selectedPatient}
                />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Cart */}
        <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col overflow-hidden bg-muted/20">
          {/* Customer Info */}
          <div className="p-3 border-b bg-card shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Customer (Optional)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Name"
                className="h-8 text-sm"
              />
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone"
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Cart */}
          <div className="flex-1 overflow-hidden flex flex-col">
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
              onCheckout={handleCheckout}
              disabled={createTransactionMutation.isPending}
            />
          </div>
        </div>
      </div>

      {/* Order Review Modal */}
      <POSOrderReview
        open={showOrderReview}
        onClose={() => setShowOrderReview(false)}
        items={cart}
        customerName={customerName}
        customerPhone={customerPhone}
        subtotal={subtotal}
        discountPercent={discountPercent}
        discountAmount={discountAmount}
        taxAmount={taxAmount}
        total={totalAmount}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCustomerNameChange={setCustomerName}
        onCustomerPhoneChange={setCustomerPhone}
        onProceedToPayment={handleProceedToPayment}
      />

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
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Sale Complete
            </DialogTitle>
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
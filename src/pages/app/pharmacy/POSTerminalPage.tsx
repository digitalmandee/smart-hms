import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { POSProductSearch } from "@/components/pharmacy/POSProductSearch";
import { POSCart } from "@/components/pharmacy/POSCart";
import { POSPaymentModal } from "@/components/pharmacy/POSPaymentModal";
import { POSReceiptPreview } from "@/components/pharmacy/POSReceiptPreview";
import { POSPatientSearch } from "@/components/pharmacy/POSPatientSearch";
import { POSHeldTransactionsDialog } from "@/components/pharmacy/POSHeldTransactions";
import { POSOrderReview } from "@/components/pharmacy/POSOrderReview";
import { POSQuickActions } from "@/components/pharmacy/POSQuickActions";
import { POSRecentProducts } from "@/components/pharmacy/POSRecentProducts";
import { POSMedicineAlternatives } from "@/components/pharmacy/POSMedicineAlternatives";
import { POSCartCompanion } from "@/components/pharmacy/POSCartCompanion";
import { POSTodaySummary } from "@/components/pharmacy/POSTodaySummary";
import { POSSessionOpenDialog } from "@/components/pharmacy/POSSessionOpenDialog";
import { POSSessionCloseDialog } from "@/components/pharmacy/POSSessionCloseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  usePOSTransactions,
  usePostToPatientProfile,
  CartItem,
  POSTransaction,
  POSPayment,
} from "@/hooks/usePOS";
import { useCurrentPOSSession } from "@/hooks/usePOSSessions";
import { useHoldTransaction } from "@/hooks/useHeldTransactions";
import { PatientForPOS, PatientAdmissionStatus } from "@/hooks/usePatientPrescriptionsForPOS";
import { usePrint } from "@/hooks/usePrint";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationModules } from "@/hooks/useOrganizationModules";
import { 
  AlertTriangle, 
  Pause, 
  History, 
  Settings, 
  Printer,
  User,
  ShoppingCart,
  ArrowLeft,
  Volume2,
  VolumeX,
  BedDouble,
  FileText,
  Syringe,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

// Location state type for prescription cart
interface PrescriptionCartState {
  prescriptionCart?: CartItem[];
  patient?: PatientForPOS | null;
  prescriptionNumber?: string;
  // OT Medication tracking
  otMedicationId?: string;
  surgeryId?: string;
  otMedicationName?: string;
}

export default function POSTerminalPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [patientAdmission, setPatientAdmission] = useState<PatientAdmissionStatus | null>(null);
  const [showPostToProfileConfirm, setShowPostToProfileConfirm] = useState(false);
  const [showLastSaleReceipt, setShowLastSaleReceipt] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prescriptionNumber, setPrescriptionNumber] = useState<string | null>(null);
  const [showCloseSession, setShowCloseSession] = useState(false);
  
  // OT Medication tracking
  const [otMedicationId, setOtMedicationId] = useState<string | null>(null);
  const [otSurgeryId, setOtSurgeryId] = useState<string | null>(null);
  const [otMedicationName, setOtMedicationName] = useState<string | null>(null);
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { printRef, handlePrint } = usePrint();

  const hasBranch = !!profile?.branch_id;
  const createTransactionMutation = useCreateTransaction();
  const postToProfileMutation = usePostToPatientProfile();
  const holdTransactionMutation = useHoldTransaction();
  
  // Session management
  const { data: currentSession, isLoading: sessionLoading } = useCurrentPOSSession();
  const [sessionJustOpened, setSessionJustOpened] = useState(false);
  
  // Fetch last transaction for "Last Sale" feature
  const { data: recentTransactions } = usePOSTransactions(profile?.branch_id, {});
  const lastTransaction = recentTransactions?.[0];
  
  // Check if patients module is enabled - if not, use standalone mode
  const isPatientsModuleEnabled = enabledModules?.includes("patients");
  const isStandaloneMode = !isPatientsModuleEnabled;

  // Handle incoming prescription cart from Dispensing page or OT Queue
  useEffect(() => {
    const state = location.state as PrescriptionCartState | null;
    if (state?.prescriptionCart && state.prescriptionCart.length > 0) {
      setCart(state.prescriptionCart);
      if (state.patient) {
        setSelectedPatient(state.patient);
        setCustomerName(`${state.patient.first_name} ${state.patient.last_name || ""}`);
        setCustomerPhone(state.patient.phone || "");
      }
      if (state.prescriptionNumber) {
        setPrescriptionNumber(state.prescriptionNumber);
      }
      // Capture OT medication info
      if (state.otMedicationId) {
        setOtMedicationId(state.otMedicationId);
        setOtSurgeryId(state.surgeryId || null);
        setOtMedicationName(state.otMedicationName || null);
      }
      // Clear navigation state to prevent re-loading on refresh
      window.history.replaceState({}, document.title);
      toast.success(state.otMedicationId ? "OT Medication loaded" : "Prescription items loaded", {
        description: `${state.prescriptionCart.length} item(s) added to cart`,
      });
    }
  }, [location.state]);

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      switch (e.key) {
        case "F2":
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case "F4":
          e.preventDefault();
          if (cart.length > 0) handleHoldTransaction();
          break;
        case "F12":
          e.preventDefault();
          if (cart.length > 0) handleCheckout();
          break;
        case "Escape":
          e.preventDefault();
          if (showOrderReview) setShowOrderReview(false);
          else if (showPaymentModal) setShowPaymentModal(false);
          else if (showReceipt) setShowReceipt(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart.length, showOrderReview, showPaymentModal, showReceipt]);

  // Play sound on successful sale
  const playSuccessSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio("/sounds/success.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}
  }, [soundEnabled]);

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
    setPatientAdmission(null);
    setPrescriptionNumber(null);
    // Clear OT medication tracking
    setOtMedicationId(null);
    setOtSurgeryId(null);
    setOtMedicationName(null);
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

  const handlePostToProfile = () => {
    if (!patientAdmission || cart.length === 0) return;
    setShowPostToProfileConfirm(true);
  };

  const confirmPostToProfile = async () => {
    if (!patientAdmission || cart.length === 0) return;
    
    // Capture OT medication info before clearing cart
    const currentOtMedicationId = otMedicationId;
    const currentCart = [...cart];
    
    postToProfileMutation.mutate({
      admissionId: patientAdmission.id,
      items: cart,
      notes: otMedicationId 
        ? `OT Medication: ${otMedicationName || 'Unknown'} - Dispensed by ${profile?.full_name || "POS"}`
        : `Dispensed by ${profile?.full_name || "POS"} at ${new Date().toLocaleString()}`,
    }, {
      onSuccess: async () => {
        // Update OT medication status if applicable
        if (currentOtMedicationId) {
          try {
            await supabase
              .from('surgery_medications')
              .update({
                pharmacy_status: 'dispensed',
                dispensed_at: new Date().toISOString(),
                dispensed_by: profile?.id,
                inventory_item_id: currentCart[0]?.inventory_id,
                batch_number: currentCart[0]?.batch_number,
                unit_price: currentCart[0]?.selling_price,
                billing_status: 'posted',
              })
              .eq('id', currentOtMedicationId);
          } catch (err) {
            console.error('Failed to update OT medication status:', err);
          }
        }
        handleClearCart();
        setShowPostToProfileConfirm(false);
      },
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowOrderReview(true);
  };

  const handleProceedToPayment = () => {
    setShowOrderReview(false);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (payments: Omit<POSPayment, "id" | "transaction_id">[], isCredit?: boolean, dueDate?: string) => {
    if (cart.length === 0) return;

    // Capture OT medication info before clearing cart
    const currentOtMedicationId = otMedicationId;
    const currentCart = [...cart];

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
      patientId: selectedPatient?.id,
      isCredit,
      dueDate,
      sessionId: currentSession?.id,
    }, {
      onSuccess: async (transaction) => {
        // Update OT medication status if applicable
        if (currentOtMedicationId) {
          try {
            await supabase
              .from('surgery_medications')
              .update({
                pharmacy_status: 'dispensed',
                dispensed_at: new Date().toISOString(),
                dispensed_by: profile?.id,
                inventory_item_id: currentCart[0]?.inventory_id,
                batch_number: currentCart[0]?.batch_number,
                unit_price: currentCart[0]?.selling_price,
                billing_status: isCredit ? 'pending' : 'paid',
              })
              .eq('id', currentOtMedicationId);
          } catch (err) {
            console.error('Failed to update OT medication status:', err);
          }
        }
        
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
      <header className="h-14 flex items-center justify-between px-4 border-b bg-primary text-primary-foreground shrink-0">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/app/pharmacy")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">POS Terminal</h1>
              <p className="text-xs text-primary-foreground/70">
                {profile?.full_name || "Cashier"} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {currentSession && (
                  <span> • Session: {currentSession.session_number}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Sound On" : "Sound Off"}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleHoldTransaction}
            disabled={cart.length === 0 || holdTransactionMutation.isPending}
            className="hidden sm:flex bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
          >
            <Pause className="h-4 w-4 mr-1" />
            Hold
          </Button>
          <POSHeldTransactionsDialog onRecall={handleRecallTransaction} />
          {currentSession && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCloseSession(true)}
              className="hidden sm:flex bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
            >
              <Lock className="h-4 w-4 mr-1" />
              Close Register
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app/pharmacy/settings")}
            title="Settings"
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Products */}
        <div className="flex-1 lg:flex-[2] flex flex-col overflow-hidden border-r">
          {/* Quick Actions Bar */}
          <POSQuickActions 
            onShowLastSale={() => {
              if (lastTransaction) {
                setCompletedTransaction(lastTransaction);
                setShowLastSaleReceipt(true);
              }
            }}
          />

          {/* Product Search & Recent Products */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              <POSProductSearch onAddToCart={handleAddToCart} />

              {/* AI Medicine Alternatives */}
              <POSMedicineAlternatives onAddToCart={handleAddToCart} />
              
              {/* Recent Products Quick Add */}
              <POSRecentProducts onAddToCart={handleAddToCart} />
              
              {/* Patient Search for Prescription Lookup - only show if patients module is enabled */}
              {!isStandaloneMode && (
                <POSPatientSearch
                  onAddToCart={handleAddToCart}
                  onPatientSelect={handlePatientSelect}
                  selectedPatient={selectedPatient}
                  onAdmissionStatusChange={setPatientAdmission}
                />
              )}

              {/* Post to Profile Info - shown when admitted patient selected */}
              {patientAdmission && cart.length > 0 && (
                <Card className="border-blue-500/50 bg-blue-500/5">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BedDouble className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Admitted Patient</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      This patient is currently admitted. You can post these items to their IPD charges 
                      and they will be billed at discharge.
                    </p>
                    <Button 
                      onClick={handlePostToProfile}
                      disabled={postToProfileMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <BedDouble className="h-4 w-4 mr-2" />
                      Post to Profile ({formatCurrency(totalAmount)})
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          {/* Today's Summary Widget */}
          <POSTodaySummary />
        </div>

        {/* Right Panel - Cart */}
        <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col overflow-hidden bg-muted/20">
          {/* OT Medication Info Banner */}
          {otMedicationId && (
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 border-b border-orange-300 dark:border-orange-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Syringe className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">OT Medication: {otMedicationName}</span>
              </div>
              <Badge variant="outline" className="text-xs border-orange-400 text-orange-700 dark:text-orange-300">From Surgery</Badge>
            </div>
          )}
          
          {/* Prescription Info Banner */}
          {prescriptionNumber && !otMedicationId && (
            <div className="p-2 bg-primary/10 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Rx: {prescriptionNumber}</span>
              </div>
              <Badge variant="outline" className="text-xs">From Prescription</Badge>
            </div>
          )}
          
          {/* Customer Info */}
          <div className="p-3 border-b bg-card shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Customer {selectedPatient ? "" : "(Optional)"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Name"
                className="h-8 text-sm"
                readOnly={!!selectedPatient}
              />
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone"
                className="h-8 text-sm"
                readOnly={!!selectedPatient}
              />
            </div>
          </div>

          {/* Smart Suggest Companion */}
          <POSCartCompanion cartItems={cart} onAddToCart={handleAddToCart} />

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
        selectedPatientId={selectedPatient?.id}
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

      {/* Last Sale Receipt Dialog */}
      <Dialog open={showLastSaleReceipt} onOpenChange={setShowLastSaleReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Last Sale
            </DialogTitle>
          </DialogHeader>
          {completedTransaction && (
            <POSReceiptPreview transaction={completedTransaction} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLastSaleReceipt(false)}>
              Close
            </Button>
            <Button onClick={() => {
              handlePrint({ title: "Last Sale Receipt" });
            }}>
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post to Profile Confirmation Dialog */}
      <ConfirmDialog
        open={showPostToProfileConfirm}
        onOpenChange={setShowPostToProfileConfirm}
        title="Post to Patient Profile?"
        description={`Post ${cart.length} item(s) totaling ${formatCurrency(totalAmount)} to ${selectedPatient?.first_name} ${selectedPatient?.last_name}'s IPD charges? These will be billed at discharge.`}
        confirmLabel="Post to Profile"
        onConfirm={confirmPostToProfile}
        isLoading={postToProfileMutation.isPending}
      />

      {/* Session Open Dialog */}
      <POSSessionOpenDialog
        open={!sessionLoading && !currentSession}
        onSessionOpened={() => setSessionJustOpened(true)}
      />

      {/* Session Close Dialog */}
      {currentSession && (
        <POSSessionCloseDialog
          open={showCloseSession}
          onOpenChange={setShowCloseSession}
          session={currentSession}
          transactions={recentTransactions || []}
        />
      )}
    </div>
  );
}
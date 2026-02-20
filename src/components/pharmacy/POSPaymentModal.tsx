import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Banknote,
  CreditCard,
  Smartphone,
  Building2,
  User,
  Phone,
  Calculator,
  CheckCircle,
  Clock,
} from "lucide-react";
import { POSPayment } from "@/hooks/usePOS";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "@/lib/i18n";

interface POSPaymentModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  customerName: string;
  customerPhone: string;
  onCustomerNameChange: (name: string) => void;
  onCustomerPhoneChange: (phone: string) => void;
  onConfirmPayment: (payments: Omit<POSPayment, "id" | "transaction_id">[], isCredit?: boolean, dueDate?: string) => void;
  isProcessing?: boolean;
  selectedPatientId?: string | null;
}

const QUICK_CASH_AMOUNTS = [100, 500, 1000, 2000, 5000];

export function POSPaymentModal({
  open,
  onClose,
  total,
  subtotal,
  discountAmount,
  taxAmount,
  customerName,
  customerPhone,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onConfirmPayment,
  isProcessing,
  selectedPatientId,
}: POSPaymentModalProps) {
  const { t } = useTranslation();
  const { formatCurrency, currencySymbol } = useCurrencyFormatter();
  const [selectedMethod, setSelectedMethod] = useState<string>("cash");
  const [cashReceived, setCashReceived] = useState<number>(total);
  const [cardReference, setCardReference] = useState("");
  const [mobileReference, setMobileReference] = useState("");
  const [creditDueDate, setCreditDueDate] = useState<string>("");

  const PAYMENT_METHODS = [
    { value: "cash", label: t("pos.cash" as any), icon: Banknote },
    { value: "card", label: t("pos.card" as any), icon: CreditCard },
    { value: "jazzcash", label: "JazzCash", icon: Smartphone },
    { value: "easypaisa", label: "EasyPaisa", icon: Smartphone },
    { value: "bank_transfer", label: "Bank", icon: Building2 },
    { value: "credit", label: t("pos.payLater" as any), icon: Clock },
  ] as const;

  const changeAmount = Math.max(0, cashReceived - total);
  const isCredit = selectedMethod === "credit";
  const isCreditValid = isCredit && selectedPatientId;
  const isPaymentValid = selectedMethod === "cash" 
    ? cashReceived >= total 
    : selectedMethod === "credit"
    ? !!selectedPatientId
    : (selectedMethod === "card" || selectedMethod === "jazzcash" || selectedMethod === "easypaisa" || selectedMethod === "bank_transfer");

  const handleConfirm = () => {
    const payment: Omit<POSPayment, "id" | "transaction_id"> = {
      payment_method: (isCredit ? "other" : selectedMethod) as POSPayment["payment_method"],
      amount: isCredit ? 0 : total,
      reference_number: selectedMethod === "card" ? cardReference : 
                        (selectedMethod === "jazzcash" || selectedMethod === "easypaisa") ? mobileReference : null,
      notes: isCredit ? "Pay Later - Credit Sale" : null,
    };

    onConfirmPayment([payment], isCredit, creditDueDate || undefined);
  };

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t("pos.payment" as any)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("common.subtotal" as any)}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{t("common.discount" as any)}</span>
                <span>- {formatCurrency(discountAmount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t("common.tax" as any)}</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>{t("common.total" as any)}</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Customer Info (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <User className="h-3 w-3" />
                {t("pos.customerName" as any)} ({t("common.optional" as any)})
              </Label>
              <Input
                placeholder={t("pos.walkIn" as any)}
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {t("common.phone" as any)} ({t("common.optional" as any)})
              </Label>
              <Input
                placeholder="03XX-XXXXXXX"
                value={customerPhone}
                onChange={(e) => onCustomerPhoneChange(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Payment Method */}
          <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
            <TabsList className="grid grid-cols-6 h-auto">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex flex-col gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="cash" className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label>{t("pos.cashReceived" as any)}</Label>
                <Input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                  className="h-12 text-xl text-center font-semibold"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {QUICK_CASH_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickCash(amount)}
                  >
                    {currencySymbol} {amount}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickCash(total)}
                >
                  {t("pos.exact" as any)}
                </Button>
              </div>

              {cashReceived >= total && (
                <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg border border-success/20">
                  <span className="font-medium text-success">{t("common.change" as any)}</span>
                  <Badge variant="default" className="text-lg bg-success">
                    {formatCurrency(changeAmount)}
                  </Badge>
                </div>
              )}
            </TabsContent>

            <TabsContent value="card" className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label>{t("pos.cardReference" as any)}</Label>
                <Input
                  placeholder="XXXX"
                  value={cardReference}
                  onChange={(e) => setCardReference(e.target.value)}
                  maxLength={20}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("common.amount" as any)}: {formatCurrency(total)} {t("pos.amountCharged" as any)}
              </p>
            </TabsContent>

            <TabsContent value="jazzcash" className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label>JazzCash {t("pos.transactionId" as any)}</Label>
                <Input
                  placeholder="Transaction ID"
                  value={mobileReference}
                  onChange={(e) => setMobileReference(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("common.amount" as any)}: {formatCurrency(total)}
              </p>
            </TabsContent>

            <TabsContent value="easypaisa" className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label>EasyPaisa {t("pos.transactionId" as any)}</Label>
                <Input
                  placeholder="Transaction ID"
                  value={mobileReference}
                  onChange={(e) => setMobileReference(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("common.amount" as any)}: {formatCurrency(total)}
              </p>
            </TabsContent>

            <TabsContent value="bank_transfer" className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label>{t("pos.bankReference" as any)}</Label>
                <Input
                  placeholder="Reference"
                  value={cardReference}
                  onChange={(e) => setCardReference(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("common.amount" as any)}: {formatCurrency(total)}
              </p>
            </TabsContent>

            <TabsContent value="credit" className="space-y-3 mt-4">
              {!selectedPatientId ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium">{t("pos.patientRequired" as any)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("pos.patientRequiredDesc" as any)}
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm font-medium text-warning">{t("pos.creditSale" as any)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("pos.creditSaleDesc" as any)} {t("common.amount" as any)}: {formatCurrency(total)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("pos.dueDate" as any)}</Label>
                    <Input
                      type="date"
                      value={creditDueDate}
                      onChange={(e) => setCreditDueDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            {t("common.cancel" as any)}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isPaymentValid || isProcessing}
            className={`min-w-32 ${isCredit ? "bg-warning hover:bg-warning/90" : ""}`}
          >
            {isProcessing ? (
              t("common.processing" as any)
            ) : isCredit ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                {t("pos.recordCreditSale" as any)}
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t("pos.completeSale" as any)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
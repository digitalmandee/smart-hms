import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "@/hooks/usePOS";
import { Minus, Plus, Trash2, ShoppingCart, CreditCard } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface POSOrderReviewProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCustomerNameChange: (name: string) => void;
  onCustomerPhoneChange: (phone: string) => void;
  onProceedToPayment: () => void;
}

export function POSOrderReview({
  open,
  onClose,
  items,
  customerName,
  customerPhone,
  subtotal,
  discountPercent,
  discountAmount,
  taxAmount,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onProceedToPayment,
}: POSOrderReviewProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t("pos.reviewOrder" as any)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t("pos.customerName" as any)}</Label>
              <Input
                placeholder={t("pos.walkIn" as any)}
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("common.phone" as any)}</Label>
              <Input
                placeholder="03XX-XXXXXXX"
                value={customerPhone}
                onChange={(e) => onCustomerPhoneChange(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <Separator />

          {/* Items List */}
          <div className="flex-1 min-h-0">
            <h4 className="text-sm font-medium mb-2">{t("pos.orderItems" as any)} ({items.length})</h4>
            <ScrollArea className="h-[250px] border rounded-lg">
              <div className="p-3 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.medicine_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Rs. {item.selling_price.toFixed(2)} {t("pos.each" as any)}
                        {item.discount_percent > 0 && (
                          <span className="text-green-600 ml-1">
                            (-{item.discount_percent}%)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.available_quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="font-medium text-sm">
                        Rs. {(item.quantity * item.selling_price * (1 - item.discount_percent / 100)).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Order Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("common.subtotal" as any)}</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{t("common.discount" as any)} ({discountPercent}%)</span>
                <span>- Rs. {discountAmount.toFixed(2)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t("common.tax" as any)}</span>
                <span>Rs. {taxAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>{t("common.total" as any)}</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            {t("pos.backToCart" as any)}
          </Button>
          <Button onClick={onProceedToPayment} className="gap-2">
            <CreditCard className="h-4 w-4" />
            {t("pos.proceedToPayment" as any)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
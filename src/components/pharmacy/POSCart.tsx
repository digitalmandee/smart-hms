import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { CartItem } from "@/hooks/usePOS";
import { cn } from "@/lib/utils";

interface POSCartProps {
  items: CartItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onDiscountChange: (percent: number) => void;
  onCheckout: () => void;
  disabled?: boolean;
}

export function POSCart({
  items,
  subtotal,
  discountPercent,
  discountAmount,
  taxAmount,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onDiscountChange,
  onCheckout,
  disabled,
}: POSCartProps) {
  return (
    <div className="flex flex-col h-full bg-card rounded-lg border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Cart</h3>
          <span className="ml-auto text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {/* Items */}
      <ScrollArea className="flex-1 p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">No items in cart</p>
            <p className="text-xs">Search and add products</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const lineTotal = item.selling_price * item.quantity * (1 - item.discount_percent / 100);
              
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-muted/50 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.medicine_name}</p>
                      {item.batch_number && (
                        <p className="text-xs text-muted-foreground">Batch: {item.batch_number}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Rs. {item.selling_price.toFixed(2)} × {item.quantity}
                        {item.discount_percent > 0 && (
                          <span className="text-green-600 ml-1">(-{item.discount_percent}%)</span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          onUpdateQuantity(item.id, Math.max(1, Math.min(val, item.available_quantity)));
                        }}
                        className="h-7 w-14 text-center"
                        min={1}
                        max={item.available_quantity}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.id, Math.min(item.quantity + 1, item.available_quantity))}
                        disabled={item.quantity >= item.available_quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-semibold text-sm">Rs. {lineTotal.toFixed(2)}</p>
                  </div>

                  {item.quantity >= item.available_quantity && (
                    <p className="text-xs text-amber-600">Max stock reached</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Totals */}
      <div className="p-4 border-t space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Discount %</span>
          <Input
            type="number"
            value={discountPercent}
            onChange={(e) => onDiscountChange(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
            className="h-8 w-20 text-center"
            min={0}
            max={100}
          />
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>- Rs. {discountAmount.toFixed(2)}</span>
          </div>
        )}

        {taxAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>Rs. {taxAmount.toFixed(2)}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>

        <Button
          className="w-full h-12 text-lg"
          onClick={onCheckout}
          disabled={disabled || items.length === 0}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
}

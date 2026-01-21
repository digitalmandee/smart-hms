import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Trash2, Minus, Plus, ShoppingCart, Percent, AlertTriangle } from "lucide-react";
import { CartItem } from "@/hooks/usePOS";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

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

const QUICK_DISCOUNTS = [5, 10, 15, 20];

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
  // Check for stock issues
  const stockIssues = useMemo(() => {
    return items.filter(item => item.quantity > item.available_quantity);
  }, [items]);

  const hasStockIssues = stockIssues.length > 0;
  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Shopping Cart</h3>
              <p className="text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => items.forEach(item => onRemoveItem(item.id))}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Items */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="p-4 rounded-full bg-muted/50 mb-3">
                <ShoppingCart className="h-10 w-10 opacity-50" />
              </div>
              <p className="font-medium">Cart is empty</p>
              <p className="text-xs mt-1">Search products to add items</p>
            </div>
          ) : (
            items.map((item) => {
              const lineTotal = item.selling_price * item.quantity * (1 - item.discount_percent / 100);
              const isOutOfStock = item.quantity > item.available_quantity;
              const isLowStock = item.available_quantity > 0 && item.available_quantity <= 5;
              
              return (
                <div
                  key={item.id}
                  className={cn(
                    "p-3 rounded-lg bg-background border hover:border-primary/30 transition-colors",
                    isOutOfStock && "border-destructive/50 bg-destructive/5"
                  )}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.medicine_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          Rs. {item.selling_price.toFixed(2)}
                        </span>
                        {item.batch_number && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {item.batch_number}
                          </span>
                        )}
                        {item.discount_percent > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            -{item.discount_percent}%
                          </span>
                        )}
                        {isOutOfStock && (
                          <Badge variant="destructive" className="text-xs h-5">
                            Out of Stock
                          </Badge>
                        )}
                        {!isOutOfStock && isLowStock && (
                          <Badge variant="outline" className="text-xs h-5 border-amber-500 text-amber-600">
                            Low: {item.available_quantity}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md"
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
                        className={cn(
                          "h-7 w-12 text-center border-0 bg-transparent font-medium",
                          isOutOfStock && "text-destructive"
                        )}
                        min={1}
                        max={item.available_quantity}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md"
                        onClick={() => onUpdateQuantity(item.id, Math.min(item.quantity + 1, item.available_quantity))}
                        disabled={item.quantity >= item.available_quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-semibold text-sm">Rs. {lineTotal.toFixed(2)}</p>
                  </div>

                  {item.quantity >= item.available_quantity && !isOutOfStock && (
                    <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Maximum stock reached
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="border-t bg-muted/20">
        {/* Quick Discount Buttons */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Quick Discount</span>
          </div>
          <div className="flex items-center gap-2">
            {QUICK_DISCOUNTS.map((percent) => (
              <Button
                key={percent}
                variant={discountPercent === percent ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-1 h-9 font-medium",
                  discountPercent === percent && "bg-primary text-primary-foreground"
                )}
                onClick={() => onDiscountChange(discountPercent === percent ? 0 : percent)}
              >
                {percent}%
              </Button>
            ))}
            <div className="relative flex-1">
              <Input
                type="number"
                value={discountPercent || ""}
                onChange={(e) => onDiscountChange(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                placeholder="Custom"
                className="h-9 text-center pr-6"
                min={0}
                max={100}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 dark:text-green-400">Discount ({discountPercent}%)</span>
              <span className="text-green-600 dark:text-green-400 font-medium">- Rs. {discountAmount.toFixed(2)}</span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">Rs. {taxAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="pt-3 mt-2 border-t border-dashed">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">Rs. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Stock Issue Warning */}
        {hasStockIssues && (
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{stockIssues.length} item(s) exceed available stock</span>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <div className="p-3 pt-0">
          <Button
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
            onClick={onCheckout}
            disabled={disabled || items.length === 0 || hasStockIssues}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {hasStockIssues ? "Fix Stock Issues" : `Checkout — Rs. ${total.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

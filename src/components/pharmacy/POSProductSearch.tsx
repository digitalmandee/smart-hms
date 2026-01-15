import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Barcode, Package, AlertCircle } from "lucide-react";
import { useInventory, InventoryWithMedicine } from "@/hooks/usePharmacy";
import { CartItem } from "@/hooks/usePOS";
import { cn } from "@/lib/utils";

interface POSProductSearchProps {
  onAddToCart: (item: CartItem) => void;
  disabled?: boolean;
}

export function POSProductSearch({ onAddToCart, disabled }: POSProductSearchProps) {
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: inventory, isLoading } = useInventory(undefined, { search });

  // Filter inventory with stock > 0
  const availableItems = inventory?.filter((item) => item.quantity > 0) || [];

  // Handle barcode scanner input (fast typing detection)
  const [lastKeyTime, setLastKeyTime] = useState(0);
  const [barcodeBuffer, setBarcodeBuffer] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      
      const now = Date.now();
      if (now - lastKeyTime < 50 && e.key.length === 1) {
        setBarcodeBuffer((prev) => prev + e.key);
      } else if (e.key === "Enter" && barcodeBuffer.length > 5) {
        // Barcode scan complete
        setSearch(barcodeBuffer);
        setBarcodeBuffer("");
      } else if (e.key.length === 1) {
        setBarcodeBuffer(e.key);
      }
      setLastKeyTime(now);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastKeyTime, barcodeBuffer, disabled]);

  const handleSelectItem = (item: InventoryWithMedicine) => {
    const cartItem: CartItem = {
      id: crypto.randomUUID(),
      inventory_id: item.id,
      medicine_id: item.medicine_id,
      medicine_name: item.medicine?.name || "Unknown",
      batch_number: item.batch_number,
      quantity: 1,
      unit_price: Number(item.unit_price) || 0,
      selling_price: Number(item.selling_price) || Number(item.unit_price) || 0,
      available_quantity: item.quantity,
      discount_percent: 0,
      tax_percent: 0,
    };
    onAddToCart(cartItem);
    setSearch("");
    inputRef.current?.focus();
  };

  const showResults = isFocused && search.length > 0;

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search medicine or scan barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-10 pr-10 h-12 text-lg"
          disabled={disabled}
        />
        <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <ScrollArea className="max-h-80">
            <CardContent className="p-2">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Searching...</div>
              ) : availableItems.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No products found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {availableItems.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg cursor-pointer",
                        "hover:bg-muted transition-colors"
                      )}
                      onClick={() => handleSelectItem(item)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.medicine?.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {item.medicine?.strength && (
                              <span>{item.medicine.strength}</span>
                            )}
                            {item.batch_number && (
                              <span>• Batch: {item.batch_number}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          Rs. {(Number(item.selling_price) || Number(item.unit_price) || 0).toFixed(2)}
                        </p>
                        <Badge
                          variant={item.quantity <= (item.reorder_level || 10) ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          Stock: {item.quantity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}

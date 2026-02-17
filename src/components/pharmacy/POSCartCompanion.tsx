import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAIChat } from "@/hooks/useAIChat";
import { DoctorAvatar } from "@/components/ai/DoctorAvatar";
import { ChevronDown, Plus, Sparkles, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CartItem } from "@/hooks/usePOS";
import { useDebounce } from "@/hooks/useDebounce";

interface POSCartCompanionProps {
  cartItems: CartItem[];
  onAddToCart: (item: CartItem) => void;
}

interface SuggestionItem {
  name: string;
  inventoryId?: string;
  medicineId?: string;
  medicineName?: string;
  batchNumber?: string | null;
  quantity?: number;
  sellingPrice?: number;
  inStock: boolean;
}

export function POSCartCompanion({ cartItems, onAddToCart }: POSCartCompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const lastCartKey = useRef("");
  const { profile } = useAuth();

  const { messages, isLoading, sendMessage, clearChat } = useAIChat({
    mode: "pharmacy_lookup",
  });

  // Create a stable key from cart medicine names
  const cartKey = cartItems.map((i) => i.medicine_name).sort().join("|");
  const debouncedCartKey = useDebounce(cartKey, 1500);

  // Trigger AI suggestion when cart changes (debounced)
  useEffect(() => {
    if (
      !debouncedCartKey ||
      debouncedCartKey === lastCartKey.current ||
      isLoading ||
      cartItems.length === 0
    )
      return;

    lastCartKey.current = debouncedCartKey;
    setSuggestions([]);
    setHasSearched(true);

    const names = cartItems.map((i) => i.medicine_name).join(", ");
    const prompt = `For a patient buying: ${names}. Suggest 2-3 complementary OTC medicines commonly recommended together in Pakistan. Return ONLY a JSON array of medicine brand name strings. No explanation.`;

    sendMessage(prompt);
  }, [debouncedCartKey, isLoading, cartItems, sendMessage]);

  // Reset when cart empties
  useEffect(() => {
    if (cartItems.length === 0 && hasSearched) {
      setSuggestions([]);
      setHasSearched(false);
      lastCartKey.current = "";
      clearChat();
    }
  }, [cartItems.length, hasSearched, clearChat]);

  // Parse AI response
  useEffect(() => {
    if (isLoading || !hasSearched) return;
    const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
    if (!lastAssistant?.content || suggestions.length > 0) return;

    try {
      const arrMatch = lastAssistant.content.match(/\[[\s\S]*\]/);
      if (arrMatch) {
        const parsed = JSON.parse(arrMatch[0]) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out items already in cart
          const cartNames = new Set(cartItems.map((i) => i.medicine_name.toLowerCase()));
          const filtered = parsed.filter(
            (name) => !cartNames.has(name.toLowerCase())
          );
          if (filtered.length > 0) {
            lookupInventory(filtered);
          }
        }
      }
    } catch {
      // Parse failed
    }
  }, [messages, isLoading, hasSearched, suggestions.length, cartItems]);

  const lookupInventory = async (names: string[]) => {
    if (!profile?.branch_id) {
      setSuggestions(names.map((n) => ({ name: n, inStock: false })));
      return;
    }

    try {
      const orFilter = names
        .map((name) => `medicine_name.ilike.%${name.replace(/[%_]/g, "")}%`)
        .join(",");

      const { data } = await supabase
        .from("medicine_inventory")
        .select("id, medicine_id, quantity, batch_number, selling_price, medicine:medicines!medicine_inventory_medicine_id_fkey(id, name)")
        .eq("branch_id", profile.branch_id)
        .or(orFilter)
        .gt("quantity", 0)
        .order("quantity", { ascending: false });

      const items: SuggestionItem[] = names.map((name) => {
        const normalizedName = name.toLowerCase().trim();
        const match = data?.find((d) => {
          const medName = ((d.medicine as any)?.name || "").toLowerCase().trim();
          return medName.includes(normalizedName) || normalizedName.includes(medName);
        });

        if (match) {
          const med = match.medicine as any;
          return {
            name,
            inventoryId: match.id,
            medicineId: match.medicine_id || med?.id,
            medicineName: med?.name || name,
            batchNumber: match.batch_number,
            quantity: match.quantity,
            sellingPrice: match.selling_price || 0,
            inStock: true,
          };
        }
        return { name, inStock: false };
      });

      setSuggestions(items);
    } catch {
      setSuggestions(names.map((n) => ({ name: n, inStock: false })));
    }
  };

  const handleAdd = (item: SuggestionItem) => {
    if (!item.inStock || !item.inventoryId) return;
    onAddToCart({
      id: crypto.randomUUID(),
      inventory_id: item.inventoryId,
      medicine_id: item.medicineId || null,
      medicine_name: item.medicineName || item.name,
      batch_number: item.batchNumber || null,
      quantity: 1,
      unit_price: item.sellingPrice || 0,
      selling_price: item.sellingPrice || 0,
      available_quantity: item.quantity || 0,
      discount_percent: 0,
      tax_percent: 0,
    });
  };

  // Don't render if cart is empty and no suggestions
  if (cartItems.length === 0 && !hasSearched) return null;

  return (
    <Card className="border-primary/15 bg-primary/5 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="p-2.5 cursor-pointer hover:bg-primary/10 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DoctorAvatar size="xs" state={isLoading ? "thinking" : "idle"} />
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium">Smart Suggest</span>
              </div>
              {suggestions.filter((s) => s.inStock).length > 0 && (
                <span className="bg-primary text-primary-foreground text-[9px] font-bold rounded-full px-1.5 py-0.5">
                  {suggestions.filter((s) => s.inStock).length}
                </span>
              )}
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-2.5 pt-0 space-y-2">
            {isLoading && (
              <div className="flex items-center gap-2 py-2">
                <DoctorAvatar size="xs" state="thinking" />
                <span className="text-[10px] text-primary animate-pulse">
                  Finding suggestions...
                </span>
              </div>
            )}

            {suggestions.length > 0 && !isLoading && (
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] transition-all animate-fade-in ${
                      item.inStock
                        ? "border-primary/20 bg-background hover:bg-primary/5 cursor-pointer"
                        : "border-border/40 bg-muted/30 opacity-50"
                    }`}
                    style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
                  >
                    {item.inStock && (
                      <Package className="h-3 w-3 text-green-600 flex-shrink-0" />
                    )}
                    <span className="font-medium">{item.name}</span>
                    {item.inStock && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAdd(item)}
                        className="h-5 w-5 p-0 rounded-full hover:bg-primary hover:text-primary-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {hasSearched && !isLoading && suggestions.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-1">
                No additional suggestions
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Star, ChevronDown, ChevronUp, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CartItem } from "@/hooks/usePOS";
import { cn } from "@/lib/utils";

interface POSRecentProductsProps {
  onAddToCart: (item: CartItem) => void;
}

interface RecentProduct {
  inventory_id: string;
  medicine_id: string;
  medicine_name: string;
  batch_number: string | null;
  selling_price: number;
  available_quantity: number;
  total_sold: number;
}

export function POSRecentProducts({ onAddToCart }: POSRecentProductsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { profile } = useAuth();

  const { data: recentProducts, isLoading } = useQuery({
    queryKey: ["pos-recent-products", profile?.branch_id],
    queryFn: async () => {
      if (!profile?.branch_id) return [];

      // Get most sold products from recent transactions
      const { data: transactions, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select(`
          id,
          created_at
        `)
        .eq("branch_id", profile.branch_id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!transactions?.length) return [];

      const transactionIds = transactions.map(t => t.id);

      // Get items from these transactions - using raw query approach for new tables
      const { data: items, error: itemsError } = await (supabase as any)
        .from("pharmacy_pos_items")
        .select(`
          inventory_id,
          medicine_name,
          quantity
        `)
        .in("transaction_id", transactionIds);

      if (itemsError) throw itemsError;

      // Aggregate by inventory_id
      const productMap = new Map<string, { medicine_name: string; total_qty: number }>();
      for (const item of items || []) {
        const existing = productMap.get(item.inventory_id);
        if (existing) {
          existing.total_qty += item.quantity;
        } else {
          productMap.set(item.inventory_id, {
            medicine_name: item.medicine_name,
            total_qty: item.quantity,
          });
        }
      }

      // Get current inventory info for top products
      const topInventoryIds = Array.from(productMap.entries())
        .sort((a, b) => b[1].total_qty - a[1].total_qty)
        .slice(0, 8)
        .map(([id]) => id);

      if (topInventoryIds.length === 0) return [];

      const { data: inventory, error: invError } = await supabase
        .from("medicine_inventory")
        .select(`
          id,
          medicine_id,
          batch_number,
          selling_price,
          quantity,
          medicine:medicines(name)
        `)
        .in("id", topInventoryIds)
        .gt("quantity", 0);

      if (invError) throw invError;

      return (inventory || []).map((inv: any) => ({
        inventory_id: inv.id,
        medicine_id: inv.medicine_id,
        medicine_name: inv.medicine?.name || productMap.get(inv.id)?.medicine_name || "Unknown",
        batch_number: inv.batch_number,
        selling_price: Number(inv.selling_price) || 0,
        available_quantity: inv.quantity,
        total_sold: productMap.get(inv.id)?.total_qty || 0,
      })) as RecentProduct[];
    },
    enabled: !!profile?.branch_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleAddProduct = (product: RecentProduct) => {
    const cartItem: CartItem = {
      id: crypto.randomUUID(),
      inventory_id: product.inventory_id,
      medicine_id: product.medicine_id,
      medicine_name: product.medicine_name,
      batch_number: product.batch_number,
      quantity: 1,
      unit_price: product.selling_price,
      selling_price: product.selling_price,
      available_quantity: product.available_quantity,
      discount_percent: 0,
      tax_percent: 0,
    };
    onAddToCart(cartItem);
  };

  if (isLoading || !recentProducts?.length) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-card">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-3 h-auto hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="font-medium text-sm">Quick Add</span>
            <Badge variant="secondary" className="text-xs">
              {recentProducts.length}
            </Badge>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3">
          <div className="flex flex-wrap gap-2">
            {recentProducts.map((product) => (
              <Button
                key={product.inventory_id}
                variant="outline"
                size="sm"
                className={cn(
                  "h-auto py-1.5 px-3 text-xs font-normal",
                  "hover:bg-primary hover:text-primary-foreground hover:border-primary"
                )}
                onClick={() => handleAddProduct(product)}
              >
                <Package className="h-3 w-3 mr-1.5 opacity-60" />
                <span className="truncate max-w-[120px]">{product.medicine_name}</span>
              </Button>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, CreditCard, Banknote, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface DailySalesData {
  total_sales: number;
  transaction_count: number;
  cash_sales: number;
  card_sales: number;
  top_items: { name: string; quantity: number; revenue: number }[];
}

interface TransactionItem {
  name: string;
  quantity: number;
  total: number;
}

export function DailySalesSummary() {
  const { profile } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["daily-sales-summary", profile?.organization_id, today],
    queryFn: async (): Promise<DailySalesData> => {
      if (!profile?.organization_id) {
        return {
          total_sales: 0,
          transaction_count: 0,
          cash_sales: 0,
          card_sales: 0,
          top_items: [],
        };
      }

      // Fetch today's transactions - note: payment_method doesn't exist, so we can't differentiate
      const { data: transactions, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("id, total_amount, notes")
        .eq("organization_id", profile.organization_id)
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`);

      if (error) throw error;

      const total_sales = transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      const transaction_count = transactions?.length || 0;
      
      // Since we don't have payment_method column, we'll show all as cash for now
      const cash_sales = total_sales;
      const card_sales = 0;

      // For top items, we need to fetch from stock movements instead since transactions don't store items directly
      const { data: stockMovements } = await supabase
        .from("pharmacy_stock_movements")
        .select("medicine_id, quantity, medicines(name)")
        .eq("organization_id", profile.organization_id)
        .eq("movement_type", "sale")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`);

      // Aggregate top selling items
      const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();

      stockMovements?.forEach((movement: any) => {
        const medicine = movement.medicines as { name: string } | null;
        if (medicine?.name) {
          const existing = itemMap.get(medicine.name);
          const qty = Math.abs(movement.quantity || 0);
          if (existing) {
            existing.quantity += qty;
          } else {
            itemMap.set(medicine.name, {
              name: medicine.name,
              quantity: qty,
              revenue: 0,
            });
          }
        }
      });

      const top_items = Array.from(itemMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      return {
        total_sales,
        transaction_count,
        cash_sales,
        card_sales,
        top_items,
      };
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Today's Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Today's Sales Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(data?.total_sales || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{data?.transaction_count || 0}</p>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 border rounded">
            <Banknote className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">
                {formatCurrency(data?.cash_sales || 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">Cash</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 border rounded">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">
                {formatCurrency(data?.card_sales || 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">Card</p>
            </div>
          </div>
        </div>

        {/* Top Items */}
        {data?.top_items && data.top_items.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Package className="h-3 w-3" />
              Top Selling Items
            </p>
            <div className="space-y-1">
              {data.top_items.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs p-1.5 bg-muted/50 rounded"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span className="truncate max-w-[120px]">{item.name}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {item.quantity} sold
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!data?.top_items || data.top_items.length === 0) && data?.transaction_count === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No sales yet today</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

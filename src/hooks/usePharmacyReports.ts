import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PaymentBreakdown {
  name: string;
  value: number;
  amount: number;
  color: string;
}

interface TopMedicine {
  name: string;
  medicine_id: string;
  quantity: number;
  revenue: number;
}

const PAYMENT_COLORS: Record<string, string> = {
  cash: "#22c55e",
  card: "#3b82f6",
  jazzcash: "#ef4444",
  easypaisa: "#8b5cf6",
  bank_transfer: "#f59e0b",
  credit: "#06b6d4",
  other: "#6b7280",
};

export function usePaymentMethodBreakdown(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-payment-breakdown", dateFrom, dateTo],
    queryFn: async () => {
      // Payment methods are in pharmacy_pos_payments table joined with transactions
      const { data: payments, error } = await (supabase as any)
        .from("pharmacy_pos_payments")
        .select(`
          payment_method,
          amount,
          transaction:pharmacy_pos_transactions!inner(status, created_at)
        `)
        .eq("transaction.status", "completed")
        .gte("transaction.created_at", dateFrom)
        .lte("transaction.created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      // Aggregate by payment method
      const breakdown: Record<string, { count: number; amount: number }> = {};
      let totalAmount = 0;

      payments?.forEach((payment: any) => {
        const method = payment.payment_method || "cash";
        if (!breakdown[method]) {
          breakdown[method] = { count: 0, amount: 0 };
        }
        breakdown[method].count++;
        breakdown[method].amount += Number(payment.amount || 0);
        totalAmount += Number(payment.amount || 0);
      });

      // Convert to percentages
      const result: PaymentBreakdown[] = Object.entries(breakdown).map(
        ([method, data]) => ({
          name: method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, " "),
          value: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
          amount: data.amount,
          color: PAYMENT_COLORS[method.toLowerCase()] || PAYMENT_COLORS.other,
        })
      );

      return result.sort((a, b) => b.value - a.value);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopSellingMedicines(dateFrom: string, dateTo: string, limit: number = 10) {
  return useQuery({
    queryKey: ["pharmacy-top-medicines", dateFrom, dateTo, limit],
    queryFn: async () => {
      // Use type bypass for complex join
      const { data: items, error } = await (supabase as any)
        .from("pharmacy_pos_transaction_items")
        .select(`
          medicine_id,
          medicine_name,
          quantity,
          line_total,
          transaction:pharmacy_pos_transactions!inner(status, created_at)
        `)
        .eq("transaction.status", "completed")
        .gte("transaction.created_at", dateFrom)
        .lte("transaction.created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      // Aggregate by medicine
      const medicineStats: Record<string, { name: string; quantity: number; revenue: number }> = {};

      items?.forEach((item: any) => {
        const medicineId = item.medicine_id || "unknown";
        const medicineName = item.medicine_name || "Unknown Medicine";
        
        if (!medicineStats[medicineId]) {
          medicineStats[medicineId] = {
            name: medicineName,
            quantity: 0,
            revenue: 0,
          };
        }
        medicineStats[medicineId].quantity += Number(item.quantity || 0);
        medicineStats[medicineId].revenue += Number(item.line_total || 0);
      });

      // Sort by revenue and take top N
      const result: TopMedicine[] = Object.entries(medicineStats)
        .map(([medicine_id, data]) => ({
          medicine_id,
          ...data,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);

      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePharmacySalesStats(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-sales-stats", dateFrom, dateTo],
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("total_amount, discount_amount, created_at, status")
        .eq("status", "completed")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const totalSales = transactions?.reduce((sum, tx) => sum + Number(tx.total_amount || 0), 0) || 0;
      const totalDiscount = transactions?.reduce((sum, tx) => sum + Number(tx.discount_amount || 0), 0) || 0;
      const transactionCount = transactions?.length || 0;
      const avgTransaction = transactionCount > 0 ? totalSales / transactionCount : 0;

      return {
        totalSales,
        totalDiscount,
        transactionCount,
        avgTransaction,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

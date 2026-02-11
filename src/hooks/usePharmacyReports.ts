import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ============ SHARED TYPES ============

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

// ============ EXISTING HOOKS (fixed table name: pharmacy_pos_items) ============

export function usePaymentMethodBreakdown(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-payment-breakdown", dateFrom, dateTo],
    queryFn: async () => {
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

      const breakdown: Record<string, { count: number; amount: number }> = {};
      let totalAmount = 0;

      payments?.forEach((payment: any) => {
        const method = payment.payment_method || "cash";
        if (!breakdown[method]) breakdown[method] = { count: 0, amount: 0 };
        breakdown[method].count++;
        breakdown[method].amount += Number(payment.amount || 0);
        totalAmount += Number(payment.amount || 0);
      });

      const result: PaymentBreakdown[] = Object.entries(breakdown).map(([method, data]) => ({
        name: method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, " "),
        value: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
        amount: data.amount,
        color: PAYMENT_COLORS[method.toLowerCase()] || PAYMENT_COLORS.other,
      }));

      return result.sort((a, b) => b.value - a.value);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopSellingMedicines(dateFrom: string, dateTo: string, limit: number = 10) {
  return useQuery({
    queryKey: ["pharmacy-top-medicines", dateFrom, dateTo, limit],
    queryFn: async () => {
      const { data: items, error } = await (supabase as any)
        .from("pharmacy_pos_items")
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

      const medicineStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
      items?.forEach((item: any) => {
        const id = item.medicine_id || "unknown";
        const name = item.medicine_name || "Unknown";
        if (!medicineStats[id]) medicineStats[id] = { name, quantity: 0, revenue: 0 };
        medicineStats[id].quantity += Number(item.quantity || 0);
        medicineStats[id].revenue += Number(item.line_total || 0);
      });

      return Object.entries(medicineStats)
        .map(([medicine_id, data]) => ({ medicine_id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit) as TopMedicine[];
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

      return { totalSales, totalDiscount, transactionCount, avgTransaction };
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============ NEW SALES REPORT HOOKS ============

export function useDailySalesSummary(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-daily-sales", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("total_amount, discount_amount, subtotal, created_at, status")
        .eq("status", "completed")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const byDay: Record<string, { date: string; sales: number; discount: number; net: number; count: number }> = {};
      data?.forEach((tx) => {
        const day = tx.created_at.substring(0, 10);
        if (!byDay[day]) byDay[day] = { date: day, sales: 0, discount: 0, net: 0, count: 0 };
        byDay[day].sales += Number(tx.subtotal || tx.total_amount || 0);
        byDay[day].discount += Number(tx.discount_amount || 0);
        byDay[day].net += Number(tx.total_amount || 0);
        byDay[day].count++;
      });

      return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useHourlySalesAnalysis(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-hourly-sales", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("total_amount, created_at, status")
        .eq("status", "completed")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const byHour: Record<number, { hour: number; label: string; sales: number; count: number }> = {};
      for (let h = 0; h < 24; h++) {
        byHour[h] = { hour: h, label: `${h.toString().padStart(2, '0')}:00`, sales: 0, count: 0 };
      }
      data?.forEach((tx) => {
        const hour = new Date(tx.created_at).getHours();
        byHour[hour].sales += Number(tx.total_amount || 0);
        byHour[hour].count++;
      });

      return Object.values(byHour);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSalesByCategory(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-sales-by-category", dateFrom, dateTo],
    queryFn: async () => {
      const { data: items, error } = await (supabase as any)
        .from("pharmacy_pos_items")
        .select(`
          medicine_id,
          line_total,
          quantity,
          transaction:pharmacy_pos_transactions!inner(status, created_at)
        `)
        .eq("transaction.status", "completed")
        .gte("transaction.created_at", dateFrom)
        .lte("transaction.created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      // Get medicine->category mapping
      const medicineIds = [...new Set((items || []).map((i: any) => i.medicine_id).filter(Boolean))];
      if (medicineIds.length === 0) return [];

      const { data: medicines } = await (supabase as any)
        .from("medicines")
        .select("id, category_id, category:medicine_categories(name)")
        .in("id", medicineIds);

      const catMap: Record<string, string> = {};
      medicines?.forEach((m: any) => {
        catMap[m.id] = m.category?.name || "Uncategorized";
      });

      const byCategory: Record<string, { name: string; revenue: number; quantity: number; count: number }> = {};
      items?.forEach((item: any) => {
        const catName = catMap[item.medicine_id] || "Uncategorized";
        if (!byCategory[catName]) byCategory[catName] = { name: catName, revenue: 0, quantity: 0, count: 0 };
        byCategory[catName].revenue += Number(item.line_total || 0);
        byCategory[catName].quantity += Number(item.quantity || 0);
        byCategory[catName].count++;
      });

      return Object.values(byCategory).sort((a, b) => b.revenue - a.revenue);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDiscountAnalysis(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-discount-analysis", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("total_amount, discount_amount, subtotal, created_at, status")
        .eq("status", "completed")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const totalSales = data?.reduce((s, t) => s + Number(t.subtotal || t.total_amount || 0), 0) || 0;
      const totalDiscount = data?.reduce((s, t) => s + Number(t.discount_amount || 0), 0) || 0;
      const discountedTx = data?.filter(t => Number(t.discount_amount || 0) > 0) || [];

      const byDay: Record<string, { date: string; discount: number; sales: number }> = {};
      data?.forEach((tx) => {
        const day = tx.created_at.substring(0, 10);
        if (!byDay[day]) byDay[day] = { date: day, discount: 0, sales: 0 };
        byDay[day].discount += Number(tx.discount_amount || 0);
        byDay[day].sales += Number(tx.subtotal || tx.total_amount || 0);
      });

      return {
        totalSales,
        totalDiscount,
        discountPercent: totalSales > 0 ? (totalDiscount / totalSales) * 100 : 0,
        discountedTransactions: discountedTx.length,
        totalTransactions: data?.length || 0,
        dailyTrend: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMonthlyComparison(months: number = 6) {
  return useQuery({
    queryKey: ["pharmacy-monthly-comparison", months],
    queryFn: async () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

      const { data, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("total_amount, discount_amount, created_at, status")
        .eq("status", "completed")
        .gte("created_at", from.toISOString());

      if (error) throw error;

      const byMonth: Record<string, { month: string; sales: number; discount: number; count: number }> = {};
      data?.forEach((tx) => {
        const m = tx.created_at.substring(0, 7); // YYYY-MM
        if (!byMonth[m]) byMonth[m] = { month: m, sales: 0, discount: 0, count: 0 };
        byMonth[m].sales += Number(tx.total_amount || 0);
        byMonth[m].discount += Number(tx.discount_amount || 0);
        byMonth[m].count++;
      });

      return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============ INVENTORY REPORT HOOKS ============

export function useStockValuation() {
  return useQuery({
    queryKey: ["pharmacy-stock-valuation"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("medicine_inventory")
        .select(`
          id, quantity, unit_price, selling_price, batch_number, expiry_date,
          medicine:medicines!inner(id, name, category:medicine_categories(name))
        `)
        .gt("quantity", 0);

      if (error) throw error;

      let totalCost = 0;
      let totalRetail = 0;
      const items = (data || []).map((inv: any) => {
        const costValue = Number(inv.quantity || 0) * Number(inv.unit_price || 0);
        const retailValue = Number(inv.quantity || 0) * Number(inv.selling_price || 0);
        totalCost += costValue;
        totalRetail += retailValue;
        return {
          medicine: inv.medicine?.name || "Unknown",
          category: inv.medicine?.category?.name || "Uncategorized",
          batch: inv.batch_number,
          quantity: inv.quantity,
          unitCost: Number(inv.unit_price || 0),
          sellingPrice: Number(inv.selling_price || 0),
          costValue,
          retailValue,
          margin: retailValue > 0 ? ((retailValue - costValue) / retailValue) * 100 : 0,
        };
      });

      return { items, totalCost, totalRetail, totalProfit: totalRetail - totalCost };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpiryReport() {
  return useQuery({
    queryKey: ["pharmacy-expiry-report"],
    queryFn: async () => {
      const now = new Date();
      const d30 = new Date(now.getTime() + 30 * 86400000).toISOString().substring(0, 10);
      const d60 = new Date(now.getTime() + 60 * 86400000).toISOString().substring(0, 10);
      const d90 = new Date(now.getTime() + 90 * 86400000).toISOString().substring(0, 10);

      const { data, error } = await (supabase as any)
        .from("medicine_inventory")
        .select(`
          id, quantity, unit_price, selling_price, batch_number, expiry_date,
          medicine:medicines!inner(name, category:medicine_categories(name))
        `)
        .gt("quantity", 0)
        .lte("expiry_date", d90)
        .order("expiry_date", { ascending: true });

      if (error) throw error;

      const items = (data || []).map((inv: any) => {
        const expiryDate = inv.expiry_date;
        let bucket = "61-90 days";
        if (expiryDate <= now.toISOString().substring(0, 10)) bucket = "Expired";
        else if (expiryDate <= d30) bucket = "0-30 days";
        else if (expiryDate <= d60) bucket = "31-60 days";

        return {
          medicine: inv.medicine?.name || "Unknown",
          category: inv.medicine?.category?.name || "",
          batch: inv.batch_number,
          quantity: inv.quantity,
          expiryDate,
          bucket,
          valueAtRisk: Number(inv.quantity || 0) * Number(inv.selling_price || 0),
        };
      });

      return items;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLowStockReport() {
  return useQuery({
    queryKey: ["pharmacy-low-stock"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("medicine_inventory")
        .select(`
          id, quantity, reorder_level, batch_number, unit_price, selling_price,
          medicine:medicines!inner(name, category:medicine_categories(name))
        `)
        .not("reorder_level", "is", null);

      if (error) throw error;

      return (data || [])
        .filter((inv: any) => Number(inv.quantity || 0) <= Number(inv.reorder_level || 0))
        .map((inv: any) => ({
          medicine: inv.medicine?.name || "Unknown",
          category: inv.medicine?.category?.name || "",
          batch: inv.batch_number,
          currentStock: inv.quantity,
          reorderLevel: inv.reorder_level,
          deficit: Number(inv.reorder_level || 0) - Number(inv.quantity || 0),
          suggestedOrder: Math.max(Number(inv.reorder_level || 0) * 2 - Number(inv.quantity || 0), 0),
          unitCost: Number(inv.unit_price || 0),
        }))
        .sort((a: any, b: any) => b.deficit - a.deficit);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeadStockReport(days: number = 30) {
  return useQuery({
    queryKey: ["pharmacy-dead-stock", days],
    queryFn: async () => {
      const cutoff = new Date(Date.now() - days * 86400000).toISOString();

      // Get all inventory with stock
      const { data: inventory, error: invError } = await (supabase as any)
        .from("medicine_inventory")
        .select(`
          id, quantity, unit_price, selling_price, batch_number,
          medicine:medicines!inner(id, name, category:medicine_categories(name))
        `)
        .gt("quantity", 0);

      if (invError) throw invError;

      // Get medicines that had movements recently
      const { data: movements, error: movError } = await (supabase as any)
        .from("pharmacy_stock_movements")
        .select("medicine_id")
        .gte("created_at", cutoff)
        .in("movement_type", ["sale", "dispense"]);

      if (movError) throw movError;

      const movedIds = new Set((movements || []).map((m: any) => m.medicine_id));

      return (inventory || [])
        .filter((inv: any) => !movedIds.has(inv.medicine?.id))
        .map((inv: any) => ({
          medicine: inv.medicine?.name || "Unknown",
          category: inv.medicine?.category?.name || "",
          batch: inv.batch_number,
          quantity: inv.quantity,
          value: Number(inv.quantity || 0) * Number(inv.selling_price || 0),
          costValue: Number(inv.quantity || 0) * Number(inv.unit_price || 0),
        }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useStockMovementSummary(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-stock-movement-summary", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("pharmacy_stock_movements")
        .select("movement_type, quantity, total_value, created_at")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const byType: Record<string, { type: string; inQty: number; outQty: number; value: number; count: number }> = {};
      (data || []).forEach((m: any) => {
        const t = m.movement_type || "unknown";
        if (!byType[t]) byType[t] = { type: t, inQty: 0, outQty: 0, value: 0, count: 0 };
        const qty = Number(m.quantity || 0);
        if (qty > 0) byType[t].inQty += qty;
        else byType[t].outQty += Math.abs(qty);
        byType[t].value += Number(m.total_value || 0);
        byType[t].count++;
      });

      return Object.values(byType).map(v => ({
        ...v,
        type: v.type.charAt(0).toUpperCase() + v.type.slice(1).replace(/_/g, " "),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============ FINANCIAL REPORT HOOKS ============

export function useProfitMarginReport(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-profit-margin", dateFrom, dateTo],
    queryFn: async () => {
      const { data: items, error } = await (supabase as any)
        .from("pharmacy_pos_items")
        .select(`
          medicine_id, medicine_name, quantity, unit_price, line_total,
          inventory:medicine_inventory(unit_price),
          transaction:pharmacy_pos_transactions!inner(status, created_at)
        `)
        .eq("transaction.status", "completed")
        .gte("transaction.created_at", dateFrom)
        .lte("transaction.created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const byMedicine: Record<string, { name: string; qtySold: number; revenue: number; cost: number }> = {};
      (items || []).forEach((item: any) => {
        const id = item.medicine_id || "unknown";
        const costPrice = Number(item.inventory?.unit_price || item.unit_price * 0.65 || 0);
        if (!byMedicine[id]) byMedicine[id] = { name: item.medicine_name || "Unknown", qtySold: 0, revenue: 0, cost: 0 };
        byMedicine[id].qtySold += Number(item.quantity || 0);
        byMedicine[id].revenue += Number(item.line_total || 0);
        byMedicine[id].cost += costPrice * Number(item.quantity || 0);
      });

      return Object.values(byMedicine)
        .map(m => ({
          ...m,
          profit: m.revenue - m.cost,
          marginPercent: m.revenue > 0 ? ((m.revenue - m.cost) / m.revenue) * 100 : 0,
        }))
        .sort((a, b) => b.profit - a.profit);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useReturnsSummary(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-returns-summary", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("id, total_amount, void_reason, voided_at, status, created_at")
        .eq("status", "voided")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const totalRefunds = data?.reduce((s, t) => s + Number(t.total_amount || 0), 0) || 0;

      return {
        returnCount: data?.length || 0,
        totalRefundAmount: totalRefunds,
        returns: data || [],
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreditSalesReport(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-credit-sales", dateFrom, dateTo],
    queryFn: async () => {
      // Credit sales are transactions where amount_paid < total_amount or due_date is set
      const { data, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("id, transaction_number, customer_name, customer_phone, total_amount, amount_paid, due_date, created_at, status")
        .eq("status", "completed")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const creditTx = (data || []).filter(t => Number(t.amount_paid || 0) < Number(t.total_amount || 0) || t.due_date);
      const totalOutstanding = creditTx.reduce((s, t) => s + (Number(t.total_amount || 0) - Number(t.amount_paid || 0)), 0);

      return {
        creditTransactions: creditTx,
        totalOutstanding,
        count: creditTx.length,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============ SUPPLIER/PROCUREMENT HOOKS ============

export function useSupplierPurchaseSummary(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-supplier-summary", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("purchase_orders")
        .select(`
          id, po_number, total_amount, status, created_at,
          vendor:vendors!inner(id, name, vendor_code)
        `)
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const byVendor: Record<string, { vendor: string; code: string; totalPurchases: number; poCount: number; received: number; pending: number }> = {};
      (data || []).forEach((po: any) => {
        const vName = po.vendor?.name || "Unknown";
        const vCode = po.vendor?.vendor_code || "";
        if (!byVendor[vName]) byVendor[vName] = { vendor: vName, code: vCode, totalPurchases: 0, poCount: 0, received: 0, pending: 0 };
        byVendor[vName].totalPurchases += Number(po.total_amount || 0);
        byVendor[vName].poCount++;
        if (po.status === "received") byVendor[vName].received += Number(po.total_amount || 0);
        else byVendor[vName].pending += Number(po.total_amount || 0);
      });

      return Object.values(byVendor).sort((a, b) => b.totalPurchases - a.totalPurchases);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePOStatusReport() {
  return useQuery({
    queryKey: ["pharmacy-po-status"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("purchase_orders")
        .select("id, status, total_amount, created_at");

      if (error) throw error;

      const byStatus: Record<string, { status: string; count: number; totalValue: number }> = {};
      (data || []).forEach((po: any) => {
        const s = po.status || "unknown";
        if (!byStatus[s]) byStatus[s] = { status: s, count: 0, totalValue: 0 };
        byStatus[s].count++;
        byStatus[s].totalValue += Number(po.total_amount || 0);
      });

      return Object.values(byStatus).map(v => ({
        ...v,
        status: v.status.charAt(0).toUpperCase() + v.status.slice(1).replace(/_/g, " "),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

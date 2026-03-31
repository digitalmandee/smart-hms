import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ============ FETCH ALL ROWS HELPER ============
// Supabase caps at 1000 rows per request. This helper paginates to fetch all.
async function fetchAllRows<T = any>(
  buildQuery: (from: number, to: number) => any
): Promise<T[]> {
  const PAGE_SIZE = 1000;
  let allData: T[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await buildQuery(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    const batch = (data || []) as T[];
    allData = allData.concat(batch);
    hasMore = batch.length === PAGE_SIZE;
    offset += PAGE_SIZE;
  }

  return allData;
}

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

// ============ EXISTING HOOKS ============

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

export function useTopSellingMedicines(dateFrom: string, dateTo: string, limit?: number) {
  return useQuery({
    queryKey: ["pharmacy-top-medicines", dateFrom, dateTo, limit],
    queryFn: async () => {
      const items = await fetchAllRows((from, to) =>
        (supabase as any)
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
          .lte("transaction.created_at", `${dateTo}T23:59:59`)
          .range(from, to)
      );

      const medicineStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
      items?.forEach((item: any) => {
        const id = item.medicine_id || "unknown";
        const name = item.medicine_name || "Unknown";
        if (!medicineStats[id]) medicineStats[id] = { name, quantity: 0, revenue: 0 };
        medicineStats[id].quantity += Number(item.quantity || 0);
        medicineStats[id].revenue += Number(item.line_total || 0);
      });

      const sorted = Object.entries(medicineStats)
        .map(([medicine_id, data]) => ({ medicine_id, ...data }))
        .sort((a, b) => b.revenue - a.revenue);

      return (limit ? sorted.slice(0, limit) : sorted) as TopMedicine[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePharmacySalesStats(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-sales-stats", dateFrom, dateTo],
    queryFn: async () => {
      const transactions = await fetchAllRows((from, to) =>
        supabase
          .from("pharmacy_pos_transactions")
          .select("total_amount, discount_amount, created_at, status")
          .eq("status", "completed")
          .gte("created_at", dateFrom)
          .lte("created_at", `${dateTo}T23:59:59`)
          .range(from, to)
      );

      const totalSales = transactions.reduce((sum, tx: any) => sum + Number(tx.total_amount || 0), 0);
      const totalDiscount = transactions.reduce((sum, tx: any) => sum + Number(tx.discount_amount || 0), 0);
      const transactionCount = transactions.length;
      const avgTransaction = transactionCount > 0 ? totalSales / transactionCount : 0;

      return { totalSales, totalDiscount, transactionCount, avgTransaction };
    },
    staleTime: 5 * 60 * 1000,
  });
}

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
        const m = tx.created_at.substring(0, 7);
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

      const { data: inventory, error: invError } = await (supabase as any)
        .from("medicine_inventory")
        .select(`
          id, quantity, unit_price, selling_price, batch_number,
          medicine:medicines!inner(id, name, category:medicine_categories(name))
        `)
        .gt("quantity", 0);

      if (invError) throw invError;

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
      const items = await fetchAllRows((from, to) =>
        (supabase as any)
          .from("pharmacy_pos_items")
          .select(`
            medicine_id, medicine_name, quantity, unit_price, line_total,
            inventory:medicine_inventory(unit_price),
            medicine:medicines(cost_price),
            transaction:pharmacy_pos_transactions!inner(status, created_at)
          `)
          .eq("transaction.status", "completed")
          .gte("transaction.created_at", dateFrom)
          .lte("transaction.created_at", `${dateTo}T23:59:59`)
          .range(from, to)
      );

      const byMedicine: Record<string, { name: string; qtySold: number; revenue: number; cost: number }> = {};
      (items || []).forEach((item: any) => {
        const id = item.medicine_id || "unknown";
        const costPrice = Number(item.inventory?.unit_price || item.medicine?.cost_price || item.unit_price * 0.65 || 0);
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

      // Get PO IDs for item-level detail
      const poIds = (data || []).map((po: any) => po.id).filter(Boolean);
      let itemDetails: any[] = [];
      if (poIds.length > 0) {
        const { data: items, error: itemErr } = await (supabase as any)
          .from("purchase_order_items")
          .select(`
            id, purchase_order_id, quantity, unit_price, total_price, item_type,
            medicine:medicines(name),
            item:inventory_items(name)
          `)
          .in("purchase_order_id", poIds);
        if (!itemErr && items) itemDetails = items;
      }

      // Build PO lookup for vendor info
      const poLookup: Record<string, { vendor: string; po_number: string }> = {};
      const byVendor: Record<string, { vendor: string; code: string; totalPurchases: number; poCount: number; received: number; pending: number }> = {};
      (data || []).forEach((po: any) => {
        const vName = po.vendor?.name || "Unknown";
        const vCode = po.vendor?.vendor_code || "";
        poLookup[po.id] = { vendor: vName, po_number: po.po_number };
        if (!byVendor[vName]) byVendor[vName] = { vendor: vName, code: vCode, totalPurchases: 0, poCount: 0, received: 0, pending: 0 };
        byVendor[vName].totalPurchases += Number(po.total_amount || 0);
        byVendor[vName].poCount++;
        if (po.status === "received") byVendor[vName].received += Number(po.total_amount || 0);
        else byVendor[vName].pending += Number(po.total_amount || 0);
      });

      // Build item-level detail rows
      const detailRows = itemDetails.map((item: any) => {
        const po = poLookup[item.purchase_order_id] || { vendor: "Unknown", po_number: "N/A" };
        const productName = item.item_type === "medicine"
          ? (item.medicine?.name || "Unknown Medicine")
          : (item.item?.name || "Unknown Item");
        return {
          vendor: po.vendor,
          poNumber: po.po_number,
          productName,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unit_price || 0),
          totalPrice: Number(item.total_price || 0),
        };
      }).sort((a: any, b: any) => a.vendor.localeCompare(b.vendor));

      return {
        summary: Object.values(byVendor).sort((a, b) => b.totalPurchases - a.totalPurchases),
        details: detailRows,
      };
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

// ============ NEW REPORT HOOKS ============

// Customer Sales Report
export function useCustomerSalesReport(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-customer-sales", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("id, customer_name, customer_phone, total_amount, discount_amount, created_at, status")
        .eq("status", "completed")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const byCustomer: Record<string, { name: string; phone: string; totalSpent: number; transactions: number; avgSpent: number; totalDiscount: number }> = {};
      (data || []).forEach((tx) => {
        const key = tx.customer_name || tx.customer_phone || "Walk-in";
        if (!byCustomer[key]) byCustomer[key] = { name: tx.customer_name || "Walk-in", phone: tx.customer_phone || "", totalSpent: 0, transactions: 0, avgSpent: 0, totalDiscount: 0 };
        byCustomer[key].totalSpent += Number(tx.total_amount || 0);
        byCustomer[key].totalDiscount += Number(tx.discount_amount || 0);
        byCustomer[key].transactions++;
      });

      return Object.values(byCustomer)
        .map(c => ({ ...c, avgSpent: c.transactions > 0 ? c.totalSpent / c.transactions : 0 }))
        .sort((a, b) => b.totalSpent - a.totalSpent);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Transaction Log
export function useTransactionLog(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-transaction-log", dateFrom, dateTo],
    queryFn: async () => {
      const data = await fetchAllRows((from, to) =>
        (supabase as any)
          .from("pharmacy_pos_transactions")
          .select("id, transaction_number, customer_name, total_amount, discount_amount, amount_paid, payment_method, status, created_at, subtotal")
          .gte("created_at", dateFrom)
          .lte("created_at", `${dateTo}T23:59:59`)
          .order("created_at", { ascending: false })
          .range(from, to)
      );
      return data.map((tx: any) => ({
        ...tx,
        total_amount: Number(tx.total_amount || 0),
        discount_amount: Number(tx.discount_amount || 0),
        amount_paid: Number(tx.amount_paid || 0),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Refund Rate Analysis
export function useRefundRateAnalysis(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-refund-rate", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("id, total_amount, status, void_reason, created_at")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const all = data || [];
      const completed = all.filter(t => t.status === "completed");
      const voided = all.filter(t => t.status === "voided");
      const totalSales = completed.reduce((s, t) => s + Number(t.total_amount || 0), 0);
      const totalRefunds = voided.reduce((s, t) => s + Number(t.total_amount || 0), 0);

      // Reasons breakdown
      const reasons: Record<string, number> = {};
      voided.forEach(t => {
        const r = t.void_reason || "No reason";
        reasons[r] = (reasons[r] || 0) + 1;
      });

      // Daily trend
      const byDay: Record<string, { date: string; refunds: number; sales: number; refundRate: number }> = {};
      all.forEach(t => {
        const day = t.created_at.substring(0, 10);
        if (!byDay[day]) byDay[day] = { date: day, refunds: 0, sales: 0, refundRate: 0 };
        if (t.status === "voided") byDay[day].refunds++;
        else if (t.status === "completed") byDay[day].sales++;
      });
      Object.values(byDay).forEach(d => {
        const total = d.sales + d.refunds;
        d.refundRate = total > 0 ? (d.refunds / total) * 100 : 0;
      });

      return {
        totalTransactions: completed.length + voided.length,
        refundCount: voided.length,
        refundRate: (completed.length + voided.length) > 0 ? (voided.length / (completed.length + voided.length)) * 100 : 0,
        totalSales,
        totalRefunds,
        reasons: Object.entries(reasons).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
        dailyTrend: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Average Basket Size
export function useBasketSizeAnalysis(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-basket-size", dateFrom, dateTo],
    queryFn: async () => {
      const { data: transactions, error: txErr } = await supabase
        .from("pharmacy_pos_transactions")
        .select("id, total_amount, created_at, status")
        .eq("status", "completed")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (txErr) throw txErr;

      const txIds = (transactions || []).map(t => t.id);
      if (txIds.length === 0) return { avgItems: 0, avgValue: 0, dailyTrend: [] };

      const { data: items, error: itemErr } = await (supabase as any)
        .from("pharmacy_pos_items")
        .select("transaction_id, quantity")
        .in("transaction_id", txIds);

      if (itemErr) throw itemErr;

      const txItemCount: Record<string, number> = {};
      (items || []).forEach((i: any) => {
        txItemCount[i.transaction_id] = (txItemCount[i.transaction_id] || 0) + Number(i.quantity || 1);
      });

      const totalItems = Object.values(txItemCount).reduce((s, c) => s + c, 0);
      const totalValue = (transactions || []).reduce((s, t) => s + Number(t.total_amount || 0), 0);
      const txCount = transactions?.length || 1;

      // Daily trend
      const byDay: Record<string, { date: string; avgItems: number; avgValue: number; count: number; totalItems: number; totalValue: number }> = {};
      (transactions || []).forEach(tx => {
        const day = tx.created_at.substring(0, 10);
        if (!byDay[day]) byDay[day] = { date: day, avgItems: 0, avgValue: 0, count: 0, totalItems: 0, totalValue: 0 };
        byDay[day].count++;
        byDay[day].totalValue += Number(tx.total_amount || 0);
        byDay[day].totalItems += txItemCount[tx.id] || 0;
      });
      Object.values(byDay).forEach(d => {
        d.avgItems = d.count > 0 ? d.totalItems / d.count : 0;
        d.avgValue = d.count > 0 ? d.totalValue / d.count : 0;
      });

      return {
        avgItems: totalItems / txCount,
        avgValue: totalValue / txCount,
        dailyTrend: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Batch-wise Stock Report
export function useBatchStockReport() {
  return useQuery({
    queryKey: ["pharmacy-batch-stock"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("medicine_inventory")
        .select(`
          id, quantity, unit_price, selling_price, batch_number, expiry_date, created_at,
          medicine:medicines!inner(name, category:medicine_categories(name))
        `)
        .gt("quantity", 0)
        .order("expiry_date", { ascending: true });

      if (error) throw error;

      return (data || []).map((inv: any) => ({
        medicine: inv.medicine?.name || "Unknown",
        category: inv.medicine?.category?.name || "Uncategorized",
        batch: inv.batch_number || "N/A",
        quantity: inv.quantity,
        unitCost: Number(inv.unit_price || 0),
        sellingPrice: Number(inv.selling_price || 0),
        expiryDate: inv.expiry_date || "N/A",
        value: Number(inv.quantity || 0) * Number(inv.selling_price || 0),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Category Stock Distribution
export function useCategoryStockDistribution() {
  return useQuery({
    queryKey: ["pharmacy-category-stock-dist"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("medicine_inventory")
        .select(`
          quantity, selling_price, unit_price,
          medicine:medicines!inner(category:medicine_categories(name))
        `)
        .gt("quantity", 0);

      if (error) throw error;

      const byCat: Record<string, { name: string; items: number; totalQty: number; retailValue: number; costValue: number }> = {};
      (data || []).forEach((inv: any) => {
        const cat = inv.medicine?.category?.name || "Uncategorized";
        if (!byCat[cat]) byCat[cat] = { name: cat, items: 0, totalQty: 0, retailValue: 0, costValue: 0 };
        byCat[cat].items++;
        byCat[cat].totalQty += Number(inv.quantity || 0);
        byCat[cat].retailValue += Number(inv.quantity || 0) * Number(inv.selling_price || 0);
        byCat[cat].costValue += Number(inv.quantity || 0) * Number(inv.unit_price || 0);
      });

      return Object.values(byCat).sort((a, b) => b.retailValue - a.retailValue);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Stock Aging Report
export function useStockAgingReport() {
  return useQuery({
    queryKey: ["pharmacy-stock-aging"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("medicine_inventory")
        .select(`
          id, quantity, unit_price, selling_price, batch_number, created_at,
          medicine:medicines!inner(name, category:medicine_categories(name))
        `)
        .gt("quantity", 0);

      if (error) throw error;

      const now = Date.now();
      return (data || []).map((inv: any) => {
        const receivedDate = inv.created_at ? new Date(inv.created_at).getTime() : now;
        const ageDays = Math.floor((now - receivedDate) / 86400000);
        let bucket = "0-30 days";
        if (ageDays > 180) bucket = "180+ days";
        else if (ageDays > 90) bucket = "91-180 days";
        else if (ageDays > 60) bucket = "61-90 days";
        else if (ageDays > 30) bucket = "31-60 days";

        return {
          medicine: inv.medicine?.name || "Unknown",
          category: inv.medicine?.category?.name || "",
          batch: inv.batch_number || "N/A",
          quantity: inv.quantity,
          ageDays,
          bucket,
          value: Number(inv.quantity || 0) * Number(inv.selling_price || 0),
        };
      }).sort((a: any, b: any) => b.ageDays - a.ageDays);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Inventory Turnover
export function useInventoryTurnover(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-inventory-turnover", dateFrom, dateTo],
    queryFn: async () => {
      // Get sales quantities per medicine
      const { data: items, error: itemErr } = await (supabase as any)
        .from("pharmacy_pos_items")
        .select(`
          medicine_id, medicine_name, quantity,
          transaction:pharmacy_pos_transactions!inner(status, created_at)
        `)
        .eq("transaction.status", "completed")
        .gte("transaction.created_at", dateFrom)
        .lte("transaction.created_at", `${dateTo}T23:59:59`);

      if (itemErr) throw itemErr;

      // Get current inventory
      const { data: inventory, error: invErr } = await (supabase as any)
        .from("medicine_inventory")
        .select("medicine_id, quantity, medicine:medicines!inner(name)")
        .gt("quantity", 0);

      if (invErr) throw invErr;

      const salesByMed: Record<string, { name: string; qtySold: number }> = {};
      (items || []).forEach((i: any) => {
        const id = i.medicine_id || "unknown";
        if (!salesByMed[id]) salesByMed[id] = { name: i.medicine_name || "Unknown", qtySold: 0 };
        salesByMed[id].qtySold += Number(i.quantity || 0);
      });

      const stockByMed: Record<string, number> = {};
      (inventory || []).forEach((inv: any) => {
        const id = inv.medicine_id;
        stockByMed[id] = (stockByMed[id] || 0) + Number(inv.quantity || 0);
      });

      const allMedIds = new Set([...Object.keys(salesByMed), ...Object.keys(stockByMed)]);
      return Array.from(allMedIds).map(id => {
        const sales = salesByMed[id] || { name: (inventory || []).find((i: any) => i.medicine_id === id)?.medicine?.name || "Unknown", qtySold: 0 };
        const currentStock = stockByMed[id] || 0;
        const avgStock = currentStock; // Simplified: use current stock as proxy
        const turnoverRatio = avgStock > 0 ? sales.qtySold / avgStock : sales.qtySold > 0 ? Infinity : 0;

        return {
          medicine: sales.name,
          qtySold: sales.qtySold,
          currentStock,
          turnoverRatio: turnoverRatio === Infinity ? 999 : Number(turnoverRatio.toFixed(2)),
          turnoverLabel: turnoverRatio === Infinity ? "∞" : turnoverRatio.toFixed(2),
        };
      }).sort((a, b) => b.turnoverRatio - a.turnoverRatio);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Daily Cash Summary
export function useDailyCashSummary(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-daily-cash", dateFrom, dateTo],
    queryFn: async () => {
      const { data: payments, error } = await (supabase as any)
        .from("pharmacy_pos_payments")
        .select(`
          payment_method, amount,
          transaction:pharmacy_pos_transactions!inner(status, created_at)
        `)
        .eq("transaction.status", "completed")
        .gte("transaction.created_at", dateFrom)
        .lte("transaction.created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const byDay: Record<string, { date: string; cashIn: number; cardIn: number; otherIn: number; totalIn: number }> = {};
      (payments || []).forEach((p: any) => {
        const day = p.transaction?.created_at?.substring(0, 10) || "unknown";
        if (!byDay[day]) byDay[day] = { date: day, cashIn: 0, cardIn: 0, otherIn: 0, totalIn: 0 };
        const amt = Number(p.amount || 0);
        const method = (p.payment_method || "cash").toLowerCase();
        if (method === "cash") byDay[day].cashIn += amt;
        else if (method === "card") byDay[day].cardIn += amt;
        else byDay[day].otherIn += amt;
        byDay[day].totalIn += amt;
      });

      return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Tax Collection Report
export function useTaxCollectionReport(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-tax-collection", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("id, transaction_number, total_amount, tax_amount, subtotal, created_at, status")
        .eq("status", "completed")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const transactions = (data || []).map(tx => ({
        ...tx,
        tax_amount: Number(tx.tax_amount || 0),
        total_amount: Number(tx.total_amount || 0),
        subtotal: Number(tx.subtotal || 0),
      }));

      const totalTax = transactions.reduce((s, t) => s + t.tax_amount, 0);
      const totalSales = transactions.reduce((s, t) => s + t.total_amount, 0);

      // Daily aggregation
      const byDay: Record<string, { date: string; taxCollected: number; salesAmount: number; transactions: number }> = {};
      transactions.forEach(tx => {
        const day = tx.created_at.substring(0, 10);
        if (!byDay[day]) byDay[day] = { date: day, taxCollected: 0, salesAmount: 0, transactions: 0 };
        byDay[day].taxCollected += tx.tax_amount;
        byDay[day].salesAmount += tx.total_amount;
        byDay[day].transactions++;
      });

      return {
        totalTax,
        totalSales,
        effectiveRate: totalSales > 0 ? (totalTax / totalSales) * 100 : 0,
        dailySummary: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
        transactions: transactions.filter(t => t.tax_amount > 0),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Cashier Performance
export function useCashierPerformance(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-cashier-performance", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("id, total_amount, discount_amount, created_by, status, created_at")
        .eq("status", "completed")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const byCashier: Record<string, { userId: string; totalSales: number; transactions: number; totalDiscount: number }> = {};
      (data || []).forEach(tx => {
        const uid = tx.created_by || "unknown";
        if (!byCashier[uid]) byCashier[uid] = { userId: uid, totalSales: 0, transactions: 0, totalDiscount: 0 };
        byCashier[uid].totalSales += Number(tx.total_amount || 0);
        byCashier[uid].totalDiscount += Number(tx.discount_amount || 0);
        byCashier[uid].transactions++;
      });

      // Fetch profile names
      const userIds = Object.keys(byCashier).filter(id => id !== "unknown");
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p.full_name || "Unknown"; });
      }

      return Object.values(byCashier).map(c => ({
        cashier: profileMap[c.userId] || (c.userId === "unknown" ? "System" : "User"),
        totalSales: c.totalSales,
        transactions: c.transactions,
        avgSale: c.transactions > 0 ? c.totalSales / c.transactions : 0,
        totalDiscount: c.totalDiscount,
      })).sort((a, b) => b.totalSales - a.totalSales);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Peak Hours Report
export function usePeakHoursReport(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-peak-hours", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_pos_transactions")
        .select("id, total_amount, created_at, status")
        .eq("status", "completed")
        .gte("created_at", dateFrom)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const heatmap: { day: string; dayIndex: number; hour: number; hourLabel: string; count: number; sales: number }[] = [];

      // Initialize grid
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
          heatmap.push({ day: dayNames[d], dayIndex: d, hour: h, hourLabel: `${h.toString().padStart(2, '0')}:00`, count: 0, sales: 0 });
        }
      }

      (data || []).forEach(tx => {
        const dt = new Date(tx.created_at);
        const dayIdx = dt.getDay();
        const hour = dt.getHours();
        const cell = heatmap.find(c => c.dayIndex === dayIdx && c.hour === hour);
        if (cell) {
          cell.count++;
          cell.sales += Number(tx.total_amount || 0);
        }
      });

      return heatmap;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============ DAILY PROFIT & LOSS ============

export interface DailyPnLRow {
  date: string;
  transactionCount: number;
  revenue: number;
  cogs: number;
  profit: number;
  marginPercent: number;
}

export function useDailyProfitLoss(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["pharmacy-daily-pnl", dateFrom, dateTo],
    queryFn: async () => {
      const items = await fetchAllRows((from, to) =>
        (supabase as any)
          .from("pharmacy_pos_items")
          .select(`
            quantity,
            unit_price,
            line_total,
            inventory_id,
            medicine_id,
            transaction:pharmacy_pos_transactions!inner(id, status, created_at),
            inventory:medicine_inventory(unit_price),
            medicine:medicines(cost_price)
          `)
          .eq("transaction.status", "completed")
          .gte("transaction.created_at", dateFrom)
          .lte("transaction.created_at", `${dateTo}T23:59:59`)
          .range(from, to)
      );

      const byDay: Record<string, { revenue: number; cogs: number; txIds: Set<string> }> = {};

      (items || []).forEach((item: any) => {
        const day = item.transaction?.created_at?.substring(0, 10);
        if (!day) return;
        if (!byDay[day]) byDay[day] = { revenue: 0, cogs: 0, txIds: new Set() };

        const revenue = Number(item.line_total || 0);
        const costPrice = item.inventory?.unit_price
          ? Number(item.inventory.unit_price)
          : item.medicine?.cost_price
            ? Number(item.medicine.cost_price)
            : Number(item.unit_price || 0) * 0.65; // fallback: 65% of selling price
        const cogs = costPrice * Number(item.quantity || 0);

        byDay[day].revenue += revenue;
        byDay[day].cogs += cogs;
        if (item.transaction?.id) byDay[day].txIds.add(item.transaction.id);
      });

      const result: DailyPnLRow[] = Object.entries(byDay)
        .map(([date, data]) => {
          const profit = data.revenue - data.cogs;
          return {
            date,
            transactionCount: data.txIds.size,
            revenue: Math.round(data.revenue * 100) / 100,
            cogs: Math.round(data.cogs * 100) / 100,
            profit: Math.round(profit * 100) / 100,
            marginPercent: data.revenue > 0 ? Math.round((profit / data.revenue) * 10000) / 100 : 0,
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date));

      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

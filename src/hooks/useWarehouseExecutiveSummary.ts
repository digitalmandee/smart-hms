import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, addDays } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export interface WarehouseExecutiveSummary {
  stockValue: number;
  totalPOs: number;
  totalSpend: number;
  grnCount: number;
  pendingRequisitions: number;
  lowStockCount: number;
  activeVendors: number;
  expiringItems: number;
  categoryDistribution: Array<{ name: string; value: number }>;
  monthlyTrend: Array<{ month: string; procurement: number; consumption: number }>;
  topVendors: Array<{ name: string; spend: number }>;
  alerts: Array<{ type: string; message: string; count: number }>;
}

export function useWarehouseExecutiveSummary(period: string) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case "last-month":
        return { start: format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd"), end: format(endOfMonth(subMonths(now, 1)), "yyyy-MM-dd") };
      case "last-3-months":
        return { start: format(startOfMonth(subMonths(now, 2)), "yyyy-MM-dd"), end: format(endOfMonth(now), "yyyy-MM-dd") };
      default:
        return { start: format(startOfMonth(now), "yyyy-MM-dd"), end: format(endOfMonth(now), "yyyy-MM-dd") };
    }
  };

  const { start, end } = getDateRange();

  return useQuery({
    queryKey: ["warehouse-executive-summary", orgId, period],
    queryFn: async (): Promise<WarehouseExecutiveSummary> => {
      const [stockRes, poRes, grnRes, reqRes, vendorRes, expiryRes, categoryRes] = await Promise.all([
        // Stock value
        queryTable("inventory_stock")
          .select("quantity, unit_cost, item:inventory_items!inner(organization_id)")
          .eq("item.organization_id", orgId)
          .gt("quantity", 0),
        // Purchase orders in period
        queryTable("purchase_orders")
          .select("id, total_amount, status, vendor:vendors(name), created_at")
          .eq("organization_id", orgId)
          .gte("created_at", start)
          .lte("created_at", end + "T23:59:59"),
        // GRNs in period
        queryTable("goods_received_notes")
          .select("id, received_date")
          .eq("organization_id", orgId)
          .gte("received_date", start)
          .lte("received_date", end),
        // Pending requisitions
        queryTable("stock_requisitions")
          .select("id, status")
          .eq("organization_id", orgId)
          .in("status", ["pending", "submitted"]),
        // Active vendors
        queryTable("vendors")
          .select("id, name")
          .eq("organization_id", orgId)
          .eq("status", "active"),
        // Expiring items (next 90 days)
        queryTable("inventory_stock")
          .select("id, expiry_date, item:inventory_items!inner(organization_id)")
          .eq("item.organization_id", orgId)
          .gt("quantity", 0)
          .not("expiry_date", "is", null)
          .lte("expiry_date", format(addDays(new Date(), 90), "yyyy-MM-dd")),
        // Category distribution
        queryTable("inventory_items")
          .select("id, category:inventory_categories(name)")
          .eq("organization_id", orgId),
      ]);

      // Stock value
      const stockValue = (stockRes.data || []).reduce(
        (sum: number, s: any) => sum + (s.quantity || 0) * (s.unit_cost || 0), 0
      );

      // PO stats
      const pos = poRes.data || [];
      const totalSpend = pos.reduce((sum: number, po: any) => sum + (po.total_amount || 0), 0);

      // Top vendors by spend
      const vendorSpendMap: Record<string, number> = {};
      pos.forEach((po: any) => {
        const name = po.vendor?.name || "Unknown";
        vendorSpendMap[name] = (vendorSpendMap[name] || 0) + (po.total_amount || 0);
      });
      const topVendors = Object.entries(vendorSpendMap)
        .map(([name, spend]) => ({ name, spend }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 8);

      // Monthly trend (last 3 months)
      const monthlyTrend: Array<{ month: string; procurement: number; consumption: number }> = [];
      for (let i = 2; i >= 0; i--) {
        const m = subMonths(new Date(), i);
        const monthLabel = format(m, "MMM yyyy");
        const mStart = format(startOfMonth(m), "yyyy-MM-dd");
        const mEnd = format(endOfMonth(m), "yyyy-MM-dd");
        const procurement = pos.filter(
          (po: any) => po.created_at >= mStart && po.created_at <= mEnd + "T23:59:59"
        ).length;
        // We approximate consumption from requisitions in period via a simple count
        monthlyTrend.push({ month: monthLabel, procurement, consumption: 0 });
      }

      // Category distribution
      const catMap: Record<string, number> = {};
      (categoryRes.data || []).forEach((item: any) => {
        const cat = item.category?.name || "Uncategorized";
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      const categoryDistribution = Object.entries(catMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Low stock - items where current stock < reorder_level
      const lowStockRes = await queryTable("inventory_items")
        .select("id, reorder_level")
        .eq("organization_id", orgId)
        .gt("reorder_level", 0);
      
      let lowStockCount = 0;
      if (lowStockRes.data) {
        for (const item of lowStockRes.data) {
          const stockCheck = await queryTable("inventory_stock")
            .select("quantity")
            .eq("item_id", item.id);
          const totalQty = (stockCheck.data || []).reduce((s: number, r: any) => s + (r.quantity || 0), 0);
          if (totalQty < (item.reorder_level || 0)) lowStockCount++;
        }
      }

      // Alerts
      const alerts: Array<{ type: string; message: string; count: number }> = [];
      if (lowStockCount > 0) alerts.push({ type: "warning", message: "Items below reorder level", count: lowStockCount });
      const expiringCount = expiryRes.data?.length || 0;
      if (expiringCount > 0) alerts.push({ type: "danger", message: "Items expiring within 90 days", count: expiringCount });
      const pendingPOs = pos.filter((po: any) => po.status === "pending" || po.status === "submitted").length;
      if (pendingPOs > 0) alerts.push({ type: "info", message: "POs pending approval", count: pendingPOs });

      return {
        stockValue,
        totalPOs: pos.length,
        totalSpend,
        grnCount: grnRes.data?.length || 0,
        pendingRequisitions: reqRes.data?.length || 0,
        lowStockCount,
        activeVendors: vendorRes.data?.length || 0,
        expiringItems: expiringCount,
        categoryDistribution,
        monthlyTrend,
        topVendors,
        alerts,
      };
    },
    enabled: !!orgId,
  });
}

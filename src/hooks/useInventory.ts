import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { inventoryLogger } from "@/lib/logger";

// =====================================================
// TYPES
// =====================================================

export interface InventoryCategory {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: InventoryCategory[];
}

export interface InventoryItem {
  id: string;
  organization_id: string;
  item_code: string;
  name: string;
  description: string | null;
  category_id: string | null;
  unit_of_measure: string;
  minimum_stock: number;
  reorder_level: number;
  standard_cost: number;
  is_consumable: boolean;
  is_active: boolean;
  barcode: string | null;
  sku: string | null;
  created_at: string;
  updated_at: string;
  category?: { id: string; name: string } | InventoryCategory | null;
  total_stock?: number;
  store_id?: string | null;
  store_name?: string | null;
}

export interface InventoryStock {
  id: string;
  item_id: string;
  branch_id: string;
  store_id: string | null;
  batch_number: string | null;
  quantity: number;
  unit_cost: number;
  expiry_date: string | null;
  location: string | null;
  received_date: string;
  vendor_id: string | null;
  grn_id: string | null;
  created_at: string;
  updated_at: string;
  item?: InventoryItem;
  branch?: { id: string; name: string };
  vendor?: { id: string; name: string };
  store?: { id: string; name: string } | null;
}

export interface StockAdjustment {
  id: string;
  organization_id: string;
  branch_id: string;
  item_id: string;
  adjustment_type: string;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
  reference_type: string | null;
  reference_id: string | null;
  adjusted_by: string | null;
  created_at: string;
}

// =====================================================
// CATEGORY HOOKS
// =====================================================

export interface UnifiedCategory extends InventoryCategory {
  source: "inventory" | "pharmacy";
}

function buildCategoryTree(categories: InventoryCategory[], source: "inventory" | "pharmacy"): UnifiedCategory[] {
  const categoryMap = new Map<string, UnifiedCategory>();
  const roots: UnifiedCategory[] = [];
  
  categories.forEach(cat => {
    const unified: UnifiedCategory = { ...cat, source, children: [] };
    categoryMap.set(cat.id, unified);
  });
  
  categories.forEach(cat => {
    const unified = categoryMap.get(cat.id)!;
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      categoryMap.get(cat.parent_id)!.children!.push(unified);
    } else {
      roots.push(unified);
    }
  });
  
  return roots;
}

export function useInventoryCategories() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["inventory-categories", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return buildCategoryTree(data as InventoryCategory[], "inventory");
    },
    enabled: !!profile?.organization_id,
  });
}

export function useUnifiedCategories() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["unified-categories", profile?.organization_id],
    queryFn: async () => {
      // Fetch inventory categories
      const { data: invCats, error: invError } = await supabase
        .from("inventory_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (invError) throw invError;
      
      // Fetch medicine categories
      const { data: medCats, error: medError } = await supabase
        .from("medicine_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (medError) throw medError;
      
      // Build inventory tree
      const invTree = buildCategoryTree(invCats as InventoryCategory[], "inventory");
      
      // Add "Medicines" as a virtual parent containing pharmacy categories
      if (medCats && medCats.length > 0) {
        const medicineChildren: UnifiedCategory[] = medCats.map(cat => ({
          id: cat.id,
          organization_id: cat.organization_id,
          name: cat.name,
          description: cat.description || null,
          parent_id: "medicines-virtual",
          is_active: cat.is_active,
          created_at: cat.created_at,
          updated_at: cat.created_at,
          source: "pharmacy" as const,
          children: [],
        }));
        
        invTree.push({
          id: "medicines-virtual",
          organization_id: profile?.organization_id || "",
          name: "Medicines",
          description: "Pharmacy medicine categories",
          parent_id: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          source: "pharmacy",
          children: medicineChildren,
        });
      }
      
      return invTree;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAllCategories() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["inventory-categories-flat", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as InventoryCategory[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; parent_id?: string }) => {
      const { data: result, error } = await supabase
        .from("inventory_categories")
        .insert({
          organization_id: profile!.organization_id!,
          name: data.name,
          description: data.description || null,
          parent_id: data.parent_id || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-categories"] });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string; parent_id?: string; is_active?: boolean }) => {
      const { data: result, error } = await supabase
        .from("inventory_categories")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// =====================================================
// ITEM HOOKS
// =====================================================

export function useInventoryItems(filters?: { categoryId?: string; search?: string; lowStock?: boolean; storeId?: string }) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["inventory-items", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("inventory_items")
        .select(`
          *,
          category:inventory_categories(id, name)
        `)
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .order("name");
      
      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,item_code.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Get stock with store info for per-warehouse breakdown
      const itemIds = data.map(i => i.id);
      if (itemIds.length === 0) return [] as InventoryItem[];

      let stockQuery = supabase
        .from("inventory_stock")
        .select("item_id, quantity, store_id, store:stores(id, name)")
        .in("item_id", itemIds);
      
      if (filters?.storeId) {
        stockQuery = stockQuery.eq("store_id", filters.storeId);
      }
      
      const { data: stockData, error: stockError } = await stockQuery;
      if (stockError) throw stockError;
      
      // Group stock by item_id + store_id for per-warehouse rows
      const storeStockMap = new Map<string, { quantity: number; store_id: string | null; store_name: string | null }>();
      stockData?.forEach((s: any) => {
        const key = `${s.item_id}__${s.store_id || 'no-store'}`;
        const existing = storeStockMap.get(key);
        if (existing) {
          existing.quantity += s.quantity;
        } else {
          storeStockMap.set(key, {
            quantity: s.quantity,
            store_id: s.store_id,
            store_name: s.store?.name || null,
          });
        }
      });
      
      // Build result: one row per item per store
      let items: InventoryItem[] = [];
      data.forEach((item: any) => {
        const itemStoreEntries = Array.from(storeStockMap.entries()).filter(([key]) => key.startsWith(`${item.id}__`));
        
        if (itemStoreEntries.length === 0) {
          // Item has no stock records at all
          items.push({
            ...item,
            total_stock: 0,
            store_id: null,
            store_name: null,
          } as unknown as InventoryItem);
        } else {
          itemStoreEntries.forEach(([, stockInfo]) => {
            items.push({
              ...item,
              total_stock: stockInfo.quantity,
              store_id: stockInfo.store_id,
              store_name: stockInfo.store_name,
            } as unknown as InventoryItem);
          });
        }
      });
      
      if (filters?.lowStock) {
        items = items.filter(i => (i.total_stock || 0) <= i.reorder_level);
      }
      
      return items;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ["inventory-item", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select(`
          *,
          category:inventory_categories(id, name)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      // Get total stock
      const { data: stockData } = await supabase
        .from("inventory_stock")
        .select("quantity")
        .eq("item_id", id);
      
      const totalStock = stockData?.reduce((sum, s) => sum + s.quantity, 0) || 0;
      
      return { ...data, total_stock: totalStock } as unknown as InventoryItem;
    },
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Partial<InventoryItem>) => {
      const { data: result, error } = await supabase
        .from("inventory_items")
        .insert({
          organization_id: profile!.organization_id!,
          item_code: "", // Will be auto-generated
          name: data.name!,
          description: data.description || null,
          category_id: data.category_id || null,
          unit_of_measure: data.unit_of_measure || "Unit",
          minimum_stock: data.minimum_stock || 0,
          reorder_level: data.reorder_level || 10,
          standard_cost: data.standard_cost || 0,
          is_consumable: data.is_consumable ?? true,
          barcode: data.barcode || null,
          sku: data.sku || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast.success("Item created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InventoryItem> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("inventory_items")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-item"] });
      toast.success("Item updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// =====================================================
// STOCK HOOKS
// =====================================================

export function useInventoryStock(itemId?: string, branchId?: string, storeId?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["inventory-stock", profile?.organization_id, itemId, branchId, storeId],
    queryFn: async () => {
      let query = supabase
        .from("inventory_stock")
        .select(`
          *,
          item:inventory_items(id, item_code, name, unit_of_measure),
          branch:branches(id, name),
          vendor:vendors(id, name),
          store:stores(id, name)
        `)
        .gt("quantity", 0)
        .order("received_date", { ascending: false });
      
      if (itemId) {
        query = query.eq("item_id", itemId);
      }
      
      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      if (storeId && storeId !== "all") {
        query = query.eq("store_id", storeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as InventoryStock[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useLowStockItems() {
  return useInventoryItems({ lowStock: true });
}

export function useExpiringStock(days: number = 30) {
  const { profile } = useAuth();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return useQuery({
    queryKey: ["expiring-stock", profile?.organization_id, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_stock")
        .select(`
          *,
          item:inventory_items(id, item_code, name),
          branch:branches(id, name)
        `)
        .gt("quantity", 0)
        .not("expiry_date", "is", null)
        .lte("expiry_date", futureDate.toISOString().split("T")[0])
        .order("expiry_date");
      
      if (error) throw error;
      return data as unknown as InventoryStock[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      item_id: string;
      branch_id: string;
      adjustment_type: string;
      quantity: number;
      reason?: string;
    }) => {
      // Get current stock
      const { data: currentStock } = await supabase
        .from("inventory_stock")
        .select("id, quantity")
        .eq("item_id", data.item_id)
        .eq("branch_id", data.branch_id)
        .order("received_date", { ascending: true })
        .limit(1)
        .single();
      
      const previousQuantity = currentStock?.quantity || 0;
      const isIncrease = ["increase", "transfer_in"].includes(data.adjustment_type);
      const newQuantity = isIncrease 
        ? previousQuantity + data.quantity 
        : Math.max(0, previousQuantity - data.quantity);
      
      // Create adjustment record
      const { error: adjError } = await supabase
        .from("stock_adjustments")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: data.branch_id,
          item_id: data.item_id,
          adjustment_type: data.adjustment_type,
          quantity: data.quantity,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          reason: data.reason || null,
          adjusted_by: user?.id,
        });
      
      if (adjError) throw adjError;
      
      // Update stock
      if (currentStock) {
        const { error } = await supabase
          .from("inventory_stock")
          .update({ quantity: newQuantity })
          .eq("id", currentStock.id);
        
        if (error) throw error;
      } else if (isIncrease) {
        const { error } = await supabase
          .from("inventory_stock")
          .insert({
            item_id: data.item_id,
            branch_id: data.branch_id,
            quantity: data.quantity,
            unit_cost: 0,
          });
        
        if (error) throw error;
      }
      
      return { previousQuantity, newQuantity };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast.success("Stock adjusted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useStockAdjustments(itemId?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["stock-adjustments", profile?.organization_id, itemId],
    queryFn: async () => {
      let query = supabase
        .from("stock_adjustments")
        .select(`
          *,
          item:inventory_items(id, item_code, name),
          branch:branches(id, name),
          adjusted_by_profile:profiles!stock_adjustments_adjusted_by_fkey(id, full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (itemId) {
        query = query.eq("item_id", itemId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================================================
// DASHBOARD STATS
// =====================================================

export function useInventoryDashboardStats(storeId?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["inventory-dashboard-stats", profile?.organization_id, storeId],
    queryFn: async () => {
      // Total items
      const { count: totalItems } = await supabase
        .from("inventory_items")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      
      // Get all items with stock
      const { data: items } = await supabase
        .from("inventory_items")
        .select("id, reorder_level")
        .eq("is_active", true);
      
      let stockQuery = supabase
        .from("inventory_stock")
        .select("item_id, quantity");
      if (storeId && storeId !== "all") {
        stockQuery = stockQuery.eq("store_id", storeId);
      }
      const { data: stocks } = await stockQuery;
      
      const stockMap = new Map<string, number>();
      stocks?.forEach(s => {
        stockMap.set(s.item_id, (stockMap.get(s.item_id) || 0) + s.quantity);
      });
      
      const lowStockCount = items?.filter(i => 
        (stockMap.get(i.id) || 0) <= i.reorder_level
      ).length || 0;
      
      // Pending POs
      const { count: pendingPOs } = await supabase
        .from("purchase_orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["draft", "pending_approval"]);
      
      // Pending Requisitions
      const { count: pendingRequisitions } = await supabase
        .from("stock_requisitions")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "approved"]);
      
      // Total inventory value
      let valueQuery = supabase
        .from("inventory_stock")
        .select("quantity, unit_cost");
      if (storeId && storeId !== "all") {
        valueQuery = valueQuery.eq("store_id", storeId);
      }
      const { data: stockValues } = await valueQuery;
      
      const totalValue = stockValues?.reduce((sum, s) => 
        sum + (s.quantity * s.unit_cost), 0
      ) || 0;
      
      // Vendors count
      const { count: vendorCount } = await supabase
        .from("vendors")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      
      return {
        totalItems: totalItems || 0,
        lowStockCount,
        pendingPOs: pendingPOs || 0,
        pendingRequisitions: pendingRequisitions || 0,
        totalValue,
        vendorCount: vendorCount || 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================================================
// COMBINED INVENTORY STATS (General + Pharmacy)
// =====================================================

export interface CombinedInventoryStats {
  general: {
    totalValue: number;
    totalItems: number;
    lowStockCount: number;
    expiringCount: number;
  };
  pharmacy: {
    totalValue: number;
    totalItems: number;
    lowStockCount: number;
    expiringCount: number;
  };
  combined: {
    totalValue: number;
    totalItems: number;
    lowStockCount: number;
    expiringCount: number;
  };
  isHospital: boolean;
  hasPharmacyModule: boolean;
}

export function useCombinedInventoryStats(
  organizationId?: string,
  facilityType?: string | null,
  enabledModules?: string[]
) {
  return useQuery({
    queryKey: ["combined-inventory-stats", organizationId, facilityType, enabledModules],
    queryFn: async (): Promise<CombinedInventoryStats> => {
      const isHospital = facilityType !== 'pharmacy';
      const hasPharmacyModule = enabledModules?.includes('pharmacy') ?? false;

      // --- General Inventory Stats ---
      const { count: generalTotalItems } = await supabase
        .from("inventory_items")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const { data: generalItems } = await supabase
        .from("inventory_items")
        .select("id, reorder_level")
        .eq("is_active", true);

      const { data: generalStocks } = await supabase
        .from("inventory_stock")
        .select("item_id, quantity, unit_cost, expiry_date");

      const generalStockMap = new Map<string, number>();
      let generalTotalValue = 0;
      let generalExpiringCount = 0;
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      generalStocks?.forEach(s => {
        generalStockMap.set(s.item_id, (generalStockMap.get(s.item_id) || 0) + s.quantity);
        generalTotalValue += s.quantity * s.unit_cost;
        if (s.expiry_date && new Date(s.expiry_date) <= thirtyDaysFromNow) {
          generalExpiringCount++;
        }
      });

      const generalLowStockCount = generalItems?.filter(i =>
        (generalStockMap.get(i.id) || 0) <= i.reorder_level
      ).length || 0;

      const generalStats = {
        totalValue: generalTotalValue,
        totalItems: generalTotalItems || 0,
        lowStockCount: generalLowStockCount,
        expiringCount: generalExpiringCount,
      };

      // --- Pharmacy Inventory Stats (only for hospitals with pharmacy module) ---
      let pharmacyStats = {
        totalValue: 0,
        totalItems: 0,
        lowStockCount: 0,
        expiringCount: 0,
      };

      if (isHospital && hasPharmacyModule) {
        const { count: pharmacyTotalItems } = await supabase
          .from("medicines")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        // medicine_inventory has reorder_level per batch
        const { data: pharmacyStocks } = await supabase
          .from("medicine_inventory")
          .select("medicine_id, quantity, unit_price, expiry_date, reorder_level");

        let pharmacyTotalValue = 0;
        let pharmacyExpiringCount = 0;
        let pharmacyLowStockCount = 0;

        pharmacyStocks?.forEach(s => {
          pharmacyTotalValue += s.quantity * s.unit_price;
          if (s.expiry_date && new Date(s.expiry_date) <= thirtyDaysFromNow) {
            pharmacyExpiringCount++;
          }
          if (s.quantity <= (s.reorder_level || 10)) {
            pharmacyLowStockCount++;
          }
        });

        pharmacyStats = {
          totalValue: pharmacyTotalValue,
          totalItems: pharmacyTotalItems || 0,
          lowStockCount: pharmacyLowStockCount,
          expiringCount: pharmacyExpiringCount,
        };
      }

      return {
        general: generalStats,
        pharmacy: pharmacyStats,
        combined: {
          totalValue: generalStats.totalValue + pharmacyStats.totalValue,
          totalItems: generalStats.totalItems + pharmacyStats.totalItems,
          lowStockCount: generalStats.lowStockCount + pharmacyStats.lowStockCount,
          expiringCount: generalStats.expiringCount + pharmacyStats.expiringCount,
        },
        isHospital,
        hasPharmacyModule,
      };
    },
    enabled: !!organizationId,
  });
}

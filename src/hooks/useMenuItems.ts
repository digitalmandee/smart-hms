import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItem {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  path: string | null;
  parent_id: string | null;
  sort_order: number | null;
  required_permission: string | null;
  required_module: string | null;
  is_active: boolean | null;
  children?: MenuItem[];
}

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission, isSuperAdmin } = useAuth();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        if (data) {
          // Filter by permissions
          const filteredItems = data.filter((item) => {
            // Super admin sees everything
            if (isSuperAdmin) return true;

            // Skip super admin menu for non-super admins
            if (item.required_module === "super_admin") return false;

            // Check permission if required
            if (item.required_permission) {
              return hasPermission(item.required_permission);
            }

            return true;
          });

          // Build tree structure
          const itemMap = new Map<string, MenuItem>();
          const rootItems: MenuItem[] = [];

          // First pass: create map of all items
          filteredItems.forEach((item) => {
            itemMap.set(item.id, { ...item, children: [] });
          });

          // Second pass: build tree
          filteredItems.forEach((item) => {
            const menuItem = itemMap.get(item.id)!;
            if (item.parent_id && itemMap.has(item.parent_id)) {
              const parent = itemMap.get(item.parent_id)!;
              parent.children = parent.children || [];
              parent.children.push(menuItem);
            } else if (!item.parent_id) {
              rootItems.push(menuItem);
            }
          });

          // Filter out parent items that have no visible children
          const finalItems = rootItems.filter((item) => {
            if (item.path) return true; // Has direct path
            return item.children && item.children.length > 0;
          });

          setMenuItems(finalItems);
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [hasPermission, isSuperAdmin]);

  return { menuItems, isLoading };
};

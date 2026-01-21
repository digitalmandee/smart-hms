import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationModules } from "@/hooks/useOrganizationModules";

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
  const { hasPermission, isSuperAdmin, profile, isLoading: authLoading } = useAuth();
  const { data: enabledModules, isLoading: modulesLoading } = useOrganizationModules(profile?.organization_id);

  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    // For non-super admins, wait for modules to load
    if (!isSuperAdmin && profile?.organization_id && modulesLoading) {
      setIsLoading(true);
      return;
    }

    const fetchMenuItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        if (data) {
          // Helper to check if an item should be visible based on permissions
          const canViewItem = (item: MenuItem): boolean => {
            // Super admin sees everything
            if (isSuperAdmin) return true;

            // Skip super admin menu for non-super admins
            if (item.required_module === "super_admin") return false;

            // Check if module is enabled for this organization
            if (item.required_module && enabledModules) {
              const isModuleEnabled = enabledModules.includes(item.required_module);
              if (!isModuleEnabled) return false;
            }

            // If no permission required, it's visible
            if (!item.required_permission) return true;

            // Check permission if required
            return hasPermission(item.required_permission);
          };

          // First pass: create map of all items with empty children arrays
          const itemMap = new Map<string, MenuItem>();
          data.forEach((item) => {
            itemMap.set(item.id, { ...item, children: [] });
          });

          // Second pass: build parent-child relationships (attach ALL children first)
          const rootItems: MenuItem[] = [];
          data.forEach((item) => {
            const menuItem = itemMap.get(item.id)!;
            if (item.parent_id && itemMap.has(item.parent_id)) {
              const parent = itemMap.get(item.parent_id)!;
              parent.children = parent.children || [];
              parent.children.push(menuItem);
            } else if (!item.parent_id) {
              rootItems.push(menuItem);
            }
          });

          // Third pass: recursively filter items based on permissions
          // This ensures children are filtered before parents are evaluated
          const filterItemsRecursively = (items: MenuItem[]): MenuItem[] => {
            return items
              .map((item) => {
                // First, recursively filter children
                if (item.children && item.children.length > 0) {
                  item.children = filterItemsRecursively(item.children);
                }
                return item;
              })
              .filter((item) => {
                // Check if user can view this item
                if (!canViewItem(item)) return false;

                // If item has a path, it's a leaf/navigable item - show it
                if (item.path) return true;

                // If item has no path, it's a parent container
                // Only show if it has visible children after filtering
                return item.children && item.children.length > 0;
              });
          };

          const finalItems = filterItemsRecursively(rootItems);
          setMenuItems(finalItems);
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [hasPermission, isSuperAdmin, enabledModules, authLoading, modulesLoading, profile?.organization_id]);

  return { menuItems, isLoading };
};

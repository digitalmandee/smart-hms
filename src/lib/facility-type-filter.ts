// Facility-type-aware sidebar filtering
// Hides clinical modules for non-clinical facility types (warehouse, pharmacy)

import type { SidebarMenuItem } from "@/config/role-sidebars";

// Clinical path prefixes that should be hidden for non-clinical facility types
const CLINICAL_PATH_PREFIXES = [
  "/app/opd",
  "/app/ipd",
  "/app/ot",
  "/app/lab",
  "/app/radiology",
  "/app/emergency",
  "/app/blood-bank",
  "/app/certificates",
  "/app/appointments",
  "/app/patients",
  "/app/reception",
];

// Pharmacy paths - kept for pharmacy facility type, hidden for warehouse
const PHARMACY_PATH_PREFIXES = [
  "/app/pharmacy",
];

// Paths blocked per facility type
const BLOCKED_PREFIXES: Record<string, string[]> = {
  warehouse: [...CLINICAL_PATH_PREFIXES, ...PHARMACY_PATH_PREFIXES],
  pharmacy: [...CLINICAL_PATH_PREFIXES], // pharmacy keeps its own paths
};

// Label overrides per facility type (code -> new name)
const LABEL_OVERRIDES: Record<string, Record<string, string>> = {
  warehouse: {
    inventory: "Warehouse",
  },
};

function isPathBlocked(path: string | null, blockedPrefixes: string[]): boolean {
  if (!path) return false;
  return blockedPrefixes.some(prefix => path.startsWith(prefix));
}

function filterItems(items: SidebarMenuItem[], blockedPrefixes: string[], labelOverrides?: Record<string, string>): SidebarMenuItem[] {
  return items
    .map(item => {
      // If this item's own path is blocked, skip it
      if (item.path && isPathBlocked(item.path, blockedPrefixes)) {
        return null;
      }

      // Apply label override if applicable
      const overriddenName = labelOverrides && item.name && labelOverrides[item.name.toLowerCase()]
        ? labelOverrides[item.name.toLowerCase()]
        : item.name;

      // If item has children, filter them
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterItems(item.children, blockedPrefixes, labelOverrides);
        // If all children were filtered out, skip the parent too
        if (filteredChildren.length === 0) {
          return null;
        }
        return { ...item, name: overriddenName, children: filteredChildren };
      }

      return { ...item, name: overriddenName };
    })
    .filter(Boolean) as SidebarMenuItem[];
}

/**
 * Filters sidebar items based on the organization's facility_type.
 * - For 'warehouse': hides all clinical + pharmacy paths
 * - For 'pharmacy': hides all clinical paths (keeps pharmacy paths)
 * - For 'hospital', 'clinic', 'diagnostic_center': no filtering (full access)
 */
export function filterSidebarByFacilityType(
  items: SidebarMenuItem[],
  facilityType: string | null | undefined
): SidebarMenuItem[] {
  if (!facilityType) return items;
  
  const blockedPrefixes = BLOCKED_PREFIXES[facilityType];
  if (!blockedPrefixes) return items; // hospital, clinic, diagnostic_center = no filtering
  
  const labelOverrides = LABEL_OVERRIDES[facilityType];
  return filterItems(items, blockedPrefixes, labelOverrides);
}

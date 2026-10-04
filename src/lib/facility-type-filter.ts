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
  "/app/insurance",
];

// Pharmacy paths - kept for pharmacy facility type, hidden for warehouse
const PHARMACY_PATH_PREFIXES = [
  "/app/pharmacy",
];

// Billing paths - irrelevant for warehouse
const BILLING_PATH_PREFIXES = [
  "/app/billing",
  "/app/accounts/receivables",
];

// Clinical HR sub-paths that are hospital-specific
const CLINICAL_HR_PATH_PREFIXES = [
  "/app/hr/doctor-compensation",
  "/app/hr/doctor-earnings",
  "/app/hr/visiting-doctors",
  "/app/hr/ot-roster",
  "/app/hr/emergency-roster",
];

// Paths a thalassemia center does not use (procurement, warehouse and inventory stay visible)
const THALASSEMIA_BLOCKED_PREFIXES = [
  "/app/ot",
  "/app/emergency",
  "/app/radiology",
  "/app/dialysis",
  "/app/dental",
  "/app/hr/ot-roster",
  "/app/hr/emergency-roster",
];

// Paths blocked per facility type
const BLOCKED_PREFIXES: Record<string, string[]> = {
  warehouse: [...CLINICAL_PATH_PREFIXES, ...PHARMACY_PATH_PREFIXES, ...BILLING_PATH_PREFIXES, ...CLINICAL_HR_PATH_PREFIXES],
  pharmacy: [...CLINICAL_PATH_PREFIXES], // pharmacy keeps its own paths
  thalassemia_center: THALASSEMIA_BLOCKED_PREFIXES,
};

// Label overrides per facility type (code -> new name)
const LABEL_OVERRIDES: Record<string, Record<string, string>> = {
  warehouse: {
    inventory: "Warehouse",
  },
};

// Names of sidebar items to hide entirely for specific facility types
const HIDDEN_ITEM_NAMES: Record<string, string[]> = {
  warehouse: [
    "doctors", "nurses", "paramedical staff",
    "doctor compensation", "doctor earnings", "visiting doctors",
    "ot roster", "emergency roster",
  ],
  thalassemia_center: [
    "ot roster", "emergency roster",
  ],
};


function isPathBlocked(path: string | null, blockedPrefixes: string[]): boolean {
  if (!path) return false;
  return blockedPrefixes.some(prefix => path.startsWith(prefix));
}

function filterItems(items: SidebarMenuItem[], blockedPrefixes: string[], labelOverrides?: Record<string, string>, hiddenNames?: string[]): SidebarMenuItem[] {
  return items
    .map(item => {
      // If this item's own path is blocked, skip it
      if (item.path && isPathBlocked(item.path, blockedPrefixes)) {
        return null;
      }

      // If this item's name is in the hidden list, skip it
      if (hiddenNames && item.name && hiddenNames.includes(item.name.toLowerCase())) {
        return null;
      }

      // Apply label override if applicable
      const overriddenName = labelOverrides && item.name && labelOverrides[item.name.toLowerCase()]
        ? labelOverrides[item.name.toLowerCase()]
        : item.name;

      // If item has children, filter them
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterItems(item.children, blockedPrefixes, labelOverrides, hiddenNames);
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
 * - For 'thalassemia_center': hides OT, Emergency, Radiology, Dialysis, Dental (keeps procurement/warehouse)
 * - For 'hospital', 'clinic', 'diagnostic_center': no filtering (full access)
 */
// Features switched off for every facility for now (radiology, surgery/OT, surgeon, anesthesia)
export const GLOBALLY_HIDDEN_PREFIXES = [
  "/app/ot",
  "/app/radiology",
  "/app/reception/ot-charges",
  "/app/services/category/radiology",
  "/app/hr/ot-roster",
  "/app/settings/surgeon-fee",
  "/app/emergency",
  "/app/dialysis",
  "/app/dental",
  "/app/insurance",
  "/app/mobile-units",
  "/app/home-care",
  "/app/telemedicine",
  "/app/kitchen",
  "/app/hr/emergency-roster",
  "/app/settings/ksa",
  "/app/settings/kiosk",
  "/app/assets",
  "/app/housekeeping",
  "/app/ipd/housekeeping",
  "/app/accounts/receivables?tab=insurance",
];
const GLOBALLY_HIDDEN_NAMES = [
  "radiology", "surgery", "surgeries", "operation theatre", "operation theater", "ot",
  "ot charges", "ot roster", "surgeon fee templates", "surgery schedule", "pre-anesthesia",
  "anesthesia", "pacs", "imaging", "emergency", "dialysis", "dental", "insurance", "nphies",
  "gynecology", "gynecology & obstetrics", "obstetrics", "maternity", "clinic on wheels", "mobile units",
  "kiosk", "kiosks", "ksa compliance", "ksa integrations", "wasfaty", "tatmeen", "nafath", "telemedicine",
  "home care", "kitchen", "emergency roster", "asset management", "housekeeping", "insurance aging",
];

// Welfare / donation module — full menu only for admin & finance roles
export const WELFARE_MENU: SidebarMenuItem = {
  name: "Donations & Welfare", path: "", icon: "HeartHandshake",
  children: [
    { name: "Front Desk", path: "/app/reception/front-desk", icon: "UserCheck" },
    { name: "Donations Dashboard", path: "/app/donations", icon: "LayoutDashboard" },
    { name: "Donors", path: "/app/donations/donors", icon: "Users" },
    { name: "Record Donation", path: "/app/donations/record", icon: "Wallet" },
    { name: "Fund Balances", path: "/app/donations/funds", icon: "Wallet" },
    { name: "Welfare Report", path: "/app/donations/welfare-report", icon: "FileBarChart" },
    { name: "Campaigns", path: "/app/donations/campaigns", icon: "Target" },
  ],
} as SidebarMenuItem;

/** Roles that see the full dedicated Donations & Welfare module */
export const WELFARE_ADMIN_ROLES = ["super_admin", "org_admin", "branch_admin", "accountant", "finance_manager"];
/** Roles that only get the Front Desk (welfare patient intake + billing) */
export const WELFARE_FRONTDESK_ROLES = ["receptionist"];

export function filterSidebarByFacilityType(
  items: SidebarMenuItem[],
  facilityType: string | null | undefined,
  role?: string | null
): SidebarMenuItem[] {
  const blockedPrefixes = [...GLOBALLY_HIDDEN_PREFIXES, ...((facilityType && BLOCKED_PREFIXES[facilityType]) || [])];
  const labelOverrides = facilityType ? LABEL_OVERRIDES[facilityType] : undefined;
  const hiddenNames = [...GLOBALLY_HIDDEN_NAMES, ...((facilityType && HIDDEN_ITEM_NAMES[facilityType]) || [])];
  const filtered = filterItems(items, blockedPrefixes, labelOverrides, hiddenNames);
  if (facilityType === "thalassemia_center" && !filtered.some(i => i.path === "/app/thalassemia")) {
    const thalMenu: SidebarMenuItem = {
      name: "Thalassemia Care", path: "", icon: "HeartPulse",
      children: [
        { name: "Thalassemia Dashboard", path: "/app/thalassemia", icon: "LayoutDashboard" },
        { name: "Patient Registry", path: "/app/thalassemia/registry", icon: "Users" },
      ],
    } as SidebarMenuItem;
    filtered.splice(Math.min(1, filtered.length), 0, thalMenu);
  }
  if (facilityType === "warehouse" || facilityType === "pharmacy") return filtered;
  const json = JSON.stringify(filtered);
  if (!role || WELFARE_ADMIN_ROLES.includes(role)) {
    if (!json.includes("/app/donations/funds")) filtered.splice(Math.min(2, filtered.length), 0, WELFARE_MENU);
  } else if (WELFARE_FRONTDESK_ROLES.includes(role)) {
    if (!json.includes("/app/reception/front-desk")) {
      filtered.splice(Math.min(1, filtered.length), 0,
        { name: "Front Desk", path: "/app/reception/front-desk", icon: "UserCheck" } as SidebarMenuItem);
    }
  }
  return filtered;
}

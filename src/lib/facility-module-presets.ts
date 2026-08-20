// Default module presets per facility_type.
// Applied once, right after an organization is created.
// Codes must match public.available_modules.code

export const FACILITY_MODULE_PRESETS: Record<string, { enabled: string[]; disabled: string[] }> = {
  thalassemia_center: {
    // Core transfusion day-care operation + mandatory procurement/warehouse + donations
    enabled: [
      "patients",
      "appointments",
      "opd",
      "blood_bank",
      "lab",
      "pharmacy",
      "pharmacy_pos",
      "billing",
      "donations",
      "accounts",
      "inventory",
      "warehouse",
      "hr",
      "insurance",
      "reports",
      "settings",
      "ksa_compliance",
    ],
    // IPD stays available but off by default (transfusion runs as day-care)
    disabled: ["ot", "emergency", "radiology", "dialysis", "ipd"],
  },
};

/** Modules that are not recommended for a facility type (shown as a hint to super-admins). */
export const FACILITY_NOT_RECOMMENDED: Record<string, string[]> = {
  thalassemia_center: ["ot", "emergency", "radiology", "dialysis"],
};

export function getFacilityModulePreset(facilityType?: string | null) {
  if (!facilityType) return null;
  return FACILITY_MODULE_PRESETS[facilityType] ?? null;
}

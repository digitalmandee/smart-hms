import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types for config tables
export interface ConfigSymptom {
  id: string;
  organization_id: string;
  name: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ConfigDosageFrequency {
  id: string;
  organization_id: string;
  code: string;
  label: string;
  sort_order: number;
  is_active: boolean;
}

export interface ConfigDurationOption {
  id: string;
  organization_id: string;
  value: string;
  label: string;
  days_equivalent: number | null;
  sort_order: number;
  is_active: boolean;
}

export interface ConfigInstruction {
  id: string;
  organization_id: string;
  text: string;
  sort_order: number;
  is_active: boolean;
}

export interface ConfigLabPanel {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  tests: Array<{ test_name: string; test_category: string }>;
  sort_order: number;
  is_active: boolean;
}

export interface LabSettings {
  id: string;
  organization_id: string;
  branch_id: string | null;
  allow_direct_lab_payment: boolean;
  require_consultation_for_lab: boolean;
  lab_payment_location: "reception" | "lab" | "both";
  auto_generate_invoice: boolean;
}

// Fallback data for when database is empty
const DEFAULT_SYMPTOMS = [
  "Fever", "Cough", "Cold", "Headache", "Body ache", "Fatigue",
  "Nausea", "Vomiting", "Diarrhea", "Chest pain", "Shortness of breath",
  "Dizziness", "Loss of appetite", "Sore throat", "Runny nose"
];

const DEFAULT_FREQUENCIES = [
  { value: "1-0-0", label: "Once daily (Morning)" },
  { value: "0-0-1", label: "Once daily (Night)" },
  { value: "1-0-1", label: "Twice daily (BD)" },
  { value: "1-1-1", label: "Three times daily (TDS)" },
  { value: "1-1-1-1", label: "Four times daily (QDS)" },
  { value: "SOS", label: "As needed (SOS)" },
  { value: "STAT", label: "Immediately (STAT)" },
  { value: "HS", label: "At bedtime (HS)" },
  { value: "AC", label: "Before meals (AC)" },
  { value: "PC", label: "After meals (PC)" },
];

const DEFAULT_DURATIONS = [
  { value: "3 days", label: "3 Days" },
  { value: "5 days", label: "5 Days" },
  { value: "7 days", label: "7 Days" },
  { value: "10 days", label: "10 Days" },
  { value: "14 days", label: "14 Days" },
  { value: "1 month", label: "1 Month" },
  { value: "2 months", label: "2 Months" },
  { value: "3 months", label: "3 Months" },
  { value: "Continuous", label: "Continuous" },
];

const DEFAULT_INSTRUCTIONS = [
  "Take with water",
  "Take after meals",
  "Take before meals",
  "Take with food",
  "Take on empty stomach",
  "Avoid alcohol",
  "Avoid dairy products",
  "Do not crush or chew",
  "Apply topically",
  "Use as directed",
];

const DEFAULT_LAB_PANELS = [
  { name: "CBC", tests: [{ test_name: "Complete Blood Count (CBC)", test_category: "blood" }] },
  { name: "LFT", tests: [{ test_name: "Liver Function Test", test_category: "blood" }] },
  { name: "RFT", tests: [{ test_name: "Renal Function Test", test_category: "blood" }] },
  { name: "Lipid", tests: [{ test_name: "Lipid Profile", test_category: "blood" }] },
  { name: "Thyroid", tests: [{ test_name: "Thyroid Function Test (TSH, T3, T4)", test_category: "blood" }] },
  { name: "HbA1c", tests: [{ test_name: "HbA1c", test_category: "blood" }] },
  { name: "Urine", tests: [{ test_name: "Urine Routine & Microscopy", test_category: "pathology" }] },
];

// Fetch common symptoms
export function useConfigSymptoms() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["config-symptoms", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return DEFAULT_SYMPTOMS;

      const { data, error } = await supabase
        .rpc('get_config_symptoms', { org_id: profile.organization_id })
        .throwOnError();

      // Fallback to direct query if RPC doesn't exist
      if (error || !data) {
        return DEFAULT_SYMPTOMS;
      }

      return (data as ConfigSymptom[]).map(s => s.name);
    },
    enabled: !!profile?.organization_id,
    // Use defaults while loading
    placeholderData: DEFAULT_SYMPTOMS,
  });
}

// Fetch dosage frequencies
export function useConfigDosageFrequencies() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["config-dosage-frequencies", profile?.organization_id],
    queryFn: async () => {
      // Return defaults - config tables will be used once types are regenerated
      return DEFAULT_FREQUENCIES;
    },
    enabled: !!profile?.organization_id,
    placeholderData: DEFAULT_FREQUENCIES,
  });
}

// Fetch duration options
export function useConfigDurationOptions() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["config-duration-options", profile?.organization_id],
    queryFn: async () => {
      return DEFAULT_DURATIONS;
    },
    enabled: !!profile?.organization_id,
    placeholderData: DEFAULT_DURATIONS,
  });
}

// Fetch instructions
export function useConfigInstructions() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["config-instructions", profile?.organization_id],
    queryFn: async () => {
      return DEFAULT_INSTRUCTIONS;
    },
    enabled: !!profile?.organization_id,
    placeholderData: DEFAULT_INSTRUCTIONS,
  });
}

// Fetch lab panels
export function useConfigLabPanels() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["config-lab-panels", profile?.organization_id],
    queryFn: async () => {
      return DEFAULT_LAB_PANELS;
    },
    enabled: !!profile?.organization_id,
    placeholderData: DEFAULT_LAB_PANELS,
  });
}

// Fetch lab settings
export function useLabSettings(branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["lab-settings", profile?.organization_id, branchId],
    queryFn: async (): Promise<LabSettings | null> => {
      if (!profile?.organization_id) return null;

      // Return default settings until types are regenerated
      return {
        id: "",
        organization_id: profile.organization_id,
        branch_id: branchId || null,
        allow_direct_lab_payment: false,
        require_consultation_for_lab: true,
        lab_payment_location: "reception",
        auto_generate_invoice: true,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// Combined hook for prescription options
export function usePrescriptionConfig() {
  const { data: frequencies = DEFAULT_FREQUENCIES } = useConfigDosageFrequencies();
  const { data: durations = DEFAULT_DURATIONS } = useConfigDurationOptions();
  const { data: instructions = DEFAULT_INSTRUCTIONS } = useConfigInstructions();

  return {
    frequencies,
    durations,
    instructions,
    isLoading: false,
  };
}

// Re-export defaults for backward compatibility
export const DOSAGE_FREQUENCIES = DEFAULT_FREQUENCIES;
export const DURATION_OPTIONS = DEFAULT_DURATIONS;
export const INSTRUCTION_OPTIONS = DEFAULT_INSTRUCTIONS;

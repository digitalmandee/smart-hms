import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SurgeryConsent {
  id: string;
  surgery_id: string;
  consent_type: 'surgical' | 'anesthesia' | 'blood_transfusion' | 'high_risk';
  consent_template: string | null;
  procedure_explained: string | null;
  risks_explained: string | null;
  alternatives_explained: string | null;
  patient_questions: string | null;
  patient_signature: string | null;
  patient_signed_at: string | null;
  patient_relationship: string | null;
  witness_name: string | null;
  witness_signature: string | null;
  witness_signed_at: string | null;
  explained_by: string | null;
  is_valid: boolean;
  revoked_at: string | null;
  revocation_reason: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  explained_by_profile?: { full_name: string } | null;
}

export interface CreateConsentData {
  surgery_id: string;
  consent_type: 'surgical' | 'anesthesia' | 'blood_transfusion' | 'high_risk';
  procedure_explained?: string;
  risks_explained?: string;
  alternatives_explained?: string;
  patient_questions?: string;
  patient_signature?: string;
  patient_relationship?: string;
  witness_name?: string;
  witness_signature?: string;
}

// Consent type labels and templates
export const CONSENT_TYPES = {
  surgical: {
    label: 'Surgical Procedure Consent',
    description: 'Consent for the surgical procedure to be performed',
  },
  anesthesia: {
    label: 'Anesthesia Consent',
    description: 'Consent for anesthesia administration',
  },
  blood_transfusion: {
    label: 'Blood Transfusion Consent',
    description: 'Consent for blood and blood product transfusion',
  },
  high_risk: {
    label: 'High-Risk Procedure Consent',
    description: 'Additional consent for high-risk procedures',
  },
};

export function useSurgeryConsents(surgeryId?: string) {
  return useQuery({
    queryKey: ['surgery-consents', surgeryId],
    queryFn: async () => {
      if (!surgeryId) return [];

      const { data, error } = await supabase
        .from('surgery_consents')
        .select(`
          *,
          explained_by_profile:profiles!surgery_consents_explained_by_fkey(full_name)
        `)
        .eq('surgery_id', surgeryId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as SurgeryConsent[];
    },
    enabled: !!surgeryId,
  });
}

export function useCreateConsent() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (consent: CreateConsentData) => {
      const { data, error } = await supabase
        .from('surgery_consents')
        .insert({
          surgery_id: consent.surgery_id,
          consent_type: consent.consent_type,
          procedure_explained: consent.procedure_explained,
          risks_explained: consent.risks_explained,
          alternatives_explained: consent.alternatives_explained,
          patient_questions: consent.patient_questions,
          patient_signature: consent.patient_signature,
          patient_signed_at: consent.patient_signature ? new Date().toISOString() : null,
          patient_relationship: consent.patient_relationship || 'self',
          witness_name: consent.witness_name,
          witness_signature: consent.witness_signature,
          witness_signed_at: consent.witness_signature ? new Date().toISOString() : null,
          explained_by: profile?.id,
          is_valid: true,
          organization_id: profile?.organization_id!,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surgery-consents', variables.surgery_id] });
      queryClient.invalidateQueries({ queryKey: ['surgery', variables.surgery_id] });
      toast.success('Consent form signed');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save consent');
    },
  });
}

export function useRevokeConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ consentId, surgeryId, reason }: { consentId: string; surgeryId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('surgery_consents')
        .update({
          is_valid: false,
          revoked_at: new Date().toISOString(),
          revocation_reason: reason,
        })
        .eq('id', consentId)
        .select()
        .single();

      if (error) throw error;
      return { data, surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['surgery-consents', result.surgeryId] });
      toast.success('Consent revoked');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke consent');
    },
  });
}

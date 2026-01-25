import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Fetch dispensed OT medications awaiting reception approval
export function useOTMedicationsPendingApproval() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['ot-medications-pending-approval', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('surgery_medications')
        .select(`
          *,
          surgery:surgeries!surgery_medications_surgery_id_fkey(
            id,
            surgery_number,
            procedure_name,
            admission_id,
            patient:patients!surgeries_patient_id_fkey(
              id, 
              first_name, 
              last_name, 
              patient_number
            ),
            admission:admissions!surgeries_admission_id_fkey(
              id,
              admission_number
            )
          ),
          dispensed_by_profile:profiles!surgery_medications_dispensed_by_fkey(full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('pharmacy_status', 'dispensed')
        .eq('billing_status', 'pending')
        .order('dispensed_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 30000,
  });
}

// Approve a single OT medication charge and post to IPD charges
export function useApproveOTMedicationCharge() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ medicationId, surgeryId }: { medicationId: string; surgeryId: string }) => {
      // 1. Get medication details
      const { data: medication, error: medError } = await supabase
        .from('surgery_medications')
        .select(`
          *,
          surgery:surgeries!surgery_medications_surgery_id_fkey(
            admission_id,
            patient_id
          )
        `)
        .eq('id', medicationId)
        .single();

      if (medError || !medication) throw new Error('Medication not found');
      
      const admissionId = medication.surgery?.admission_id;
      
      // 2. Post to ipd_charges if there's an admission
      if (admissionId && medication.unit_price) {
        const { error: chargeError } = await supabase
          .from('ipd_charges')
          .insert({
            admission_id: admissionId,
            charge_date: new Date().toISOString().split('T')[0],
            charge_type: 'medication',
            description: `OT Med: ${medication.medication_name} ${medication.dosage || ''}`.trim(),
            quantity: 1,
            unit_price: medication.unit_price,
            total_amount: medication.unit_price,
            is_billed: false,
          });

        if (chargeError) {
          console.error('Failed to post IPD charge:', chargeError);
          throw new Error('Failed to add charge to patient bill');
        }
      }

      // 3. Update medication billing_status
      const { error: updateError } = await supabase
        .from('surgery_medications')
        .update({
          billing_status: 'posted',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', medicationId);

      if (updateError) throw updateError;

      return { medicationId, surgeryId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ot-medications-pending-approval'] });
      queryClient.invalidateQueries({ queryKey: ['patient-unbilled-charges'] });
      queryClient.invalidateQueries({ queryKey: ['admission-unbilled-charges'] });
      toast.success('Medication charge approved and posted to billing');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve charge');
    },
  });
}

// Bulk approve multiple OT medication charges
export function useBulkApproveOTMedicationCharges() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (medicationIds: string[]) => {
      let successCount = 0;
      let failCount = 0;

      for (const medicationId of medicationIds) {
        try {
          // Get medication details
          const { data: medication, error: medError } = await supabase
            .from('surgery_medications')
            .select(`
              *,
              surgery:surgeries!surgery_medications_surgery_id_fkey(
                admission_id,
                patient_id
              )
            `)
            .eq('id', medicationId)
            .single();

          if (medError || !medication) {
            failCount++;
            continue;
          }

          const admissionId = medication.surgery?.admission_id;

          // Post to ipd_charges if there's an admission
          if (admissionId && medication.unit_price) {
            await supabase
              .from('ipd_charges')
              .insert({
                admission_id: admissionId,
                charge_date: new Date().toISOString().split('T')[0],
                charge_type: 'medication',
                description: `OT Med: ${medication.medication_name} ${medication.dosage || ''}`.trim(),
                quantity: 1,
                unit_price: medication.unit_price,
                total_amount: medication.unit_price,
                is_billed: false,
              });
          }

          // Update medication billing_status
          await supabase
            .from('surgery_medications')
            .update({
              billing_status: 'posted',
              approved_by: profile?.id,
              approved_at: new Date().toISOString(),
            })
            .eq('id', medicationId);

          successCount++;
        } catch (err) {
          failCount++;
        }
      }

      return { successCount, failCount };
    },
    onSuccess: ({ successCount, failCount }) => {
      queryClient.invalidateQueries({ queryKey: ['ot-medications-pending-approval'] });
      queryClient.invalidateQueries({ queryKey: ['patient-unbilled-charges'] });
      queryClient.invalidateQueries({ queryKey: ['admission-unbilled-charges'] });
      
      if (successCount > 0) {
        toast.success(`${successCount} charge(s) approved and posted to billing`);
      }
      if (failCount > 0) {
        toast.warning(`${failCount} charge(s) failed to process`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process charges');
    },
  });
}

// Reject an OT medication charge
export function useRejectOTMedicationCharge() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ medicationId, reason }: { medicationId: string; reason: string }) => {
      const { error } = await supabase
        .from('surgery_medications')
        .update({
          billing_status: 'rejected',
          rejection_reason: reason,
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', medicationId);

      if (error) throw error;
      return { medicationId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ot-medications-pending-approval'] });
      toast.success('Medication charge rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject charge');
    },
  });
}

// Get count of pending OT medication approvals for badges
export function useOTMedicationApprovalCount() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['ot-medications-approval-count', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return 0;

      const { count, error } = await supabase
        .from('surgery_medications')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id)
        .eq('pharmacy_status', 'dispensed')
        .eq('billing_status', 'pending');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 30000,
  });
}

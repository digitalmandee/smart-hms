import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DoctorSettlement {
  id: string;
  organization_id: string;
  doctor_id: string;
  settlement_date: string;
  settlement_number: string;
  total_amount: number;
  earning_ids: string[];
  payment_method: string | null;
  reference_number: string | null;
  notes: string | null;
  settled_by: string | null;
  created_at: string;
  doctor?: {
    employee?: {
      first_name: string;
      last_name: string;
    };
  };
  settler?: {
    full_name: string;
  };
}

export function useDoctorSettlements(doctorId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["doctor-settlements", profile?.organization_id, doctorId],
    queryFn: async () => {
      let query = supabase
        .from("doctor_settlements")
        .select(`
          *,
          doctor:doctors(
            employee:employees!doctors_employee_id_fkey(first_name, last_name)
          ),
          settler:profiles!doctor_settlements_settled_by_fkey(full_name)
        `)
        .eq("organization_id", profile!.organization_id!)
        .order("settlement_date", { ascending: false });

      if (doctorId) {
        query = query.eq("doctor_id", doctorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DoctorSettlement[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateSettlement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorId,
      earningIds,
      totalAmount,
      paymentMethod,
      referenceNumber,
      notes,
    }: {
      doctorId: string;
      earningIds: string[];
      totalAmount: number;
      paymentMethod?: string;
      referenceNumber?: string;
      notes?: string;
    }) => {
      // Create settlement record
      const { data: settlement, error: settlementError } = await supabase
        .from("doctor_settlements")
        .insert({
          organization_id: profile!.organization_id!,
          doctor_id: doctorId,
          earning_ids: earningIds,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          reference_number: referenceNumber,
          notes,
          settled_by: profile!.id,
        })
        .select()
        .single();

      if (settlementError) throw settlementError;

      // Mark all earnings as paid
      const { error: updateError } = await supabase
        .from("doctor_earnings")
        .update({ is_paid: true })
        .in("id", earningIds);

      if (updateError) throw updateError;

      return settlement;
    },
    onSuccess: () => {
      toast.success("Settlement created successfully");
      queryClient.invalidateQueries({ queryKey: ["doctor-wallet-balances"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-settlements"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-earnings"] });
    },
    onError: (error) => {
      toast.error("Failed to create settlement: " + error.message);
    },
  });
}

export function useDailyEarningsReport(date: Date) {
  const { profile } = useAuth();
  const dateStr = date.toISOString().split("T")[0];

  return useQuery({
    queryKey: ["daily-earnings-report", profile?.organization_id, dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_earnings")
        .select(`
          *,
          doctor:doctors(
            id,
            employee:employees!doctors_employee_id_fkey(first_name, last_name, employee_number)
          ),
          patient:patients(first_name, last_name)
        `)
        .eq("organization_id", profile!.organization_id!)
        .eq("earning_date", dateStr)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

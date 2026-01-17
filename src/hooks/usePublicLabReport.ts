import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicLabReport {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  clinical_notes: string | null;
  result_notes: string | null;
  created_at: string;
  completed_at: string | null;
  is_published: boolean;
  published_at: string | null;
  patient: {
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    gender: string | null;
    phone: string | null;
    patient_number: string;
  };
  doctor: {
    profile: { full_name: string } | null;
    specialization: string | null;
  } | null;
  items: Array<{
    id: string;
    test_name: string;
    test_category: string | null;
    status: string;
    result_values: Record<string, string | number> | null;
    result_notes: string | null;
  }>;
}

export function usePublicLabReport(orderNumber: string, verificationCode: string) {
  return useQuery({
    queryKey: ["public-lab-report", orderNumber, verificationCode],
    queryFn: async (): Promise<PublicLabReport | null> => {
      if (!orderNumber || !verificationCode) return null;

      // Fetch the published lab order with verification
      const { data: labOrder, error } = await supabase
        .from("lab_orders")
        .select(`
          id,
          order_number,
          status,
          priority,
          clinical_notes,
          result_notes,
          created_at,
          completed_at,
          is_published,
          published_at,
          access_code,
          patient:patients!inner(
            first_name,
            last_name,
            date_of_birth,
            gender,
            phone,
            patient_number
          ),
          doctor:doctors(
            specialization,
            profile:profiles(full_name)
          ),
          items:lab_order_items(
            id,
            test_name,
            test_category,
            status,
            result_values,
            result_notes
          )
        `)
        .eq("order_number", orderNumber.toUpperCase())
        .eq("is_published", true)
        .single();

      if (error || !labOrder) {
        console.error("Lab report not found or not published:", error);
        return null;
      }

      // Verify the access code or last 4 digits of phone
      const patient = labOrder.patient as unknown as PublicLabReport["patient"];
      const storedAccessCode = (labOrder as unknown as { access_code: string | null }).access_code;
      const patientPhone = patient?.phone || "";
      const phoneLast4 = patientPhone.slice(-4);

      const isValidAccess =
        storedAccessCode === verificationCode ||
        phoneLast4 === verificationCode;

      if (!isValidAccess) {
        console.error("Invalid verification code");
        return null;
      }

      // Transform to correct type
      return {
        id: labOrder.id,
        order_number: labOrder.order_number,
        status: labOrder.status,
        priority: labOrder.priority,
        clinical_notes: labOrder.clinical_notes,
        result_notes: labOrder.result_notes,
        created_at: labOrder.created_at,
        completed_at: labOrder.completed_at,
        is_published: labOrder.is_published ?? false,
        published_at: labOrder.published_at ?? null,
        patient: patient,
        doctor: labOrder.doctor as PublicLabReport["doctor"],
        items: (labOrder.items || []) as PublicLabReport["items"],
      };
    },
    enabled: !!orderNumber && !!verificationCode && orderNumber.length >= 6,
    retry: false,
  });
}

// Hook for publishing a lab report
export function usePublishLabReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      publish,
    }: {
      orderId: string;
      publish: boolean;
    }) => {
      const accessCode = publish
        ? Math.floor(100000 + Math.random() * 900000).toString()
        : null;

      const { error } = await supabase
        .from("lab_orders")
        .update({
          is_published: publish,
          published_at: publish ? new Date().toISOString() : null,
          access_code: accessCode,
        })
        .eq("id", orderId);

      if (error) throw error;
      return { accessCode };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-orders"] });
      queryClient.invalidateQueries({ queryKey: ["lab-order"] });
    },
  });
}

// Hook for marking patient notified
export function useMarkPatientNotified() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("lab_orders")
        .update({
          patient_notified: true,
          notification_sent_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-orders"] });
      queryClient.invalidateQueries({ queryKey: ["lab-order"] });
    },
  });
}

// Hook for searching public lab reports
export function useSearchPublicLabReport() {
  return useMutation({
    mutationFn: async ({
      orderNumber,
      verificationCode,
    }: {
      orderNumber: string;
      verificationCode: string;
    }): Promise<PublicLabReport | null> => {
      // Same logic as usePublicLabReport but as a mutation for manual trigger
      const { data: labOrder, error } = await supabase
        .from("lab_orders")
        .select(`
          id,
          order_number,
          status,
          priority,
          clinical_notes,
          result_notes,
          created_at,
          completed_at,
          is_published,
          published_at,
          access_code,
          patient:patients!inner(
            first_name,
            last_name,
            date_of_birth,
            gender,
            phone,
            patient_number
          ),
          doctor:doctors(
            specialization,
            profile:profiles(full_name)
          ),
          items:lab_order_items(
            id,
            test_name,
            test_category,
            status,
            result_values,
            result_notes
          )
        `)
        .eq("order_number", orderNumber.toUpperCase())
        .eq("is_published", true)
        .single();

      if (error || !labOrder) {
        throw new Error("Lab report not found or not published");
      }

      const patient = labOrder.patient as unknown as PublicLabReport["patient"];
      const storedAccessCode = (labOrder as unknown as { access_code: string | null }).access_code;
      const patientPhone = patient?.phone || "";
      const phoneLast4 = patientPhone.slice(-4);

      const isValidAccess =
        storedAccessCode === verificationCode ||
        phoneLast4 === verificationCode;

      if (!isValidAccess) {
        throw new Error("Invalid verification code");
      }

      return {
        id: labOrder.id,
        order_number: labOrder.order_number,
        status: labOrder.status,
        priority: labOrder.priority,
        clinical_notes: labOrder.clinical_notes,
        result_notes: labOrder.result_notes,
        created_at: labOrder.created_at,
        completed_at: labOrder.completed_at,
        is_published: labOrder.is_published ?? false,
        published_at: labOrder.published_at ?? null,
        patient: patient,
        doctor: labOrder.doctor as PublicLabReport["doctor"],
        items: (labOrder.items || []) as PublicLabReport["items"],
      };
    },
  });
}

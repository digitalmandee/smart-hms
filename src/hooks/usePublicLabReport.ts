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
  organization?: {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    logo_url: string | null;
    slug: string;
  } | null;
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
          branch_id,
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
          ),
          branch:branches(
            organization:organizations(
              name,
              address,
              phone,
              email,
              logo_url,
              slug
            )
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

      // Extract organization from branch
      const branch = labOrder.branch as { organization: PublicLabReport["organization"] } | null;
      const organization = branch?.organization || null;

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
        organization,
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

// Hook for searching public lab reports by order number
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
          branch_id,
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
          ),
          branch:branches(
            organization:organizations(
              name,
              address,
              phone,
              email,
              logo_url,
              slug
            )
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

      // Extract organization from branch
      const branch = labOrder.branch as { organization: PublicLabReport["organization"] } | null;
      const organization = branch?.organization || null;

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
        organization,
      };
    },
  });
}

// Brief summary type for patient reports list
export interface PatientReportSummary {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  test_names: string[];
}

// Hook for searching all patient reports by MR number
export function useSearchPatientReports() {
  return useMutation({
    mutationFn: async ({
      patientNumber,
      verificationCode,
    }: {
      patientNumber: string;
      verificationCode: string;
    }): Promise<{ patient: PublicLabReport["patient"]; reports: PatientReportSummary[] }> => {
      // Find patient by patient_number
      const { data: patients, error: patientError } = await supabase
        .from("patients")
        .select("id, first_name, last_name, date_of_birth, gender, phone, patient_number")
        .ilike("patient_number", `%${patientNumber}%`)
        .limit(1);

      if (patientError || !patients || patients.length === 0) {
        throw new Error("Patient not found");
      }

      const patient = patients[0];
      
      // Verify phone last 4 digits
      const phoneLast4 = (patient.phone || "").slice(-4);
      if (phoneLast4 !== verificationCode) {
        throw new Error("Invalid verification code");
      }

      // Fetch all published lab orders for this patient
      const { data: labOrders, error: ordersError } = await supabase
        .from("lab_orders")
        .select(`
          id,
          order_number,
          status,
          created_at,
          completed_at,
          items:lab_order_items(test_name)
        `)
        .eq("patient_id", patient.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (ordersError) {
        throw new Error("Failed to fetch reports");
      }

      const reports: PatientReportSummary[] = (labOrders || []).map((order) => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        created_at: order.created_at,
        completed_at: order.completed_at,
        test_names: (order.items as Array<{ test_name: string }>)?.map((i) => i.test_name) || [],
      }));

      return {
        patient: {
          first_name: patient.first_name,
          last_name: patient.last_name,
          date_of_birth: patient.date_of_birth,
          gender: patient.gender,
          phone: patient.phone,
          patient_number: patient.patient_number,
        },
        reports,
      };
    },
  });
}

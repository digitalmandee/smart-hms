import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InvoiceItem {
  id: string;
  description: string;
  service_type_id: string | null;
  quantity: number;
  unit_price: number;
}

interface CreateLabOrderFromInvoiceParams {
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  branchId: string;
  items: InvoiceItem[];
}

export function useCreateLabOrderFromInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      invoiceNumber,
      patientId,
      branchId,
      items,
    }: CreateLabOrderFromInvoiceParams) => {
      // Get service types to identify lab items
      const serviceTypeIds = items
        .filter((i) => i.service_type_id)
        .map((i) => i.service_type_id!);

      if (serviceTypeIds.length === 0) {
        throw new Error("No service items found");
      }

      const { data: serviceTypes } = await supabase
        .from("service_types")
        .select("id, category, name")
        .in("id", serviceTypeIds);

      const labServiceIds =
        serviceTypes?.filter((st) => st.category === "lab").map((st) => st.id) ||
        [];

      const labItems = items.filter(
        (item) => item.service_type_id && labServiceIds.includes(item.service_type_id)
      );

      if (labItems.length === 0) {
        throw new Error("No lab items found in this invoice");
      }

      // Generate lab order number
      const now = new Date();
      const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
      const randomPart = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      const orderNumber = `LAB-${datePart}-${randomPart}`;

      // Create lab order
      const { data: labOrder, error: labOrderError } = await supabase
        .from("lab_orders")
        .insert({
          order_number: orderNumber,
          patient_id: patientId,
          branch_id: branchId,
          invoice_id: invoiceId,
          payment_status: "paid" as const,
          status: "ordered" as const,
          priority: "routine" as const,
          clinical_notes: `Created from Invoice ${invoiceNumber}`,
        })
        .select()
        .single();

      if (labOrderError) throw labOrderError;

      // Create lab order items
      const labOrderItems = labItems.map((item) => {
        const serviceType = serviceTypes?.find(
          (st) => st.id === item.service_type_id
        );
        return {
          lab_order_id: labOrder.id,
          service_type_id: item.service_type_id,
          test_name: item.description || serviceType?.name || "Lab Test",
          test_category: "lab",
          status: "pending" as const,
        };
      });

      const { error: itemsError } = await supabase
        .from("lab_order_items")
        .insert(labOrderItems);

      if (itemsError) throw itemsError;

      return { labOrder, itemsCount: labOrderItems.length };
    },
    onSuccess: (data) => {
      toast.success(`Lab order created with ${data.itemsCount} test(s)`);
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["lab-orders"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create lab order");
    },
  });
}

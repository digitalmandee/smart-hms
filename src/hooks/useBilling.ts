import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type InvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"];
type Payment = Database["public"]["Tables"]["payments"]["Row"];
type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"];
type ServiceType = Database["public"]["Tables"]["service_types"]["Row"];
type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

export interface InvoiceWithDetails extends Invoice {
  patient: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_number: string;
    phone: string | null;
  };
  items: InvoiceItemWithDetails[];
  payments: PaymentWithMethod[];
  created_by_profile?: { full_name: string } | null;
}

export interface InvoiceItemWithDetails extends InvoiceItem {
  service_type?: ServiceType | null;
}

export interface PaymentWithMethod extends Payment {
  payment_method?: PaymentMethod | null;
  received_by_profile?: { full_name: string } | null;
}

export interface InvoiceFilters {
  status?: InvoiceStatus | "all";
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface PaymentFilters {
  dateFrom?: string;
  dateTo?: string;
  paymentMethodId?: string;
}

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  service_type_id?: string | null;
  medicine_inventory_id?: string | null;
}

// ========== INVOICES ==========

export function useInvoices(branchId?: string, filters: InvoiceFilters = {}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["invoices", branchId, filters],
    queryFn: async () => {
      let query = supabase
        .from("invoices")
        .select(`
          *,
          patient:patients!invoices_patient_id_fkey(id, first_name, last_name, patient_number, phone)
        `)
        .order("created_at", { ascending: false });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.patientId) {
        query = query.eq("patient_id", filters.patientId);
      }

      if (filters.dateFrom) {
        query = query.gte("invoice_date", filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte("invoice_date", filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          patient:patients!invoices_patient_id_fkey(id, first_name, last_name, patient_number, phone, email, address, city),
          created_by_profile:profiles!invoices_created_by_fkey(full_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fetch items separately
      const { data: items, error: itemsError } = await supabase
        .from("invoice_items")
        .select(`
          *,
          service_type:service_types(*)
        `)
        .eq("invoice_id", id);

      if (itemsError) throw itemsError;

      // Fetch payments separately
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          *,
          payment_method:payment_methods(*),
          received_by_profile:profiles!payments_received_by_fkey(full_name)
        `)
        .eq("invoice_id", id)
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      return {
        ...data,
        items: items || [],
        payments: payments || [],
      } as InvoiceWithDetails;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      patientId,
      branchId,
      items,
      notes,
      discountAmount = 0,
      taxAmount = 0,
      status = "pending",
    }: {
      patientId: string;
      branchId: string;
      items: InvoiceItemInput[];
      notes?: string;
      discountAmount?: number;
      taxAmount?: number;
      status?: InvoiceStatus;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      // Calculate totals
      const subtotal = items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
        return sum + itemTotal;
      }, 0);
      const totalAmount = subtotal + taxAmount - discountAmount;

      // Generate invoice number
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          patient_id: patientId,
          branch_id: branchId,
          organization_id: profile.organization_id,
          subtotal,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          paid_amount: 0,
          status,
          notes,
          created_by: profile.id,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const invoiceItems = items.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        total_price: item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100),
        service_type_id: item.service_type_id,
        medicine_inventory_id: item.medicine_inventory_id,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create invoice: " + error.message);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      items,
      notes,
      discountAmount,
      taxAmount,
      status,
    }: {
      id: string;
      items?: InvoiceItemInput[];
      notes?: string;
      discountAmount?: number;
      taxAmount?: number;
      status?: InvoiceStatus;
    }) => {
      const updates: Partial<Invoice> = {};
      
      if (notes !== undefined) updates.notes = notes;
      if (status !== undefined) updates.status = status;
      if (discountAmount !== undefined) updates.discount_amount = discountAmount;
      if (taxAmount !== undefined) updates.tax_amount = taxAmount;

      if (items) {
        // Delete existing items
        await supabase.from("invoice_items").delete().eq("invoice_id", id);

        // Calculate new totals
        const subtotal = items.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
          return sum + itemTotal;
        }, 0);

        updates.subtotal = subtotal;
        updates.total_amount = subtotal + (taxAmount || 0) - (discountAmount || 0);

        // Insert new items
        const invoiceItems = items.map((item) => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent || 0,
          total_price: item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100),
          service_type_id: item.service_type_id,
          medicine_inventory_id: item.medicine_inventory_id,
        }));

        await supabase.from("invoice_items").insert(invoiceItems);
      }

      const { data, error } = await supabase
        .from("invoices")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
      toast.success("Invoice updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update invoice: " + error.message);
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice cancelled");
    },
    onError: (error) => {
      toast.error("Failed to cancel invoice: " + error.message);
    },
  });
}

// ========== PAYMENTS ==========

export function usePayments(branchId?: string, filters: PaymentFilters = {}) {
  return useQuery({
    queryKey: ["payments", branchId, filters],
    queryFn: async () => {
      let query = supabase
        .from("payments")
        .select(`
          *,
          payment_method:payment_methods(*),
          received_by_profile:profiles!payments_received_by_fkey(full_name),
          invoice:invoices!payments_invoice_id_fkey(
            id,
            invoice_number,
            patient:patients!invoices_patient_id_fkey(first_name, last_name, patient_number)
          )
        `)
        .order("created_at", { ascending: false });

      if (filters.dateFrom) {
        query = query.gte("payment_date", filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte("payment_date", filters.dateTo);
      }

      if (filters.paymentMethodId) {
        query = query.eq("payment_method_id", filters.paymentMethodId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      amount,
      paymentMethodId,
      referenceNumber,
      notes,
    }: {
      invoiceId: string;
      amount: number;
      paymentMethodId: string;
      referenceNumber?: string;
      notes?: string;
    }) => {
      // Create payment
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          invoice_id: invoiceId,
          amount,
          payment_method_id: paymentMethodId,
          reference_number: referenceNumber,
          notes,
          received_by: profile?.id,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Get invoice to update paid amount
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select("total_amount, paid_amount")
        .eq("id", invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      const newPaidAmount = (invoice.paid_amount || 0) + amount;
      const totalAmount = invoice.total_amount || 0;
      
      let newStatus: InvoiceStatus = "partially_paid";
      if (newPaidAmount >= totalAmount) {
        newStatus = "paid";
      }

      // Update invoice
      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          paid_amount: newPaidAmount,
          status: newStatus,
        })
        .eq("id", invoiceId);

      if (updateError) throw updateError;

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["billing-stats"] });
      toast.success("Payment recorded successfully");
    },
    onError: (error) => {
      toast.error("Failed to record payment: " + error.message);
    },
  });
}

// ========== PAYMENT METHODS ==========

export function usePaymentMethods() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["payment-methods", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data as PaymentMethod[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAllPaymentMethods() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["all-payment-methods", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      return data as PaymentMethod[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePaymentMethod(id: string | undefined) {
  return useQuery({
    queryKey: ["payment-method", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PaymentMethod;
    },
    enabled: !!id,
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (values: {
      name: string;
      code: string;
      icon?: string;
      requires_reference?: boolean;
      sort_order?: number;
      is_active?: boolean;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase
        .from("payment_methods")
        .insert({
          ...values,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["all-payment-methods"] });
      toast.success("Payment method created");
    },
    onError: (error) => {
      toast.error("Failed to create payment method: " + error.message);
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...values }: {
      id: string;
      name?: string;
      code?: string;
      icon?: string;
      requires_reference?: boolean;
      sort_order?: number;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("payment_methods")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["all-payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["payment-method", variables.id] });
      toast.success("Payment method updated");
    },
    onError: (error) => {
      toast.error("Failed to update payment method: " + error.message);
    },
  });
}

export function useTogglePaymentMethodStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await supabase
        .from("payment_methods")
        .select("is_active")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("payment_methods")
        .update({ is_active: !(current?.is_active ?? true) })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["all-payment-methods"] });
    },
  });
}

// ========== SERVICE TYPES ==========

export function useServiceTypes() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["service-types", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as ServiceType[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAllServiceTypes() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["all-service-types", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as ServiceType[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useServiceType(id: string | undefined) {
  return useQuery({
    queryKey: ["service-type", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ServiceType;
    },
    enabled: !!id,
  });
}

export function useCreateServiceType() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (values: {
      name: string;
      category: "consultation" | "procedure" | "lab" | "pharmacy" | "room" | "other";
      default_price?: number;
      is_active?: boolean;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase
        .from("service_types")
        .insert({
          name: values.name,
          category: values.category,
          default_price: values.default_price,
          is_active: values.is_active,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["all-service-types"] });
      toast.success("Service type created");
    },
    onError: (error) => {
      toast.error("Failed to create service type: " + error.message);
    },
  });
}

export function useUpdateServiceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: {
      id: string;
      name?: string;
      category?: "consultation" | "procedure" | "lab" | "pharmacy" | "room" | "other";
      default_price?: number;
      is_active?: boolean;
    }) => {
      const { id, ...updateData } = values;
      const { data, error } = await supabase
        .from("service_types")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["all-service-types"] });
      queryClient.invalidateQueries({ queryKey: ["service-type", variables.id] });
      toast.success("Service type updated");
    },
    onError: (error) => {
      toast.error("Failed to update service type: " + error.message);
    },
  });
}

export function useToggleServiceTypeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await supabase
        .from("service_types")
        .select("is_active")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("service_types")
        .update({ is_active: !(current?.is_active ?? true) })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["all-service-types"] });
    },
  });
}

// ========== BILLING STATS ==========

export function useBillingStats(branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["billing-stats", branchId],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);

      // Today's collections
      let paymentsQuery = supabase
        .from("payments")
        .select("amount, invoice:invoices!payments_invoice_id_fkey(branch_id)")
        .gte("payment_date", today);

      const { data: todayPayments } = await paymentsQuery;
      
      const todayCollections = todayPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Pending invoices
      let pendingQuery = supabase
        .from("invoices")
        .select("total_amount, paid_amount")
        .in("status", ["pending", "partially_paid"]);

      if (branchId) {
        pendingQuery = pendingQuery.eq("branch_id", branchId);
      }

      const { data: pendingInvoices } = await pendingQuery;
      
      const pendingCount = pendingInvoices?.length || 0;
      const pendingAmount = pendingInvoices?.reduce(
        (sum, inv) => sum + (Number(inv.total_amount) - Number(inv.paid_amount || 0)),
        0
      ) || 0;

      // Invoices created today
      let todayInvoicesQuery = supabase
        .from("invoices")
        .select("id")
        .eq("invoice_date", today);

      if (branchId) {
        todayInvoicesQuery = todayInvoicesQuery.eq("branch_id", branchId);
      }

      const { data: todayInvoices } = await todayInvoicesQuery;
      const invoicesToday = todayInvoices?.length || 0;

      return {
        todayCollections,
        pendingCount,
        pendingAmount,
        invoicesToday,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePatientBalance(patientId: string | undefined) {
  return useQuery({
    queryKey: ["patient-balance", patientId],
    queryFn: async () => {
      if (!patientId) return { outstanding: 0, invoices: [] };

      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, total_amount, paid_amount, status, invoice_date")
        .eq("patient_id", patientId)
        .in("status", ["pending", "partially_paid"])
        .order("invoice_date", { ascending: false });

      if (error) throw error;

      const outstanding = data?.reduce(
        (sum, inv) => sum + (Number(inv.total_amount) - Number(inv.paid_amount || 0)),
        0
      ) || 0;

      return { outstanding, invoices: data || [] };
    },
    enabled: !!patientId,
  });
}

// ========== ANALYTICS HOOKS ==========

export function useDailyCollections(dateFrom: string, dateTo: string, branchId?: string) {
  return useQuery({
    queryKey: ["daily-collections", dateFrom, dateTo, branchId],
    queryFn: async () => {
      let query = supabase
        .from("payments")
        .select("amount, payment_date")
        .gte("payment_date", dateFrom)
        .lte("payment_date", dateTo + "T23:59:59");

      const { data, error } = await query;
      if (error) throw error;

      // Group by date
      const grouped: Record<string, number> = {};
      data?.forEach((p) => {
        const date = p.payment_date?.slice(0, 10) || "";
        grouped[date] = (grouped[date] || 0) + Number(p.amount);
      });

      // Convert to array sorted by date
      return Object.entries(grouped)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
  });
}

export function useRevenueByCategory(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["revenue-by-category", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_items")
        .select(`
          total_price,
          service_type:service_types(category),
          invoice:invoices!invoice_items_invoice_id_fkey(invoice_date)
        `)
        .gte("invoice.invoice_date", dateFrom)
        .lte("invoice.invoice_date", dateTo);

      if (error) throw error;

      // Group by category
      const grouped: Record<string, number> = {};
      data?.forEach((item) => {
        const category = (item.service_type as any)?.category || "other";
        grouped[category] = (grouped[category] || 0) + Number(item.total_price || 0);
      });

      return Object.entries(grouped)
        .map(([category, amount]) => ({ category, amount }))
        .filter((c) => c.amount > 0);
    },
  });
}

export function usePaymentMethodDistribution(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["payment-method-distribution", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          amount,
          payment_method:payment_methods(name)
        `)
        .gte("payment_date", dateFrom)
        .lte("payment_date", dateTo + "T23:59:59");

      if (error) throw error;

      // Group by payment method
      const grouped: Record<string, number> = {};
      data?.forEach((p) => {
        const method = (p.payment_method as any)?.name || "Unknown";
        grouped[method] = (grouped[method] || 0) + Number(p.amount);
      });

      return Object.entries(grouped)
        .map(([method, amount]) => ({ method, amount }))
        .filter((m) => m.amount > 0);
    },
  });
}

export function useOutstandingReceivables(branchId?: string) {
  return useQuery({
    queryKey: ["outstanding-receivables", branchId],
    queryFn: async () => {
      let query = supabase
        .from("invoices")
        .select("total_amount, paid_amount, status")
        .in("status", ["pending", "partially_paid", "paid"]);

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      let totalBilled = 0;
      let totalCollected = 0;
      let outstanding = 0;
      let count = 0;

      data?.forEach((inv) => {
        totalBilled += Number(inv.total_amount || 0);
        totalCollected += Number(inv.paid_amount || 0);
        if (inv.status !== "paid") {
          outstanding += Number(inv.total_amount || 0) - Number(inv.paid_amount || 0);
          count++;
        }
      });

      const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

      return { total: outstanding, count, collectionRate, totalBilled, totalCollected };
    },
  });
}

export function useTopServices(dateFrom: string, dateTo: string, limit = 10) {
  return useQuery({
    queryKey: ["top-services", dateFrom, dateTo, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_items")
        .select(`
          description,
          quantity,
          total_price,
          invoice:invoices!invoice_items_invoice_id_fkey(invoice_date)
        `)
        .gte("invoice.invoice_date", dateFrom)
        .lte("invoice.invoice_date", dateTo);

      if (error) throw error;

      // Group by description
      const grouped: Record<string, { revenue: number; count: number }> = {};
      data?.forEach((item) => {
        const name = item.description;
        if (!grouped[name]) {
          grouped[name] = { revenue: 0, count: 0 };
        }
        grouped[name].revenue += Number(item.total_price || 0);
        grouped[name].count += Number(item.quantity || 1);
      });

      return Object.entries(grouped)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
    },
  });
}

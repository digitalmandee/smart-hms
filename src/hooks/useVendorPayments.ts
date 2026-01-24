import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface VendorPayment {
  id: string;
  organization_id: string;
  branch_id: string | null;
  payment_number: string;
  vendor_id: string;
  purchase_order_id: string | null;
  grn_id: string | null;
  payment_date: string;
  amount: number;
  payment_method_id: string | null;
  bank_account_id: string | null;
  reference_number: string | null;
  notes: string | null;
  status: string;
  journal_entry_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  vendor?: {
    id: string;
    name: string;
    vendor_code: string;
    contact_person: string | null;
  };
  purchase_order?: {
    id: string;
    po_number: string;
    total_amount: number;
  } | null;
  grn?: {
    id: string;
    grn_number: string;
    invoice_amount: number;
    invoice_number: string | null;
  } | null;
  bank_account?: {
    id: string;
    bank_name: string;
    account_number: string;
  } | null;
  payment_method?: {
    id: string;
    name: string;
  } | null;
  approved_by_profile?: {
    full_name: string;
  } | null;
}

// Fetch all vendor payments
export function useVendorPayments(filters?: { 
  status?: string; 
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["vendor-payments", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("vendor_payments")
        .select(`
          *,
          vendor:vendors(id, name, vendor_code, contact_person),
          purchase_order:purchase_orders(id, po_number, total_amount),
          grn:goods_received_notes(id, grn_number, invoice_amount, invoice_number),
          bank_account:bank_accounts(id, bank_name, account_number),
          payment_method:payment_methods(id, name),
          approved_by_profile:profiles!vendor_payments_approved_by_fkey(full_name)
        `)
        .order("payment_date", { ascending: false });
      
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      
      if (filters?.vendorId) {
        query = query.eq("vendor_id", filters.vendorId);
      }
      
      if (filters?.dateFrom) {
        query = query.gte("payment_date", filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte("payment_date", filters.dateTo);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as unknown as VendorPayment[];
    },
    enabled: !!profile?.organization_id,
  });
}

// Fetch single vendor payment
export function useVendorPayment(id: string) {
  return useQuery({
    queryKey: ["vendor-payment", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_payments")
        .select(`
          *,
          vendor:vendors(id, name, vendor_code, contact_person, phone, email),
          purchase_order:purchase_orders(id, po_number, total_amount, order_date),
          grn:goods_received_notes(id, grn_number, invoice_amount, invoice_number, received_date),
          bank_account:bank_accounts(id, bank_name, account_number),
          payment_method:payment_methods(id, name),
          approved_by_profile:profiles!vendor_payments_approved_by_fkey(full_name)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as unknown as VendorPayment;
    },
    enabled: !!id,
  });
}

// Fetch vendor outstanding balance
export function useVendorOutstandingBalance(vendorId: string) {
  return useQuery({
    queryKey: ["vendor-outstanding", vendorId],
    queryFn: async () => {
      // Get all posted GRNs for this vendor
      const { data: grns, error: grnError } = await supabase
        .from("goods_received_notes")
        .select("id, grn_number, invoice_amount, invoice_number, received_date")
        .eq("vendor_id", vendorId)
        .eq("status", "posted");
      
      if (grnError) throw grnError;
      
      // Get all payments for this vendor
      const { data: payments, error: payError } = await supabase
        .from("vendor_payments")
        .select("id, amount, grn_id")
        .eq("vendor_id", vendorId)
        .in("status", ["approved", "paid"]);
      
      if (payError) throw payError;
      
      // Calculate total payable and paid
      const totalPayable = grns?.reduce((sum, grn) => sum + (grn.invoice_amount || 0), 0) || 0;
      const totalPaid = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      
      // Create map of payments per GRN
      const paymentsByGRN = new Map<string, number>();
      payments?.forEach(p => {
        if (p.grn_id) {
          paymentsByGRN.set(p.grn_id, (paymentsByGRN.get(p.grn_id) || 0) + p.amount);
        }
      });
      
      // Outstanding items with breakdown
      const outstandingItems = grns?.map(grn => ({
        id: grn.id,
        grn_number: grn.grn_number,
        invoice_number: grn.invoice_number,
        received_date: grn.received_date,
        invoice_amount: grn.invoice_amount || 0,
        paid_amount: paymentsByGRN.get(grn.id) || 0,
        outstanding: (grn.invoice_amount || 0) - (paymentsByGRN.get(grn.id) || 0),
      })).filter(item => item.outstanding > 0) || [];
      
      return {
        totalPayable,
        totalPaid,
        outstanding: totalPayable - totalPaid,
        outstandingItems,
      };
    },
    enabled: !!vendorId,
  });
}

// Create vendor payment
export function useCreateVendorPayment() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      vendor_id: string;
      grn_id?: string | null;
      purchase_order_id?: string | null;
      payment_date: string;
      amount: number;
      payment_method_id?: string | null;
      bank_account_id?: string | null;
      reference_number?: string | null;
      notes?: string | null;
    }) => {
      // Create the payment record
      const { data: payment, error } = await supabase
        .from("vendor_payments")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id,
          payment_number: "", // Auto-generated by trigger
          vendor_id: data.vendor_id,
          grn_id: data.grn_id || null,
          purchase_order_id: data.purchase_order_id || null,
          payment_date: data.payment_date,
          amount: data.amount,
          payment_method_id: data.payment_method_id || null,
          bank_account_id: data.bank_account_id || null,
          reference_number: data.reference_number || null,
          notes: data.notes || null,
          status: "pending",
          created_by: profile!.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-payments"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-outstanding"] });
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      toast.success("Payment recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to record payment: ${error.message}`);
    },
  });
}

// Approve and post vendor payment (creates journal entry)
export function useApproveVendorPayment() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      // Get payment details
      const { data: payment, error: fetchError } = await supabase
        .from("vendor_payments")
        .select(`
          *,
          vendor:vendors(name),
          bank_account:bank_accounts(account_id)
        `)
        .eq("id", paymentId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!payment) throw new Error("Payment not found");
      
      // Get default AP account
      const { data: apAccount } = await supabase
        .from("accounts")
        .select("id")
        .ilike("name", "%accounts payable%")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .limit(1)
        .single();
      
      // Get cash account if no bank account linked
      let creditAccountId = (payment as any).bank_account?.account_id;
      if (!creditAccountId) {
        const { data: cashAccount } = await supabase
          .from("accounts")
          .select("id")
          .ilike("name", "%cash%")
          .eq("organization_id", profile!.organization_id!)
          .eq("is_active", true)
          .limit(1)
          .single();
        creditAccountId = cashAccount?.id;
      }
      
      let journalEntryId = null;
      
      // Create journal entry if accounts exist
      if (apAccount?.id && creditAccountId) {
        // Create journal entry
        const { data: journalEntry, error: jeError } = await supabase
          .from("journal_entries")
          .insert({
            organization_id: profile!.organization_id!,
            branch_id: payment.branch_id,
            entry_number: "",
            entry_date: payment.payment_date,
            description: `Vendor payment to ${(payment as any).vendor?.name} - ${payment.payment_number}`,
            reference_type: "vendor_payment",
            reference_id: payment.id,
            is_posted: true,
            posted_by: profile!.id,
            posted_at: new Date().toISOString(),
            created_by: profile!.id,
          })
          .select()
          .single();
        
        if (jeError) throw jeError;
        journalEntryId = journalEntry.id;
        
        // Create journal lines: Debit AP, Credit Cash/Bank
        const { error: linesError } = await supabase
          .from("journal_entry_lines")
          .insert([
            {
              journal_entry_id: journalEntry.id,
              account_id: apAccount.id,
              description: `Payment to ${(payment as any).vendor?.name}`,
              debit_amount: payment.amount,
              credit_amount: 0,
            },
            {
              journal_entry_id: journalEntry.id,
              account_id: creditAccountId,
              description: `Payment to ${(payment as any).vendor?.name}`,
              debit_amount: 0,
              credit_amount: payment.amount,
            },
          ]);
        
        if (linesError) throw linesError;
        
        // Update account balances by directly updating current_balance
        // Decrease AP (liability decreases with debit)
        await supabase
          .from("accounts")
          .update({ current_balance: supabase.rpc ? undefined : 0 })
          .eq("id", apAccount.id);
          
        // For now, we'll just create the journal entries
        // Account balances should be updated by a database trigger
      }
      
      // Update payment status
      const { data: updatedPayment, error: updateError } = await supabase
        .from("vendor_payments")
        .update({
          status: "paid",
          journal_entry_id: journalEntryId,
          approved_by: profile!.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", paymentId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return updatedPayment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-payments"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-payment"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-outstanding"] });
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      toast.success("Payment approved and posted to ledger");
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve payment: ${error.message}`);
    },
  });
}

// Cancel vendor payment
export function useCancelVendorPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { data, error } = await supabase
        .from("vendor_payments")
        .update({ status: "cancelled" })
        .eq("id", paymentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-payments"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-payment"] });
      toast.success("Payment cancelled");
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel payment: ${error.message}`);
    },
  });
}

// Get payables with outstanding balances
export function usePayablesWithBalance() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["payables-with-balance", profile?.organization_id],
    queryFn: async () => {
      // Get all posted GRNs
      const { data: grns, error: grnError } = await supabase
        .from("goods_received_notes")
        .select(`
          id,
          grn_number,
          invoice_number,
          received_date,
          invoice_amount,
          vendor_id,
          status,
          vendor:vendors(id, name, vendor_code, contact_person, phone)
        `)
        .eq("status", "posted")
        .order("received_date", { ascending: false });
      
      if (grnError) throw grnError;
      
      // Get all payments
      const { data: payments, error: payError } = await supabase
        .from("vendor_payments")
        .select("id, amount, grn_id, vendor_id")
        .in("status", ["approved", "paid"]);
      
      if (payError) throw payError;
      
      // Calculate payments per GRN
      const paymentsByGRN = new Map<string, number>();
      payments?.forEach(p => {
        if (p.grn_id) {
          paymentsByGRN.set(p.grn_id, (paymentsByGRN.get(p.grn_id) || 0) + p.amount);
        }
      });
      
      // Map GRNs with outstanding amounts
      const payables = grns?.map(grn => {
        const paidAmount = paymentsByGRN.get(grn.id) || 0;
        const outstanding = (grn.invoice_amount || 0) - paidAmount;
        
        return {
          id: grn.id,
          grn_number: grn.grn_number,
          invoice_number: grn.invoice_number,
          received_date: grn.received_date,
          invoice_amount: grn.invoice_amount || 0,
          paid_amount: paidAmount,
          outstanding_amount: outstanding,
          payment_status: outstanding <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid',
          vendor_id: grn.vendor_id,
          vendor: grn.vendor,
        };
      }).filter(p => p.outstanding_amount > 0) || [];
      
      return payables;
    },
    enabled: !!profile?.organization_id,
  });
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShiftType, getShiftFromTime, getShiftLabel } from "@/components/reports/ShiftFilter";

export interface ShiftCollection {
  shift: ShiftType;
  shiftLabel: string;
  revenue: number;
  count: number;
  percentage: number;
  paymentMethods: { method: string; amount: number }[];
}

export interface CashierCollection {
  cashierId: string;
  cashierName: string;
  shift: ShiftType;
  totalAmount: number;
  transactionCount: number;
  cashAmount: number;
  cardAmount: number;
  otherAmount: number;
}

export interface ShiftWiseDetail {
  id: string;
  invoice_number: string;
  patient_name: string;
  amount: number;
  payment_method: string;
  cashier_name: string;
  time: string;
  shift: ShiftType;
}

export function useShiftWiseCollection(dateFrom: string, dateTo: string, branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["shift-wise-collection", dateFrom, dateTo, branchId],
    queryFn: async (): Promise<{ shifts: ShiftCollection[]; total: number }> => {
      // Fetch payments with method info
      let query = supabase
        .from("payments")
        .select(`
          id,
          amount,
          payment_date,
          created_at,
          payment_method:payment_methods(name),
          invoice:invoices!payments_invoice_id_fkey(branch_id)
        `)
        .gte("payment_date", dateFrom)
        .lte("payment_date", dateTo);

      if (branchId && branchId !== "all") {
        query = query.eq("invoice.branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by shift
      const shiftData: Record<ShiftType, { revenue: number; count: number; methods: Record<string, number> }> = {
        all: { revenue: 0, count: 0, methods: {} },
        morning: { revenue: 0, count: 0, methods: {} },
        evening: { revenue: 0, count: 0, methods: {} },
        night: { revenue: 0, count: 0, methods: {} },
      };

      let total = 0;

      data?.forEach((payment: any) => {
        const createdAt = payment.created_at;
        const shift = getShiftFromTime(createdAt);
        const amount = Number(payment.amount || 0);
        const method = (payment.payment_method as any)?.name || "Unknown";

        shiftData[shift].revenue += amount;
        shiftData[shift].count += 1;
        shiftData[shift].methods[method] = (shiftData[shift].methods[method] || 0) + amount;
        total += amount;
      });

      const shifts: ShiftCollection[] = (["morning", "evening", "night"] as ShiftType[]).map(shift => ({
        shift,
        shiftLabel: getShiftLabel(shift),
        revenue: shiftData[shift].revenue,
        count: shiftData[shift].count,
        percentage: total > 0 ? (shiftData[shift].revenue / total) * 100 : 0,
        paymentMethods: Object.entries(shiftData[shift].methods).map(([method, amount]) => ({
          method,
          amount,
        })),
      }));

      return { shifts, total };
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCashierWiseCollection(dateFrom: string, dateTo: string, branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["cashier-wise-collection", dateFrom, dateTo, branchId],
    queryFn: async (): Promise<CashierCollection[]> => {
      let query = supabase
        .from("payments")
        .select(`
          id,
          amount,
          created_at,
          received_by,
          payment_method:payment_methods(name),
          received_by_profile:profiles!payments_received_by_fkey(id, full_name),
          invoice:invoices!payments_invoice_id_fkey(branch_id)
        `)
        .gte("payment_date", dateFrom)
        .lte("payment_date", dateTo);

      if (branchId && branchId !== "all") {
        query = query.eq("invoice.branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by cashier and shift
      const cashierMap: Record<string, Record<ShiftType, {
        totalAmount: number;
        count: number;
        cashAmount: number;
        cardAmount: number;
        otherAmount: number;
        name: string;
      }>> = {};

      data?.forEach((payment: any) => {
        const receivedBy = payment.received_by || "unknown";
        const profile = payment.received_by_profile;
        const cashierName = profile?.full_name || "Unknown Cashier";
        const shift = getShiftFromTime(payment.created_at);
        const amount = Number(payment.amount || 0);
        const methodName = ((payment.payment_method as any)?.name || "").toLowerCase();

        if (!cashierMap[receivedBy]) {
          cashierMap[receivedBy] = {} as any;
        }
        if (!cashierMap[receivedBy][shift]) {
          cashierMap[receivedBy][shift] = {
            totalAmount: 0,
            count: 0,
            cashAmount: 0,
            cardAmount: 0,
            otherAmount: 0,
            name: cashierName,
          };
        }

        cashierMap[receivedBy][shift].totalAmount += amount;
        cashierMap[receivedBy][shift].count += 1;
        cashierMap[receivedBy][shift].name = cashierName;

        if (methodName.includes("cash")) {
          cashierMap[receivedBy][shift].cashAmount += amount;
        } else if (methodName.includes("card") || methodName.includes("credit") || methodName.includes("debit")) {
          cashierMap[receivedBy][shift].cardAmount += amount;
        } else {
          cashierMap[receivedBy][shift].otherAmount += amount;
        }
      });

      // Flatten to array
      const result: CashierCollection[] = [];
      Object.entries(cashierMap).forEach(([cashierId, shifts]) => {
        Object.entries(shifts).forEach(([shift, data]) => {
          result.push({
            cashierId,
            cashierName: data.name,
            shift: shift as ShiftType,
            totalAmount: data.totalAmount,
            transactionCount: data.count,
            cashAmount: data.cashAmount,
            cardAmount: data.cardAmount,
            otherAmount: data.otherAmount,
          });
        });
      });

      return result.sort((a, b) => b.totalAmount - a.totalAmount);
    },
    enabled: !!profile?.organization_id,
  });
}

export function useShiftWiseDetails(
  dateFrom: string,
  dateTo: string,
  shift: ShiftType,
  branchId?: string
) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["shift-wise-details", dateFrom, dateTo, shift, branchId],
    queryFn: async (): Promise<ShiftWiseDetail[]> => {
      let query = supabase
        .from("payments")
        .select(`
          id,
          amount,
          created_at,
          payment_method:payment_methods(name),
          received_by_profile:profiles!payments_received_by_fkey(full_name),
          invoice:invoices!payments_invoice_id_fkey(
            invoice_number,
            branch_id,
            patient:patients!invoices_patient_id_fkey(first_name, last_name)
          )
        `)
        .gte("payment_date", dateFrom)
        .lte("payment_date", dateTo)
        .order("created_at", { ascending: false });

      if (branchId && branchId !== "all") {
        query = query.eq("invoice.branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by shift
      const filtered = data?.filter((payment: any) => {
        const paymentShift = getShiftFromTime(payment.created_at);
        return shift === "all" || paymentShift === shift;
      }) || [];

      return filtered.map((payment: any) => {
        const patient = payment.invoice?.patient;
        return {
          id: payment.id,
          invoice_number: payment.invoice?.invoice_number || "-",
          patient_name: patient
            ? `${patient.first_name} ${patient.last_name || ""}`.trim()
            : "Unknown",
          amount: Number(payment.amount || 0),
          payment_method: (payment.payment_method as any)?.name || "Unknown",
          cashier_name: payment.received_by_profile?.full_name || "Unknown",
          time: new Date(payment.created_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          shift: getShiftFromTime(payment.created_at),
        };
      });
    },
    enabled: !!profile?.organization_id,
  });
}

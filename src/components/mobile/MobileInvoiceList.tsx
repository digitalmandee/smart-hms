import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, FlaskConical, Radio, Stethoscope, MoreVertical, User, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useHaptics } from "@/hooks/useHaptics";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];
type CategoryFilter = "all" | "lab" | "radiology" | "consultation";

interface InvoiceWithPatient {
  id: string;
  invoice_number: string;
  invoice_date: string | null;
  status: InvoiceStatus | null;
  total_amount: number | null;
  paid_amount: number | null;
  patient: {
    first_name: string;
    last_name: string | null;
    patient_number: string;
  };
  hasLab?: boolean;
  hasRadiology?: boolean;
  hasConsultation?: boolean;
  categories?: string[];
}

function useInvoicesWithCategories(branchId?: string, statusFilter?: InvoiceStatus | "all") {
  return useQuery({
    queryKey: ["invoices-with-categories-mobile", branchId, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("invoices")
        .select(`
          *,
          patient:patients!invoices_patient_id_fkey(id, first_name, last_name, patient_number, phone),
          items:invoice_items(
            service_type:service_types(category)
          )
        `)
        .order("created_at", { ascending: false });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      return data?.map(invoice => {
        const categories = new Set<string>();
        invoice.items?.forEach((item: any) => {
          if (item.service_type?.category) {
            categories.add(item.service_type.category);
          }
        });

        const hasRadiology = invoice.items?.some((item: any) => {
          const category = item.service_type?.category;
          return category === 'radiology' || category === 'imaging';
        }) || false;

        return {
          ...invoice,
          categories: Array.from(categories),
          hasLab: categories.has('lab'),
          hasRadiology,
          hasConsultation: categories.has('consultation'),
        };
      }) || [];
    },
  });
}

export function MobileInvoiceList() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const haptics = useHaptics();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const { data: invoices, isLoading, refetch } = useInvoicesWithCategories(
    profile?.branch_id || undefined,
    statusFilter
  );

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    
    if (categoryFilter === "all") return invoices;
    
    return invoices.filter(invoice => {
      switch (categoryFilter) {
        case "lab":
          return invoice.hasLab;
        case "radiology":
          return invoice.hasRadiology || invoice.categories?.includes('procedure');
        case "consultation":
          return invoice.hasConsultation;
        default:
          return true;
      }
    });
  }, [invoices, categoryFilter]);

  const handleRefresh = async () => {
    await refetch();
  };

  const handleInvoiceClick = (invoice: InvoiceWithPatient) => {
    haptics.light();
    navigate(`/app/billing/invoices/${invoice.id}`);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4 py-4 space-y-4 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Invoices</h1>
            <p className="text-sm text-muted-foreground">
              {filteredInvoices.length} invoices
            </p>
          </div>
        </div>

        {/* Category Tabs - Scrollable */}
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <Tabs value={categoryFilter} onValueChange={(v) => {
            haptics.light();
            setCategoryFilter(v as CategoryFilter);
          }}>
            <TabsList className="w-max">
              <TabsTrigger value="all" className="gap-1.5 px-3">
                <FileText className="h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="lab" className="gap-1.5 px-3">
                <FlaskConical className="h-4 w-4" />
                Lab
              </TabsTrigger>
              <TabsTrigger value="radiology" className="gap-1.5 px-3">
                <Radio className="h-4 w-4" />
                Radiology
              </TabsTrigger>
              <TabsTrigger value="consultation" className="gap-1.5 px-3">
                <Stethoscope className="h-4 w-4" />
                Consult
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            haptics.light();
            setStatusFilter(v as InvoiceStatus | "all");
          }}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Invoice List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => {
              const balance = Number(invoice.total_amount || 0) - Number(invoice.paid_amount || 0);
              
              return (
                <Card 
                  key={invoice.id} 
                  className="cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => handleInvoiceClick(invoice)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-semibold text-sm">
                            {invoice.invoice_number}
                          </span>
                          <InvoiceStatusBadge status={invoice.status} />
                        </div>
                        
                        {invoice.patient && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {invoice.patient.first_name} {invoice.patient.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {invoice.patient.patient_number}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {invoice.invoice_date && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(invoice.invoice_date), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg">
                          Rs. {Number(invoice.total_amount || 0).toLocaleString()}
                        </p>
                        {invoice.paid_amount > 0 && (
                          <p className="text-xs text-success">
                            Paid: Rs. {Number(invoice.paid_amount).toLocaleString()}
                          </p>
                        )}
                        {balance > 0 && (
                          <p className="text-xs text-destructive font-medium">
                            Due: Rs. {balance.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <Button 
        className="fab bg-primary text-primary-foreground"
        onClick={() => {
          haptics.medium();
          navigate("/app/billing/invoices/new");
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </PullToRefresh>
  );
}

import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { PageHeader } from "@/components/PageHeader";
import { useTranslation } from "@/lib/i18n";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge";
import { Plus, FileText, FlaskConical, Radio, Stethoscope, Landmark } from "lucide-react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { MobileInvoiceList } from "@/components/mobile/MobileInvoiceList";
import { Badge } from "@/components/ui/badge";
import { DepositDetailDialog } from "@/components/billing/DepositDetailDialog";

type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

interface InvoiceRow {
  id: string;
  invoice_number: string;
  invoice_date: string | null;
  status: InvoiceStatus | null;
  total_amount: number | null;
  paid_amount: number | null;
  isDeposit?: boolean;
  patient: {
    first_name: string;
    last_name: string | null;
    patient_number: string;
  };
}

type CategoryFilter = "all" | "lab" | "radiology" | "consultation";

// Hook to get invoices with their service categories
function useInvoicesWithCategories(branchId?: string, statusFilter?: InvoiceStatus | "all") {
  return useQuery({
    queryKey: ["invoices-with-categories", branchId, statusFilter],
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

      const { data, error } = await query;
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

// Hook to get patient deposits as invoice-like rows
function useDepositRows(branchId?: string) {
  return useQuery({
    queryKey: ["deposit-invoice-rows", branchId],
    queryFn: async () => {
      let query = supabase
        .from("patient_deposits")
        .select(`
          id, amount, type, status, created_at, notes, reference_number,
          patient:patients!patient_deposits_patient_id_fkey(id, first_name, last_name, patient_number)
        `)
        .eq("type", "deposit")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((d: any) => ({
        id: d.id,
        invoice_number: d.reference_number || `DEP-${format(new Date(d.created_at), "yyMMdd")}-${d.id.slice(0, 4).toUpperCase()}`,
        invoice_date: d.created_at,
        status: "paid" as InvoiceStatus,
        total_amount: Number(d.amount),
        paid_amount: Number(d.amount),
        isDeposit: true,
        patient: d.patient || { first_name: "Unknown", last_name: null, patient_number: "-" },
        categories: [],
        hasLab: false,
        hasRadiology: false,
        hasConsultation: false,
      }));
    },
  });
}

export default function InvoicesListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
    (searchParams.get("status") as InvoiceStatus) || "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null);

  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;
  const { formatCurrency } = useCurrencyFormatter();

  const { data: invoicesWithCategories, isLoading } = useInvoicesWithCategories(
    profile?.branch_id || undefined,
    statusFilter
  );

  const { data: depositRows, isLoading: depositsLoading } = useDepositRows(
    profile?.branch_id || undefined
  );

  const filteredInvoices = useMemo(() => {
    const invoices = invoicesWithCategories || [];
    const deposits = (statusFilter === "all" || statusFilter === "paid") ? (depositRows || []) : [];
    const combined = [...invoices, ...deposits];

    if (categoryFilter === "all") return combined;
    return combined.filter((invoice: any) => {
      if (invoice.isDeposit) return false; // Deposits don't belong to lab/radiology/consultation
      switch (categoryFilter) {
        case "lab": return invoice.hasLab;
        case "radiology": return invoice.hasRadiology || invoice.categories?.includes('procedure');
        case "consultation": return invoice.hasConsultation;
        default: return true;
      }
    });
  }, [invoicesWithCategories, depositRows, categoryFilter, statusFilter]);

  const columns: ColumnDef<InvoiceRow>[] = [
    {
      accessorKey: "invoice_number",
      header: t("invoices.invoiceNo"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono">{row.original.invoice_number}</span>
          {row.original.isDeposit && (
            <Badge variant="outline" className="text-xs gap-1 bg-primary/10 text-primary border-primary/20">
              <Landmark className="h-3 w-3" />
              {t("invoices.depositInvoice")}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "invoice_date",
      header: t("invoices.date"),
      cell: ({ row }) => row.original.invoice_date ? format(new Date(row.original.invoice_date), "MMM dd, yyyy") : "-",
    },
    {
      accessorKey: "patient",
      header: t("invoices.patient"),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.patient?.first_name} {row.original.patient?.last_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.patient?.patient_number}</p>
        </div>
      ),
    },
    {
      accessorKey: "total_amount",
      header: t("invoices.amount"),
      cell: ({ row }) => <span className="font-medium">{formatCurrency(Number(row.original.total_amount || 0))}</span>,
    },
    {
      accessorKey: "paid_amount",
      header: t("invoices.paid"),
      cell: ({ row }) => <span className="text-success">{formatCurrency(Number(row.original.paid_amount || 0))}</span>,
    },
    {
      accessorKey: "balance",
      header: t("invoices.balance"),
      cell: ({ row }) => {
        const balance = Number(row.original.total_amount || 0) - Number(row.original.paid_amount || 0);
        return <span className={balance > 0 ? "text-destructive font-medium" : ""}>{formatCurrency(balance)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: t("invoices.status"),
      cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
    },
  ];

  if (showMobileUI) {
    return <MobileInvoiceList />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("invoices.title")}
        description={t("invoices.subtitle")}
        actions={
          <Button onClick={() => navigate("/app/billing/invoices/new")}>
            <Plus className="mr-2 h-4 w-4" />
            {t("invoices.newInvoice")}
          </Button>
        }
      />

      <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <FileText className="h-4 w-4" />
            {t("invoices.allInvoices")}
          </TabsTrigger>
          <TabsTrigger value="lab" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            {t("nav.lab")}
          </TabsTrigger>
          <TabsTrigger value="radiology" className="gap-2">
            <Radio className="h-4 w-4" />
            {t("nav.radiology")}
          </TabsTrigger>
          <TabsTrigger value="consultation" className="gap-2">
            <Stethoscope className="h-4 w-4" />
            {t("invoices.consultation")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as InvoiceStatus | "all")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("invoices.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("invoices.allStatus")}</SelectItem>
            <SelectItem value="draft">{t("invoices.draft")}</SelectItem>
            <SelectItem value="pending">{t("invoices.pending")}</SelectItem>
            <SelectItem value="partially_paid">{t("invoices.partiallyPaid")}</SelectItem>
            <SelectItem value="paid">{t("invoices.paid")}</SelectItem>
            <SelectItem value="cancelled">{t("invoices.cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={(filteredInvoices as InvoiceRow[]) || []}
        searchKey="invoice_number"
        searchPlaceholder={t("invoices.searchPlaceholder")}
        isLoading={isLoading || depositsLoading}
        onRowClick={(row) => {
          if (row.isDeposit) return; // Deposits don't have a detail page
          navigate(`/app/billing/invoices/${row.id}`);
        }}
      />
    </div>
  );
}

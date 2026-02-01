import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { PageHeader } from "@/components/PageHeader";
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
import { useInvoices } from "@/hooks/useBilling";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge";
import { Plus, FileText, FlaskConical, Radio, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileInvoiceList } from "@/components/mobile/MobileInvoiceList";

type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

interface InvoiceRow {
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
}

type CategoryFilter = "all" | "lab" | "radiology" | "consultation";

const columns: ColumnDef<InvoiceRow>[] = [
  {
    accessorKey: "invoice_number",
    header: "Invoice #",
    cell: ({ row }) => (
      <span className="font-mono">{row.original.invoice_number}</span>
    ),
  },
  {
    accessorKey: "invoice_date",
    header: "Date",
    cell: ({ row }) =>
      row.original.invoice_date
        ? format(new Date(row.original.invoice_date), "MMM dd, yyyy")
        : "-",
  },
  {
    accessorKey: "patient",
    header: "Patient",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">
          {row.original.patient?.first_name} {row.original.patient?.last_name}
        </p>
        <p className="text-xs text-muted-foreground">
          {row.original.patient?.patient_number}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "total_amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium">
        Rs. {Number(row.original.total_amount || 0).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "paid_amount",
    header: "Paid",
    cell: ({ row }) => (
      <span className="text-success">
        Rs. {Number(row.original.paid_amount || 0).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const balance =
        Number(row.original.total_amount || 0) -
        Number(row.original.paid_amount || 0);
      return (
        <span className={balance > 0 ? "text-destructive font-medium" : ""}>
          Rs. {balance.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
  },
];

// Hook to get invoices with their service categories
function useInvoicesWithCategories(branchId?: string, statusFilter?: InvoiceStatus | "all") {
  return useQuery({
    queryKey: ["invoices-with-categories", branchId, statusFilter],
    queryFn: async () => {
      // Get invoices with their items and service types
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

      // Process invoices to add category info
      return data?.map(invoice => {
        const categories = new Set<string>();
        invoice.items?.forEach((item: any) => {
          if (item.service_type?.category) {
            categories.add(item.service_type.category);
          }
        });

        // Check for radiology by looking at procedure items with imaging keywords
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

export default function InvoicesListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
    (searchParams.get("status") as InvoiceStatus) || "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  // Mobile detection
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;

  const { data: invoicesWithCategories, isLoading } = useInvoicesWithCategories(
    profile?.branch_id || undefined,
    statusFilter
  );

  // Filter invoices by category
  const filteredInvoices = useMemo(() => {
    if (!invoicesWithCategories) return [];
    
    if (categoryFilter === "all") return invoicesWithCategories;
    
    return invoicesWithCategories.filter(invoice => {
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
  }, [invoicesWithCategories, categoryFilter]);

  // Render mobile UI
  if (showMobileUI) {
    return <MobileInvoiceList />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage all patient invoices"
        actions={
          <Button onClick={() => navigate("/app/billing/invoices/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        }
      />

      {/* Category Tabs */}
      <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <FileText className="h-4 w-4" />
            All Invoices
          </TabsTrigger>
          <TabsTrigger value="lab" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            Lab
          </TabsTrigger>
          <TabsTrigger value="radiology" className="gap-2">
            <Radio className="h-4 w-4" />
            Radiology
          </TabsTrigger>
          <TabsTrigger value="consultation" className="gap-2">
            <Stethoscope className="h-4 w-4" />
            Consultation
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as InvoiceStatus | "all")}
        >
          <SelectTrigger className="w-48">
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
      </div>

      <DataTable
        columns={columns}
        data={(filteredInvoices as InvoiceRow[]) || []}
        searchKey="invoice_number"
        searchPlaceholder="Search invoices..."
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/app/billing/invoices/${row.id}`)}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLabOrders } from "@/hooks/useLabOrders";
import { supabase } from "@/integrations/supabase/client";
import { useLabSettings } from "@/hooks/useClinicConfig";
import { PageHeader } from "@/components/PageHeader";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CreditCard, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileLabQueue } from "@/components/mobile/MobileLabQueue";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";
import { formatDistanceToNow } from "date-fns";

type StatusFilter = "all" | "ordered" | "collected" | "processing" | "completed";
type PaymentFilter = "all" | "paid" | "pending";

const priorityColors: Record<string, "destructive" | "secondary" | "outline"> = {
  stat: "destructive", urgent: "secondary", routine: "outline",
};
const paymentColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  paid: "default", pending: "secondary", unpaid: "outline",
};
const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  ordered: "outline", collected: "secondary", processing: "secondary",
  completed: "default", cancelled: "destructive",
};

export default function LabQueuePage() {
  const navigate = useNavigate();
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");

  const { data: labSettings } = useLabSettings();
  const { data: labOrders, isLoading, refetch } = useLabOrders(
    statusFilter !== "all" && statusFilter !== "completed" ? { status: statusFilter } : {}
  );

  const filteredOrders = (labOrders || [])
    .filter((order) => {
      if (statusFilter === "completed") {
        if (order.status !== "completed") return false;
      } else {
        if (order.status === "completed" || order.status === "cancelled") return false;
      }
      if (paymentFilter === "paid" && order.payment_status !== "paid") return false;
      if (paymentFilter === "pending" && order.payment_status === "paid") return false;
      if (priorityFilter !== "all" && order.priority !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const po = { stat: 0, urgent: 1, routine: 2 };
      const ap = po[a.priority as keyof typeof po] ?? 2;
      const bp = po[b.priority as keyof typeof po] ?? 2;
      if (ap !== bp) return ap - bp;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  useEffect(() => {
    const labChannel = supabase
      .channel('lab_orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lab_orders' }, () => refetch())
      .subscribe();
    const invoiceChannel = supabase
      .channel('invoices_realtime_for_lab')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'invoices' }, (payload) => {
        if (payload.new && (payload.new as any).status === 'paid') refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(labChannel);
      supabase.removeChannel(invoiceChannel);
    };
  }, [refetch]);

  const statCount = labOrders?.filter((o) => o.priority === "stat" && o.status !== "completed" && o.status !== "cancelled").length || 0;
  const urgentCount = labOrders?.filter((o) => o.priority === "urgent" && o.status !== "completed" && o.status !== "cancelled").length || 0;
  const pendingPaymentCount = labOrders?.filter((o) => o.payment_status !== "paid" && o.status !== "completed" && o.status !== "cancelled").length || 0;
  const paidReadyCount = labOrders?.filter((o) => o.payment_status === "paid" && o.status === "ordered").length || 0;

  if (showMobileUI) return <MobileLabQueue />;

  const columns: Column<any>[] = [
    { key: "order_number", header: "Order #", sortable: true },
    { key: "patient_name", header: "Patient", sortable: true, cell: (r) => `${r.patient?.first_name || ""} ${r.patient?.last_name || ""}`.trim() },
    { key: "patient_mrn", header: "MRN", cell: (r) => r.patient?.patient_number || "–" },
    { key: "tests", header: "Tests", cell: (r) => {
      const items = r.lab_order_items || [];
      const count = items.length;
      const first = items[0]?.lab_tests?.name || items[0]?.test_name;
      return count > 1 ? `${first} +${count - 1}` : first || "–";
    }},
    { key: "priority", header: "Priority", sortable: true, cell: (r) => <Badge variant={priorityColors[r.priority] || "outline"}>{r.priority?.toUpperCase()}</Badge> },
    { key: "payment_status", header: "Payment", sortable: true, cell: (r) => <Badge variant={paymentColors[r.payment_status] || "outline"}>{r.payment_status || "pending"}</Badge> },
    { key: "status", header: "Status", sortable: true, cell: (r) => <Badge variant={statusColors[r.status] || "outline"}>{r.status}</Badge> },
    { key: "created_at", header: "Time", sortable: true, cell: (r) => r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : "–" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader title="Lab Orders Queue" description="View and process pending laboratory orders" />
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {statCount > 0 && <div className="bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg text-sm font-medium">{statCount} STAT pending</div>}
        {urgentCount > 0 && <div className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg text-sm font-medium">{urgentCount} Urgent pending</div>}
        {paidReadyCount > 0 && <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" />{paidReadyCount} Ready</div>}
        {pendingPaymentCount > 0 && <div className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{pendingPaymentCount} Awaiting payment</div>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ordered">Ordered</TabsTrigger>
            <TabsTrigger value="collected">Collected</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentFilter)}>
          <TabsList>
            <TabsTrigger value="all">All Pay</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="pending">Unpaid</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="stat">STAT</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="routine">Routine</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ReportTable
        data={filteredOrders}
        columns={columns}
        isLoading={isLoading}
        pageSize={20}
        searchPlaceholder="Search by patient, order number..."
        emptyMessage="No pending lab orders"
        onRowClick={(r) => navigate(`/app/lab/orders/${r.id}`)}
      />
    </div>
  );
}

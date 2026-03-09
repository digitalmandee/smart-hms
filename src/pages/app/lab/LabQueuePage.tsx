import { useState, useEffect } from "react";
import { useLabOrders } from "@/hooks/useLabOrders";
import { supabase } from "@/integrations/supabase/client";
import { useLabSettings } from "@/hooks/useClinicConfig";
import { PageHeader } from "@/components/PageHeader";
import { LabOrderCard } from "@/components/lab/LabOrderCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, TestTube, CreditCard, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileLabQueue } from "@/components/mobile/MobileLabQueue";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";

type StatusFilter = "all" | "ordered" | "collected" | "processing";
type PaymentFilter = "all" | "paid" | "pending";

export default function LabQueuePage() {
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: labSettings } = useLabSettings();

  // Fetch lab orders based on status filter
  const { data: labOrders, isLoading, refetch } = useLabOrders(
    statusFilter !== "all" ? { status: statusFilter } : {}
  );

  // Filter out completed/cancelled and apply search
  const filteredOrders = labOrders
    ?.filter((order) => {
      // Exclude completed/cancelled from queue
      if (order.status === "completed" || order.status === "cancelled") return false;

      // Payment filter
      if (paymentFilter === "paid" && order.payment_status !== "paid") return false;
      if (paymentFilter === "pending" && order.payment_status === "paid") return false;

      // Priority filter
      if (priorityFilter !== "all" && order.priority !== priorityFilter) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const patientName = `${order.patient?.first_name} ${order.patient?.last_name}`.toLowerCase();
        const patientNumber = order.patient?.patient_number?.toLowerCase() || "";
        const orderNumber = order.order_number.toLowerCase();

        return (
          patientName.includes(query) ||
          patientNumber.includes(query) ||
          orderNumber.includes(query)
        );
      }

      return true;
    })
    // Sort by priority (stat first) then by date
    .sort((a, b) => {
      const priorityOrder = { stat: 0, urgent: 1, routine: 2 };
      const aPriority = priorityOrder[a.priority] ?? 2;
      const bPriority = priorityOrder[b.priority] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Real-time subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('lab_orders_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'lab_orders' 
      }, () => {
        refetch();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [refetch]);

  const statCount = labOrders?.filter((o) => o.priority === "stat" && o.status !== "completed" && o.status !== "cancelled").length || 0;
  const urgentCount = labOrders?.filter((o) => o.priority === "urgent" && o.status !== "completed" && o.status !== "cancelled").length || 0;
  const pendingPaymentCount = labOrders?.filter((o) => o.payment_status !== "paid" && o.status !== "completed" && o.status !== "cancelled").length || 0;
  const paidReadyCount = labOrders?.filter((o) => o.payment_status === "paid" && o.status === "ordered").length || 0;

  const canCollectPayment = labSettings?.allow_direct_lab_payment;
  // Show mobile UI on mobile devices
  if (showMobileUI) {
    return <MobileLabQueue />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab Orders Queue"
        description="View and process pending laboratory orders"
      />

      {/* Stats Summary */}
      <div className="flex flex-wrap gap-4">
        {statCount > 0 && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="font-bold">{statCount}</span>
            <span>STAT orders pending</span>
          </div>
        )}
        {urgentCount > 0 && (
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="font-bold">{urgentCount}</span>
            <span>Urgent orders pending</span>
          </div>
        )}
        {paidReadyCount > 0 && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="font-bold">{paidReadyCount}</span>
            <span>Ready for collection</span>
          </div>
        )}
        {pendingPaymentCount > 0 && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-bold">{pendingPaymentCount}</span>
            <span>Awaiting payment</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient, order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="stat">STAT</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="routine">Routine</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <TabsList>
              <TabsTrigger value="all">All Status</TabsTrigger>
              <TabsTrigger value="ordered">Ordered</TabsTrigger>
              <TabsTrigger value="collected">Collected</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentFilter)}>
            <TabsList>
              <TabsTrigger value="all">All Payments</TabsTrigger>
              <TabsTrigger value="paid" className="text-green-700">Paid - Ready</TabsTrigger>
              <TabsTrigger value="pending" className="text-yellow-700">Awaiting Payment</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredOrders?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No pending lab orders</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search criteria" : "All lab orders have been processed"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders?.map((order) => (
            <LabOrderCard 
              key={order.id} 
              order={order} 
              canCollectPayment={canCollectPayment}
              onPaymentComplete={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

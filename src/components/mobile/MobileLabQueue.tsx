import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  TestTube, 
  Search, 
  Clock, 
  CreditCard, 
  User,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";
import { useLabOrders } from "@/hooks/useLabOrders";
import { supabase } from "@/integrations/supabase/client";
import { useLabSettings } from "@/hooks/useClinicConfig";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useHaptics } from "@/hooks/useHaptics";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type StatusFilter = "all" | "ordered" | "collected" | "processing";
type PaymentFilter = "all" | "paid" | "pending";

export function MobileLabQueue() {
  const navigate = useNavigate();
  const haptics = useHaptics();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: labSettings } = useLabSettings();
  const { data: labOrders, isLoading, refetch } = useLabOrders(
    statusFilter !== "all" ? { status: statusFilter } : {}
  );

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('lab_orders_realtime_mobile')
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

  // Filter orders
  const filteredOrders = labOrders
    ?.filter((order) => {
      if (order.status === "completed" || order.status === "cancelled") return false;
      if (paymentFilter === "paid" && order.payment_status !== "paid") return false;
      if (paymentFilter === "pending" && order.payment_status === "paid") return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const patientName = `${order.patient?.first_name} ${order.patient?.last_name}`.toLowerCase();
        const patientNumber = order.patient?.patient_number?.toLowerCase() || "";
        const orderNumber = order.order_number.toLowerCase();
        return patientName.includes(query) || patientNumber.includes(query) || orderNumber.includes(query);
      }
      return true;
    })
    .sort((a, b) => {
      const priorityOrder = { stat: 0, urgent: 1, routine: 2 };
      const aPriority = priorityOrder[a.priority] ?? 2;
      const bPriority = priorityOrder[b.priority] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleRefresh = async () => {
    haptics.light();
    await refetch();
    toast.success("Refreshed");
  };

  // Stats
  const statCount = labOrders?.filter((o) => o.priority === "stat" && o.status !== "completed" && o.status !== "cancelled").length || 0;
  const urgentCount = labOrders?.filter((o) => o.priority === "urgent" && o.status !== "completed" && o.status !== "cancelled").length || 0;
  const pendingPaymentCount = labOrders?.filter((o) => o.payment_status !== "paid" && o.status !== "completed" && o.status !== "cancelled").length || 0;
  const paidReadyCount = labOrders?.filter((o) => o.payment_status === "paid" && o.status === "ordered").length || 0;

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "ordered", label: "Ordered" },
    { value: "collected", label: "Collected" },
    { value: "processing", label: "Processing" },
  ];

  const paymentOptions: { value: PaymentFilter; label: string; color?: string }[] = [
    { value: "all", label: "All" },
    { value: "paid", label: "Ready", color: "text-success" },
    { value: "pending", label: "Pending", color: "text-warning" },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'stat':
        return <Badge variant="destructive" className="text-xs">STAT</Badge>;
      case 'urgent':
        return <Badge className="bg-warning text-warning-foreground text-xs">Urgent</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ordered':
        return <Badge variant="outline" className="text-xs">Ordered</Badge>;
      case 'collected':
        return <Badge className="bg-info text-info-foreground text-xs">Collected</Badge>;
      case 'processing':
        return <Badge className="bg-primary text-primary-foreground text-xs">Processing</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Lab Queue</h1>
            <p className="text-sm text-muted-foreground">Pending laboratory orders</p>
          </div>
          <Button size="icon" variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats Summary */}
        {(statCount > 0 || urgentCount > 0 || paidReadyCount > 0 || pendingPaymentCount > 0) && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {statCount > 0 && (
              <Badge variant="destructive" className="shrink-0 py-1.5 px-3">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {statCount} STAT
              </Badge>
            )}
            {urgentCount > 0 && (
              <Badge className="shrink-0 py-1.5 px-3 bg-warning text-warning-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {urgentCount} Urgent
              </Badge>
            )}
            {paidReadyCount > 0 && (
              <Badge className="shrink-0 py-1.5 px-3 bg-success text-success-foreground">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {paidReadyCount} Ready
              </Badge>
            )}
            {pendingPaymentCount > 0 && (
              <Badge variant="outline" className="shrink-0 py-1.5 px-3">
                <CreditCard className="h-3 w-3 mr-1" />
                {pendingPaymentCount} Unpaid
              </Badge>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patient, order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Horizontal Filter Chips - Status */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={() => { haptics.light(); setStatusFilter(option.value); }}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Horizontal Filter Chips - Payment */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {paymentOptions.map((option) => (
            <Button
              key={option.value}
              variant={paymentFilter === option.value ? "default" : "outline"}
              size="sm"
              className={cn("shrink-0", option.color)}
              onClick={() => { haptics.light(); setPaymentFilter(option.value); }}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <FlaskConical className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        ) : filteredOrders?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TestTube className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium">No pending lab orders</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Try adjusting your search" : "All orders have been processed"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders?.map((order) => (
              <Card 
                key={order.id}
                className={cn(
                  "cursor-pointer transition-all active:scale-[0.99]",
                  order.priority === 'stat' && "border-destructive/50",
                  order.priority === 'urgent' && "border-warning/50"
                )}
                onClick={() => { haptics.light(); navigate(`/app/lab/orders/${order.id}`); }}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPriorityBadge(order.priority)}
                      {getStatusBadge(order.status)}
                      {order.payment_status === 'paid' ? (
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                          <CreditCard className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                          <Clock className="h-3 w-3 mr-1" />
                          Unpaid
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {order.patient?.first_name} {order.patient?.last_name}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-1">
                    Order: {order.order_number}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), "MMM d, h:mm a")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
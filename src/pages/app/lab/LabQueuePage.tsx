import { useState } from "react";
import { useLabOrders } from "@/hooks/useLabOrders";
import { PageHeader } from "@/components/PageHeader";
import { LabOrderCard } from "@/components/lab/LabOrderCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, TestTube } from "lucide-react";

type StatusFilter = "all" | "ordered" | "collected" | "processing";

export default function LabQueuePage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch lab orders based on status filter
  const { data: labOrders, isLoading } = useLabOrders(
    statusFilter !== "all" ? { status: statusFilter } : {}
  );

  // Filter out completed/cancelled and apply search
  const filteredOrders = labOrders
    ?.filter((order) => {
      // Exclude completed/cancelled from queue
      if (order.status === "completed" || order.status === "cancelled") return false;

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

  const statCount = labOrders?.filter((o) => o.priority === "stat" && o.status !== "completed" && o.status !== "cancelled").length || 0;
  const urgentCount = labOrders?.filter((o) => o.priority === "urgent" && o.status !== "completed" && o.status !== "cancelled").length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab Orders Queue"
        description="View and process pending laboratory orders"
      />

      {/* Stats Summary */}
      {(statCount > 0 || urgentCount > 0) && (
        <div className="flex gap-4">
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
        </div>
      )}

      {/* Filters */}
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

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ordered">Ordered</TabsTrigger>
            <TabsTrigger value="collected">Collected</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
          </TabsList>
        </Tabs>

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
            <LabOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import {
  TestTubes,
  Pill,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  ChevronRight,
} from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

const labStatusConfig: Record<string, { label: string; color: string }> = {
  ordered: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  collected: { label: "Collected", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  processing: { label: "Processing", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const rxStatusConfig: Record<string, { label: string; color: string }> = {
  created: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  partially_dispensed: { label: "Partial", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  dispensed: { label: "Dispensed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

interface LabOrder {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  created_at: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    patient_number: string;
  };
  doctor: {
    profile: { full_name: string };
  };
  lab_order_items: { test_name: string }[];
}

interface Prescription {
  id: string;
  prescription_number: string;
  status: string;
  created_at: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    patient_number: string;
  };
  doctor: {
    profile: { full_name: string };
  };
  prescription_items: { medicine_name: string }[];
}

interface MobileOrdersListProps {
  labOrders: LabOrder[];
  prescriptions: Prescription[];
  isLoadingLab: boolean;
  isLoadingRx: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onRefresh: () => Promise<void>;
}

export function MobileOrdersList({
  labOrders,
  prescriptions,
  isLoadingLab,
  isLoadingRx,
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
}: MobileOrdersListProps) {
  const [activeTab, setActiveTab] = useState("lab");

  const triggerHaptic = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const pendingLabCount = labOrders.filter((o) => o.status === "ordered").length;
  const pendingRxCount = prescriptions.filter((p) => p.status === "created").length;

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">OPD Orders</h1>
            <p className="text-sm text-muted-foreground">
              Lab orders & prescriptions
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-2 text-center">
              <TestTubes className="h-4 w-4 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{labOrders.length}</p>
              <p className="text-[10px] text-muted-foreground">Lab</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="p-2 text-center">
              <Clock className="h-4 w-4 mx-auto text-amber-600 mb-1" />
              <p className="text-lg font-bold">{pendingLabCount}</p>
              <p className="text-[10px] text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 text-center">
              <Pill className="h-4 w-4 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{prescriptions.length}</p>
              <p className="text-[10px] text-muted-foreground">Rx</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="p-2 text-center">
              <AlertCircle className="h-4 w-4 mx-auto text-amber-600 mb-1" />
              <p className="text-lg font-bold">{pendingRxCount}</p>
              <p className="text-[10px] text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patient or order #..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-12"
            />
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="h-10 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Today</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="h-10 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 h-12">
            <TabsTrigger value="lab" className="h-10 gap-2">
              <TestTubes className="h-4 w-4" />
              Lab ({labOrders.length})
            </TabsTrigger>
            <TabsTrigger value="rx" className="h-10 gap-2">
              <Pill className="h-4 w-4" />
              Rx ({prescriptions.length})
            </TabsTrigger>
          </TabsList>

          {/* Lab Orders Tab */}
          <TabsContent value="lab" className="mt-4 space-y-3">
            {isLoadingLab ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))
            ) : labOrders.length === 0 ? (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center text-center">
                  <TestTubes className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="font-medium">No lab orders</p>
                  <p className="text-sm text-muted-foreground">
                    No orders match your filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              labOrders.map((order) => {
                const status = labStatusConfig[order.status] || labStatusConfig.ordered;
                return (
                  <Link
                    key={order.id}
                    to="/app/lab/queue"
                    onClick={triggerHaptic}
                  >
                    <Card className="overflow-hidden active:scale-[0.98] transition-transform">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Order Number & Status */}
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                                {order.order_number}
                              </code>
                              <Badge className={status.color}>
                                {status.label}
                              </Badge>
                              {order.priority === "stat" && (
                                <Badge variant="destructive">STAT</Badge>
                              )}
                            </div>

                            {/* Patient */}
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium truncate">
                                {order.patient?.first_name} {order.patient?.last_name}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              MR# {order.patient?.patient_number}
                            </p>

                            {/* Tests & Doctor */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{order.lab_order_items?.length || 0} test(s)</span>
                              <span>Dr. {order.doctor?.profile?.full_name}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at), "MMM d")}
                            </span>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="rx" className="mt-4 space-y-3">
            {isLoadingRx ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))
            ) : prescriptions.length === 0 ? (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center text-center">
                  <Pill className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="font-medium">No prescriptions</p>
                  <p className="text-sm text-muted-foreground">
                    No prescriptions match your filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              prescriptions.map((rx) => {
                const status = rxStatusConfig[rx.status] || rxStatusConfig.created;
                return (
                  <Link
                    key={rx.id}
                    to="/app/pharmacy/queue"
                    onClick={triggerHaptic}
                  >
                    <Card className="overflow-hidden active:scale-[0.98] transition-transform">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Rx Number & Status */}
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                                {rx.prescription_number}
                              </code>
                              <Badge className={status.color}>
                                {status.label}
                              </Badge>
                            </div>

                            {/* Patient */}
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium truncate">
                                {rx.patient?.first_name} {rx.patient?.last_name}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              MR# {rx.patient?.patient_number}
                            </p>

                            {/* Medicines & Doctor */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{rx.prescription_items?.length || 0} medicine(s)</span>
                              <span>Dr. {rx.doctor?.profile?.full_name}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(rx.created_at), "MMM d")}
                            </span>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PullToRefresh>
  );
}

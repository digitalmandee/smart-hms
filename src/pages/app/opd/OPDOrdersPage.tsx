import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TestTubes,
  Pill,
  Search,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const labStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  ordered: { label: "Pending", variant: "outline" },
  collected: { label: "Collected", variant: "secondary" },
  processing: { label: "Processing", variant: "secondary" },
  completed: { label: "Completed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const rxStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  created: { label: "Pending", variant: "outline" },
  partially_dispensed: { label: "Partial", variant: "secondary" },
  dispensed: { label: "Dispensed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export default function OPDOrdersPage() {
  const { profile } = useAuth();
  const [dateRange, setDateRange] = useState("7");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const dateFrom = startOfDay(subDays(new Date(), parseInt(dateRange)));
  const dateTo = endOfDay(new Date());

  // Fetch lab orders from OPD consultations
  const { data: labOrders, isLoading: loadingLab } = useQuery({
    queryKey: ["opd-lab-orders", profile?.branch_id, dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_orders")
        .select(`
          id,
          order_number,
          status,
          priority,
          created_at,
          patient:patients(id, first_name, last_name, patient_number),
          doctor:doctors(profile:profiles(full_name)),
          consultation:consultations(id, appointment_id),
          lab_order_items(test_name)
        `)
        .eq("branch_id", profile?.branch_id)
        .not("consultation_id", "is", null)
        .gte("created_at", dateFrom.toISOString())
        .lte("created_at", dateTo.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.branch_id,
  });

  // Fetch prescriptions from OPD consultations
  const { data: prescriptions, isLoading: loadingRx } = useQuery({
    queryKey: ["opd-prescriptions", profile?.branch_id, dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          id,
          prescription_number,
          status,
          created_at,
          patient:patients(id, first_name, last_name, patient_number),
          doctor:doctors(profile:profiles(full_name)),
          consultation:consultations(id, appointment_id),
          prescription_items(medicine_name)
        `)
        .eq("branch_id", profile?.branch_id)
        .not("consultation_id", "is", null)
        .gte("created_at", dateFrom.toISOString())
        .lte("created_at", dateTo.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.branch_id,
  });

  // Filter function
  const filterOrders = (orders: any[] | undefined, type: "lab" | "rx") => {
    if (!orders) return [];
    return orders.filter((order) => {
      const patient = order.patient as any;
      const matchesSearch =
        !searchTerm ||
        patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient?.patient_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (type === "lab" ? order.order_number : order.prescription_number)?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const filteredLabOrders = filterOrders(labOrders, "lab");
  const filteredPrescriptions = filterOrders(prescriptions, "rx");

  const pendingLabCount = labOrders?.filter((o) => o.status === "ordered").length || 0;
  const pendingRxCount = prescriptions?.filter((p) => p.status === "created").length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="OPD Orders"
        description="Lab orders and prescriptions from OPD consultations"
        breadcrumbs={[
          { label: "OPD", href: "/app/opd" },
          { label: "Orders" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TestTubes className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{labOrders?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Lab Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingLabCount}</p>
              <p className="text-xs text-muted-foreground">Pending Lab</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{prescriptions?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Prescriptions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingRxCount}</p>
              <p className="text-xs text-muted-foreground">Pending Rx</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient or order number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-[150px]">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Today</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[150px]">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Tabs defaultValue="lab" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lab" className="gap-2">
            <TestTubes className="h-4 w-4" />
            Lab Orders ({filteredLabOrders.length})
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="gap-2">
            <Pill className="h-4 w-4" />
            Prescriptions ({filteredPrescriptions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lab">
          <Card>
            <CardContent className="p-0">
              {loadingLab ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredLabOrders.length === 0 ? (
                <div className="text-center py-12">
                  <TestTubes className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No lab orders found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Tests</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLabOrders.map((order) => {
                      const patient = order.patient as any;
                      const doctor = order.doctor as any;
                      const items = order.lab_order_items as any[];
                      const status = labStatusConfig[order.status || "pending"];

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.order_number}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {patient?.first_name} {patient?.last_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {patient?.patient_number}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {items?.length || 0} test(s)
                            </span>
                          </TableCell>
                          <TableCell>
                            Dr. {doctor?.profile?.full_name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={order.priority === "stat" ? "destructive" : order.priority === "urgent" ? "secondary" : "outline"}
                            >
                              {order.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.created_at), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/app/lab/queue`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardContent className="p-0">
              {loadingRx ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredPrescriptions.length === 0 ? (
                <div className="text-center py-12">
                  <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No prescriptions found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rx #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medicines</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrescriptions.map((rx) => {
                      const patient = rx.patient as any;
                      const doctor = rx.doctor as any;
                      const items = rx.prescription_items as any[];
                      const status = rxStatusConfig[rx.status || "pending"];

                      return (
                        <TableRow key={rx.id}>
                          <TableCell className="font-mono text-sm">
                            {rx.prescription_number}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {patient?.first_name} {patient?.last_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {patient?.patient_number}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {items?.length || 0} medicine(s)
                            </span>
                          </TableCell>
                          <TableCell>
                            Dr. {doctor?.profile?.full_name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(rx.created_at), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/app/pharmacy/queue`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

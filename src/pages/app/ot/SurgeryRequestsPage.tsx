// Surgery Requests & Scheduled Surgeries Page
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Scissors, 
  Calendar, 
  Clock, 
  User, 
  Activity,
  CheckCircle,
  XCircle,
  Building,
  Bed,
  Eye,
  CreditCard
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { 
  usePendingSurgeryRequests, 
  type SurgeryRequest,
  type SurgeryRequestStatus,
  type SurgeryRequestPriority
} from "@/hooks/useSurgeryRequests";
import { useSurgeries, type Surgery } from "@/hooks/useOT";
import { OTStatusBadge } from "@/components/ot/OTStatusBadge";
import { PriorityBadge } from "@/components/ot/PriorityBadge";

const statusConfig: Record<SurgeryRequestStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  ot_availability_checked: { label: "OT Checked", variant: "outline", icon: CheckCircle },
  admission_required: { label: "Needs Admission", variant: "default", icon: Bed },
  admitted: { label: "Admitted", variant: "default", icon: Building },
  scheduled: { label: "Scheduled", variant: "default", icon: Calendar },
  completed: { label: "Completed", variant: "secondary", icon: CheckCircle },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

const priorityConfig: Record<SurgeryRequestPriority, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  elective: { label: "Elective", variant: "secondary" },
  urgent: { label: "Urgent", variant: "default" },
  emergency: { label: "Emergency", variant: "destructive" },
};

export default function SurgeryRequestsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch pending surgery requests (from surgery_requests table)
  const { data: requests, isLoading: requestsLoading } = usePendingSurgeryRequests(profile?.branch_id || undefined);
  
  // Fetch all scheduled surgeries (from surgeries table) - no date filter to show all
  const { data: surgeries, isLoading: surgeriesLoading } = useSurgeries({
    branchId: profile?.branch_id || undefined,
    status: ['scheduled', 'pre_op', 'in_progress', 'completed'] 
  });

  // Filter requests based on search and filters
  const filteredRequests = (requests || []).filter((request) => {
    const matchesSearch = !searchQuery || 
      request.patient?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.patient?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.patient?.patient_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.procedure_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.request_status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Filter surgeries based on search
  const filteredSurgeries = (surgeries || []).filter((surgery) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const patientName = `${surgery.patient?.first_name} ${surgery.patient?.last_name}`.toLowerCase();
    return (
      patientName.includes(query) ||
      surgery.procedure_name?.toLowerCase().includes(query) ||
      surgery.surgery_number?.toLowerCase().includes(query)
    );
  });

  const handleCheckOT = (requestId: string) => {
    navigate(`/app/ot/schedule?surgeryRequestId=${requestId}`);
  };

  const handleAdmitPatient = (patientId: string, requestId: string) => {
    navigate(`/app/ipd/admissions/new?patientId=${patientId}&surgeryRequestId=${requestId}`);
  };

  const handleScheduleSurgery = (request: SurgeryRequest) => {
    navigate(`/app/ot/surgeries/new?patientId=${request.patient_id}&requestId=${request.id}&procedure=${encodeURIComponent(request.procedure_name)}`);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return format(new Date(dateStr), "MMM d, yyyy");
  };

  // Combined stats
  const stats = {
    totalRequests: requests?.length || 0,
    pendingRequests: requests?.filter(r => r.request_status === "pending").length || 0,
    scheduledSurgeries: surgeries?.filter(s => s.status === "scheduled" || s.status === "pre_op").length || 0,
    inProgress: surgeries?.filter(s => s.status === "in_progress").length || 0,
  };

  const isLoading = requestsLoading || surgeriesLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surgery Requests & Schedule"
        description="View pending surgery recommendations and all scheduled surgeries"
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Operation Theatre", href: "/app/ot" },
          { label: "Surgery Requests" },
        ]}
        actions={
          <Button onClick={() => navigate("/app/ot/surgeries/new")}>
            <Scissors className="h-4 w-4 mr-2" />
            Schedule Surgery
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Scissors className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
                <p className="text-sm text-muted-foreground">Doctor Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <Calendar className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.scheduledSurgeries}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search patient name, number, or procedure..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab === "requests" && (
              <>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="ot_availability_checked">OT Checked</SelectItem>
                    <SelectItem value="admission_required">Needs Admission</SelectItem>
                    <SelectItem value="admitted">Admitted</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            All
            <Badge variant="secondary" className="ml-1">
              {(requests?.length || 0) + (surgeries?.length || 0)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            Scheduled Surgeries
            <Badge variant="secondary" className="ml-1">{surgeries?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            Doctor Requests
            <Badge variant="secondary" className="ml-1">{requests?.length || 0}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* All Tab - Shows both scheduled surgeries and requests */}
        <TabsContent value="all" className="space-y-6">
          {/* Scheduled Surgeries Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Surgeries
              </CardTitle>
              <CardDescription>
                All scheduled surgical procedures from the surgeries table
              </CardDescription>
            </CardHeader>
            <CardContent>
              {surgeriesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredSurgeries.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No scheduled surgeries found</p>
                </div>
              ) : (
                <ScrollArea className="h-[350px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Surgery #</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Procedure</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Surgeon</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSurgeries.map((surgery) => (
                        <TableRow key={surgery.id}>
                          <TableCell>
                            <span className="font-mono text-sm">{surgery.surgery_number}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">
                                  {surgery.patient?.first_name} {surgery.patient?.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {surgery.patient?.patient_number}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium max-w-[200px] truncate">{surgery.procedure_name}</p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{formatDate(surgery.scheduled_date)}</p>
                              <p className="text-xs text-muted-foreground">
                                {surgery.scheduled_start_time ? format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a') : '—'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{surgery.lead_surgeon?.profile?.full_name || '—'}</p>
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={surgery.priority} showIcon={false} />
                          </TableCell>
                          <TableCell>
                            <OTStatusBadge status={surgery.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {surgery.is_billable && !surgery.invoice_id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/app/billing/invoices/new?patientId=${surgery.patient_id}&surgeryId=${surgery.id}`)}
                                  title="Create Invoice"
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/app/ot/surgeries/${surgery.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Doctor Requests Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Doctor Surgery Requests
              </CardTitle>
              <CardDescription>
                Pending surgery recommendations from doctors (OPD referrals)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Scissors className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No pending surgery requests</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Doctors can recommend surgeries from OPD consultations
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[350px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Procedure</TableHead>
                        <TableHead>Recommended By</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => {
                        const statusInfo = statusConfig[request.request_status];
                        const priorityInfo = priorityConfig[request.priority];
                        const StatusIcon = statusInfo.icon;

                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">
                                    {request.patient?.first_name} {request.patient?.last_name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {request.patient?.patient_number}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.procedure_name}</p>
                                {request.diagnosis && (
                                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                    {request.diagnosis}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {request.doctor?.profile?.full_name || "—"}
                              </p>
                              {request.doctor?.specialization && (
                                <p className="text-xs text-muted-foreground">
                                  {request.doctor.specialization}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={priorityInfo.variant}>
                                {priorityInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusInfo.variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(request.recommended_date)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {request.request_status === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCheckOT(request.id)}
                                  >
                                    Check OT
                                  </Button>
                                )}
                                {(request.request_status === "pending" || 
                                  request.request_status === "ot_availability_checked" ||
                                  request.request_status === "admission_required") && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAdmitPatient(request.patient_id, request.id)}
                                  >
                                    Admit
                                  </Button>
                                )}
                                {request.request_status === "admitted" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleScheduleSurgery(request)}
                                  >
                                    Schedule
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Surgeries Tab */}
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Surgeries</CardTitle>
              <CardDescription>
                All scheduled surgical procedures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {surgeriesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredSurgeries.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No Scheduled Surgeries</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchQuery ? "No surgeries match your search" : "No surgeries have been scheduled yet"}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate("/app/ot/surgeries/new")}
                  >
                    Schedule Surgery
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Surgery #</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Procedure</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>OT Room</TableHead>
                        <TableHead>Surgeon</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSurgeries.map((surgery) => (
                        <TableRow key={surgery.id}>
                          <TableCell>
                            <span className="font-mono text-sm">{surgery.surgery_number}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">
                                  {surgery.patient?.first_name} {surgery.patient?.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {surgery.patient?.patient_number}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium max-w-[200px] truncate">{surgery.procedure_name}</p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{formatDate(surgery.scheduled_date)}</p>
                              <p className="text-xs text-muted-foreground">
                                {surgery.scheduled_start_time ? format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a') : '—'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {surgery.ot_room?.name || <span className="text-muted-foreground">Not assigned</span>}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{surgery.lead_surgeon?.profile?.full_name || '—'}</p>
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={surgery.priority} showIcon={false} />
                          </TableCell>
                          <TableCell>
                            <OTStatusBadge status={surgery.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/app/ot/surgeries/${surgery.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doctor Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Surgery Requests</CardTitle>
              <CardDescription>
                Requests from doctors for surgical procedures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Scissors className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No Surgery Requests</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                      ? "No requests match your filters"
                      : "No pending surgery requests at this time"}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate("/app/ot/surgeries")}
                  >
                    View All Surgeries
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Procedure</TableHead>
                        <TableHead>Recommended By</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => {
                        const statusInfo = statusConfig[request.request_status];
                        const priorityInfo = priorityConfig[request.priority];
                        const StatusIcon = statusInfo.icon;

                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">
                                    {request.patient?.first_name} {request.patient?.last_name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {request.patient?.patient_number}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.procedure_name}</p>
                                {request.diagnosis && (
                                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                    {request.diagnosis}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {request.doctor?.profile?.full_name || "—"}
                              </p>
                              {request.doctor?.specialization && (
                                <p className="text-xs text-muted-foreground">
                                  {request.doctor.specialization}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={priorityInfo.variant}>
                                {priorityInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusInfo.variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(request.recommended_date)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {request.request_status === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCheckOT(request.id)}
                                  >
                                    Check OT
                                  </Button>
                                )}
                                {(request.request_status === "pending" || 
                                  request.request_status === "ot_availability_checked" ||
                                  request.request_status === "admission_required") && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAdmitPatient(request.patient_id, request.id)}
                                  >
                                    Admit
                                  </Button>
                                )}
                                {request.request_status === "admitted" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleScheduleSurgery(request)}
                                  >
                                    Schedule
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

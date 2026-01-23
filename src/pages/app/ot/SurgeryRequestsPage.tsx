import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Scissors, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  User, 
  Activity,
  CheckCircle,
  XCircle,
  Building,
  Bed
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
import { useAuth } from "@/contexts/AuthContext";
import { 
  usePendingSurgeryRequests, 
  type SurgeryRequest,
  type SurgeryRequestStatus,
  type SurgeryRequestPriority
} from "@/hooks/useSurgeryRequests";

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

  const { data: requests, isLoading } = usePendingSurgeryRequests(profile?.branch_id || undefined);

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

  // Stats
  const stats = {
    total: requests?.length || 0,
    pending: requests?.filter(r => r.request_status === "pending").length || 0,
    needsAdmission: requests?.filter(r => r.request_status === "admission_required").length || 0,
    admitted: requests?.filter(r => r.request_status === "admitted").length || 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surgery Requests"
        description="Manage pending surgery recommendations and scheduling"
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
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Bed className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.needsAdmission}</p>
                <p className="text-sm text-muted-foreground">Needs Admission</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Building className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admitted}</p>
                <p className="text-sm text-muted-foreground">Admitted - Ready</p>
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
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Surgery Requests</CardTitle>
          <CardDescription>
            Requests from doctors for surgical procedures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { format, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useLeaveRequests, useLeaveTypes, useApproveLeaveRequest,
  useCreateLeaveRequest, useLevel1ApproveLeave, useLevel2ApproveLeave,
  getApprovalStage,
} from "@/hooks/useLeaves";
import { Loader2, Search, Plus, Check, X, Calendar, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

export default function LeavesPage() {
  const { t } = useTranslation();
  const { user, profile, hasRole, isSuperAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    employee_id: "",
  });

  const { data: leaveRequests, isLoading } = useLeaveRequests({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: leaveTypes } = useLeaveTypes();
  const approveLeaveRequest = useApproveLeaveRequest();
  const level2Approve = useLevel2ApproveLeave();
  const createLeaveRequest = useCreateLeaveRequest();
  const { toast: toastLegacy } = useToast();

  const isHrOrAdmin = isSuperAdmin || hasRole("org_admin") || hasRole("branch_admin") || hasRole("hr_manager");

  const { data: employees } = useQuery({
    queryKey: ["employees-for-leave"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, employee_number")
        .eq("employment_status", "active")
        .order("first_name");
      if (error) throw error;
      return data || [];
    },
  });

  const filteredRequests = leaveRequests?.filter((request) => {
    const employeeName = `${request.employee?.first_name} ${request.employee?.last_name}`.toLowerCase();
    return employeeName.includes(search.toLowerCase());
  });

  // For HR admin: direct approve (super_admin) or Level 2 approve
  const handleApprove = async (id: string, request: any) => {
    try {
      const stage = getApprovalStage(request);
      if (isSuperAdmin) {
        // Super admin can do direct full approval
        await approveLeaveRequest.mutateAsync({ id, approved: true });
      } else if (stage.stage === "awaiting_hr") {
        // HR manager does Level 2
        await level2Approve.mutateAsync({ id, approved: true });
      } else {
        // Fallback direct approve
        await approveLeaveRequest.mutateAsync({ id, approved: true });
      }
    } catch (error: any) {
      toastLegacy({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (id: string, request: any) => {
    try {
      const stage = getApprovalStage(request);
      if (isSuperAdmin) {
        await approveLeaveRequest.mutateAsync({ id, approved: false });
      } else if (stage.stage === "awaiting_hr") {
        await level2Approve.mutateAsync({ id, approved: false });
      } else {
        await approveLeaveRequest.mutateAsync({ id, approved: false });
      }
    } catch (error: any) {
      toastLegacy({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmitLeave = async () => {
    if (!leaveForm.leave_type_id || !leaveForm.start_date || !leaveForm.end_date || !leaveForm.employee_id) {
      toast.error("Please fill all required fields");
      return;
    }

    const totalDays = differenceInDays(
      new Date(leaveForm.end_date),
      new Date(leaveForm.start_date)
    ) + 1;

    if (totalDays <= 0) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      await createLeaveRequest.mutateAsync({
        employee_id: leaveForm.employee_id,
        organization_id: profile?.organization_id || "",
        leave_type_id: leaveForm.leave_type_id,
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        total_days: totalDays,
        reason: leaveForm.reason || null,
        status: "pending",
      });

      toast.success("Leave request submitted successfully");
      setIsDialogOpen(false);
      setLeaveForm({ leave_type_id: "", start_date: "", end_date: "", reason: "", employee_id: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit leave request");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getStageBadge = (request: any) => {
    const stage = getApprovalStage(request);
    switch (stage.stage) {
      case "awaiting_dept_head":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">{stage.label}</Badge>;
      case "awaiting_hr":
        return <Badge variant="outline" className="bg-info/10 text-info border-info/20 text-xs">{stage.label}</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">{stage.label}</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">{stage.label}</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{stage.label}</Badge>;
    }
  };

  const canApprove = (request: any): boolean => {
    if (request.status !== "pending") return false;
    if (isSuperAdmin) return true;
    const stage = getApprovalStage(request);
    if (isHrOrAdmin && stage.stage === "awaiting_hr") return true;
    return false;
  };

  const pendingCount = leaveRequests?.filter((r) => r.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        description="Manage employee leave applications"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Leaves" },
        ]}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Employee <span className="text-destructive">*</span></Label>
                  <Select
                    value={leaveForm.employee_id}
                    onValueChange={(v) => setLeaveForm({ ...leaveForm, employee_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.employee_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Leave Type <span className="text-destructive">*</span></Label>
                  <Select
                    value={leaveForm.leave_type_id}
                    onValueChange={(v) => setLeaveForm({ ...leaveForm, leave_type_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>From Date <span className="text-destructive">*</span></Label>
                    <Input
                      type="date"
                      value={leaveForm.start_date}
                      onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>To Date <span className="text-destructive">*</span></Label>
                    <Input
                      type="date"
                      value={leaveForm.end_date}
                      onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                      min={leaveForm.start_date}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Reason for leave..."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleSubmitLeave}
                  disabled={createLeaveRequest.isPending || !leaveForm.leave_type_id || !leaveForm.employee_id}
                >
                  {createLeaveRequest.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {pendingCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">{pendingCount} pending leave request(s) awaiting approval</span>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval Stage</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredRequests && filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {request.employee?.first_name} {request.employee?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.employee?.department?.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: request.leave_type?.color || "#666",
                          color: request.leave_type?.color || "#666",
                        }}
                      >
                        {request.leave_type?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(request.start_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{format(new Date(request.end_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{request.total_days}</TableCell>
                    <TableCell>{getStatusBadge(request.status || "pending")}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              {getStageBadge(request)}
                              {(request.approver_1_remarks || request.approver_2_remarks) && (
                                <Info className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-1 text-xs">
                              <p><strong>Level 1 (Dept Head):</strong> {(request as any).approver_1_profile?.full_name || "Not assigned"} — {request.approver_1_action || "pending"}</p>
                              {request.approver_1_remarks && <p className="text-muted-foreground">"{request.approver_1_remarks}"</p>}
                              <p><strong>Level 2 (HR):</strong> {(request as any).approver_2_profile?.full_name || "Pending"} — {request.approver_2_action || "pending"}</p>
                              {request.approver_2_remarks && <p className="text-muted-foreground">"{request.approver_2_remarks}"</p>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.created_at || new Date()), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {canApprove(request) && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600"
                            onClick={() => handleApprove(request.id, request)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => handleReject(request.id, request)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No leave requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
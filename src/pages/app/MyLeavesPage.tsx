import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useLeaveTypes, useCreateLeaveRequest, useCancelLeaveRequest, getApprovalStage } from "@/hooks/useLeaves";
import { Loader2, Plus, Calendar, X, CalendarOff, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function ApprovalTracker({ request }: { request: any }) {
  const stage = getApprovalStage(request);
  
  const level1Done = request.approver_1_action === "approved";
  const level1Rejected = request.approver_1_action === "rejected";
  const level2Done = request.approver_2_action === "approved";
  const level2Rejected = request.approver_2_action === "rejected";

  return (
    <div className="flex items-center gap-1 text-xs">
      {/* Step 1 */}
      <div className="flex items-center gap-0.5">
        {level1Done ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        ) : level1Rejected ? (
          <XCircle className="h-3.5 w-3.5 text-destructive" />
        ) : (
          <Clock className="h-3.5 w-3.5 text-warning" />
        )}
        <span className={cn(
          "hidden sm:inline",
          level1Done && "text-green-600",
          level1Rejected && "text-destructive",
          !level1Done && !level1Rejected && "text-warning"
        )}>
          Dept Head
        </span>
      </div>

      <span className="text-muted-foreground">→</span>

      {/* Step 2 */}
      <div className="flex items-center gap-0.5">
        {level2Done ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        ) : level2Rejected ? (
          <XCircle className="h-3.5 w-3.5 text-destructive" />
        ) : (
          <Clock className={cn("h-3.5 w-3.5", level1Done ? "text-warning" : "text-muted-foreground")} />
        )}
        <span className={cn(
          "hidden sm:inline",
          level2Done && "text-green-600",
          level2Rejected && "text-destructive",
          level1Done && !level2Done && !level2Rejected && "text-warning",
          !level1Done && !level2Done && "text-muted-foreground"
        )}>
          HR Manager
        </span>
      </div>
    </div>
  );
}

export default function MyLeavesPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const { data: leaveTypes, isLoading: typesLoading } = useLeaveTypes();
  const createLeaveRequest = useCreateLeaveRequest();
  const cancelLeaveRequest = useCancelLeaveRequest();

  const { data: myEmployee, isLoading: employeeLoading } = useQuery({
    queryKey: ["my-employee", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, organization_id")
        .eq("profile_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: myLeaves, isLoading: leavesLoading } = useQuery({
    queryKey: ["my-leave-requests", myEmployee?.id],
    queryFn: async () => {
      if (!myEmployee?.id) return [];
      const { data, error } = await supabase
        .from("leave_requests")
        .select(`
          *,
          leave_type:leave_types(id, name, color),
          approver_1_profile:approver_1_id(id, full_name),
          approver_2_profile:approver_2_id(id, full_name)
        `)
        .eq("employee_id", myEmployee.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!myEmployee?.id,
  });

  const { data: leaveBalances } = useQuery({
    queryKey: ["my-leave-balances", myEmployee?.id],
    queryFn: async () => {
      if (!myEmployee?.id) return [];
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from("leave_balances")
        .select(`*, leave_type:leave_types(id, name, color)`)
        .eq("employee_id", myEmployee.id)
        .eq("year", currentYear);
      if (error) throw error;
      return data || [];
    },
    enabled: !!myEmployee?.id,
  });

  const handleSubmitLeave = async () => {
    if (!leaveForm.leave_type_id || !leaveForm.start_date || !leaveForm.end_date) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!myEmployee?.id || !myEmployee?.organization_id) {
      toast.error("Employee record not found");
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
        employee_id: myEmployee.id,
        organization_id: myEmployee.organization_id,
        leave_type_id: leaveForm.leave_type_id,
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        total_days: totalDays,
        reason: leaveForm.reason || null,
        status: "pending",
      });

      toast.success("Leave request submitted successfully");
      setIsDialogOpen(false);
      setLeaveForm({ leave_type_id: "", start_date: "", end_date: "", reason: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit leave request");
    }
  };

  const handleCancelLeave = async (id: string) => {
    try {
      await cancelLeaveRequest.mutateAsync(id);
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel leave request");
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

  const isLoading = employeeLoading || leavesLoading || typesLoading;

  if (!myEmployee && !employeeLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Leaves"
          description="View and manage your leave requests"
          breadcrumbs={[{ label: "My Leaves" }]}
        />
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <CalendarOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No employee record found for your account.</p>
            <p className="text-sm">Please contact HR to set up your employee profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Leaves"
        description="View and manage your leave requests"
        breadcrumbs={[{ label: "My Leaves" }]}
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
                  disabled={createLeaveRequest.isPending || !leaveForm.leave_type_id}
                >
                  {createLeaveRequest.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {leaveBalances && leaveBalances.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {leaveBalances.map((balance) => {
            const entitled = balance.entitled || 0;
            const used = balance.used || 0;
            const remaining = entitled - used;
            const usedPercent = entitled ? (used / entitled) * 100 : 0;

            return (
              <Card key={balance.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: balance.leave_type?.color || "#666" }}
                    />
                    <span className="font-medium text-sm">{balance.leave_type?.name}</span>
                  </div>
                  <div className="text-2xl font-bold">{remaining}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    remaining of {entitled} days
                  </div>
                  <Progress value={usedPercent} className="h-1.5" />
                  <div className="text-xs text-muted-foreground mt-1">Used: {used} days</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Leave Requests
          </CardTitle>
        </CardHeader>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval Progress</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : myLeaves && myLeaves.length > 0 ? (
                myLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: leave.leave_type?.color || "#666",
                          color: leave.leave_type?.color || "#666",
                        }}
                      >
                        {leave.leave_type?.name || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(leave.start_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{format(new Date(leave.end_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{leave.total_days}</TableCell>
                    <TableCell>{getStatusBadge(leave.status || "pending")}</TableCell>
                    <TableCell>
                      <ApprovalTracker request={leave} />
                      {/* Show remarks if any */}
                      {leave.approver_1_remarks && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          L1: {leave.approver_1_remarks}
                        </p>
                      )}
                      {leave.approver_2_remarks && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          L2: {leave.approver_2_remarks}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(leave.created_at || new Date()), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {leave.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => handleCancelLeave(leave.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
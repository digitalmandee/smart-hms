import { useState } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLeaveRequests, useLeaveTypes, useApproveLeave, useRejectLeave } from "@/hooks/useLeaves";
import { Loader2, Search, Plus, Check, X, Calendar } from "lucide-react";
import { LeaveRequestCard } from "@/components/hr/LeaveRequestCard";
import { useToast } from "@/hooks/use-toast";

export default function LeavesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const { data: leaveRequests, isLoading } = useLeaveRequests({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: leaveTypes } = useLeaveTypes();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  const { toast } = useToast();

  const filteredRequests = leaveRequests?.filter((request) => {
    const employeeName = `${request.employee?.first_name} ${request.employee?.last_name}`.toLowerCase();
    return employeeName.includes(search.toLowerCase());
  });

  const handleApprove = async (id: string) => {
    try {
      await approveLeave.mutateAsync(id);
      toast({ title: "Leave request approved" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve leave",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    try {
      await rejectLeave.mutateAsync({ id, reason });
      toast({ title: "Leave request rejected" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject leave",
        variant: "destructive",
      });
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

  const pendingCount = leaveRequests?.filter((r) => r.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        description="Manage employee leave applications"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Leaves" },
        ]}
        actions={
          <Dialog>
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
                  <Label>Leave Type</Label>
                  <Select>
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
                    <Label>From Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label>To Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Reason</Label>
                  <Textarea placeholder="Reason for leave..." />
                </div>
                <Button className="w-full">Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Quick Stats */}
      {pendingCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">{pendingCount} pending leave request(s) awaiting approval</span>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
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

      {/* Leave Requests Table */}
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
                    <TableCell>{format(new Date(request.from_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{format(new Date(request.to_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{request.total_days}</TableCell>
                    <TableCell>{getStatusBadge(request.status || "pending")}</TableCell>
                    <TableCell>
                      {format(new Date(request.created_at || new Date()), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === "pending" && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600"
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => handleReject(request.id)}
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

import { useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMyApprovalRequests, useLevel1ApproveLeave, useLevel2ApproveLeave, getApprovalStage } from "@/hooks/useLeaves";
import { Loader2, Check, X, ClipboardList, MessageSquare } from "lucide-react";

export default function MyApprovalsPage() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useMyApprovalRequests();
  const level1Approve = useLevel1ApproveLeave();
  const level2Approve = useLevel2ApproveLeave();

  const [remarksDialog, setRemarksDialog] = useState<{
    open: boolean;
    requestId: string;
    action: "approve" | "reject";
    level: 1 | 2;
  }>({ open: false, requestId: "", action: "approve", level: 1 });
  const [remarks, setRemarks] = useState("");

  const handleAction = (requestId: string, action: "approve" | "reject", level: 1 | 2) => {
    if (action === "reject") {
      setRemarksDialog({ open: true, requestId, action, level });
      setRemarks("");
    } else {
      processAction(requestId, action, level, "");
    }
  };

  const processAction = async (requestId: string, action: "approve" | "reject", level: 1 | 2, remarkText: string) => {
    const approved = action === "approve";
    if (level === 1) {
      await level1Approve.mutateAsync({ id: requestId, approved, remarks: remarkText });
    } else {
      await level2Approve.mutateAsync({ id: requestId, approved, remarks: remarkText });
    }
    setRemarksDialog({ open: false, requestId: "", action: "approve", level: 1 });
  };

  const getMyLevel = (request: any): 1 | 2 | null => {
    if (!user) return null;
    const stage = getApprovalStage(request);
    if (stage.stage === "awaiting_dept_head" && request.approver_1_id === user.id) return 1;
    if (stage.stage === "awaiting_hr" && (request.approver_2_id === user.id || !request.approver_2_id)) return 2;
    return null;
  };

  const actionableRequests = requests?.filter(r => getMyLevel(r) !== null) || [];
  const otherRequests = requests?.filter(r => getMyLevel(r) === null) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Approvals"
        description="Leave requests awaiting your approval"
        breadcrumbs={[{ label: "My Approvals" }]}
      />

      {actionableRequests.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-warning" />
            <span className="font-medium">
              {actionableRequests.length} request(s) awaiting your action
            </span>
          </CardContent>
        </Card>
      )}

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
                <TableHead>Stage</TableHead>
                <TableHead>Reason</TableHead>
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
              ) : actionableRequests.length > 0 ? (
                actionableRequests.map((request) => {
                  const stage = getApprovalStage(request);
                  const myLevel = getMyLevel(request);

                  return (
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
                      <TableCell>
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          {stage.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {request.reason || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {myLevel && (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                              onClick={() => handleAction(request.id, "approve", myLevel)}
                              disabled={level1Approve.isPending || level2Approve.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleAction(request.id, "reject", myLevel)}
                              disabled={level1Approve.isPending || level2Approve.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No leave requests pending your approval
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Rejection remarks dialog */}
      <Dialog open={remarksDialog.open} onOpenChange={(open) => setRemarksDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Rejection Remarks
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Reason for rejection</Label>
              <Textarea
                placeholder="Enter reason..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRemarksDialog(prev => ({ ...prev, open: false }))}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => processAction(remarksDialog.requestId, "reject", remarksDialog.level, remarks)}
                disabled={level1Approve.isPending || level2Approve.isPending}
              >
                {(level1Approve.isPending || level2Approve.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
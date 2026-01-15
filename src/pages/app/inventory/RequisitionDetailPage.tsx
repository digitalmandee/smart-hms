import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { RequisitionStatusBadge } from "@/components/inventory/RequisitionStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  XCircle,
  Send,
  Truck,
  Clock,
} from "lucide-react";
import {
  useRequisition,
  useSubmitRequisition,
  useApproveRequisition,
  useRejectRequisition,
  useIssueStock,
} from "@/hooks/useRequisitions";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RequisitionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: requisition, isLoading } = useRequisition(id || "");
  const submitMutation = useSubmitRequisition();
  const approveMutation = useApproveRequisition();
  const rejectMutation = useRejectRequisition();
  const issueMutation = useIssueStock();

  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [approvedQuantities, setApprovedQuantities] = useState<Record<string, number>>({});

  const handleSubmit = async () => {
    if (!requisition) return;
    try {
      await submitMutation.mutateAsync(requisition.id);
      toast.success("Requisition submitted for approval");
    } catch {
      // Error handled by mutation
    }
  };

  const handleApprove = async () => {
    if (!requisition) return;
    const items = requisition.items?.map((item) => ({
      id: item.id,
      approved_quantity: approvedQuantities[item.id] ?? item.requested_quantity,
    })) || [];

    try {
      await approveMutation.mutateAsync({ id: requisition.id, items });
      toast.success("Requisition approved");
    } catch {
      // Error handled by mutation
    }
  };

  const handleReject = async () => {
    if (!requisition || !rejectReason) return;
    try {
      await rejectMutation.mutateAsync({
        id: requisition.id,
        rejection_reason: rejectReason,
      });
      toast.success("Requisition rejected");
      setShowRejectForm(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleIssue = async () => {
    if (!requisition) return;
    const items = requisition.items?.map((item) => ({
      id: item.id,
      issued_quantity: item.approved_quantity || 0,
    })) || [];

    try {
      await issueMutation.mutateAsync({ id: requisition.id, items });
      toast.success("Stock issued successfully");
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Requisition not found</h2>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/app/inventory/requisitions")}
        >
          Back to Requisitions
        </Button>
      </div>
    );
  }

  const canSubmit = requisition.status === "draft";
  const canApprove = requisition.status === "pending";
  const canIssue = requisition.status === "approved";

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "normal":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Requisition: ${requisition.requisition_number}`}
        description={`Requested on ${format(new Date(requisition.created_at!), "MMMM dd, yyyy")}`}
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/app/inventory/requisitions")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {canSubmit && (
          <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
            <Send className="mr-2 h-4 w-4" />
            Submit for Approval
          </Button>
        )}
        {canApprove && (
          <>
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectForm(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </>
        )}
        {canIssue && (
          <Button onClick={handleIssue} disabled={issueMutation.isPending}>
            <Truck className="mr-2 h-4 w-4" />
            Issue Stock
          </Button>
        )}
      </div>

      {/* Reject Form */}
      {showRejectForm && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Reject Requisition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason || rejectMutation.isPending}
              >
                Confirm Rejection
              </Button>
              <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Banner */}
      <Card
        className={
          requisition.status === "issued"
            ? "border-emerald-200 bg-emerald-50"
            : requisition.status === "approved"
            ? "border-blue-200 bg-blue-50"
            : requisition.status === "rejected"
            ? "border-red-200 bg-red-50"
            : ""
        }
      >
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {requisition.status === "issued" ? (
                <Truck className="h-6 w-6 text-emerald-600" />
              ) : requisition.status === "approved" ? (
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              ) : requisition.status === "rejected" ? (
                <XCircle className="h-6 w-6 text-red-600" />
              ) : requisition.status === "pending" ? (
                <Clock className="h-6 w-6 text-amber-600" />
              ) : (
                <Package className="h-6 w-6 text-muted-foreground" />
              )}
              <div>
                <p className="font-semibold capitalize">
                  {requisition.status === "issued"
                    ? "Stock Issued"
                    : requisition.status === "approved"
                    ? "Approved - Ready to Issue"
                    : requisition.status === "rejected"
                    ? "Requisition Rejected"
                    : requisition.status === "pending"
                    ? "Pending Approval"
                    : "Draft Requisition"}
                </p>
                {requisition.rejection_reason && (
                  <p className="text-sm text-red-600">
                    Reason: {requisition.rejection_reason}
                  </p>
                )}
              </div>
            </div>
            <RequisitionStatusBadge status={requisition.status} />
          </div>
        </CardContent>
      </Card>

      {/* Requisition Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Requisition Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Requisition Number</p>
                <p className="font-medium">{requisition.requisition_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{requisition.requesting_department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{requisition.branch?.branch_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Required By</p>
                <p className="font-medium">
                  {requisition.required_date
                    ? format(new Date(requisition.required_date), "MMM dd, yyyy")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <Badge variant={getPriorityColor(requisition.priority || "normal")}>
                  {requisition.priority?.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested By</p>
                <p className="font-medium">
                  {requisition.requested_by_profile?.full_name || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {requisition.status === "approved" && (
          <Card>
            <CardHeader>
              <CardTitle>Approval Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Approved By</p>
                  <p className="font-medium">
                    {requisition.approved_by_profile?.full_name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved At</p>
                  <p className="font-medium">
                    {requisition.approved_at
                      ? format(new Date(requisition.approved_at), "MMM dd, yyyy HH:mm")
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Requested Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Requested</TableHead>
                {canApprove && <TableHead className="text-center">Approve Qty</TableHead>}
                {(requisition.status === "approved" || requisition.status === "issued") && (
                  <TableHead className="text-center">Approved</TableHead>
                )}
                {requisition.status === "issued" && (
                  <TableHead className="text-center">Issued</TableHead>
                )}
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisition.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{item.item?.item_name}</p>
                      <p className="text-sm text-muted-foreground">{item.item?.item_code}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.requested_quantity}</TableCell>
                  {canApprove && (
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min="0"
                        max={item.requested_quantity}
                        value={approvedQuantities[item.id] ?? item.requested_quantity}
                        onChange={(e) =>
                          setApprovedQuantities((prev) => ({
                            ...prev,
                            [item.id]: Number(e.target.value),
                          }))
                        }
                        className="w-24 mx-auto"
                      />
                    </TableCell>
                  )}
                  {(requisition.status === "approved" || requisition.status === "issued") && (
                    <TableCell className="text-center text-blue-600">
                      {item.approved_quantity || 0}
                    </TableCell>
                  )}
                  {requisition.status === "issued" && (
                    <TableCell className="text-center text-emerald-600">
                      {item.issued_quantity || 0}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">{item.notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes */}
      {requisition.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Justification / Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{requisition.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

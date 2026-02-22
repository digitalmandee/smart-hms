import { useNavigate, useParams, Link } from "react-router-dom";
import { usePrint } from "@/hooks/usePrint";
import { PrintablePR } from "@/components/inventory/PrintablePR";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  ShoppingCart,
  FileText,
  AlertCircle,
} from "lucide-react";
// Printer already imported above
import {
  usePurchaseRequest,
  useSubmitPurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
  useConvertPRtoPO,
} from "@/hooks/usePurchaseRequests";
import { format } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useState } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "secondary",
  pending_approval: "default",
  approved: "default",
  rejected: "destructive",
  converted: "default",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  converted: "Converted to PO",
};

export default function PRDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { formatCurrency } = useCurrencyFormatter();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { printRef: prPrintRef, handlePrint: prPrintHandle } = usePrint();

  const { data: pr, isLoading } = usePurchaseRequest(id || "");
  const submitMutation = useSubmitPurchaseRequest();
  const approveMutation = useApprovePurchaseRequest();
  const rejectMutation = useRejectPurchaseRequest();
  const convertMutation = useConvertPRtoPO();

  const handleSubmit = async () => {
    if (!pr) return;
    await submitMutation.mutateAsync(pr.id);
  };

  const handleApprove = async () => {
    if (!pr) return;
    await approveMutation.mutateAsync(pr.id);
  };

  const handleReject = async () => {
    if (!pr) return;
    await rejectMutation.mutateAsync({ id: pr.id, reason: rejectionReason });
    setRejectDialogOpen(false);
    setRejectionReason("");
  };

  const handleConvertToPO = async () => {
    if (!pr) return;
    await convertMutation.mutateAsync(pr.id);
    toast.success("PR marked as converted. Redirecting to create PO...");
    // Navigate to PO form with PR items pre-filled via query params
    navigate(`/app/inventory/purchase-orders/new?from_pr=${pr.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!pr) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Purchase Request not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app/inventory/purchase-requests")}>
          Back to PR List
        </Button>
      </div>
    );
  }

  const totalEstimated = pr.items?.reduce(
    (sum, item) => sum + item.quantity_requested * item.estimated_unit_cost,
    0
  ) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`PR: ${pr.pr_number}`}
        description={`Created on ${format(new Date(pr.created_at), "MMMM dd, yyyy")}`}
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/app/inventory/purchase-requests")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button variant="outline" onClick={() => prPrintHandle({ title: pr.pr_number })}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        {pr.status === "draft" && (
          <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
            <Send className="mr-2 h-4 w-4" />
            Submit for Approval
          </Button>
        )}
        {pr.status === "pending_approval" && (
          <>
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button variant="destructive" onClick={() => setRejectDialogOpen(true)} disabled={rejectMutation.isPending}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </>
        )}
        {pr.status === "approved" && (
          <Button onClick={handleConvertToPO} disabled={convertMutation.isPending}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Convert to Purchase Order
          </Button>
        )}
        {pr.status === "converted" && (
          <Button variant="outline" asChild>
            <Link to={`/app/inventory/purchase-orders?search=${pr.pr_number}`}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Linked PO
            </Link>
          </Button>
        )}
      </div>

      {/* Status Banner */}
      <Card
        className={
          pr.status === "approved"
            ? "border-emerald-200 bg-emerald-50"
            : pr.status === "rejected"
            ? "border-red-200 bg-red-50"
            : pr.status === "converted"
            ? "border-blue-200 bg-blue-50"
            : ""
        }
      >
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {pr.status === "approved" ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : pr.status === "rejected" ? (
                <XCircle className="h-6 w-6 text-red-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              )}
              <div>
                <p className="font-semibold">{statusLabels[pr.status]}</p>
                {pr.status === "rejected" && pr.rejection_reason && (
                  <p className="text-sm text-destructive">Reason: {pr.rejection_reason}</p>
                )}
              </div>
            </div>
            <Badge variant={statusColors[pr.status] as any}>
              {statusLabels[pr.status]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">PR Number</p>
                <p className="font-medium">{pr.pr_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{pr.department || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested By</p>
                <p className="font-medium">{pr.requested_by_profile?.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <p className="font-medium">
                  {pr.priority >= 2 ? "High" : pr.priority === 1 ? "Medium" : "Normal"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{pr.branch?.name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Total</p>
                <p className="font-medium text-lg">{formatCurrency(totalEstimated)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {pr.approved_by_profile && (
          <Card>
            <CardHeader>
              <CardTitle>Approval Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {pr.status === "rejected" ? "Rejected By" : "Approved By"}
                  </p>
                  <p className="font-medium">{pr.approved_by_profile.full_name}</p>
                </div>
                {pr.approved_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{format(new Date(pr.approved_at), "MMM dd, yyyy")}</p>
                  </div>
                )}
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
                <TableHead className="text-center">Qty Requested</TableHead>
                <TableHead className="text-right">Est. Unit Cost</TableHead>
                <TableHead className="text-right">Est. Total</TableHead>
                <TableHead className="text-center">Reorder Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pr.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item?.name || "—"}</TableCell>
                  <TableCell className="text-center">{item.quantity_requested}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.estimated_unit_cost)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.quantity_requested * item.estimated_unit_cost)}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">{item.reorder_level}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pr.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{pr.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Purchase Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Printable */}
      {pr && (
        <div className="hidden">
          <PrintablePR ref={prPrintRef} pr={pr} />
        </div>
      )}
    </div>
  );
}

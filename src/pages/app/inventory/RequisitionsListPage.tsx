import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, FileInput, Send, Eye, Loader2 } from "lucide-react";
import { useRequisitions, useSubmitRequisition } from "@/hooks/useRequisitions";
import { RequisitionStatusBadge } from "@/components/inventory/RequisitionStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type RequisitionStatus = Database["public"]["Enums"]["requisition_status"];

export default function RequisitionsListPage() {
  const [statusFilter, setStatusFilter] = useState<RequisitionStatus | "all">("all");
  const { data: requisitions, isLoading } = useRequisitions(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );
  const submitRequisition = useSubmitRequisition();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Requisitions"
        description="Department stock requests"
        actions={
          <Button asChild>
            <Link to="/app/inventory/requisitions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Requisition
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RequisitionStatus | "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="partially_issued">Partially Issued</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : requisitions?.length === 0 ? (
            <div className="text-center py-12">
              <FileInput className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No requisitions found</h3>
              <p className="text-muted-foreground">
                {statusFilter ? "Try a different filter" : "Create your first stock requisition"}
              </p>
              <Button asChild className="mt-4">
                <Link to="/app/inventory/requisitions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Requisition
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requisition #</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Required By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisitions?.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <Link
                        to={`/app/inventory/requisitions/${req.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {req.requisition_number}
                      </Link>
                    </TableCell>
                    <TableCell>{req.requested_by_profile?.full_name || "-"}</TableCell>
                    <TableCell>{req.department?.name || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{req.from_store?.name || "—"}</TableCell>
                    <TableCell>{format(new Date(req.request_date), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      {req.required_date 
                        ? format(new Date(req.required_date), "dd MMM yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <RequisitionStatusBadge status={req.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {req.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={submitRequisition.isPending}
                            onClick={() => submitRequisition.mutate(req.id)}
                          >
                            {submitRequisition.isPending ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="mr-1 h-3 w-3" />
                            )}
                            Submit
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/app/inventory/requisitions/${req.id}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

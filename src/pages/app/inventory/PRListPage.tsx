import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { ListFilterBar } from "@/components/inventory/ListFilterBar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText } from "lucide-react";
import { usePurchaseRequests } from "@/hooks/usePurchaseRequests";
import { format } from "date-fns";
import { useState, useMemo } from "react";

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

export default function PRListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: prs, isLoading } = usePurchaseRequests(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  const filteredPRs = useMemo(() => {
    if (!prs || !search) return prs || [];
    const q = search.toLowerCase();
    return prs.filter((pr) =>
      pr.pr_number.toLowerCase().includes(q) ||
      (pr.department || "").toLowerCase().includes(q) ||
      (pr.requested_by_profile?.full_name || "").toLowerCase().includes(q)
    );
  }, [prs, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Requests"
        description="Manage purchase requests and approvals"
      />

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <ListFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by PR number or department...">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </ListFilterBar>

        <Button onClick={() => navigate("/app/inventory/purchase-requests/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Request
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PR Number</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPRs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  No purchase requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredPRs?.map((pr) => (
                <TableRow
                  key={pr.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/app/inventory/purchase-requests/${pr.id}`)}
                >
                  <TableCell className="font-medium">{pr.pr_number}</TableCell>
                  <TableCell>{pr.department || "—"}</TableCell>
                  <TableCell>{pr.requested_by_profile?.full_name || "—"}</TableCell>
                  <TableCell>{format(new Date(pr.created_at), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    {pr.priority >= 2 ? (
                      <Badge variant="destructive">High</Badge>
                    ) : pr.priority === 1 ? (
                      <Badge variant="default">Medium</Badge>
                    ) : (
                      <Badge variant="secondary">Normal</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[pr.status] as any}>
                      {statusLabels[pr.status] || pr.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

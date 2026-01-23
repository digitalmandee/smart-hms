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
import { Plus, PackageCheck } from "lucide-react";
import { useGRNs } from "@/hooks/useGRN";
import { GRNStatusBadge } from "@/components/inventory/GRNStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type GRNStatus = Database["public"]["Enums"]["grn_status"];

export default function GRNListPage() {
  const [statusFilter, setStatusFilter] = useState<GRNStatus | "all">("all");
  const { data: grns, isLoading } = useGRNs(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goods Received Notes"
        description="Track received goods"
        actions={
          <Button asChild>
            <Link to="/app/inventory/grn/new">
              <Plus className="mr-2 h-4 w-4" />
              New GRN
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as GRNStatus | "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_verification">Pending Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
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
          ) : grns?.length === 0 ? (
            <div className="text-center py-12">
              <PackageCheck className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No GRNs found</h3>
              <p className="text-muted-foreground">
                {statusFilter !== "all" ? "Try a different filter" : "Create your first goods received note"}
              </p>
              <Button asChild className="mt-4">
                <Link to="/app/inventory/grn/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New GRN
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GRN Number</TableHead>
                  <TableHead>PO Reference</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Received Date</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grns?.map((grn) => (
                  <TableRow key={grn.id}>
                    <TableCell>
                      <Link
                        to={`/app/inventory/grn/${grn.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {grn.grn_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {grn.purchase_order ? (
                        <Link
                          to={`/app/inventory/purchase-orders/${grn.purchase_order_id}`}
                          className="text-primary hover:underline"
                        >
                          {grn.purchase_order.po_number}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{grn.vendor?.name}</p>
                        <p className="text-xs text-muted-foreground">{grn.vendor?.vendor_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(grn.received_date), "dd MMM yyyy")}</TableCell>
                    <TableCell>{grn.invoice_number || "-"}</TableCell>
                    <TableCell>
                      <GRNStatusBadge status={grn.status} />
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

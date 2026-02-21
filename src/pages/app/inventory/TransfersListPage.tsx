import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeftRight } from "lucide-react";
import { useStoreTransfers } from "@/hooks/useStoreTransfers";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { ListFilterBar } from "@/components/inventory/ListFilterBar";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  in_transit: "bg-purple-100 text-purple-800",
  received: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function TransfersListPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { data: transfers, isLoading } = useStoreTransfers(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  const filteredTransfers = useMemo(() => {
    if (!transfers || !search) return transfers || [];
    const q = search.toLowerCase();
    return transfers.filter((t) =>
      t.transfer_number.toLowerCase().includes(q) ||
      (t.from_store?.name || "").toLowerCase().includes(q) ||
      (t.to_store?.name || "").toLowerCase().includes(q)
    );
  }, [transfers, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inter-Store Transfers"
        description="Transfer stock between warehouses"
        actions={
          <Button asChild>
            <Link to="/app/inventory/transfers/new">
              <Plus className="mr-2 h-4 w-4" />
              New Transfer
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <ListFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by transfer number or store...">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </ListFilterBar>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div className="text-center py-12">
              <ArrowLeftRight className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No transfers found</h3>
              <p className="text-muted-foreground">Create your first inter-store transfer</p>
              <Button asChild className="mt-4">
                <Link to="/app/inventory/transfers/new">
                  <Plus className="mr-2 h-4 w-4" /> New Transfer
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer #</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link to={`/app/inventory/transfers/${t.id}`} className="font-medium text-primary hover:underline">
                        {t.transfer_number}
                      </Link>
                    </TableCell>
                    <TableCell>{t.from_store?.name || "—"}</TableCell>
                    <TableCell>{t.to_store?.name || "—"}</TableCell>
                    <TableCell>{t.requested_by_profile?.full_name || "—"}</TableCell>
                    <TableCell>{format(new Date(t.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[t.status] || ""} variant="secondary">
                        {t.status.replace("_", " ")}
                      </Badge>
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

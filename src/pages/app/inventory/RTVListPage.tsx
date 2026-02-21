import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { ListFilterBar } from "@/components/inventory/ListFilterBar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, RotateCcw } from "lucide-react";
import { useRTVs } from "@/hooks/useReturnToVendor";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { format } from "date-fns";

const STATUS_BADGES: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  approved: "default",
  shipped: "default",
  completed: "outline",
  cancelled: "destructive",
};

export default function RTVListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { formatCurrency } = useCurrencyFormatter();
  const { data: rtvs, isLoading } = useRTVs(statusFilter !== "all" ? statusFilter : undefined);

  const filtered = useMemo(() => {
    if (!rtvs) return [];
    if (!search) return rtvs;
    const q = search.toLowerCase();
    return rtvs.filter((r) => r.rtv_number.toLowerCase().includes(q) || r.vendor?.name?.toLowerCase().includes(q));
  }, [rtvs, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Return to Vendor"
        description="Manage goods returns to vendors"
        actions={
          <Button asChild><Link to="/app/inventory/rtv/new"><Plus className="mr-2 h-4 w-4" />New Return</Link></Button>
        }
      />

      <Card>
        <CardHeader>
          <ListFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by RTV# or vendor...">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </ListFilterBar>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold">No returns found</h3>
              <p className="text-muted-foreground mt-1">Create a return when goods need to be sent back to vendor</p>
              <Button asChild className="mt-4"><Link to="/app/inventory/rtv/new"><Plus className="mr-2 h-4 w-4" />New Return</Link></Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RTV #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>GRN Ref</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link to={`/app/inventory/rtv/${r.id}`} className="font-medium text-primary hover:underline">{r.rtv_number}</Link>
                    </TableCell>
                    <TableCell>{r.vendor?.name}</TableCell>
                    <TableCell>{r.grn?.grn_number || "—"}</TableCell>
                    <TableCell>{format(new Date(r.return_date), "dd/MM/yyyy")}</TableCell>
                    <TableCell><Badge variant={STATUS_BADGES[r.status]}>{r.status}</Badge></TableCell>
                    <TableCell>{r.created_by_profile?.full_name || "—"}</TableCell>
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

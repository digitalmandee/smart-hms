import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { ListFilterBar } from "@/components/inventory/ListFilterBar";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ClipboardCheck } from "lucide-react";
import { useCycleCounts } from "@/hooks/useCycleCounts";
import { useDefaultStore } from "@/hooks/useDefaultStore";
import { format } from "date-fns";

const STATUS_BADGES: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  in_progress: "default",
  completed: "outline",
  cancelled: "destructive",
};

export default function CycleCountListPage() {
  const [storeId, setStoreId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  useDefaultStore(storeId, setStoreId, false);

  const { data: counts, isLoading } = useCycleCounts(storeId || undefined);

  const filtered = useMemo(() => {
    if (!counts) return [];
    return counts.filter((c) => {
      const matchSearch = !search || c.count_number.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [counts, search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cycle Counts"
        description="Physical inventory counting and reconciliation"
        actions={
          <div className="flex gap-2 items-center">
            <StoreSelector value={storeId} onChange={setStoreId} className="w-[220px]" />
            <Button asChild>
              <Link to="/app/inventory/cycle-counts/new">
                <Plus className="mr-2 h-4 w-4" />New Cycle Count
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <ListFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by count number...">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
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
              <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold">No cycle counts found</h3>
              <p className="text-muted-foreground mt-1">Start a cycle count to verify your physical inventory</p>
              <Button asChild className="mt-4"><Link to="/app/inventory/cycle-counts/new"><Plus className="mr-2 h-4 w-4" />New Cycle Count</Link></Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Count #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link to={`/app/inventory/cycle-counts/${c.id}`} className="font-medium text-primary hover:underline">
                        {c.count_number}
                      </Link>
                    </TableCell>
                    <TableCell><Badge variant="outline">{c.count_type}</Badge></TableCell>
                    <TableCell>{c.store?.name || "—"}</TableCell>
                    <TableCell>{c.zone?.zone_name || "All"}</TableCell>
                    <TableCell>{c.assigned_profile?.full_name || "—"}</TableCell>
                    <TableCell><Badge variant={STATUS_BADGES[c.status]}>{c.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell>{format(new Date(c.created_at), "dd/MM/yyyy")}</TableCell>
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

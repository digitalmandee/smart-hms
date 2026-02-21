import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, ClipboardCheck } from "lucide-react";
import { useCycleCount, useCycleCountItems, useUpdateCycleCountItem, useCompleteCycleCount } from "@/hooks/useCycleCounts";
import { format } from "date-fns";
import { useState } from "react";

export default function CycleCountDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: count, isLoading } = useCycleCount(id || "");
  const { data: items } = useCycleCountItems(id || "");
  const updateItem = useUpdateCycleCountItem();
  const completeMutation = useCompleteCycleCount();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-64" /></div>;
  if (!count) return <div className="text-center py-12"><ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground" /><p className="mt-4">Cycle count not found</p></div>;

  const handleSaveCount = async (itemId: string) => {
    await updateItem.mutateAsync({ id: itemId, counted_quantity: editQty });
    setEditingId(null);
  };

  const totalVariance = items?.reduce((sum, i) => sum + (i.variance || 0), 0) || 0;
  const countedItems = items?.filter(i => i.counted_quantity !== null).length || 0;
  const totalItems = items?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader title={`Cycle Count: ${count.count_number}`} description={`${count.count_type} count — ${count.store?.name || ""}`} />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/app/inventory/cycle-counts")}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        {count.status !== "completed" && count.status !== "cancelled" && (
          <Button onClick={() => completeMutation.mutate(count.id)} disabled={completeMutation.isPending || countedItems < totalItems}>
            <CheckCircle2 className="mr-2 h-4 w-4" />Complete Count
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center"><p className="text-sm text-muted-foreground">Status</p><Badge className="mt-1" variant={count.status === "completed" ? "outline" : "default"}>{count.status.replace("_", " ")}</Badge></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-sm text-muted-foreground">Progress</p><p className="text-2xl font-bold">{countedItems}/{totalItems}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-sm text-muted-foreground">Zone</p><p className="font-medium">{count.zone?.zone_name || "All Zones"}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-sm text-muted-foreground">Total Variance</p><p className={`text-2xl font-bold ${totalVariance !== 0 ? "text-destructive" : ""}`}>{totalVariance}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Count Items</CardTitle></CardHeader>
        <CardContent>
          {!items?.length ? (
            <p className="text-center py-8 text-muted-foreground">No items loaded for this cycle count. Items are loaded from current stock when the count starts.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Bin</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-center">Expected</TableHead>
                  <TableHead className="text-center">Counted</TableHead>
                  <TableHead className="text-center">Variance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div><p className="font-medium">{item.item?.name}</p><p className="text-xs text-muted-foreground">{item.item?.item_code}</p></div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.bin?.bin_code || "—"}</TableCell>
                    <TableCell>{item.batch_number || "—"}</TableCell>
                    <TableCell className="text-center">{item.expected_quantity}</TableCell>
                    <TableCell className="text-center">
                      {editingId === item.id ? (
                        <Input type="number" className="w-20 mx-auto" value={editQty} onChange={(e) => setEditQty(Number(e.target.value))} />
                      ) : (
                        <span className={item.counted_quantity !== null ? "" : "text-muted-foreground"}>{item.counted_quantity ?? "—"}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.counted_quantity !== null ? (
                        <span className={`font-medium ${(item.counted_quantity - item.expected_quantity) !== 0 ? "text-destructive" : "text-emerald-600"}`}>
                          {item.counted_quantity - item.expected_quantity}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {count.status !== "completed" && (
                        editingId === item.id ? (
                          <Button size="sm" onClick={() => handleSaveCount(item.id)}>Save</Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(item.id); setEditQty(item.counted_quantity ?? item.expected_quantity); }}>Count</Button>
                        )
                      )}
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

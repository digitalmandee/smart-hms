import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePickList, usePickListItems, useUpdatePickListItem, useUpdatePickList } from "@/hooks/usePickingPacking";
import { ArrowLeft, Check } from "lucide-react";

export default function PickListDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: list } = usePickList(id);
  const { data: items } = usePickListItems(id);
  const updateItem = useUpdatePickListItem();
  const updateList = useUpdatePickList();

  const handlePickItem = async (itemId: string, qtyRequired: number) => {
    await updateItem.mutateAsync({ id: itemId, quantity_picked: qtyRequired, status: "picked", picked_at: new Date().toISOString() });
  };

  const handleComplete = async () => {
    if (!id) return;
    await updateList.mutateAsync({ id, status: "completed", completed_at: new Date().toISOString() });
  };

  const allPicked = items?.every((i) => i.status === "picked");

  return (
    <div className="p-6">
      <PageHeader title={`Pick List ${list?.pick_list_number || ""}`}
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Pick Lists", href: "/app/inventory/picking" }, { label: list?.pick_list_number || "Detail" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/inventory/picking")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            {allPicked && list?.status !== "completed" && <Button onClick={handleComplete}>Complete Pick List</Button>}
          </div>
        }
      />
      <div className="grid gap-4">
        {list && (
          <Card>
            <CardContent className="pt-6 flex gap-6 flex-wrap">
              <div><span className="text-muted-foreground text-sm">Status</span><div><Badge>{list.status}</Badge></div></div>
              <div><span className="text-muted-foreground text-sm">Strategy</span><div><Badge variant="outline">{list.pick_strategy}</Badge></div></div>
              <div><span className="text-muted-foreground text-sm">Priority</span><div>{list.priority}</div></div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader><CardTitle>Items to Pick</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Bin</TableHead><TableHead>Batch</TableHead><TableHead>Required</TableHead><TableHead>Picked</TableHead><TableHead>Status</TableHead><TableHead className="w-[80px]">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.pick_sequence}</TableCell>
                    <TableCell className="font-mono">{item.bin?.bin_code || "—"}</TableCell>
                    <TableCell>{item.batch_number || "—"}</TableCell>
                    <TableCell>{item.quantity_required}</TableCell>
                    <TableCell>{item.quantity_picked}</TableCell>
                    <TableCell><Badge variant={item.status === "picked" ? "default" : "outline"}>{item.status}</Badge></TableCell>
                    <TableCell>{item.status !== "picked" && <Button size="sm" variant="outline" onClick={() => handlePickItem(item.id, item.quantity_required)}><Check className="h-3 w-3 mr-1" />Pick</Button>}</TableCell>
                  </TableRow>
                ))}
                {!items?.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No items</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePickList, usePickListItems, useUpdatePickListItem, useUpdatePickList } from "@/hooks/usePickingPacking";
import { ArrowLeft, Check, Play, SkipForward, Printer } from "lucide-react";
import { usePrint } from "@/hooks/usePrint";
import { PrintablePickList } from "@/components/inventory/PrintablePickList";
import { InlineBarcodeScannerInput } from "@/components/inventory/InlineBarcodeScannerInput";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export default function PickListDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: list } = usePickList(id);
  const { data: items } = usePickListItems(id);
  const updateItem = useUpdatePickListItem();
  const updateList = useUpdatePickList();
  const [partialQty, setPartialQty] = useState<Record<string, number>>({});
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);
  const { printRef, handlePrint } = usePrint();

  const handlePickItem = async (itemId: string, qty: number) => {
    const actualQty = partialQty[itemId] ?? qty;
    await updateItem.mutateAsync({ id: itemId, quantity_picked: actualQty, status: "picked", picked_at: new Date().toISOString() });
  };

  const handleSkipItem = async (itemId: string) => {
    await updateItem.mutateAsync({ id: itemId, status: "picked", quantity_picked: 0, picked_at: new Date().toISOString() });
  };

  const handleStartPicking = async () => {
    if (!id) return;
    await updateList.mutateAsync({ id, status: "in_progress", started_at: new Date().toISOString() });
  };

  const handleComplete = async () => {
    if (!id) return;
    await updateList.mutateAsync({ id, status: "completed", completed_at: new Date().toISOString() });
  };

  const handleScan = useCallback(async (code: string) => {
    if (!items) return;
    // Look up item by barcode/item_code
    const { data: foundItem } = await (supabase as any)
      .from("inventory_items")
      .select("id, name, item_code, barcode")
      .or(`barcode.eq.${code},item_code.eq.${code}`)
      .limit(1)
      .maybeSingle();

    if (!foundItem) {
      toast.error("Item not found for this barcode");
      return;
    }

    // Find matching pending pick list item
    const match = items.find(
      (i) => i.status !== "picked" && i.item_id === foundItem.id
    );

    if (!match) {
      toast.error(`"${foundItem.name}" is not in this pick list or already picked`);
      return;
    }

    // Auto-pick with full quantity
    setHighlightedItem(match.id);
    await handlePickItem(match.id, match.quantity_required);
    toast.success(`Picked: ${foundItem.name} (${match.quantity_required})`);
    setTimeout(() => setHighlightedItem(null), 2000);
  }, [items]);

  const allPicked = items?.every((i) => i.status === "picked");
  const canStart = list?.status === "draft" || list?.status === "assigned";

  return (
    <div className="p-6">
      <PageHeader title={`Pick List ${list?.pick_list_number || ""}`}
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Pick Lists", href: "/app/inventory/picking" }, { label: list?.pick_list_number || "Detail" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/inventory/picking")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            <Button variant="outline" onClick={() => handlePrint({ title: list?.pick_list_number || "Pick List" })}><Printer className="h-4 w-4 mr-2" />Print</Button>
            {canStart && <Button variant="outline" onClick={handleStartPicking}><Play className="h-4 w-4 mr-2" />Start Picking</Button>}
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
              {list.started_at && <div><span className="text-muted-foreground text-sm">Started</span><div>{new Date(list.started_at).toLocaleString()}</div></div>}
              {list.completed_at && <div><span className="text-muted-foreground text-sm">Completed</span><div>{new Date(list.completed_at).toLocaleString()}</div></div>}
            </CardContent>
          </Card>
        )}

        {/* Scanner for picking */}
        {list?.status === "in_progress" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Scan to Pick</CardTitle>
            </CardHeader>
            <CardContent>
              <InlineBarcodeScannerInput
                onScan={handleScan}
                placeholder="Scan barcode to auto-pick item..."
                autoFocus
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Items to Pick ({items?.filter(i => i.status === "picked").length || 0}/{items?.length || 0} picked)</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead><TableHead>Bin</TableHead><TableHead>Batch</TableHead>
                  <TableHead>Required</TableHead><TableHead>Pick Qty</TableHead><TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((item) => (
                  <TableRow key={item.id} className={cn(
                    highlightedItem === item.id && "bg-emerald-100 dark:bg-emerald-900/30 transition-colors duration-500"
                  )}>
                    <TableCell>{item.pick_sequence}</TableCell>
                    <TableCell className="font-mono">{item.bin?.bin_code || "—"}</TableCell>
                    <TableCell>{item.batch_number || "—"}</TableCell>
                    <TableCell>{item.quantity_required}</TableCell>
                    <TableCell>
                      {item.status !== "picked" ? (
                        <Input
                          type="number" min={0} max={item.quantity_required}
                          value={partialQty[item.id] ?? item.quantity_required}
                          onChange={(e) => setPartialQty({ ...partialQty, [item.id]: Number(e.target.value) })}
                          className="w-20"
                        />
                      ) : (
                        item.quantity_picked
                      )}
                    </TableCell>
                    <TableCell><Badge variant={item.status === "picked" ? "default" : "outline"}>{item.status}</Badge></TableCell>
                    <TableCell>
                      {item.status !== "picked" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handlePickItem(item.id, item.quantity_required)}>
                            <Check className="h-3 w-3 mr-1" />Pick
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleSkipItem(item.id)} title="Skip">
                            <SkipForward className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!items?.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No items</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Hidden Printable */}
      {list && items && (
        <div className="hidden">
          <PrintablePickList ref={printRef} pickList={list} items={items} />
        </div>
      )}
    </div>
  );
}

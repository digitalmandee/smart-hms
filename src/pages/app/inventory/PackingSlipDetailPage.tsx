import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePackingSlip, usePackingSlipItems, useUpdatePackingSlip } from "@/hooks/usePickingPacking";
import { ArrowLeft, CheckCircle, Printer, Package } from "lucide-react";
import { usePrint } from "@/hooks/usePrint";
import { PrintablePackingSlip } from "@/components/inventory/PrintablePackingSlip";

export default function PackingSlipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: slip } = usePackingSlip(id);
  const { data: items } = usePackingSlipItems(id);
  const updateSlip = useUpdatePackingSlip();
  const [weight, setWeight] = useState("");
  const [boxCount, setBoxCount] = useState("");
  const { printRef, handlePrint } = usePrint();

  const handleVerify = async () => {
    if (!id) return;
    await updateSlip.mutateAsync({ id, status: "verified", verified_at: new Date().toISOString() });
  };

  const handlePack = async () => {
    if (!id) return;
    const updates: Record<string, unknown> = { id, status: "packed", packed_at: new Date().toISOString() };
    if (weight) updates.total_weight = Number(weight);
    if (boxCount) updates.box_count = Number(boxCount);
    await updateSlip.mutateAsync(updates as Parameters<typeof updateSlip.mutateAsync>[0]);
  };

  return (
    <div className="p-6">
      <PageHeader title={`Packing Slip ${slip?.packing_slip_number || ""}`}
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Packing", href: "/app/inventory/packing" }, { label: slip?.packing_slip_number || "Detail" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/inventory/packing")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            <Button variant="outline" onClick={() => handlePrint({ title: slip?.packing_slip_number || "Packing Slip" })}><Printer className="h-4 w-4 mr-2" />Print</Button>
            {slip?.status === "draft" && <Button variant="outline" onClick={handlePack}><Package className="h-4 w-4 mr-2" />Mark Packed</Button>}
            {slip?.status === "packed" && <Button onClick={handleVerify}><CheckCircle className="h-4 w-4 mr-2" />Verify</Button>}
          </div>
        }
      />
      {slip && (
        <Card className="mb-4">
          <CardContent className="pt-6 flex gap-6 flex-wrap items-end">
            <div><span className="text-muted-foreground text-sm">Status</span><div><Badge>{slip.status}</Badge></div></div>
            <div><span className="text-muted-foreground text-sm">Items</span><div>{slip.total_items}</div></div>
            <div><span className="text-muted-foreground text-sm">Boxes</span><div>{slip.box_count}</div></div>
            <div><span className="text-muted-foreground text-sm">Weight</span><div>{slip.total_weight ? `${slip.total_weight} kg` : "—"}</div></div>
            {slip.status === "draft" && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">Total Weight (kg)</Label>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="kg" className="w-24" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Box Count</Label>
                  <Input type="number" value={boxCount} onChange={(e) => setBoxCount(e.target.value)} placeholder="#" className="w-20" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Packed Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Box #</TableHead><TableHead>Batch</TableHead><TableHead>Quantity</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
            <TableBody>
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.box_number || "—"}</TableCell>
                  <TableCell>{item.batch_number || "—"}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.notes || "—"}</TableCell>
                </TableRow>
              ))}
              {!items?.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No items</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hidden Printable */}
      {slip && items && (
        <div className="hidden">
          <PrintablePackingSlip ref={printRef} slip={slip} items={items} />
        </div>
      )}
    </div>
  );
}

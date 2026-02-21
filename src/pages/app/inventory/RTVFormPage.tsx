import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useCreateRTV } from "@/hooks/useReturnToVendor";
import { useInventoryItems } from "@/hooks/useInventory";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

interface RTVLineItem {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_cost: number;
  reason: string;
  batch_number: string;
}

export default function RTVFormPage() {
  const navigate = useNavigate();
  const { data: vendors } = useVendors();
  const { data: items } = useInventoryItems();
  const createRTV = useCreateRTV();
  const { formatCurrency } = useCurrencyFormatter();

  const [vendorId, setVendorId] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<RTVLineItem[]>([]);

  const addLine = () => {
    setLineItems([...lineItems, { item_id: "", item_name: "", quantity: 1, unit_cost: 0, reason: "", batch_number: "" }]);
  };

  const updateLine = (idx: number, field: keyof RTVLineItem, value: any) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "item_id") {
        const item = items?.find(i => i.id === value);
        if (item) updated[idx].item_name = item.name;
      }
      return updated;
    });
  };

  const removeLine = (idx: number) => setLineItems(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!vendorId || lineItems.length === 0) return;
    const result = await createRTV.mutateAsync({
      vendor_id: vendorId,
      reason: reason || undefined,
      notes: notes || undefined,
      items: lineItems.map(l => ({
        item_id: l.item_id,
        quantity: l.quantity,
        unit_cost: l.unit_cost,
        reason: l.reason || undefined,
        batch_number: l.batch_number || undefined,
      })),
    });
    navigate(`/app/inventory/rtv/${result.id}`);
  };

  const totalValue = lineItems.reduce((sum, l) => sum + l.quantity * l.unit_cost, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="New Return to Vendor" description="Create a return authorization" />
      <Button variant="outline" onClick={() => navigate("/app/inventory/rtv")}>
        <ArrowLeft className="mr-2 h-4 w-4" />Back
      </Button>

      <Card>
        <CardHeader><CardTitle>Return Details</CardTitle></CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Vendor *</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {vendors?.map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.vendor_code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason</Label>
              <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Damaged goods, Wrong items" />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Items to Return</CardTitle>
            <Button size="sm" onClick={addLine}><Plus className="mr-1 h-4 w-4" />Add Item</Button>
          </div>
        </CardHeader>
        <CardContent>
          {lineItems.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Add items to return. Click "Add Item" above.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-24">Qty</TableHead>
                    <TableHead className="w-28">Unit Cost</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="w-20">Total</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((line, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Select value={line.item_id} onValueChange={v => updateLine(idx, "item_id", v)}>
                          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select item" /></SelectTrigger>
                          <SelectContent>
                            {items?.map(i => <SelectItem key={i.id} value={i.id}>{i.name} ({i.item_code})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell><Input type="number" min={1} value={line.quantity} onChange={e => updateLine(idx, "quantity", Number(e.target.value))} /></TableCell>
                      <TableCell><Input type="number" min={0} step={0.01} value={line.unit_cost} onChange={e => updateLine(idx, "unit_cost", Number(e.target.value))} /></TableCell>
                      <TableCell><Input value={line.batch_number} onChange={e => updateLine(idx, "batch_number", e.target.value)} placeholder="Batch" /></TableCell>
                      <TableCell><Input value={line.reason} onChange={e => updateLine(idx, "reason", e.target.value)} placeholder="Reason" /></TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(line.quantity * line.unit_cost)}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => removeLine(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-right">
                <p className="text-sm text-muted-foreground">Total Return Value</p>
                <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/app/inventory/rtv")}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!vendorId || lineItems.length === 0 || createRTV.isPending}>
          {createRTV.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />Create Return
        </Button>
      </div>
    </div>
  );
}

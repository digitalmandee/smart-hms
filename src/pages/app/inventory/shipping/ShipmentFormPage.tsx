import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { useCreateShipment } from "@/hooks/useShipments";
import { ArrowLeft } from "lucide-react";

export default function ShipmentFormPage() {
  const navigate = useNavigate();
  const createShipment = useCreateShipment();
  const [storeId, setStoreId] = useState("");
  const [form, setForm] = useState({
    carrier_name: "", tracking_number: "", shipping_method: "standard",
    destination_type: "store", notes: "", total_weight: "", total_boxes: "",
  });

  const handleSubmit = async () => {
    await createShipment.mutateAsync({
      store_id: storeId, carrier_name: form.carrier_name || null,
      tracking_number: form.tracking_number || null, shipping_method: form.shipping_method,
      destination_type: form.destination_type, notes: form.notes || null,
      total_weight: form.total_weight ? parseFloat(form.total_weight) : null,
      total_boxes: form.total_boxes ? parseInt(form.total_boxes) : null,
      status: "pending",
    } as any);
    navigate("/app/inventory/shipping");
  };

  return (
    <div className="p-6">
      <PageHeader title="New Shipment"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Shipping", href: "/app/inventory/shipping" }, { label: "New" }]}
        actions={<Button variant="outline" onClick={() => navigate("/app/inventory/shipping")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>}
      />
      <Card>
        <CardHeader><CardTitle>Shipment Details</CardTitle></CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div><Label>Warehouse</Label><StoreSelector value={storeId} onChange={setStoreId} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Carrier Name</Label><Input value={form.carrier_name} onChange={(e) => setForm({ ...form, carrier_name: e.target.value })} placeholder="e.g. FedEx" /></div>
            <div><Label>Tracking Number</Label><Input value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Shipping Method</Label><Select value={form.shipping_method} onValueChange={(v) => setForm({ ...form, shipping_method: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="standard">Standard</SelectItem><SelectItem value="express">Express</SelectItem><SelectItem value="same_day">Same Day</SelectItem><SelectItem value="pickup">Pickup</SelectItem></SelectContent></Select></div>
            <div><Label>Destination Type</Label><Select value={form.destination_type} onValueChange={(v) => setForm({ ...form, destination_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="branch">Branch</SelectItem><SelectItem value="store">Store</SelectItem><SelectItem value="external">External</SelectItem><SelectItem value="customer">Customer</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Total Weight (kg)</Label><Input type="number" value={form.total_weight} onChange={(e) => setForm({ ...form, total_weight: e.target.value })} /></div>
            <div><Label>Total Boxes</Label><Input type="number" value={form.total_boxes} onChange={(e) => setForm({ ...form, total_boxes: e.target.value })} /></div>
          </div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <Button onClick={handleSubmit} disabled={!storeId || createShipment.isPending}>Create Shipment</Button>
        </CardContent>
      </Card>
    </div>
  );
}

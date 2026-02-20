import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShipment, useTrackingEvents, useAddTrackingEvent, useUpdateShipment } from "@/hooks/useShipments";
import { ArrowLeft, Plus, MapPin, Printer } from "lucide-react";
import { usePrint } from "@/hooks/usePrint";
import { PrintableShipment } from "@/components/inventory/PrintableShipment";

const EVENT_TYPES = ["picked_up", "in_transit", "out_for_delivery", "delivered", "exception"];

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: shipment } = useShipment(id);
  const { data: events } = useTrackingEvents(id);
  const addEvent = useAddTrackingEvent();
  const updateShipment = useUpdateShipment();
  const { printRef, handlePrint } = usePrint();

  const [eventForm, setEventForm] = useState({ event_type: "in_transit", event_description: "", location: "" });
  const [showEventForm, setShowEventForm] = useState(false);

  const handleAddEvent = async () => {
    if (!id) return;
    await addEvent.mutateAsync({ shipment_id: id, ...eventForm });
    setEventForm({ event_type: "in_transit", event_description: "", location: "" });
    setShowEventForm(false);
    const statusMap: Record<string, string> = { picked_up: "picked_up", in_transit: "in_transit", delivered: "delivered" };
    if (statusMap[eventForm.event_type]) {
      await updateShipment.mutateAsync({ id, status: statusMap[eventForm.event_type] } as any);
    }
  };

  return (
    <div className="p-6">
      <PageHeader title={`Shipment ${shipment?.shipment_number || ""}`}
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Shipping", href: "/app/inventory/shipping" }, { label: shipment?.shipment_number || "Detail" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/inventory/shipping")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            <Button variant="outline" onClick={() => handlePrint({ title: shipment?.shipment_number || "Shipment" })}><Printer className="h-4 w-4 mr-2" />Print</Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {shipment && (
          <Card>
            <CardHeader><CardTitle>Shipment Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge>{shipment.status.replace("_", " ")}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Carrier</span><span>{shipment.carrier_name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tracking</span><span className="font-mono text-sm">{shipment.tracking_number || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Method</span><Badge variant="outline">{shipment.shipping_method}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span>{shipment.total_weight ? `${shipment.total_weight} kg` : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Boxes</span><span>{shipment.total_boxes || "—"}</span></div>
              {shipment.notes && <div><span className="text-muted-foreground">Notes</span><p className="text-sm mt-1">{shipment.notes}</p></div>}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tracking Events</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowEventForm(!showEventForm)}><Plus className="h-3 w-3 mr-1" />Add Event</Button>
          </CardHeader>
          <CardContent>
            {showEventForm && (
              <div className="space-y-3 mb-4 p-3 border rounded-lg">
                <Select value={eventForm.event_type} onValueChange={(v) => setEventForm({ ...eventForm, event_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>)}</SelectContent></Select>
                <Input value={eventForm.event_description} onChange={(e) => setEventForm({ ...eventForm, event_description: e.target.value })} placeholder="Description" />
                <Input value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} placeholder="Location" />
                <Button size="sm" onClick={handleAddEvent} disabled={addEvent.isPending}>Save Event</Button>
              </div>
            )}
            <div className="space-y-3">
              {events?.map((ev) => (
                <div key={ev.id} className="flex gap-3 items-start border-l-2 border-primary pl-3 py-1">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2"><Badge variant="outline" className="text-xs">{ev.event_type.replace("_", " ")}</Badge><span className="text-xs text-muted-foreground">{new Date(ev.event_time).toLocaleString()}</span></div>
                    {ev.event_description && <p className="text-sm mt-1">{ev.event_description}</p>}
                    {ev.location && <p className="text-xs text-muted-foreground">{ev.location}</p>}
                  </div>
                </div>
              ))}
              {!events?.length && <p className="text-sm text-muted-foreground text-center">No tracking events yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden Printable */}
      {shipment && (
        <div className="hidden">
          <PrintableShipment ref={printRef} shipment={shipment} events={events} />
        </div>
      )}
    </div>
  );
}

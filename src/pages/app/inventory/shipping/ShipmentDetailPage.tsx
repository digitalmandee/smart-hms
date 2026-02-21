import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShipment, useTrackingEvents, useAddTrackingEvent, useUpdateShipment } from "@/hooks/useShipments";
import { ArrowLeft, Plus, MapPin, Printer, Truck, CheckCircle, Package, Calendar, DollarSign, Link as LinkIcon } from "lucide-react";
import { usePrint } from "@/hooks/usePrint";
import { PrintableShipment } from "@/components/inventory/PrintableShipment";
import { toast } from "sonner";

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

  const handleMarkDispatched = async () => {
    if (!id) return;
    await updateShipment.mutateAsync({ id, status: "dispatched", dispatched_at: new Date().toISOString() } as any);
    toast.success("Shipment marked as dispatched");
  };

  const handleMarkDelivered = async () => {
    if (!id) return;
    await updateShipment.mutateAsync({ id, status: "delivered", actual_delivery: new Date().toISOString(), received_at: new Date().toISOString() } as any);
    toast.success("Shipment marked as delivered");
  };

  const destAddr = shipment?.destination_address as Record<string, string> | null;

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    dispatched: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    picked_up: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    in_transit: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title={`Shipment ${shipment?.shipment_number || ""}`}
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Shipping", href: "/app/inventory/shipping" }, { label: shipment?.shipment_number || "Detail" }]}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => navigate("/app/inventory/shipping")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            <Button variant="outline" onClick={() => handlePrint({ title: shipment?.shipment_number || "Shipment" })}><Printer className="h-4 w-4 mr-2" />Print</Button>
            {shipment && !["dispatched", "in_transit", "delivered"].includes(shipment.status) && (
              <Button onClick={handleMarkDispatched} className="bg-blue-600 hover:bg-blue-700 text-white"><Truck className="h-4 w-4 mr-2" />Mark Dispatched</Button>
            )}
            {shipment && ["dispatched", "in_transit", "picked_up"].includes(shipment.status) && (
              <Button onClick={handleMarkDelivered} className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="h-4 w-4 mr-2" />Mark Delivered</Button>
            )}
          </div>
        }
      />

      {shipment && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipment Info */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Shipment Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className={statusColors[shipment.status] || ""}>{shipment.status.replace(/_/g, " ")}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Carrier</span><span>{shipment.carrier_name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tracking</span><span className="font-mono text-sm">{shipment.tracking_number || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Method</span><Badge variant="outline">{shipment.shipping_method}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span>{shipment.total_weight ? `${shipment.total_weight} kg` : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Boxes</span><span>{shipment.total_boxes || "—"}</span></div>
              {shipment.shipping_cost != null && (
                <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />Shipping Cost</span><span className="font-semibold">{shipment.shipping_cost.toFixed(2)}</span></div>
              )}
              {shipment.notes && <div><span className="text-muted-foreground">Notes</span><p className="text-sm mt-1">{shipment.notes}</p></div>}
            </CardContent>
          </Card>

          {/* Destination & Dates */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Destination & Dates</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Destination Type</span><span className="capitalize">{shipment.destination_type?.replace(/_/g, " ") || "—"}</span></div>
              {destAddr?.address && <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="text-sm text-right max-w-[60%]">{destAddr.address}</span></div>}
              {destAddr?.city && <div className="flex justify-between"><span className="text-muted-foreground">City</span><span>{destAddr.city}{destAddr.state ? `, ${destAddr.state}` : ""}</span></div>}
              {shipment.estimated_delivery && <div className="flex justify-between"><span className="text-muted-foreground">Est. Delivery</span><span>{new Date(shipment.estimated_delivery).toLocaleDateString()}</span></div>}
              {shipment.actual_delivery && <div className="flex justify-between"><span className="text-muted-foreground">Actual Delivery</span><span className="text-green-600 font-medium">{new Date(shipment.actual_delivery).toLocaleDateString()}</span></div>}
              {shipment.dispatched_at && <div className="flex justify-between"><span className="text-muted-foreground">Dispatched At</span><span className="text-sm">{new Date(shipment.dispatched_at).toLocaleString()}</span></div>}
              {shipment.received_at && <div className="flex justify-between"><span className="text-muted-foreground">Received At</span><span className="text-sm">{new Date(shipment.received_at).toLocaleString()}</span></div>}
              {shipment.received_by_name && <div className="flex justify-between"><span className="text-muted-foreground">Received By</span><span>{shipment.received_by_name}</span></div>}

              {/* Links */}
              {shipment.packing_slip_id && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Packing Slip</span>
                  <Button variant="link" size="sm" className="h-auto p-0" onClick={() => navigate(`/app/inventory/packing/${shipment.packing_slip_id}`)}>
                    <LinkIcon className="h-3 w-3 mr-1" />View Packing Slip
                  </Button>
                </div>
              )}
              {shipment.transfer_id && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Transfer</span>
                  <Button variant="link" size="sm" className="h-auto p-0" onClick={() => navigate(`/app/inventory/transfers/${shipment.transfer_id}`)}>
                    <LinkIcon className="h-3 w-3 mr-1" />View Transfer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tracking Events */}
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
            {!events?.length && <p className="text-sm text-muted-foreground text-center py-6">No tracking events yet</p>}
          </div>
        </CardContent>
      </Card>

      {/* Hidden Printable */}
      {shipment && (
        <div className="hidden">
          <PrintableShipment ref={printRef} shipment={shipment} events={events} />
        </div>
      )}
    </div>
  );
}

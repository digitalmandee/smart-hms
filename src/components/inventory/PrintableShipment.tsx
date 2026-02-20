import { forwardRef } from "react";
import type { Shipment, TrackingEvent } from "@/hooks/useShipments";

interface PrintableShipmentProps {
  shipment: Shipment;
  events?: TrackingEvent[];
  organizationName?: string;
}

export const PrintableShipment = forwardRef<HTMLDivElement, PrintableShipmentProps>(
  ({ shipment, events, organizationName = "Warehouse" }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-4">
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">{organizationName}</h1>
          <h2 className="text-lg font-semibold mt-2">SHIPMENT / DELIVERY NOTE</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm"><strong>Shipment #:</strong> {shipment.shipment_number}</p>
            <p className="text-sm"><strong>Carrier:</strong> {shipment.carrier_name || "—"}</p>
            <p className="text-sm"><strong>Tracking:</strong> {shipment.tracking_number || "—"}</p>
            <p className="text-sm"><strong>Method:</strong> {shipment.shipping_method}</p>
          </div>
          <div className="text-right">
            <p className="text-sm"><strong>Status:</strong> {shipment.status.replace("_", " ").toUpperCase()}</p>
            <p className="text-sm"><strong>Weight:</strong> {shipment.total_weight ? `${shipment.total_weight} kg` : "—"}</p>
            <p className="text-sm"><strong>Boxes:</strong> {shipment.total_boxes || "—"}</p>
            {shipment.estimated_delivery && <p className="text-sm"><strong>ETA:</strong> {new Date(shipment.estimated_delivery).toLocaleDateString()}</p>}
          </div>
        </div>

        {shipment.notes && (
          <div className="border p-4 mb-6">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm whitespace-pre-line">{shipment.notes}</p>
          </div>
        )}

        {events && events.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Tracking History</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm">Date/Time</th>
                  <th className="text-left py-2 text-sm">Event</th>
                  <th className="text-left py-2 text-sm">Location</th>
                  <th className="text-left py-2 text-sm">Description</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-b">
                    <td className="py-2 text-sm">{new Date(ev.event_time).toLocaleString()}</td>
                    <td className="py-2 text-sm capitalize">{ev.event_type.replace("_", " ")}</td>
                    <td className="py-2 text-sm">{ev.location || "—"}</td>
                    <td className="py-2 text-sm">{ev.event_description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Dispatched By</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Driver / Carrier</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Received By</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintableShipment.displayName = "PrintableShipment";

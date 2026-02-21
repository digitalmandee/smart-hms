import { forwardRef } from "react";
import type { Shipment, TrackingEvent } from "@/hooks/useShipments";

interface PrintableShipmentProps {
  shipment: Shipment;
  events?: TrackingEvent[];
  organizationName?: string;
}

export const PrintableShipment = forwardRef<HTMLDivElement, PrintableShipmentProps>(
  ({ shipment, events, organizationName = "Warehouse" }, ref) => {
    const destAddr = shipment.destination_address as Record<string, string> | null;

    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-4" style={{ fontFamily: "Inter, Arial, sans-serif", fontSize: "11pt", lineHeight: "1.6" }}>
        {/* Header */}
        <div style={{ textAlign: "center", borderBottom: "3px solid #0d9488", paddingBottom: "12px", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "22pt", fontWeight: 700, color: "#0d9488", margin: 0 }}>{organizationName}</h1>
          <h2 style={{ fontSize: "14pt", fontWeight: 600, margin: "6px 0 0", letterSpacing: "2px" }}>DELIVERY NOTE</h2>
        </div>

        {/* Two-column info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          {/* Left - Shipment Info */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "12px" }}>
            <h3 style={{ fontSize: "10pt", fontWeight: 600, color: "#0d9488", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px", marginBottom: "8px" }}>Shipment Details</h3>
            <table style={{ width: "100%", fontSize: "10pt" }}>
              <tbody>
                <tr><td style={{ color: "#666", padding: "2px 8px 2px 0", width: "120px" }}>Shipment #</td><td style={{ fontWeight: 600 }}>{shipment.shipment_number}</td></tr>
                <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Status</td><td style={{ fontWeight: 500 }}>{shipment.status.replace(/_/g, " ").toUpperCase()}</td></tr>
                <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Carrier</td><td>{shipment.carrier_name || "—"}</td></tr>
                <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Tracking #</td><td style={{ fontFamily: "monospace" }}>{shipment.tracking_number || "—"}</td></tr>
                <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Method</td><td>{shipment.shipping_method}</td></tr>
                <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Weight</td><td>{shipment.total_weight ? `${shipment.total_weight} kg` : "—"}</td></tr>
                <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Boxes</td><td>{shipment.total_boxes || "—"}</td></tr>
                {shipment.shipping_cost != null && <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Shipping Cost</td><td style={{ fontWeight: 500 }}>{shipment.shipping_cost.toFixed(2)}</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Right - Destination & Dates */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "12px" }}>
            <h3 style={{ fontSize: "10pt", fontWeight: 600, color: "#0d9488", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px", marginBottom: "8px" }}>Destination & Dates</h3>
            <table style={{ width: "100%", fontSize: "10pt" }}>
              <tbody>
                <tr><td style={{ color: "#666", padding: "2px 8px 2px 0", width: "120px" }}>Destination</td><td>{shipment.destination_type?.replace(/_/g, " ") || "—"}</td></tr>
                {destAddr?.address && <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Address</td><td>{destAddr.address}</td></tr>}
                {destAddr?.city && <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>City</td><td>{destAddr.city}{destAddr.state ? `, ${destAddr.state}` : ""}</td></tr>}
                {shipment.estimated_delivery && <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Est. Delivery</td><td>{new Date(shipment.estimated_delivery).toLocaleDateString()}</td></tr>}
                {shipment.actual_delivery && <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Actual Delivery</td><td>{new Date(shipment.actual_delivery).toLocaleDateString()}</td></tr>}
                {shipment.dispatched_at && <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Dispatched</td><td>{new Date(shipment.dispatched_at).toLocaleString()}</td></tr>}
                {shipment.received_at && <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Received</td><td>{new Date(shipment.received_at).toLocaleString()}</td></tr>}
                {shipment.received_by_name && <tr><td style={{ color: "#666", padding: "2px 8px 2px 0" }}>Received By</td><td>{shipment.received_by_name}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {shipment.notes && (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "12px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "10pt", fontWeight: 600, color: "#0d9488", marginBottom: "6px" }}>Notes</h3>
            <p style={{ fontSize: "10pt", whiteSpace: "pre-line" }}>{shipment.notes}</p>
          </div>
        )}

        {/* Tracking History */}
        {events && events.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "10pt", fontWeight: 600, color: "#0d9488", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px", marginBottom: "8px" }}>Tracking History</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "2px solid #e5e7eb", fontWeight: 600 }}>Date/Time</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "2px solid #e5e7eb", fontWeight: 600 }}>Event</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "2px solid #e5e7eb", fontWeight: 600 }}>Location</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "2px solid #e5e7eb", fontWeight: 600 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>{new Date(ev.event_time).toLocaleString()}</td>
                    <td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6", textTransform: "capitalize" }}>{ev.event_type.replace(/_/g, " ")}</td>
                    <td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>{ev.location || "—"}</td>
                    <td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>{ev.event_description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature Blocks */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "40px", marginTop: "50px" }}>
          {["Dispatched By", "Driver / Carrier", "Received By"].map((label) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1.5px solid #333", paddingTop: "8px", marginTop: "40px" }}>
                <p style={{ fontSize: "9pt", fontWeight: 600 }}>{label}</p>
                <p style={{ fontSize: "8pt", color: "#999", marginTop: "2px" }}>Name & Signature</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "30px", paddingTop: "8px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", fontSize: "8pt", color: "#999" }}>
          <span>{shipment.shipment_number}</span>
          <span>Printed: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    );
  }
);

PrintableShipment.displayName = "PrintableShipment";

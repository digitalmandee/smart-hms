import { forwardRef } from "react";
import type { PackingSlip, PackingSlipItem } from "@/hooks/usePickingPacking";

interface PrintablePackingSlipProps {
  slip: PackingSlip;
  items: PackingSlipItem[];
  organizationName?: string;
}

export const PrintablePackingSlip = forwardRef<HTMLDivElement, PrintablePackingSlipProps>(
  ({ slip, items, organizationName = "Warehouse" }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-4">
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">{organizationName}</h1>
          <h2 className="text-lg font-semibold mt-2">PACKING SLIP</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm"><strong>Packing Slip #:</strong> {slip.packing_slip_number}</p>
            <p className="text-sm"><strong>Total Items:</strong> {slip.total_items}</p>
            <p className="text-sm"><strong>Box Count:</strong> {slip.box_count}</p>
          </div>
          <div className="text-right">
            <p className="text-sm"><strong>Status:</strong> {slip.status.toUpperCase()}</p>
            <p className="text-sm"><strong>Weight:</strong> {slip.total_weight ? `${slip.total_weight} kg` : "—"}</p>
            {slip.packed_at && <p className="text-sm"><strong>Packed:</strong> {new Date(slip.packed_at).toLocaleString()}</p>}
          </div>
        </div>

        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-sm">#</th>
              <th className="text-center py-2 text-sm">Box #</th>
              <th className="text-left py-2 text-sm">Batch</th>
              <th className="text-center py-2 text-sm">Quantity</th>
              <th className="text-left py-2 text-sm">Notes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index} className="border-b">
                <td className="py-2 text-sm">{index + 1}</td>
                <td className="text-center py-2 text-sm">{item.box_number || "—"}</td>
                <td className="py-2 text-sm">{item.batch_number || "—"}</td>
                <td className="text-center py-2 text-sm">{item.quantity}</td>
                <td className="py-2 text-sm">{item.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {slip.notes && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm whitespace-pre-line">{slip.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Packed By</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Verified By</p>
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

PrintablePackingSlip.displayName = "PrintablePackingSlip";

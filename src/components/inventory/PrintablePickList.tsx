import { forwardRef } from "react";
import type { PickList, PickListItem } from "@/hooks/usePickingPacking";

interface PrintablePickListProps {
  pickList: PickList;
  items: PickListItem[];
  organizationName?: string;
}

export const PrintablePickList = forwardRef<HTMLDivElement, PrintablePickListProps>(
  ({ pickList, items, organizationName = "Warehouse" }, ref) => {
    const picked = items.filter(i => i.status === "picked").length;

    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-4">
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">{organizationName}</h1>
          <h2 className="text-lg font-semibold mt-2">PICK LIST</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm"><strong>Pick List #:</strong> {pickList.pick_list_number}</p>
            <p className="text-sm"><strong>Strategy:</strong> {pickList.pick_strategy}</p>
            <p className="text-sm"><strong>Priority:</strong> {pickList.priority}</p>
          </div>
          <div className="text-right">
            <p className="text-sm"><strong>Status:</strong> {pickList.status.toUpperCase()}</p>
            <p className="text-sm"><strong>Progress:</strong> {picked}/{items.length} picked</p>
            {pickList.started_at && <p className="text-sm"><strong>Started:</strong> {new Date(pickList.started_at).toLocaleString()}</p>}
          </div>
        </div>

        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-sm">Seq</th>
              <th className="text-left py-2 text-sm">Bin Location</th>
              <th className="text-left py-2 text-sm">Batch</th>
              <th className="text-center py-2 text-sm">Required</th>
              <th className="text-center py-2 text-sm">Picked</th>
              <th className="text-center py-2 text-sm">✓</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index} className="border-b">
                <td className="py-2 text-sm">{item.pick_sequence}</td>
                <td className="py-2 text-sm font-mono">{item.bin?.bin_code || "—"}</td>
                <td className="py-2 text-sm">{item.batch_number || "—"}</td>
                <td className="text-center py-2 text-sm">{item.quantity_required}</td>
                <td className="text-center py-2 text-sm">{item.status === "picked" ? item.quantity_picked : "___"}</td>
                <td className="text-center py-2 text-sm">{item.status === "picked" ? "✓" : "☐"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {pickList.notes && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm whitespace-pre-line">{pickList.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 mt-12">
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Picker Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Verified By</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintablePickList.displayName = "PrintablePickList";

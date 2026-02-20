import { forwardRef } from "react";
import type { StoreTransfer } from "@/hooks/useStoreTransfers";
import { format } from "date-fns";

interface PrintableTransferProps {
  transfer: StoreTransfer;
  organizationName?: string;
}

export const PrintableTransfer = forwardRef<HTMLDivElement, PrintableTransferProps>(
  ({ transfer, organizationName = "Warehouse" }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-4">
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">{organizationName}</h1>
          <h2 className="text-lg font-semibold mt-2">INTER-STORE TRANSFER</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm"><strong>Transfer #:</strong> {transfer.transfer_number}</p>
            <p className="text-sm"><strong>Date:</strong> {format(new Date(transfer.created_at), "dd/MM/yyyy")}</p>
            <p className="text-sm"><strong>Requested By:</strong> {transfer.requested_by_profile?.full_name || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm"><strong>Status:</strong> {transfer.status.replace("_", " ").toUpperCase()}</p>
            <p className="text-sm"><strong>From:</strong> {transfer.from_store?.name}</p>
            <p className="text-sm"><strong>To:</strong> {transfer.to_store?.name}</p>
          </div>
        </div>

        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-sm">#</th>
              <th className="text-left py-2 text-sm">Item</th>
              <th className="text-center py-2 text-sm">Requested</th>
              <th className="text-center py-2 text-sm">Sent</th>
              <th className="text-center py-2 text-sm">Received</th>
            </tr>
          </thead>
          <tbody>
            {transfer.items?.map((item, index) => (
              <tr key={item.id || index} className="border-b">
                <td className="py-2 text-sm">{index + 1}</td>
                <td className="py-2 text-sm">
                  <p className="font-medium">{item.item?.name}</p>
                  <p className="text-xs text-gray-600">{item.item?.item_code}</p>
                </td>
                <td className="text-center py-2 text-sm">{item.quantity_requested}</td>
                <td className="text-center py-2 text-sm">{item.quantity_sent}</td>
                <td className="text-center py-2 text-sm">{item.quantity_received}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {transfer.notes && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm whitespace-pre-line">{transfer.notes}</p>
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
              <p className="text-sm font-medium">Approved By</p>
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

PrintableTransfer.displayName = "PrintableTransfer";

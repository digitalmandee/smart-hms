import { forwardRef } from "react";
import type { GoodsReceivedNote } from "@/hooks/useGRN";
import { format } from "date-fns";

interface PrintableGRNProps {
  grn: GoodsReceivedNote;
  organizationName?: string;
  currencySymbol?: string;
}

export const PrintableGRN = forwardRef<HTMLDivElement, PrintableGRNProps>(
  ({ grn, organizationName = "Hospital", currencySymbol = "Rs." }, ref) => {
    const totalValue = grn.items?.reduce((sum, item) => 
      sum + (item.quantity_accepted * item.unit_cost), 0
    ) || 0;

    const fc = (amount: number) => `${currencySymbol} ${amount.toLocaleString()}`;

    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-4">
        {/* Header */}
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">{organizationName}</h1>
          <h2 className="text-lg font-semibold mt-2">GOODS RECEIVED NOTE</h2>
        </div>

        {/* GRN Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm"><strong>GRN Number:</strong> {grn.grn_number}</p>
            <p className="text-sm"><strong>Received Date:</strong> {format(new Date(grn.received_date), "dd/MM/yyyy")}</p>
            {grn.purchase_order && (
              <p className="text-sm"><strong>PO Reference:</strong> {grn.purchase_order.po_number}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm"><strong>Branch:</strong> {grn.branch?.name}</p>
            <p className="text-sm"><strong>Status:</strong> {grn.status.replace("_", " ").toUpperCase()}</p>
            {grn.invoice_number && (
              <p className="text-sm"><strong>Invoice #:</strong> {grn.invoice_number}</p>
            )}
          </div>
        </div>

        {/* Vendor Info */}
        <div className="border p-4 mb-6">
          <h3 className="font-semibold mb-2">Vendor Details</h3>
          <p className="text-sm"><strong>Name:</strong> {grn.vendor?.name}</p>
          <p className="text-sm"><strong>Code:</strong> {grn.vendor?.vendor_code}</p>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-sm">#</th>
              <th className="text-left py-2 text-sm">Item</th>
              <th className="text-center py-2 text-sm">Batch</th>
              <th className="text-center py-2 text-sm">Expiry</th>
              <th className="text-center py-2 text-sm">Received</th>
              <th className="text-center py-2 text-sm">Accepted</th>
              <th className="text-center py-2 text-sm">Rejected</th>
              <th className="text-right py-2 text-sm">Unit Cost</th>
              <th className="text-right py-2 text-sm">Value</th>
            </tr>
          </thead>
          <tbody>
            {grn.items?.map((item, index) => (
              <tr key={item.id || index} className="border-b">
                <td className="py-2 text-sm">{index + 1}</td>
                <td className="py-2 text-sm">
                  <div>
                    <p className="font-medium">{item.item?.name}</p>
                    <p className="text-xs text-gray-600">{item.item?.item_code}</p>
                  </div>
                </td>
                <td className="text-center py-2 text-sm">{item.batch_number || "-"}</td>
                <td className="text-center py-2 text-sm">
                  {item.expiry_date ? format(new Date(item.expiry_date), "MM/yyyy") : "-"}
                </td>
                <td className="text-center py-2 text-sm">{item.quantity_received}</td>
                <td className="text-center py-2 text-sm font-medium text-green-600">{item.quantity_accepted}</td>
                <td className="text-center py-2 text-sm font-medium text-red-600">{item.quantity_rejected}</td>
                <td className="text-right py-2 text-sm">{fc(item.unit_cost)}</td>
                <td className="text-right py-2 text-sm">
                  {fc(item.quantity_accepted * item.unit_cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-2 font-bold border-t">
              <span>Total Value:</span>
              <span>{fc(totalValue)}</span>
            </div>
            {grn.invoice_amount && (
              <div className="flex justify-between py-1 text-sm">
                <span>Invoice Amount:</span>
                <span>{fc(grn.invoice_amount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {grn.notes && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm whitespace-pre-line">{grn.notes}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Received By</p>
              <p className="text-xs">{grn.received_by_profile?.full_name || "-"}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Verified By</p>
              <p className="text-xs">{grn.verified_by_profile?.full_name || "-"}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Store In-Charge</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintableGRN.displayName = "PrintableGRN";

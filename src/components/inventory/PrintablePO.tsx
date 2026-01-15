import { forwardRef } from "react";
import type { PurchaseOrder } from "@/hooks/usePurchaseOrders";
import { format } from "date-fns";

interface PrintablePOProps {
  po: PurchaseOrder;
  organizationName?: string;
}

export const PrintablePO = forwardRef<HTMLDivElement, PrintablePOProps>(
  ({ po, organizationName = "Hospital" }, ref) => {
    const subtotal = po.items?.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const discount = itemSubtotal * (item.discount_percent / 100);
      return sum + (itemSubtotal - discount);
    }, 0) || 0;

    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-4">
        {/* Header */}
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">{organizationName}</h1>
          <h2 className="text-lg font-semibold mt-2">PURCHASE ORDER</h2>
        </div>

        {/* PO Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm"><strong>PO Number:</strong> {po.po_number}</p>
            <p className="text-sm"><strong>Order Date:</strong> {format(new Date(po.order_date), "dd/MM/yyyy")}</p>
            {po.expected_delivery_date && (
              <p className="text-sm">
                <strong>Expected Delivery:</strong> {format(new Date(po.expected_delivery_date), "dd/MM/yyyy")}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm"><strong>Branch:</strong> {po.branch?.name}</p>
            <p className="text-sm"><strong>Status:</strong> {po.status.replace("_", " ").toUpperCase()}</p>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="border p-4 mb-6">
          <h3 className="font-semibold mb-2">Vendor Details</h3>
          <p className="text-sm"><strong>Name:</strong> {po.vendor?.name}</p>
          <p className="text-sm"><strong>Code:</strong> {po.vendor?.vendor_code}</p>
          {po.vendor?.address && <p className="text-sm"><strong>Address:</strong> {po.vendor.address}</p>}
          {po.vendor?.phone && <p className="text-sm"><strong>Phone:</strong> {po.vendor.phone}</p>}
          {po.vendor?.email && <p className="text-sm"><strong>Email:</strong> {po.vendor.email}</p>}
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-sm">#</th>
              <th className="text-left py-2 text-sm">Item</th>
              <th className="text-center py-2 text-sm">Qty</th>
              <th className="text-right py-2 text-sm">Unit Price</th>
              <th className="text-center py-2 text-sm">Tax %</th>
              <th className="text-center py-2 text-sm">Disc %</th>
              <th className="text-right py-2 text-sm">Total</th>
            </tr>
          </thead>
          <tbody>
            {po.items?.map((item, index) => (
              <tr key={item.id || index} className="border-b">
                <td className="py-2 text-sm">{index + 1}</td>
                <td className="py-2 text-sm">
                  <div>
                    <p className="font-medium">{item.item?.name}</p>
                    <p className="text-xs text-gray-600">{item.item?.item_code}</p>
                  </div>
                </td>
                <td className="text-center py-2 text-sm">{item.quantity} {item.item?.unit_of_measure}</td>
                <td className="text-right py-2 text-sm">Rs. {item.unit_price.toLocaleString()}</td>
                <td className="text-center py-2 text-sm">{item.tax_percent}%</td>
                <td className="text-center py-2 text-sm">{item.discount_percent}%</td>
                <td className="text-right py-2 text-sm">Rs. {item.total_price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-1 text-sm">
              <span>Subtotal:</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span>Tax:</span>
              <span>Rs. {po.tax_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span>Discount:</span>
              <span>Rs. {po.discount_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 font-bold border-t">
              <span>Grand Total:</span>
              <span>Rs. {po.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        {po.terms && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Terms & Conditions</h3>
            <p className="text-sm whitespace-pre-line">{po.terms}</p>
          </div>
        )}

        {/* Notes */}
        {po.notes && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm whitespace-pre-line">{po.notes}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Prepared By</p>
              <p className="text-xs">{po.created_by_profile?.full_name || "-"}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Approved By</p>
              <p className="text-xs">{po.approved_by_profile?.full_name || "-"}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Vendor Signature</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintablePO.displayName = "PrintablePO";

import { forwardRef } from "react";
import type { PurchaseRequest } from "@/hooks/usePurchaseRequests";
import { format } from "date-fns";

interface PrintablePRProps {
  pr: PurchaseRequest;
  organizationName?: string;
  currencySymbol?: string;
}

export const PrintablePR = forwardRef<HTMLDivElement, PrintablePRProps>(
  ({ pr, organizationName = "Warehouse", currencySymbol = "Rs." }, ref) => {
    const fc = (amount: number) => `${currencySymbol} ${amount.toLocaleString()}`;
    const totalEstimated = pr.items?.reduce(
      (sum, item) => sum + item.quantity_requested * item.estimated_unit_cost, 0
    ) || 0;

    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-4">
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">{organizationName}</h1>
          <h2 className="text-lg font-semibold mt-2">PURCHASE REQUEST</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm"><strong>PR Number:</strong> {pr.pr_number}</p>
            <p className="text-sm"><strong>Date:</strong> {format(new Date(pr.created_at), "dd/MM/yyyy")}</p>
            <p className="text-sm"><strong>Department:</strong> {pr.department || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm"><strong>Status:</strong> {pr.status.replace("_", " ").toUpperCase()}</p>
            <p className="text-sm"><strong>Priority:</strong> {pr.priority >= 2 ? "High" : pr.priority === 1 ? "Medium" : "Normal"}</p>
            <p className="text-sm"><strong>Branch:</strong> {pr.branch?.name}</p>
          </div>
        </div>

        <div className="border p-4 mb-6">
          <h3 className="font-semibold mb-2">Requester</h3>
          <p className="text-sm">{pr.requested_by_profile?.full_name || "—"}</p>
        </div>

        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-sm">#</th>
              <th className="text-left py-2 text-sm">Item</th>
              <th className="text-center py-2 text-sm">Qty Requested</th>
              <th className="text-right py-2 text-sm">Est. Unit Cost</th>
              <th className="text-right py-2 text-sm">Est. Total</th>
            </tr>
          </thead>
          <tbody>
            {pr.items?.map((item, index) => (
              <tr key={item.id || index} className="border-b">
                <td className="py-2 text-sm">{index + 1}</td>
                <td className="py-2 text-sm">
                  <p className="font-medium">{item.item?.name}</p>
                  <p className="text-xs text-gray-600">{item.item?.item_code}</p>
                </td>
                <td className="text-center py-2 text-sm">{item.quantity_requested}</td>
                <td className="text-right py-2 text-sm">{fc(item.estimated_unit_cost)}</td>
                <td className="text-right py-2 text-sm">{fc(item.quantity_requested * item.estimated_unit_cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-2 font-bold border-t">
              <span>Estimated Total:</span>
              <span>{fc(totalEstimated)}</span>
            </div>
          </div>
        </div>

        {pr.notes && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm whitespace-pre-line">{pr.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Requested By</p>
              <p className="text-xs">{pr.requested_by_profile?.full_name || "—"}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Approved By</p>
              <p className="text-xs">{pr.approved_by_profile?.full_name || "—"}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Store Manager</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintablePR.displayName = "PrintablePR";

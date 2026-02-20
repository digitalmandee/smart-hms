import { forwardRef } from "react";
import type { StockRequisition } from "@/hooks/useRequisitions";
import { format } from "date-fns";

interface PrintableRequisitionProps {
  requisition: StockRequisition;
  organizationName?: string;
}

export const PrintableRequisition = forwardRef<HTMLDivElement, PrintableRequisitionProps>(
  ({ requisition, organizationName = "Warehouse" }, ref) => {
    const priorityLabel = requisition.priority >= 3 ? "URGENT" : requisition.priority >= 2 ? "HIGH" : requisition.priority >= 1 ? "NORMAL" : "LOW";

    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-4">
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">{organizationName}</h1>
          <h2 className="text-lg font-semibold mt-2">STOCK REQUISITION</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm"><strong>Requisition #:</strong> {requisition.requisition_number}</p>
            <p className="text-sm"><strong>Date:</strong> {format(new Date(requisition.created_at!), "dd/MM/yyyy")}</p>
            <p className="text-sm"><strong>Department:</strong> {requisition.department?.name || "—"}</p>
            <p className="text-sm"><strong>Priority:</strong> {priorityLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-sm"><strong>Status:</strong> {requisition.status.toUpperCase()}</p>
            <p className="text-sm"><strong>Branch:</strong> {requisition.branch?.name}</p>
            <p className="text-sm"><strong>Requested By:</strong> {requisition.requested_by_profile?.full_name || "—"}</p>
            {requisition.required_date && <p className="text-sm"><strong>Required By:</strong> {format(new Date(requisition.required_date), "dd/MM/yyyy")}</p>}
          </div>
        </div>

        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-sm">#</th>
              <th className="text-left py-2 text-sm">Item</th>
              <th className="text-center py-2 text-sm">Requested</th>
              <th className="text-center py-2 text-sm">Approved</th>
              <th className="text-center py-2 text-sm">Issued</th>
              <th className="text-left py-2 text-sm">Notes</th>
            </tr>
          </thead>
          <tbody>
            {requisition.items?.map((item, index) => (
              <tr key={item.id || index} className="border-b">
                <td className="py-2 text-sm">{index + 1}</td>
                <td className="py-2 text-sm">
                  <p className="font-medium">{item.item?.name}</p>
                  <p className="text-xs text-gray-600">{item.item?.item_code}</p>
                </td>
                <td className="text-center py-2 text-sm">{item.quantity_requested}</td>
                <td className="text-center py-2 text-sm">{item.quantity_approved || 0}</td>
                <td className="text-center py-2 text-sm">{item.quantity_issued || 0}</td>
                <td className="py-2 text-sm">{item.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {requisition.notes && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Justification / Notes</h3>
            <p className="text-sm whitespace-pre-line">{requisition.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Requested By</p>
              <p className="text-xs">{requisition.requested_by_profile?.full_name || "—"}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Approved By</p>
              <p className="text-xs">{requisition.approved_by_profile?.full_name || "—"}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">Issued By</p>
              <p className="text-xs">{requisition.issued_by_profile?.full_name || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintableRequisition.displayName = "PrintableRequisition";

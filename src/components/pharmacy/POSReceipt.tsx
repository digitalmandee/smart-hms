import { forwardRef } from "react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

export interface POSReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
  batch_number?: string;
  expiry_date?: string;
}

export interface POSReceiptData {
  receipt_number: string;
  date: Date;
  cashier_name: string;
  patient_name?: string;
  patient_mr?: string;
  prescription_number?: string;
  items: POSReceiptItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  payment_method: string;
  amount_paid: number;
  change: number;
  organization_name: string;
  organization_address?: string;
  organization_phone?: string;
  receipt_header?: string;
  receipt_footer?: string;
}

interface POSReceiptProps {
  data: POSReceiptData;
}

export const POSReceipt = forwardRef<HTMLDivElement, POSReceiptProps>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white text-black p-4 w-[300px] font-mono text-xs"
        style={{ fontFamily: "monospace" }}
      >
        {/* Header */}
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm uppercase">{data.organization_name}</h2>
          {data.organization_address && (
            <p className="text-[10px]">{data.organization_address}</p>
          )}
          {data.organization_phone && (
            <p className="text-[10px]">Tel: {data.organization_phone}</p>
          )}
          {data.receipt_header && (
            <p className="text-[10px] mt-1 whitespace-pre-line">{data.receipt_header}</p>
          )}
        </div>

        <Separator className="my-2 border-dashed" />

        {/* Receipt Info */}
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>Receipt #:</span>
            <span className="font-medium">{data.receipt_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{format(data.date, "dd MMM yyyy HH:mm")}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{data.cashier_name}</span>
          </div>
        </div>

        {/* Patient Info (if applicable) */}
        {(data.patient_name || data.patient_mr || data.prescription_number) && (
          <>
            <Separator className="my-2 border-dashed" />
            <div className="space-y-0.5 text-[10px]">
              {data.patient_name && (
                <div className="flex justify-between">
                  <span>Patient:</span>
                  <span>{data.patient_name}</span>
                </div>
              )}
              {data.patient_mr && (
                <div className="flex justify-between">
                  <span>MR#:</span>
                  <span className="font-medium">{data.patient_mr}</span>
                </div>
              )}
              {data.prescription_number && (
                <div className="flex justify-between">
                  <span>Rx#:</span>
                  <span>{data.prescription_number}</span>
                </div>
              )}
            </div>
          </>
        )}

        <Separator className="my-2 border-dashed" />

        {/* Items Header */}
        <div className="flex justify-between font-bold text-[10px] mb-1">
          <span className="flex-1">ITEM</span>
          <span className="w-8 text-center">QTY</span>
          <span className="w-14 text-right">PRICE</span>
          <span className="w-16 text-right">AMOUNT</span>
        </div>

        {/* Items */}
        <div className="space-y-1">
          {data.items.map((item) => (
            <div key={item.id}>
              <div className="flex justify-between text-[10px]">
                <span className="flex-1 truncate pr-1">{item.name}</span>
                <span className="w-8 text-center">{item.quantity}</span>
                <span className="w-14 text-right">{item.unit_price.toFixed(2)}</span>
                <span className="w-16 text-right">{item.total.toFixed(2)}</span>
              </div>
              {(item.batch_number || item.expiry_date) && (
                <div className="text-[9px] text-gray-600 pl-2">
                  {item.batch_number && <span>Batch: {item.batch_number}</span>}
                  {item.batch_number && item.expiry_date && <span> | </span>}
                  {item.expiry_date && <span>Exp: {item.expiry_date}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator className="my-2 border-dashed" />

        {/* Totals */}
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{data.subtotal.toFixed(2)}</span>
          </div>
          {data.tax_rate > 0 && (
            <div className="flex justify-between">
              <span>Tax ({data.tax_rate}%):</span>
              <span>{data.tax_amount.toFixed(2)}</span>
            </div>
          )}
          {data.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-{data.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed">
            <span>TOTAL:</span>
            <span>Rs. {data.total.toFixed(2)}</span>
          </div>
        </div>

        <Separator className="my-2 border-dashed" />

        {/* Payment */}
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>Payment ({data.payment_method}):</span>
            <span>{data.amount_paid.toFixed(2)}</span>
          </div>
          {data.change > 0 && (
            <div className="flex justify-between">
              <span>Change:</span>
              <span>{data.change.toFixed(2)}</span>
            </div>
          )}
        </div>

        <Separator className="my-2 border-dashed" />

        {/* Footer */}
        <div className="text-center text-[10px] mt-3">
          <p className="whitespace-pre-line">
            {data.receipt_footer || "Thank you for your purchase!"}
          </p>
        </div>
      </div>
    );
  }
);

POSReceipt.displayName = "POSReceipt";

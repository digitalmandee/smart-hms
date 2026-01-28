import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Download, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { useOrganizationBranding } from "@/hooks/useOrganizationBranding";

interface SettlementReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settlement: {
    settlementNumber: string;
    doctorName: string;
    employeeNumber: string;
    totalAmount: number;
    breakdown: {
      consultations: number;
      surgeries: number;
      procedures: number;
      other: number;
    };
    paymentMethod: string;
    referenceNumber?: string;
    settledBy: string;
    date: Date;
  };
}

export function SettlementReceiptDialog({
  open,
  onOpenChange,
  settlement,
}: SettlementReceiptDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { data: branding } = useOrganizationBranding();

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Settlement Receipt - ${settlement.settlementNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { height: 50px; margin-bottom: 10px; }
          .org-name { font-size: 18px; font-weight: bold; margin: 0; }
          .subtitle { font-size: 12px; color: #666; }
          .receipt-title { text-align: center; font-size: 16px; font-weight: bold; margin: 20px 0; border: 2px dashed #000; padding: 10px; }
          .info-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
          .label { color: #666; }
          .value { font-weight: 500; }
          .divider { border-top: 1px dashed #ccc; margin: 15px 0; }
          .total-row { font-size: 18px; font-weight: bold; background: #f5f5f5; padding: 10px; margin: 15px 0; }
          .footer { text-align: center; font-size: 11px; color: #666; margin-top: 30px; }
          .success-icon { text-align: center; color: green; font-size: 24px; margin: 20px 0; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${branding?.logo_url ? `<img src="${branding.logo_url}" class="logo" alt="Logo" />` : ""}
          <p class="org-name">${branding?.name || "SmartHMS"}</p>
          <p class="subtitle">${branding?.address || ""}</p>
        </div>
        
        <div class="receipt-title">COMMISSION SETTLEMENT RECEIPT</div>
        
        <div class="success-icon">✓</div>
        
        <div class="info-row">
          <span class="label">Receipt #:</span>
          <span class="value">${settlement.settlementNumber}</span>
        </div>
        <div class="info-row">
          <span class="label">Date:</span>
          <span class="value">${format(settlement.date, "MMM dd, yyyy")}</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-row">
          <span class="label">Doctor:</span>
          <span class="value">${settlement.doctorName}</span>
        </div>
        <div class="info-row">
          <span class="label">Employee #:</span>
          <span class="value">${settlement.employeeNumber}</span>
        </div>
        
        <div class="divider"></div>
        
        <p style="font-weight: bold; margin-bottom: 10px;">Earnings Breakdown:</p>
        ${settlement.breakdown.consultations > 0 ? `
          <div class="info-row">
            <span class="label">Consultations:</span>
            <span class="value">${formatCurrency(settlement.breakdown.consultations)}</span>
          </div>
        ` : ""}
        ${settlement.breakdown.surgeries > 0 ? `
          <div class="info-row">
            <span class="label">Surgeries:</span>
            <span class="value">${formatCurrency(settlement.breakdown.surgeries)}</span>
          </div>
        ` : ""}
        ${settlement.breakdown.procedures > 0 ? `
          <div class="info-row">
            <span class="label">Procedures:</span>
            <span class="value">${formatCurrency(settlement.breakdown.procedures)}</span>
          </div>
        ` : ""}
        ${settlement.breakdown.other > 0 ? `
          <div class="info-row">
            <span class="label">Other:</span>
            <span class="value">${formatCurrency(settlement.breakdown.other)}</span>
          </div>
        ` : ""}
        
        <div class="total-row">
          <div class="info-row" style="margin: 0;">
            <span>TOTAL SETTLED:</span>
            <span>${formatCurrency(settlement.totalAmount)}</span>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-row">
          <span class="label">Payment Method:</span>
          <span class="value">${settlement.paymentMethod}</span>
        </div>
        ${settlement.referenceNumber ? `
          <div class="info-row">
            <span class="label">Reference:</span>
            <span class="value">${settlement.referenceNumber}</span>
          </div>
        ` : ""}
        <div class="info-row">
          <span class="label">Settled By:</span>
          <span class="value">${settlement.settledBy}</span>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated receipt.</p>
          <p>Generated on ${format(new Date(), "MMM dd, yyyy 'at' h:mm a")}</p>
        </div>
        
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Settlement Complete
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="space-y-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Settlement Number</p>
            <p className="text-xl font-bold text-green-700">{settlement.settlementNumber}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Doctor:</span>
              <span className="font-medium">{settlement.doctorName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date:</span>
              <span>{format(settlement.date, "MMM dd, yyyy")}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="font-medium text-sm">Breakdown:</p>
            {settlement.breakdown.consultations > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Consultations</span>
                <span>{formatCurrency(settlement.breakdown.consultations)}</span>
              </div>
            )}
            {settlement.breakdown.surgeries > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Surgeries</span>
                <span>{formatCurrency(settlement.breakdown.surgeries)}</span>
              </div>
            )}
            {settlement.breakdown.procedures > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Procedures</span>
                <span>{formatCurrency(settlement.breakdown.procedures)}</span>
              </div>
            )}
            {settlement.breakdown.other > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Other</span>
                <span>{formatCurrency(settlement.breakdown.other)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
            <span className="font-semibold">Total Settled:</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(settlement.totalAmount)}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <span>{settlement.paymentMethod}</span>
            </div>
            {settlement.referenceNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference:</span>
                <span>{settlement.referenceNumber}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

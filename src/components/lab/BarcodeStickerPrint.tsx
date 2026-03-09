import { useRef, useEffect, useCallback } from "react";
import JsBarcode from "jsbarcode";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface BarcodeStickerPrintProps {
  sampleNumber: string;
  patientName: string;
  patientNumber: string;
  patientAge?: number | null;
  patientGender?: string | null;
  orderNumber: string;
  testNames: string[];
  orderDate: string;
}

export function BarcodeStickerPrint({
  sampleNumber,
  patientName,
  patientNumber,
  patientAge,
  patientGender,
  orderNumber,
  testNames,
  orderDate,
}: BarcodeStickerPrintProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && sampleNumber) {
      try {
        JsBarcode(barcodeRef.current, sampleNumber, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 12,
          margin: 4,
          font: "monospace",
        });
      } catch {
        // Invalid barcode value
      }
    }
  }, [sampleNumber]);

  const handlePrintSticker = useCallback(() => {
    if (!sampleNumber) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print");
      return;
    }

    const testsText = testNames.join(", ");
    const demographics = [
      patientAge != null ? `${patientAge}Y` : "",
      patientGender || "",
    ].filter(Boolean).join(" / ");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode Sticker - ${sampleNumber}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page {
              size: 50mm 25mm;
              margin: 1mm;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              width: 48mm;
              padding: 1mm;
            }
            .sticker {
              width: 100%;
              border: 0.3mm dashed #ccc;
              padding: 1.5mm;
              page-break-after: always;
            }
            .patient-name {
              font-size: 8pt;
              font-weight: 700;
              line-height: 1.1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .info-row {
              font-size: 6pt;
              color: #333;
              line-height: 1.2;
              display: flex;
              justify-content: space-between;
            }
            .barcode-container {
              text-align: center;
              margin: 1mm 0;
            }
            .barcode-container svg {
              width: 100%;
              height: auto;
              max-height: 14mm;
            }
            .tests {
              font-size: 5.5pt;
              color: #555;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              line-height: 1.1;
            }
            @media print {
              .sticker { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="sticker">
            <div class="patient-name">${patientName}</div>
            <div class="info-row">
              <span>${patientNumber}${demographics ? " • " + demographics : ""}</span>
              <span>${orderDate}</span>
            </div>
            <div class="barcode-container">
              <svg id="barcode"></svg>
            </div>
            <div class="tests">Tests: ${testsText}</div>
          </div>
          <script>
            try {
              JsBarcode("#barcode", "${sampleNumber}", {
                format: "CODE128",
                width: 2,
                height: 40,
                displayValue: true,
                fontSize: 10,
                margin: 2,
                font: "monospace"
              });
            } catch(e) {}
            window.onload = function() {
              setTimeout(function() { window.print(); }, 300);
              window.onafterprint = function() { window.close(); };
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [sampleNumber, patientName, patientNumber, patientAge, patientGender, orderNumber, testNames, orderDate]);

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="border border-dashed border-muted-foreground/30 rounded-md p-3 bg-background max-w-[280px]">
        <p className="text-xs font-bold truncate">{patientName}</p>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{patientNumber}{patientAge != null ? ` • ${patientAge}Y` : ""}{patientGender ? ` • ${patientGender}` : ""}</span>
          <span>{orderDate}</span>
        </div>
        <div className="flex justify-center my-1">
          <svg ref={barcodeRef} />
        </div>
        <p className="text-[10px] text-muted-foreground truncate">
          Tests: {testNames.join(", ")}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handlePrintSticker}
        disabled={!sampleNumber.trim()}
      >
        <Printer className="h-4 w-4 mr-2" />
        Print Barcode Sticker
      </Button>
    </div>
  );
}

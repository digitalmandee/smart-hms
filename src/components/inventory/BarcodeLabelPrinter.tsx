import { useRef, useEffect, useCallback } from "react";
import JsBarcode from "jsbarcode";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface BarcodeLabelProps {
  itemCode: string;
  itemName: string;
  barcode?: string | null;
  batchNumber?: string;
  expiryDate?: string;
  unitOfMeasure?: string;
  showDownload?: boolean;
}

export function BarcodeLabel({
  itemCode,
  itemName,
  barcode,
  batchNumber,
  expiryDate,
  unitOfMeasure,
  showDownload = true,
}: BarcodeLabelProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const barcodeValue = barcode || itemCode;

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, barcodeValue, {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: true,
          fontSize: 10,
          margin: 2,
        });
      } catch {
        // Invalid barcode value
      }
    }
  }, [barcodeValue]);

  const handleDownloadPng = useCallback(async () => {
    if (!labelRef.current) return;
    try {
      const dataUrl = await toPng(labelRef.current, { backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `barcode-${itemCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      console.error("Failed to download barcode label");
    }
  }, [itemCode]);

  return (
    <div className="relative group">
      <div
        ref={labelRef}
        className="border border-border rounded p-3 bg-background text-foreground w-[280px] text-xs print:border-black"
      >
        <div className="font-bold text-sm truncate mb-1">{itemName}</div>
        <div className="flex justify-between text-muted-foreground mb-1">
          <span>Code: {itemCode}</span>
          {unitOfMeasure && <span>UOM: {unitOfMeasure}</span>}
        </div>
        <div className="flex justify-center my-1">
          <svg ref={barcodeRef} />
        </div>
        <div className="flex justify-between text-muted-foreground">
          {batchNumber && <span>Batch: {batchNumber}</span>}
          {expiryDate && <span>Exp: {expiryDate}</span>}
        </div>
      </div>
      {showDownload && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
          onClick={handleDownloadPng}
          title="Download as PNG"
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

interface BarcodeLabelPrinterProps {
  labels: BarcodeLabelProps[];
}

export function BarcodeLabelPrinter({ labels }: BarcodeLabelPrinterProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
      {labels.map((label, i) => (
        <BarcodeLabel key={i} {...label} />
      ))}
    </div>
  );
}

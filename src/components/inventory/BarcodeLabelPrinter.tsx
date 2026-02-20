import { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeLabelProps {
  itemCode: string;
  itemName: string;
  barcode?: string | null;
  batchNumber?: string;
  expiryDate?: string;
  unitOfMeasure?: string;
}

export function BarcodeLabel({
  itemCode,
  itemName,
  barcode,
  batchNumber,
  expiryDate,
  unitOfMeasure,
}: BarcodeLabelProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
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
        // Invalid barcode value, leave SVG empty
      }
    }
  }, [barcodeValue]);

  return (
    <div className="border border-border rounded p-3 bg-background text-foreground w-[280px] text-xs print:border-black">
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

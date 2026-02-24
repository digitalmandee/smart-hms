import { useRef, useEffect, useCallback } from "react";
import JsBarcode from "jsbarcode";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BloodGroupBadge } from "./BloodGroupBadge";
import { useTranslation, useDirection } from "@/lib/i18n";
import { format, parseISO } from "date-fns";
import type { BloodInventory } from "@/hooks/useBloodBank";

const componentLabels: Record<string, string> = {
  whole_blood: "Whole Blood",
  packed_rbc: "Packed RBC",
  fresh_frozen_plasma: "FFP",
  platelet_concentrate: "Platelet Conc.",
  cryoprecipitate: "Cryoprecipitate",
  granulocytes: "Granulocytes",
};

interface BloodBagLabelProps {
  unit: BloodInventory;
  showDownload?: boolean;
}

export function BloodBagLabel({ unit, showDownload = true }: BloodBagLabelProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const dir = useDirection();

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, unit.unit_number, {
          format: "CODE128",
          width: 1.5,
          height: 36,
          displayValue: true,
          fontSize: 9,
          margin: 2,
        });
      } catch {
        // invalid barcode
      }
    }
  }, [unit.unit_number]);

  const handleDownloadPng = useCallback(async () => {
    if (!labelRef.current) return;
    try {
      const dataUrl = await toPng(labelRef.current, { backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `blood-label-${unit.unit_number}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      console.error("Failed to download label");
    }
  }, [unit.unit_number]);

  return (
    <div className="relative group">
      <div
        ref={labelRef}
        dir={dir}
        className="border-2 border-destructive/30 rounded-lg p-3 bg-background text-foreground w-[300px] text-xs print:border-black print:border-2"
      >
        {/* Header: Blood Group + Component */}
        <div className="flex items-center justify-between mb-2">
          <BloodGroupBadge group={unit.blood_group} size="lg" showIcon />
          <span className="text-[10px] font-semibold bg-muted px-2 py-0.5 rounded">
            {componentLabels[unit.component_type] || unit.component_type}
          </span>
        </div>

        {/* Barcode */}
        <div className="flex justify-center my-1">
          <svg ref={barcodeRef} />
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-[10px]">
          <LabelField label={t("bb.unitNumber")} value={unit.unit_number} />
          <LabelField label={t("bb.volume")} value={`${unit.volume_ml} ml`} />
          <LabelField
            label={t("bb.collectionDate")}
            value={format(parseISO(unit.collection_date), "dd/MM/yyyy")}
          />
          <LabelField
            label={t("bb.expiryDate")}
            value={format(parseISO(unit.expiry_date), "dd/MM/yyyy")}
          />
          {unit.bag_number && (
            <LabelField label={t("bb.bagNumber")} value={unit.bag_number} />
          )}
          <LabelField
            label={t("bb.storageLocation")}
            value={unit.storage_location || "-"}
          />
        </div>
      </div>

      {showDownload && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
          onClick={handleDownloadPng}
          title={t("common.download")}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

function LabelField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </div>
  );
}

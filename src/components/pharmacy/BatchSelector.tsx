import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";
import { useTranslation } from "@/lib/i18n";

type MedicineInventory = Database["public"]["Tables"]["medicine_inventory"]["Row"];

interface BatchSelectorProps {
  batches: MedicineInventory[];
  selectedBatchId?: string;
  onSelect: (batchId: string) => void;
  disabled?: boolean;
}

export function BatchSelector({ batches, selectedBatchId, onSelect, disabled }: BatchSelectorProps) {
  const { t } = useTranslation();
  
  if (batches.length === 0) {
    return <div className="text-sm text-destructive">{t('pharmacy.noStockAvailable' as any)}</div>;
  }

  return (
    <Select value={selectedBatchId} onValueChange={onSelect} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t('pharmacy.selectBatch' as any)} />
      </SelectTrigger>
      <SelectContent>
        {batches.map((batch) => (
          <SelectItem key={batch.id} value={batch.id}>
            <div className="flex items-center justify-between gap-4">
              <span>{batch.batch_number || t('pharmacy.noBatchNumber' as any)}</span>
              <span className="text-muted-foreground">
                {t('pharmacy.qty' as any)}: {batch.quantity} | 
                {batch.expiry_date && (
                  <span className={new Date(batch.expiry_date) < new Date() ? "text-destructive ml-1" : "ml-1"}>
                    {t('pharmacy.exp' as any)}: {format(new Date(batch.expiry_date), "MMM yyyy")}
                  </span>
                )}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

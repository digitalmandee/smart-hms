import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";

interface StockLevelBadgeProps {
  quantity: number;
  reorderLevel?: number;
}

export function StockLevelBadge({ quantity, reorderLevel = 10 }: StockLevelBadgeProps) {
  const { t } = useTranslation();
  
  if (quantity <= 0) {
    return <Badge variant="destructive">{t('pharmacy.outOfStock' as any)}</Badge>;
  }
  
  if (quantity <= reorderLevel) {
    return <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50">{t('pharmacy.lowStock' as any)}</Badge>;
  }
  
  return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">{t('pharmacy.inStock' as any)}</Badge>;
}

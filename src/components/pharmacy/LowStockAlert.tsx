import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

interface LowStockAlertProps {
  count: number;
}

export function LowStockAlert({ count }: LowStockAlertProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (count === 0) return null;

  return (
    <Alert variant="destructive" className="border-orange-200 bg-orange-50 text-orange-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{t('pharmacy.lowStockAlert' as any)}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{count} {t('pharmacy.medicinesRunningLow' as any)}</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/app/pharmacy/inventory?filter=lowStock")}
          className="ml-4"
        >
          {t('pharmacy.viewItems' as any)}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

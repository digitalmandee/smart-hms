import { Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DoctorAvatar } from "@/components/ai/DoctorAvatar";
import { useTranslation } from "@/lib/i18n";

interface ExpiryAlertProps {
  count: number;
}

export function ExpiryAlert({ count }: ExpiryAlertProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (count === 0) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800">
      <div className="flex items-start gap-2">
        <DoctorAvatar size="xs" state="idle" />
        <div className="flex-1">
          <AlertTitle className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {t('pharmacy.expiryAlert' as any)}
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between mt-1">
            <span>{count} {t('pharmacy.itemsExpiringWithin30Days' as any)}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/app/pharmacy/inventory?filter=expiring")}
              className="ml-4 shrink-0"
            >
              {t('pharmacy.viewItems' as any)}
            </Button>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

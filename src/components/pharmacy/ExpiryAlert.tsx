import { Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DoctorAvatar } from "@/components/ai/DoctorAvatar";

interface ExpiryAlertProps {
  count: number;
}

export function ExpiryAlert({ count }: ExpiryAlertProps) {
  const navigate = useNavigate();

  if (count === 0) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800">
      <div className="flex items-start gap-2">
        <DoctorAvatar size="xs" state="idle" />
        <div className="flex-1">
          <AlertTitle className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Tabeebi Expiry Alert
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between mt-1">
            <span>{count} item(s) expiring within 30 days. Consider running a discount promotion or bundling them.</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/app/pharmacy/inventory?filter=expiring")}
              className="ml-4 shrink-0"
            >
              View Items
            </Button>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

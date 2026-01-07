import { Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ExpiryAlertProps {
  count: number;
}

export function ExpiryAlert({ count }: ExpiryAlertProps) {
  const navigate = useNavigate();

  if (count === 0) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800">
      <Clock className="h-4 w-4" />
      <AlertTitle>Expiry Warning</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{count} item(s) expiring within 30 days.</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/app/pharmacy/inventory?filter=expiring")}
          className="ml-4"
        >
          View Items
        </Button>
      </AlertDescription>
    </Alert>
  );
}

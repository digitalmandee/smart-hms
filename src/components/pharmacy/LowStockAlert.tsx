import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LowStockAlertProps {
  count: number;
}

export function LowStockAlert({ count }: LowStockAlertProps) {
  const navigate = useNavigate();

  if (count === 0) return null;

  return (
    <Alert variant="destructive" className="border-orange-200 bg-orange-50 text-orange-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Low Stock Alert</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{count} medicine(s) are running low on stock.</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/app/pharmacy/inventory?filter=lowStock")}
          className="ml-4"
        >
          View Items
        </Button>
      </AlertDescription>
    </Alert>
  );
}

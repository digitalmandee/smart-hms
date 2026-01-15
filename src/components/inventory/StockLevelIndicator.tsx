import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface StockLevelIndicatorProps {
  currentStock: number;
  reorderLevel: number;
  minimumStock: number;
  showLabel?: boolean;
}

export function StockLevelIndicator({ 
  currentStock, 
  reorderLevel, 
  minimumStock,
  showLabel = true 
}: StockLevelIndicatorProps) {
  const isCritical = currentStock <= minimumStock;
  const isLow = currentStock <= reorderLevel && currentStock > minimumStock;
  const isOk = currentStock > reorderLevel;
  
  return (
    <div className="flex items-center gap-2">
      {isCritical && (
        <>
          <XCircle className="h-4 w-4 text-destructive" />
          {showLabel && <span className="text-sm text-destructive font-medium">Critical</span>}
        </>
      )}
      {isLow && (
        <>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          {showLabel && <span className="text-sm text-yellow-600 font-medium">Low Stock</span>}
        </>
      )}
      {isOk && (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          {showLabel && <span className="text-sm text-green-600 font-medium">In Stock</span>}
        </>
      )}
      <span className={cn(
        "text-sm font-medium",
        isCritical && "text-destructive",
        isLow && "text-yellow-600",
        isOk && "text-green-600"
      )}>
        ({currentStock})
      </span>
    </div>
  );
}

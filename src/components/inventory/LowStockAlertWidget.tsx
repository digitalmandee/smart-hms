import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useLowStockItems } from "@/hooks/useInventory";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function LowStockAlertWidget() {
  const { data: lowStockItems, isLoading } = useLowStockItems();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const items = lowStockItems?.slice(0, 5) || [];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No low stock items</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.item_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-destructive">
                    {item.total_stock} / {item.reorder_level}
                  </p>
                  <p className="text-xs text-muted-foreground">Current / Reorder</p>
                </div>
              </div>
            ))}
            {(lowStockItems?.length || 0) > 5 && (
              <Button variant="link" asChild className="p-0 h-auto">
                <Link to="/app/inventory/stock">
                  View all {lowStockItems?.length} items →
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

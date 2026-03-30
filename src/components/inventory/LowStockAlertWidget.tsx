import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useLowStockItems } from "@/hooks/useInventory";
import { useLowStockItems as usePharmacyLowStock } from "@/hooks/usePharmacy";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function LowStockAlertWidget() {
  const { roles } = useAuth();
  const isPharmacist = roles.includes("pharmacist");

  const { data: generalLowStock, isLoading: generalLoading } = useLowStockItems();
  const { data: pharmacyLowStock, isLoading: pharmacyLoading } = usePharmacyLowStock();

  const isLoading = isPharmacist ? pharmacyLoading : generalLoading;

  // Normalize items for display
  const items = isPharmacist
    ? (pharmacyLowStock?.slice(0, 5) || []).map((item: any) => ({
        id: item.id,
        name: item.medicine?.name || "Unknown",
        code: item.batch_number || "",
        current: item.quantity || 0,
        reorder: item.reorder_level || 10,
      }))
    : (generalLowStock?.slice(0, 5) || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        code: item.item_code,
        current: item.total_stock,
        reorder: item.reorder_level,
      }));

  const totalCount = isPharmacist
    ? pharmacyLowStock?.length || 0
    : generalLowStock?.length || 0;

  const linkTo = isPharmacist
    ? "/app/pharmacy/stock-alerts"
    : "/app/inventory/stock";

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
                  <p className="text-xs text-muted-foreground">{item.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-destructive">
                    {item.current} / {item.reorder}
                  </p>
                  <p className="text-xs text-muted-foreground">Current / Reorder</p>
                </div>
              </div>
            ))}
            {totalCount > 5 && (
              <Button variant="link" asChild className="p-0 h-auto">
                <Link to={linkTo}>
                  View all {totalCount} items →
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

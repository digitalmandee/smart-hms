import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pill, AlertTriangle, Clock, ArrowRight, Package } from "lucide-react";
import { useDashboardPharmacy } from "@/hooks/usePharmacy";
import { format, differenceInDays } from "date-fns";

export function PharmacyAlertsWidget() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboardPharmacy();

  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const { lowStockItems = [], expiringItems = [], pendingPrescriptions = 0 } = data || {};

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Pharmacy Alerts
            </CardTitle>
            <CardDescription>Stock levels and expiry warnings</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/pharmacy/inventory")}>
            View Inventory
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-center">
            <Package className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold">{lowStockItems.length}</p>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
            <Clock className="h-4 w-4 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold">{expiringItems.length}</p>
            <p className="text-xs text-muted-foreground">Expiring Soon</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <Pill className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{pendingPrescriptions}</p>
            <p className="text-xs text-muted-foreground">To Dispense</p>
          </div>
        </div>

        {/* Low Stock Items */}
        {lowStockItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Low Stock Items
            </h4>
            <div className="space-y-2 max-h-28 overflow-y-auto">
              {lowStockItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-md bg-warning/5 border border-warning/20"
                >
                  <div>
                    <p className="text-sm font-medium">{item.medicine?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.medicine?.strength} • Batch: {item.batch_number || "N/A"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-warning border-warning">
                    {item.quantity} left
                  </Badge>
                </div>
              ))}
              {lowStockItems.length > 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate("/app/pharmacy/inventory?filter=lowStock")}
                >
                  View all {lowStockItems.length} low stock items
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Expiring Items */}
        {expiringItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-destructive" />
              Expiring Soon (30 days)
            </h4>
            <div className="space-y-2 max-h-28 overflow-y-auto">
              {expiringItems.slice(0, 4).map((item) => {
                const daysUntilExpiry = item.expiry_date
                  ? differenceInDays(new Date(item.expiry_date), new Date())
                  : 0;
                const isExpired = daysUntilExpiry < 0;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded-md border ${
                      isExpired
                        ? "bg-destructive/10 border-destructive/30"
                        : "bg-destructive/5 border-destructive/20"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">{item.medicine?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Batch: {item.batch_number || "N/A"} • Qty: {item.quantity}
                      </p>
                    </div>
                    <Badge
                      variant={isExpired ? "destructive" : "outline"}
                      className={isExpired ? "" : "text-destructive border-destructive"}
                    >
                      {isExpired
                        ? "Expired"
                        : daysUntilExpiry === 0
                        ? "Today"
                        : `${daysUntilExpiry}d left`}
                    </Badge>
                  </div>
                );
              })}
              {expiringItems.length > 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-destructive hover:text-destructive"
                  onClick={() => navigate("/app/pharmacy/inventory?filter=expiring")}
                >
                  View all {expiringItems.length} expiring items
                </Button>
              )}
            </div>
          </div>
        )}

        {/* All Clear State */}
        {lowStockItems.length === 0 && expiringItems.length === 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
            <div className="p-2 rounded-md bg-success/10">
              <Package className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-success">Inventory looks good!</p>
              <p className="text-xs text-muted-foreground">No stock alerts at this time</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

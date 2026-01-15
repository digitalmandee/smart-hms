import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react";
import { useAvailableBloodStock } from "@/hooks/useBloodBank";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { BloodGroupType } from "@/hooks/useBloodBank";

const bloodGroups: BloodGroupType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const getStockLevel = (count: number): 'critical' | 'low' | 'adequate' | 'good' => {
  if (count === 0) return 'critical';
  if (count <= 2) return 'low';
  if (count <= 5) return 'adequate';
  return 'good';
};

const stockColors = {
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  low: 'bg-warning/10 text-warning border-warning/20',
  adequate: 'bg-primary/10 text-primary border-primary/20',
  good: 'bg-success/10 text-success border-success/20',
};

interface BloodStockWidgetProps {
  compact?: boolean;
}

export function BloodStockWidget({ compact = false }: BloodStockWidgetProps) {
  const { data: stock, isLoading } = useAvailableBloodStock();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Blood Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUnits = stock ? Object.values(stock).reduce((a, b) => a + b, 0) : 0;

  return (
    <Card>
      <CardHeader className={cn("pb-2", compact && "p-3")}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Droplets className="h-4 w-4 text-destructive" />
            Blood Stock
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {totalUnits} units available
          </span>
        </div>
      </CardHeader>
      <CardContent className={compact ? "p-3 pt-0" : undefined}>
        <div className="grid grid-cols-4 gap-2">
          {bloodGroups.map((group) => {
            const count = stock?.[group] || 0;
            const level = getStockLevel(count);
            return (
              <div 
                key={group}
                className={cn(
                  "rounded-lg p-2 text-center border",
                  stockColors[level]
                )}
              >
                <div className="text-lg font-bold">{count}</div>
                <div className="text-xs font-mono">{group}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

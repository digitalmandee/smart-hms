import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  Package,
  Calendar,
  Filter,
  RefreshCw,
  FileDown
} from "lucide-react";
import { format, subDays } from "date-fns";
import { useStockMovements, useStockMovementSummary, MovementType } from "@/hooks/useStockMovements";
import { cn } from "@/lib/utils";

const movementTypeConfig: Record<MovementType, { label: string; color: string; icon: "in" | "out" }> = {
  grn: { label: "GRN Receipt", color: "bg-green-500", icon: "in" },
  sale: { label: "POS Sale", color: "bg-blue-500", icon: "out" },
  dispense: { label: "Dispensed", color: "bg-purple-500", icon: "out" },
  adjustment: { label: "Adjustment", color: "bg-amber-500", icon: "in" },
  return: { label: "Return", color: "bg-cyan-500", icon: "in" },
  transfer_in: { label: "Transfer In", color: "bg-emerald-500", icon: "in" },
  transfer_out: { label: "Transfer Out", color: "bg-orange-500", icon: "out" },
  expired: { label: "Expired", color: "bg-red-500", icon: "out" },
  damaged: { label: "Damaged", color: "bg-red-600", icon: "out" },
  opening: { label: "Opening Stock", color: "bg-slate-500", icon: "in" },
};

export default function StockMovementsPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");

  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);
  const [movementType, setMovementType] = useState<MovementType | "all">("all");

  const { data: movements, isLoading, refetch } = useStockMovements(undefined, {
    startDate,
    endDate,
    movementType: movementType === "all" ? undefined : movementType,
  });

  const { data: summary } = useStockMovementSummary(undefined, startDate, endDate);

  const totalIn = movements?.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0) || 0;
  const totalOut = movements?.filter(m => m.quantity < 0).reduce((sum, m) => sum + Math.abs(m.quantity), 0) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Movements"
        description="Track all inventory movements - sales, receipts, adjustments, and more"
        breadcrumbs={[
          { label: "Pharmacy", href: "/app/pharmacy" },
          { label: "Stock Movements" },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Movements</p>
                <p className="text-2xl font-bold">{movements?.length || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowLeftRight className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock In</p>
                <p className="text-2xl font-bold text-green-600">+{totalIn}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock Out</p>
                <p className="text-2xl font-bold text-red-600">-{totalOut}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Change</p>
                <p className={cn(
                  "text-2xl font-bold",
                  totalIn - totalOut >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {totalIn - totalOut >= 0 ? "+" : ""}{totalIn - totalOut}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Movement Type</Label>
              <Select value={movementType} onValueChange={(v) => setMovementType(v as MovementType | "all")}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(movementTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Movement Log</CardTitle>
            <Button variant="outline" size="sm" disabled>
              <FileDown className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : movements && movements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => {
                  const config = movementTypeConfig[movement.movement_type];
                  const isIn = movement.quantity > 0;

                  return (
                    <TableRow key={movement.id}>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(movement.created_at), "dd MMM, HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {movement.medicine?.name || "Unknown"}
                          </p>
                          {movement.medicine?.generic_name && (
                            <p className="text-xs text-muted-foreground">
                              {movement.medicine.generic_name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={cn("text-xs text-white", config?.color)}
                        >
                          {config?.label || movement.movement_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-semibold",
                          isIn ? "text-green-600" : "text-red-600"
                        )}>
                          {isIn ? "+" : ""}{movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movement.batch_number || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.reference_number || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movement.creator?.full_name || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowLeftRight className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No stock movements found</p>
              <p className="text-sm">Try adjusting your date range or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, ShoppingCart, Package } from "lucide-react";
import { useReorderAlerts } from "@/hooks/useReorderAlerts";

export default function ReorderAlertsPage() {
  const navigate = useNavigate();
  const { data: alerts, isLoading } = useReorderAlerts();

  const handleCreatePR = () => {
    // Navigate to PR form - user can select items there
    navigate("/app/inventory/purchase-requests/new");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reorder Alerts"
        description="Items below reorder level that need restocking"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{alerts?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Items Below Reorder Level</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {alerts?.filter((a) => a.current_stock === 0).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleCreatePR} className="w-full h-full py-4">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Create Purchase Request
            </Button>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Items Requiring Reorder</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Current Stock</TableHead>
                  <TableHead className="text-center">Reorder Level</TableHead>
                  <TableHead className="text-center">Deficit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      All items are above reorder levels
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts?.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-mono text-sm">{alert.item_code}</TableCell>
                      <TableCell className="font-medium">{alert.name}</TableCell>
                      <TableCell>{alert.category?.name || "—"}</TableCell>
                      <TableCell className="text-center">
                        <span className={alert.current_stock === 0 ? "text-red-600 font-bold" : ""}>
                          {alert.current_stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{alert.reorder_level}</TableCell>
                      <TableCell className="text-center font-medium text-amber-600">
                        {alert.deficit}
                      </TableCell>
                      <TableCell>
                        {alert.current_stock === 0 ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : (
                          <Badge variant="default" className="bg-amber-500">Low Stock</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShipments } from "@/hooks/useShipments";
import { useNavigate } from "react-router-dom";
import { Truck, Package, CheckCircle, Clock, Plus, Eye, ArrowRight } from "lucide-react";

export default function DispatchDashboardPage() {
  const [storeId, setStoreId] = useState("");
  const { data: shipments } = useShipments(storeId);
  const navigate = useNavigate();

  const today = new Date().toDateString();
  const todayShipments = shipments?.filter((s) => new Date(s.created_at).toDateString() === today) || [];
  const pending = shipments?.filter((s) => s.status === "pending").length || 0;
  const inTransit = shipments?.filter((s) => s.status === "in_transit").length || 0;
  const delivered = shipments?.filter((s) => s.status === "delivered").length || 0;

  const recentShipments = shipments?.slice(0, 10) || [];

  const stats = [
    { label: "Today's Dispatches", value: todayShipments.length, icon: Truck, color: "text-blue-500" },
    { label: "Pending", value: pending, icon: Clock, color: "text-orange-500" },
    { label: "In Transit", value: inTransit, icon: Package, color: "text-purple-500" },
    { label: "Delivered", value: delivered, icon: CheckCircle, color: "text-green-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Dispatch Dashboard" description="Overview of today's dispatch operations"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Dispatch Dashboard" }]}
        actions={
          <div className="flex items-center gap-3">
            <StoreSelector value={storeId} onChange={setStoreId} showAll className="w-[220px]" />
            <Button onClick={() => navigate("/app/inventory/shipping/new")}><Plus className="h-4 w-4 mr-2" />New Shipment</Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Shipments</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate("/app/inventory/shipping")}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentShipments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="h-8 w-8 mx-auto mb-2" />
              <p>No shipments yet. Create your first shipment to get started.</p>
              <Button className="mt-3" onClick={() => navigate("/app/inventory/shipping/new")}><Plus className="h-4 w-4 mr-2" />New Shipment</Button>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Carrier</TableHead><TableHead>Tracking</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="w-[80px]">View</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentShipments.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono">{s.shipment_number}</TableCell>
                    <TableCell>{s.carrier_name || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{s.tracking_number || "—"}</TableCell>
                    <TableCell><Badge>{s.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => navigate(`/app/inventory/shipping/${s.id}`)}><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

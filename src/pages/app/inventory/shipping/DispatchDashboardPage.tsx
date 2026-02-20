import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShipments } from "@/hooks/useShipments";
import { Truck, Package, CheckCircle, Clock } from "lucide-react";

export default function DispatchDashboardPage() {
  const [storeId, setStoreId] = useState("");
  const { data: shipments } = useShipments(storeId);

  const today = new Date().toDateString();
  const todayShipments = shipments?.filter((s) => new Date(s.created_at).toDateString() === today) || [];
  const pending = shipments?.filter((s) => s.status === "pending").length || 0;
  const inTransit = shipments?.filter((s) => s.status === "in_transit").length || 0;
  const delivered = shipments?.filter((s) => s.status === "delivered").length || 0;

  const stats = [
    { label: "Today's Dispatches", value: todayShipments.length, icon: Truck, color: "text-blue-500" },
    { label: "Pending", value: pending, icon: Clock, color: "text-orange-500" },
    { label: "In Transit", value: inTransit, icon: Package, color: "text-purple-500" },
    { label: "Delivered", value: delivered, icon: CheckCircle, color: "text-green-500" },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Dispatch Dashboard" description="Overview of today's dispatch operations"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Dispatch Dashboard" }]}
        actions={<StoreSelector value={storeId} onChange={setStoreId} showAll className="w-[220px]" />}
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
    </div>
  );
}

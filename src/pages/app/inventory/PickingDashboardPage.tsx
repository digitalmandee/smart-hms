import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePickLists, usePackingSlips } from "@/hooks/usePickingPacking";
import { ClipboardList, Package, CheckCircle, Clock } from "lucide-react";

export default function PickingDashboardPage() {
  const [storeId, setStoreId] = useState("");
  const { data: picks } = usePickLists(storeId);
  const { data: slips } = usePackingSlips(storeId);

  const pendingPicks = picks?.filter((p) => p.status === "draft" || p.status === "assigned").length || 0;
  const inProgressPicks = picks?.filter((p) => p.status === "in_progress").length || 0;
  const completedPicks = picks?.filter((p) => p.status === "completed").length || 0;
  const pendingPacking = slips?.filter((s) => s.status === "draft" || s.status === "packed").length || 0;

  const stats = [
    { label: "Pending Picks", value: pendingPicks, icon: Clock, color: "text-orange-500" },
    { label: "In Progress", value: inProgressPicks, icon: ClipboardList, color: "text-blue-500" },
    { label: "Completed Picks", value: completedPicks, icon: CheckCircle, color: "text-green-500" },
    { label: "Pending Packing", value: pendingPacking, icon: Package, color: "text-purple-500" },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Picking Dashboard" description="Overview of picking and packing operations"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Picking Dashboard" }]}
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

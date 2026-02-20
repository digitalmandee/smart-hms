import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useWarehouseZones } from "@/hooks/useWarehouseZones";
import { useWarehouseBins } from "@/hooks/useWarehouseBins";
import { MapPin } from "lucide-react";

export default function StorageMapPage() {
  const [storeId, setStoreId] = useState("");
  const { data: zones } = useWarehouseZones(storeId);
  const { data: bins } = useWarehouseBins(storeId);

  const getZoneBins = (zoneId: string) => bins?.filter((b) => b.zone_id === zoneId) || [];
  const getUtilization = (zoneId: string) => {
    const zBins = getZoneBins(zoneId);
    if (!zBins.length) return 0;
    return Math.round((zBins.filter((b) => b.is_occupied).length / zBins.length) * 100);
  };

  const typeColors: Record<string, string> = {
    receiving: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    storage: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    staging: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    shipping: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    cold: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    hazardous: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="p-6">
      <PageHeader title="Storage Map" description="Visual overview of warehouse zone utilization"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Storage Map" }]}
        actions={<StoreSelector value={storeId} onChange={setStoreId} className="w-[220px]" />}
      />
      {!storeId ? <Card><CardContent className="py-12 text-center text-muted-foreground">Select a warehouse to view the storage map.</CardContent></Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones?.map((zone) => {
            const util = getUtilization(zone.id);
            const zoneBins = getZoneBins(zone.id);
            return (
              <Card key={zone.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" />{zone.zone_name}</CardTitle>
                    <Badge className={typeColors[zone.zone_type] || ""}>{zone.zone_type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{zone.zone_code}{zone.temperature_range ? ` • ${zone.temperature_range}` : ""}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Utilization</span><span className="font-medium">{util}%</span></div>
                    <Progress value={util} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{zoneBins.filter((b) => b.is_occupied).length} occupied</span>
                      <span>{zoneBins.filter((b) => !b.is_occupied).length} available</span>
                      <span>{zoneBins.length} total bins</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!zones?.length && <Card className="col-span-full"><CardContent className="py-12 text-center text-muted-foreground">No zones configured for this warehouse.</CardContent></Card>}
        </div>
      )}
    </div>
  );
}

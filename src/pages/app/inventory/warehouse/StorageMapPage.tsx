import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWarehouseZones } from "@/hooks/useWarehouseZones";
import { useWarehouseBins } from "@/hooks/useWarehouseBins";
import { useBinAssignments } from "@/hooks/useWarehouseBins";
import { MapPin, ChevronDown, ChevronUp, Settings, Grid3X3, Plus, Package, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StorageMapPage() {
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState("");
  const { data: zones } = useWarehouseZones(storeId);
  const { data: bins } = useWarehouseBins(storeId);
  const { data: assignments } = useBinAssignments(storeId);
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const [selectedBin, setSelectedBin] = useState<string | null>(null);

  const getZoneBins = (zoneId: string) => bins?.filter((b) => b.zone_id === zoneId) || [];
  const getUtilization = (zoneId: string) => {
    const zBins = getZoneBins(zoneId);
    if (!zBins.length) return 0;
    return Math.round((zBins.filter((b) => b.is_occupied).length / zBins.length) * 100);
  };

  const getBinAssignments = (binId: string) => assignments?.filter((a) => a.bin_id === binId) || [];

  const totalBins = bins?.length || 0;
  const occupiedBins = bins?.filter((b) => b.is_occupied).length || 0;
  const overallUtil = totalBins > 0 ? Math.round((occupiedBins / totalBins) * 100) : 0;

  const typeColors: Record<string, string> = {
    receiving: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    storage: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    staging: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    shipping: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    cold: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    hazardous: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Storage Map" description="Visual overview of warehouse zone utilization"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Storage Map" }]}
        actions={
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={() => navigate("/app/inventory/warehouse/zones")}><Settings className="h-4 w-4 mr-1" />Manage Zones</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/inventory/warehouse/bins")}><Grid3X3 className="h-4 w-4 mr-1" />Manage Bins</Button>
            <StoreSelector value={storeId} onChange={setStoreId} className="w-[220px]" />
          </div>
        }
      />

      {!storeId ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Warehouse className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />Select a warehouse to view the storage map.</CardContent></Card>
      ) : (
        <>
          {/* Summary Bar */}
          {(zones?.length || 0) > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card><CardContent className="pt-4 pb-4 text-center"><p className="text-sm text-muted-foreground">Total Zones</p><p className="text-2xl font-bold">{zones?.length || 0}</p></CardContent></Card>
              <Card><CardContent className="pt-4 pb-4 text-center"><p className="text-sm text-muted-foreground">Total Bins</p><p className="text-2xl font-bold">{totalBins}</p></CardContent></Card>
              <Card><CardContent className="pt-4 pb-4 text-center"><p className="text-sm text-muted-foreground">Overall Utilization</p><div className="flex items-center justify-center gap-2"><p className="text-2xl font-bold">{overallUtil}%</p><Progress value={overallUtil} className="h-2 w-20" /></div></CardContent></Card>
            </div>
          )}

          {/* Zone Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones?.map((zone) => {
              const util = getUtilization(zone.id);
              const zoneBins = getZoneBins(zone.id);
              const isExpanded = expandedZone === zone.id;
              return (
                <Card key={zone.id} className={cn("transition-all", isExpanded && "col-span-full")}>
                  <CardHeader className="pb-3 cursor-pointer" onClick={() => { setExpandedZone(isExpanded ? null : zone.id); setSelectedBin(null); }}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" />{zone.zone_name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={typeColors[zone.zone_type] || ""}>{zone.zone_type}</Badge>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
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

                    {/* Expanded: Bin Grid */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t">
                        {zoneBins.length > 0 ? (
                          <div className="space-y-4">
                            <p className="text-sm font-medium">Bins in {zone.zone_name}</p>
                            <div className="flex flex-wrap gap-2">
                              {zoneBins.map((bin) => {
                                const isSelected = selectedBin === bin.id;
                                return (
                                  <button
                                    key={bin.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedBin(isSelected ? null : bin.id); }}
                                    className={cn(
                                      "px-3 py-2 rounded-md text-xs font-mono border transition-all cursor-pointer",
                                      bin.is_occupied
                                        ? "bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-200"
                                        : "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200",
                                      isSelected && "ring-2 ring-primary"
                                    )}
                                  >
                                    {bin.bin_code}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Selected Bin Details */}
                            {selectedBin && (() => {
                              const binDetail = zoneBins.find((b) => b.id === selectedBin);
                              const binItems = getBinAssignments(selectedBin);
                              return (
                                <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <p className="font-medium font-mono">{binDetail?.bin_code}</p>
                                    <Badge variant={binDetail?.is_occupied ? "default" : "outline"}>{binDetail?.is_occupied ? "Occupied" : "Available"}</Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Type: {binDetail?.bin_type} • Max Weight: {binDetail?.max_weight || "—"} kg
                                  </div>
                                  {binItems.length > 0 ? (
                                    <div className="space-y-1">
                                      <p className="text-xs font-medium">Stored Items:</p>
                                      {binItems.map((item) => (
                                        <div key={item.id} className="flex justify-between text-xs bg-background rounded px-2 py-1 border">
                                          <span className="flex items-center gap-1"><Package className="h-3 w-3" />{item.item_id || item.medicine_id || "Unknown"}</span>
                                          <span className="font-medium">Qty: {item.quantity}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic">No items assigned to this bin</p>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No bins in this zone. <Button variant="link" size="sm" className="h-auto p-0" onClick={() => navigate("/app/inventory/warehouse/bins")}>Create bins</Button></p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {!zones?.length && (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Warehouse className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground mb-4">No zones configured for this warehouse.</p>
                <Button onClick={() => navigate("/app/inventory/warehouse/zones")}><Plus className="h-4 w-4 mr-2" />Create Your First Zone</Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

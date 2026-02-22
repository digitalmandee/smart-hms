import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Gauge, Package, Truck, Clock, BarChart3, Boxes } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";

export default function WarehouseKPIDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  const { data: pickStats } = useQuery({
    queryKey: ["kpi-picks", orgId],
    queryFn: async () => {
      const { data } = await (supabase as any).from("pick_lists").select("status").eq("organization_id", orgId!);
      const total = data?.length || 0;
      const completed = data?.filter((p: any) => p.status === "completed").length || 0;
      return { total, completed, accuracy: total > 0 ? Math.round((completed / total) * 100) : 0 };
    },
    enabled: !!orgId,
  });

  const { data: grnStats } = useQuery({
    queryKey: ["kpi-grns", orgId],
    queryFn: async () => {
      const { data } = await (supabase as any).from("goods_received_notes").select("status").eq("organization_id", orgId!);
      const total = data?.length || 0;
      const posted = data?.filter((g: any) => g.status === "posted").length || 0;
      return { total, posted };
    },
    enabled: !!orgId,
  });

  const { data: shipmentStats } = useQuery({
    queryKey: ["kpi-shipments", orgId],
    queryFn: async () => {
      const { data } = await (supabase as any).from("shipments").select("status").eq("organization_id", orgId!);
      const total = data?.length || 0;
      const delivered = data?.filter((s: any) => s.status === "delivered").length || 0;
      return { total, delivered, rate: total > 0 ? Math.round((delivered / total) * 100) : 0 };
    },
    enabled: !!orgId,
  });

  const { data: binStats } = useQuery({
    queryKey: ["kpi-bins", orgId],
    queryFn: async () => {
      const { data: bins } = await (supabase as any).from("warehouse_bins").select("id, status").eq("organization_id", orgId!);
      const total = bins?.length || 0;
      const occupied = bins?.filter((b: any) => b.status === "occupied").length || 0;
      return { total, occupied, utilization: total > 0 ? Math.round((occupied / total) * 100) : 0 };
    },
    enabled: !!orgId,
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.warehouseKpis")} description={t("nav.warehouseKpisDesc")} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <ModernStatsCard title="GRNs Received" value={grnStats?.total || 0} change={`${grnStats?.posted || 0} posted`} icon={Package} variant="primary" />
        <ModernStatsCard title="Pick Accuracy" value={`${pickStats?.accuracy || 0}%`} change={`${pickStats?.completed || 0}/${pickStats?.total || 0}`} icon={BarChart3} variant="success" />
        <ModernStatsCard title="Shipments" value={shipmentStats?.total || 0} change={`${shipmentStats?.delivered || 0} delivered`} icon={Truck} variant="info" />
        <ModernStatsCard title="Fulfillment Rate" value={`${shipmentStats?.rate || 0}%`} change="On-time delivery" icon={Clock} variant="warning" />
        <ModernStatsCard title="Space Utilization" value={`${binStats?.utilization || 0}%`} change={`${binStats?.occupied || 0}/${binStats?.total || 0} bins`} icon={Boxes} variant="primary" />
        <ModernStatsCard title="Total Picks" value={pickStats?.total || 0} change={`${pickStats?.completed || 0} completed`} icon={Gauge} variant="success" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Receiving Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Total GRNs</span>
                <span className="text-2xl font-bold">{grnStats?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Posted GRNs</span>
                <span className="text-2xl font-bold text-green-600">{grnStats?.posted || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Outbound Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Pick Lists Completed</span>
                <span className="text-2xl font-bold">{pickStats?.completed || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Shipments Delivered</span>
                <span className="text-2xl font-bold text-green-600">{shipmentStats?.delivered || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

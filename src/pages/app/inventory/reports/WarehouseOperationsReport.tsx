import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Clock, MapPin, Package } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function WarehouseOperationsReport() {
  const { profile } = useAuth();

  const { data: putawayTasks } = useQuery({
    queryKey: ["ops-putaway", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await queryTable("putaway_tasks")
        .select("status, created_at, completed_at")
        .eq("organization_id", profile!.organization_id);
      if (error) throw error;
      return data as Array<{ status: string; created_at: string; completed_at: string | null }>;
    },
    enabled: !!profile?.organization_id,
  });

  const { data: bins } = useQuery({
    queryKey: ["ops-bins", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await queryTable("warehouse_bins")
        .select("status, current_quantity, max_capacity")
        .eq("organization_id", profile!.organization_id);
      if (error) throw error;
      return data as Array<{ status: string; current_quantity: number; max_capacity: number | null }>;
    },
    enabled: !!profile?.organization_id,
  });

  const totalTasks = putawayTasks?.length || 0;
  const completedTasks = putawayTasks?.filter((t) => t.status === "completed").length || 0;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalBins = bins?.length || 0;
  const occupiedBins = bins?.filter((b) => (b.current_quantity || 0) > 0).length || 0;
  const binUtilization = totalBins ? Math.round((occupiedBins / totalBins) * 100) : 0;

  const avgPutawayTime = (() => {
    const completed = putawayTasks?.filter((t) => t.completed_at);
    if (!completed?.length) return "N/A";
    const totalHours = completed.reduce((sum, t) => {
      const diff = new Date(t.completed_at!).getTime() - new Date(t.created_at).getTime();
      return sum + diff / (1000 * 60 * 60);
    }, 0);
    return `${(totalHours / completed.length).toFixed(1)}h`;
  })();

  const stats = [
    { label: "Put-Away Completion Rate", value: `${completionRate}%`, icon: CheckCircle, color: "text-green-500" },
    { label: "Avg Put-Away Time", value: avgPutawayTime, icon: Clock, color: "text-blue-500" },
    { label: "Bin Utilization", value: `${binUtilization}%`, icon: MapPin, color: "text-orange-500" },
    { label: "Total Bins", value: totalBins, icon: Package, color: "text-purple-500" },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Warehouse Operations Report" description="Put-away rates, bin utilization, and operational metrics"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Reports", href: "/app/inventory/reports" }, { label: "Operations" }]}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Put-Away Tasks Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Tasks</span><span className="font-semibold">{totalTasks}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span className="font-semibold text-green-600">{completedTasks}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span className="font-semibold text-orange-600">{totalTasks - completedTasks}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Bin Status Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Bins</span><span className="font-semibold">{totalBins}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Occupied</span><span className="font-semibold text-blue-600">{occupiedBins}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Empty</span><span className="font-semibold text-green-600">{totalBins - occupiedBins}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ClipboardList, Truck, CheckCircle, Clock } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "#f59e0b", "#10b981", "#8b5cf6"];

export default function PickingShippingReport() {
  const { profile } = useAuth();

  const { data: pickLists } = useQuery({
    queryKey: ["ps-picks", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await queryTable("pick_lists")
        .select("status, created_at, completed_at")
        .eq("organization_id", profile!.organization_id);
      if (error) throw error;
      return data as Array<{ status: string; created_at: string; completed_at: string | null }>;
    },
    enabled: !!profile?.organization_id,
  });

  const { data: shipments } = useQuery({
    queryKey: ["ps-shipments", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await queryTable("shipments")
        .select("status, carrier_name, created_at")
        .eq("organization_id", profile!.organization_id);
      if (error) throw error;
      return data as Array<{ status: string; carrier_name: string | null; created_at: string }>;
    },
    enabled: !!profile?.organization_id,
  });

  const totalPicks = pickLists?.length || 0;
  const completedPicks = pickLists?.filter((p) => p.status === "completed").length || 0;
  const pickCompletionRate = totalPicks ? Math.round((completedPicks / totalPicks) * 100) : 0;

  const totalShipments = shipments?.length || 0;
  const deliveredShipments = shipments?.filter((s) => s.status === "delivered").length || 0;

  const pickStatusData = (() => {
    const map: Record<string, number> = {};
    pickLists?.forEach((p) => { map[p.status] = (map[p.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const carrierData = (() => {
    const map: Record<string, number> = {};
    shipments?.forEach((s) => { const c = s.carrier_name || "Unknown"; map[c] = (map[c] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  })();

  const stats = [
    { label: "Total Pick Lists", value: totalPicks, icon: ClipboardList, color: "text-blue-500" },
    { label: "Pick Completion Rate", value: `${pickCompletionRate}%`, icon: CheckCircle, color: "text-green-500" },
    { label: "Total Shipments", value: totalShipments, icon: Truck, color: "text-purple-500" },
    { label: "Delivered", value: deliveredShipments, icon: Clock, color: "text-orange-500" },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Picking & Shipping Report" description="Pick list and shipment performance metrics"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Reports", href: "/app/inventory/reports" }, { label: "Picking & Shipping" }]}
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
        {pickStatusData.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Pick List Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pickStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pickStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        {carrierData.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Shipments by Carrier</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={carrierData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {carrierData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

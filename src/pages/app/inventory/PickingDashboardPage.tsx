import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePickLists, usePackingSlips } from "@/hooks/usePickingPacking";
import { ClipboardList, Package, CheckCircle, Clock, Plus, ArrowRight, Eye } from "lucide-react";

export default function PickingDashboardPage() {
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState("");
  const { data: picks } = usePickLists(storeId);
  const { data: slips } = usePackingSlips(storeId);

  const pendingPicks = picks?.filter((p) => p.status === "draft" || p.status === "assigned").length || 0;
  const inProgressPicks = picks?.filter((p) => p.status === "in_progress").length || 0;
  const completedPicks = picks?.filter((p) => p.status === "completed").length || 0;
  const pendingPacking = slips?.filter((s) => s.status === "draft" || s.status === "packed").length || 0;

  const stats = [
    { label: "Pending Picks", value: pendingPicks, icon: Clock, color: "text-orange-500", link: "/app/inventory/picklists" },
    { label: "In Progress", value: inProgressPicks, icon: ClipboardList, color: "text-blue-500", link: "/app/inventory/picklists" },
    { label: "Completed Picks", value: completedPicks, icon: CheckCircle, color: "text-green-500", link: "/app/inventory/picklists" },
    { label: "Pending Packing", value: pendingPacking, icon: Package, color: "text-purple-500", link: "/app/inventory/packing" },
  ];

  const recentPicks = picks?.slice(0, 5) || [];
  const recentSlips = slips?.slice(0, 5) || [];

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    assigned: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    packed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Picking Dashboard" description="Overview of picking and packing operations"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Picking Dashboard" }]}
        actions={
          <div className="flex gap-2 items-center">
            <Button size="sm" onClick={() => navigate("/app/inventory/picklists")}><Plus className="h-4 w-4 mr-1" />Pick Lists</Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/app/inventory/packing")}><Plus className="h-4 w-4 mr-1" />Packing Slips</Button>
            <StoreSelector value={storeId} onChange={setStoreId} showAll className="w-[220px]" />
          </div>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate(s.link)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{s.value}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pick Lists */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Pick Lists</CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => navigate("/app/inventory/picklists")}>View All</Button>
          </CardHeader>
          <CardContent>
            {recentPicks.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {recentPicks.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.pick_list_number}</TableCell>
                      <TableCell><Badge className={statusColors[p.status] || ""} variant="outline">{p.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => navigate(`/app/inventory/picklists/${p.id}`)}><Eye className="h-3 w-3" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No pick lists yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Packing Slips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Packing Slips</CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => navigate("/app/inventory/packing")}>View All</Button>
          </CardHeader>
          <CardContent>
            {recentSlips.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Status</TableHead><TableHead>Items</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {recentSlips.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm">{s.packing_slip_number}</TableCell>
                      <TableCell><Badge className={statusColors[s.status] || ""} variant="outline">{s.status}</Badge></TableCell>
                      <TableCell className="text-sm">{s.total_items}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => navigate(`/app/inventory/packing/${s.id}`)}><Eye className="h-3 w-3" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No packing slips yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

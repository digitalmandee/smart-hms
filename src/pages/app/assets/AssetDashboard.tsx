import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Wrench, Package, AlertTriangle, CheckCircle, Search, Plus } from "lucide-react";

export default function AssetDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();

  const { data: assets = [] } = useQuery({
    queryKey: ["assets", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!profile?.organization_id,
  });

  const active = assets.filter((a) => a.status === "active").length;
  const maintenance = assets.filter((a) => a.status === "maintenance").length;
  const retired = assets.filter((a) => a.status === "retired").length;

  return (
    <div>
      <PageHeader
        title={t("assets.dashboard" as any, "Asset Management")}
        description={t("assets.dashboardDesc" as any, "Equipment registry, maintenance schedules, and AMC tracking")}
        breadcrumbs={[{ label: t("assets.title" as any, "Assets") }]}
        actions={
          <Button onClick={() => window.location.href = "/app/assets/registry"}>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{assets.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{active}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{maintenance}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{retired}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Serial #</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No assets registered yet. Click "Add Asset" to begin.
                    </TableCell>
                  </TableRow>
                ) : (
                  assets.slice(0, 20).map((asset: any) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>{asset.category || "-"}</TableCell>
                      <TableCell>{asset.serial_number || "-"}</TableCell>
                      <TableCell>{asset.location || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={asset.status === "active" ? "default" : "secondary"}>
                          {asset.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

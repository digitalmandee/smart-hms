import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface HealthSummary {
  sandbox: boolean;
  window: string;
  summary: Record<string, { last_success?: string; success: number; failed: number }>;
}

interface RecentLog {
  id: string;
  sync_type: string;
  submission_status: string;
  submitted_at: string | null;
  sehhaty_reference_id: string | null;
  submission_response: any;
}

export default function HealthNetworkDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const [recent, setRecent] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    const [healthRes, logsRes] = await Promise.all([
      supabase.functions.invoke("sehhaty-sync", { body: { action: "health" } }),
      supabase
        .from("sehhaty_sync_log")
        .select("id, sync_type, submission_status, submitted_at, sehhaty_reference_id, submission_response")
        .order("submitted_at", { ascending: false })
        .limit(20),
    ]);
    if (healthRes.data) setHealth(healthRes.data as HealthSummary);
    setRecent((logsRes.data as RecentLog[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    toast({ title: t("healthnet.refreshed" as any, "Refreshed") });
  };

  const syncTypes = ["pull", "immunization"];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("healthnet.title" as any, "Health Network Sync")}
        description={t("healthnet.description" as any, "Sehhaty + NPHIES bidirectional sync health and recent activity")}
        actions={
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            {t("common.refresh" as any, "Refresh")}
          </Button>
        }
      />

      {health?.sandbox && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span>{t("healthnet.sandbox" as any, "Sandbox mode — SEHHATY_API_KEY not configured. Activity below uses stub data.")}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {loading && <div className="text-sm text-muted-foreground">{t("common.loading" as any, "Loading...")}</div>}
        {!loading && syncTypes.map((type) => {
          const s = health?.summary[type] ?? { success: 0, failed: 0 };
          return (
            <Card key={type}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm capitalize">{type.replace("_", " ")}</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription className="text-xs">{t("healthnet.window7d" as any, "Last 7 days")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("healthnet.success" as any, "Successful")}</span>
                  <span className="font-semibold text-emerald-600">{s.success}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("healthnet.failed" as any, "Failed")}</span>
                  <span className={`font-semibold ${s.failed > 0 ? "text-destructive" : ""}`}>{s.failed}</span>
                </div>
                <div className="text-xs text-muted-foreground pt-2">
                  {s.last_success
                    ? `${t("healthnet.lastSuccess" as any, "Last success")}: ${formatDistanceToNow(new Date(s.last_success), { addSuffix: true })}`
                    : t("healthnet.noActivity" as any, "No activity yet")}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("healthnet.recent" as any, "Recent Sync Activity")}</CardTitle>
          <CardDescription>{t("healthnet.recentDesc" as any, "Last 20 pull/push events")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {recent.length === 0 && (
              <div className="py-3 text-sm text-muted-foreground">{t("healthnet.empty" as any, "No sync activity yet")}</div>
            )}
            {recent.map((r) => (
              <div key={r.id} className="py-3 flex items-center gap-3 text-sm">
                {r.submission_status === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium capitalize">{r.sync_type.replace("_", " ")}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {r.sehhaty_reference_id ?? (typeof r.submission_response === "object" && r.submission_response !== null ? JSON.stringify(r.submission_response).slice(0, 120) : "—")}
                  </div>
                </div>
                <Badge variant={r.submission_status === "success" ? "default" : "destructive"}>
                  {r.submission_status}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {r.submitted_at ? formatDistanceToNow(new Date(r.submitted_at), { addSuffix: true }) : "—"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

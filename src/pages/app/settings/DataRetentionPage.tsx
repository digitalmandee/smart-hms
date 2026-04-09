import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash2, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const RETENTION_POLICIES = [
  { table: "audit_logs", label: "retention.audit_logs", retention: "12 months", action: "Delete" },
  { table: "kiosk_sessions", label: "retention.kiosk_sessions", retention: "90 days", action: "Delete" },
  { table: "kiosk_token_logs", label: "retention.kiosk_token_logs", retention: "90 days", action: "Delete" },
  { table: "notification_logs", label: "retention.notification_logs", retention: "6 months", action: "Delete" },
  { table: "ai_conversations", label: "retention.ai_conversations", retention: "6 months", action: "Delete" },
  { table: "hipaa_training_records", label: "retention.training_records", retention: "Permanent", action: "Retain" },
  { table: "hipaa_breach_incidents", label: "retention.breach_incidents", retention: "Permanent", action: "Retain" },
];

export default function DataRetentionPage() {
  const { t } = useTranslation();
  const [isPurging, setIsPurging] = useState(false);

  const { data: lastPurge } = useQuery({
    queryKey: ["last-data-purge"],
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("created_at, new_values")
        .eq("action", "data_retention_purge")
        .order("created_at", { ascending: false })
        .limit(1);
      return data?.[0] || null;
    },
  });

  const handleManualPurge = async () => {
    setIsPurging(true);
    try {
      const { data, error } = await supabase.functions.invoke("data-retention-purge", {
        body: { manual: true },
      });
      if (error) throw error;
      toast.success(t("retention.purge_success"), {
        description: `${data?.total_deleted || 0} ${t("retention.records_deleted")}`,
      });
    } catch (err: any) {
      toast.error(t("retention.purge_error"), { description: err.message });
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("retention.title")} description={t("retention.subtitle")} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t("retention.last_purge")}</p>
                <p className="font-semibold">
                  {lastPurge ? format(new Date(lastPurge.created_at), "PPp") : t("retention.never")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("retention.protected_tables")}</p>
                <p className="font-semibold">2 {t("retention.tables_permanent")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trash2 className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("retention.purged_tables")}</p>
                <p className="font-semibold">5 {t("retention.tables_scheduled")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("retention.policies")}</CardTitle>
          <CardDescription>{t("retention.policies_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("retention.data_type")}</TableHead>
                <TableHead>{t("retention.retention_period")}</TableHead>
                <TableHead>{t("retention.action_col")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RETENTION_POLICIES.map((policy) => (
                <TableRow key={policy.table}>
                  <TableCell className="font-medium">{t(policy.label as any)}</TableCell>
                  <TableCell>{policy.retention}</TableCell>
                  <TableCell>{policy.action}</TableCell>
                  <TableCell>
                    <Badge variant={policy.action === "Retain" ? "default" : "secondary"}>
                      {policy.action === "Retain" ? t("retention.permanent") : t("retention.auto_purge")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {t("retention.manual_purge")}
          </CardTitle>
          <CardDescription>{t("retention.manual_purge_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleManualPurge} disabled={isPurging}>
            {isPurging && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Trash2 className="h-4 w-4 mr-2" />
            {t("retention.run_purge")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

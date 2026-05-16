import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Ctx = { patientId: string };

export default function PortalLabResultsPage() {
  const { patientId } = useOutletContext<Ctx>();
  const { t } = useTranslation();
  const rtl = useIsRTL();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["portal-labs", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_orders")
        .select("id, order_number, status, created_at, completed_at, is_published, result_notes")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("portal.nav.lab_results" as any)}</h1>

      {isLoading && <p className="text-muted-foreground">{t("common.loading" as any)}</p>}
      {!isLoading && (rows?.length ?? 0) === 0 && (
        <div className="text-center text-muted-foreground py-12 border rounded-lg">{t("portal.no_labs" as any)}</div>
      )}

      <div className="space-y-2">
        {rows?.map((l) => (
          <div key={l.id} className={`border rounded-lg p-4 bg-card flex items-start gap-3 ${rtl ? "flex-row-reverse text-end" : ""}`}>
            <div className="rounded-md bg-primary/10 p-2">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{l.order_number ?? l.id.slice(0, 8)}</div>
              <div className="text-xs text-muted-foreground">
                {l.created_at ? format(new Date(l.created_at), "PPP") : ""}
              </div>
              {l.is_published && l.result_notes && (
                <p className="text-sm mt-2 whitespace-pre-line">{l.result_notes}</p>
              )}
              {!l.is_published && (
                <p className="text-xs text-muted-foreground mt-1">{t("portal.results_pending" as any)}</p>
              )}
            </div>
            <Badge variant={l.is_published ? "default" : "secondary"}>{String(l.status ?? "")}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

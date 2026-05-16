import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Ctx = { patientId: string };

export default function PortalPrescriptionsPage() {
  const { patientId } = useOutletContext<Ctx>();
  const { t } = useTranslation();
  const rtl = useIsRTL();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["portal-rx", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("id, prescription_number, status, notes, created_at")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("portal.nav.prescriptions" as any)}</h1>

      {isLoading && <p className="text-muted-foreground">{t("common.loading" as any)}</p>}
      {!isLoading && (rows?.length ?? 0) === 0 && (
        <div className="text-center text-muted-foreground py-12 border rounded-lg">{t("portal.no_rx" as any)}</div>
      )}

      <div className="space-y-2">
        {rows?.map((p) => (
          <div key={p.id} className={`border rounded-lg p-4 bg-card flex items-start gap-3 ${rtl ? "flex-row-reverse text-end" : ""}`}>
            <div className="rounded-md bg-primary/10 p-2">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{p.prescription_number ?? p.id.slice(0, 8)}</div>
              <div className="text-xs text-muted-foreground">
                {p.created_at ? format(new Date(p.created_at), "PPP") : ""}
              </div>
              {p.notes && <p className="text-sm mt-2 whitespace-pre-line">{p.notes}</p>}
            </div>
            <Badge variant="secondary">{String(p.status ?? "")}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

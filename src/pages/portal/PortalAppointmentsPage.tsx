import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Ctx = { patientId: string };

export default function PortalAppointmentsPage() {
  const { patientId } = useOutletContext<Ctx>();
  const { t } = useTranslation();
  const rtl = useIsRTL();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["portal-appointments", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, notes, doctor_id")
        .eq("patient_id", patientId)
        .order("appointment_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("portal.nav.appointments" as any)}</h1>

      {isLoading && <p className="text-muted-foreground">{t("common.loading" as any)}</p>}
      {!isLoading && (rows?.length ?? 0) === 0 && (
        <div className="text-center text-muted-foreground py-12 border rounded-lg">{t("portal.no_appointments" as any)}</div>
      )}

      <div className="space-y-2">
        {rows?.map((a) => (
          <div key={a.id} className={`border rounded-lg p-4 bg-card flex items-start gap-3 ${rtl ? "flex-row-reverse text-end" : ""}`}>
            <div className="rounded-md bg-primary/10 p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">
                {a.appointment_date ? format(new Date(a.appointment_date), "PPP") : "-"}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {a.appointment_time ?? "-"}
              </div>
              {a.notes && <p className="text-sm mt-2 line-clamp-2">{a.notes}</p>}
            </div>
            <Badge variant={a.status === "completed" ? "default" : a.status === "cancelled" ? "destructive" : "secondary"}>
              {String(a.status ?? "")}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

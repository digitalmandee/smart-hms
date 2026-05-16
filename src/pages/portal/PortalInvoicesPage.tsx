import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Ctx = { patientId: string };

export default function PortalInvoicesPage() {
  const { patientId } = useOutletContext<Ctx>();
  const { t } = useTranslation();
  const rtl = useIsRTL();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["portal-invoices", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date, total_amount, paid_amount, status")
        .eq("patient_id", patientId)
        .order("invoice_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("portal.nav.invoices" as any)}</h1>

      {isLoading && <p className="text-muted-foreground">{t("common.loading" as any)}</p>}
      {!isLoading && (rows?.length ?? 0) === 0 && (
        <div className="text-center text-muted-foreground py-12 border rounded-lg">{t("portal.no_invoices" as any)}</div>
      )}

      <div className="space-y-2">
        {rows?.map((inv) => {
          const balance = Number(inv.total_amount ?? 0) - Number(inv.paid_amount ?? 0);
          return (
            <div key={inv.id} className={`border rounded-lg p-4 bg-card flex items-start gap-3 ${rtl ? "flex-row-reverse text-end" : ""}`}>
              <div className="rounded-md bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{inv.invoice_number ?? inv.id.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground">
                  {inv.invoice_date ? format(new Date(inv.invoice_date), "PPP") : ""}
                </div>
                <div className="text-sm mt-1">
                  {t("portal.total" as any)}: {Number(inv.total_amount ?? 0).toFixed(2)} ·{" "}
                  {t("portal.paid" as any)}: {Number(inv.paid_amount ?? 0).toFixed(2)} ·{" "}
                  <span className={balance > 0 ? "text-destructive font-medium" : ""}>
                    {t("portal.balance" as any)}: {balance.toFixed(2)}
                  </span>
                </div>
              </div>
              <Badge variant={inv.status === "paid" ? "default" : balance > 0 ? "destructive" : "secondary"}>
                {String(inv.status ?? "")}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

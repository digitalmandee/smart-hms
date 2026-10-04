import { Link, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { FlaskConical, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { invoicePayStatus, payStatusVariant } from "@/components/portal/portalStatus";

type Ctx = { patientId: string };
type Field = { name: string; unit?: string | null; normal_min?: number | null; normal_max?: number | null };

export default function PortalLabResultsPage() {
  const { patientId } = useOutletContext<Ctx>();
  const { t } = useTranslation();
  const rtl = useIsRTL();

  const { data, isLoading } = useQuery({
    queryKey: ["portal-labs", patientId],
    queryFn: async () => {
      const { data: orders, error } = await (supabase as any)
        .from("lab_orders")
        .select("id, order_number, status, created_at, completed_at, is_published, result_notes, access_code, invoice_id")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const list = (orders ?? []) as any[];
      const ids = list.map((o) => o.id);
      const invIds = list.map((o) => o.invoice_id).filter(Boolean);
      const [itemsRes, invRes] = await Promise.all([
        ids.length ? supabase.from("lab_order_items").select("id, lab_order_id, test_name, service_type_id, result, result_values, result_notes").in("lab_order_id", ids) : Promise.resolve({ data: [] as any[] }),
        invIds.length ? supabase.from("invoices").select("id, invoice_number, total_amount, paid_amount, status").in("id", invIds) : Promise.resolve({ data: [] as any[] }),
      ]);
      const items = (itemsRes.data ?? []) as any[];
      const names = [...new Set(items.map((i) => i.test_name))];
      const { data: tpls } = names.length
        ? await supabase.from("lab_test_templates").select("test_name, service_type_id, fields").in("test_name", names)
        : { data: [] as any[] };
      return { orders: list, items, invoices: (invRes.data ?? []) as any[], templates: (tpls ?? []) as any[] };
    },
  });

  const fieldsFor = (item: any): Field[] => {
    const tpl = data?.templates.find((x) => x.service_type_id && x.service_type_id === item.service_type_id)
      ?? data?.templates.find((x) => x.test_name === item.test_name);
    return ((tpl?.fields as Field[]) ?? []);
  };

  const flag = (f: Field | undefined, v: unknown) => {
    const n = Number(v);
    if (!f || Number.isNaN(n)) return null;
    if (f.normal_min != null && n < f.normal_min) return "low";
    if (f.normal_max != null && n > f.normal_max) return "high";
    return null;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("portal.nav.lab_results" as any)}</h1>

      {isLoading && <p className="text-muted-foreground">{t("common.loading" as any)}</p>}
      {!isLoading && (data?.orders.length ?? 0) === 0 && (
        <div className="text-center text-muted-foreground py-12 border rounded-lg">{t("portal.no_labs" as any)}</div>
      )}

      <div className="space-y-3">
        {data?.orders.map((l) => {
          const inv = data.invoices.find((i) => i.id === l.invoice_id);
          const ps = invoicePayStatus(inv);
          const items = data.items.filter((i) => i.lab_order_id === l.id);
          return (
            <div key={l.id} className={cn("border rounded-lg p-4 bg-card space-y-3", rtl && "text-end")}>
              <div className={cn("flex items-start gap-3", rtl && "flex-row-reverse")}>
                <div className="rounded-md bg-primary/10 p-2"><FlaskConical className="h-5 w-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{l.order_number ?? l.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{l.created_at ? format(new Date(l.created_at), "PPP") : ""}</div>
                </div>
                <div className={cn("flex flex-wrap gap-1", rtl && "flex-row-reverse")}>
                  {inv && <Badge variant={payStatusVariant[ps]}>{t(`portal.status.${ps}` as any)}</Badge>}
                  <Badge variant={l.is_published ? "default" : "secondary"}>{String(l.status ?? "")}</Badge>
                </div>
              </div>

              {!l.is_published ? (
                <p className="text-sm text-muted-foreground">{t("portal.results_pending" as any)}</p>
              ) : (
                <div className="space-y-3">
                  {items.map((it) => {
                    const fields = fieldsFor(it);
                    const values = (it.result_values ?? {}) as Record<string, unknown>;
                    const entries = Object.entries(values);
                    return (
                      <div key={it.id} className="rounded-md border p-3">
                        <div className="font-medium text-sm mb-2">{it.test_name}</div>
                        {entries.length === 0 && it.result && <p className="text-sm">{it.result}</p>}
                        {entries.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-muted-foreground text-xs">
                                  <th className="text-start font-normal py-1"></th>
                                  <th className="text-start font-normal py-1"></th>
                                  <th className="text-start font-normal py-1">{t("portal.lab.range" as any)}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {entries.map(([k, v]) => {
                                  const f = fields.find((x) => x.name === k);
                                  const fl = flag(f, v);
                                  return (
                                    <tr key={k} className="border-t">
                                      <td className="py-1 text-start">{k}</td>
                                      <td className={cn("py-1 text-start font-medium", fl && "text-destructive")}>
                                        {String(v)} {f?.unit ?? ""}
                                        {fl && <Badge variant="destructive" className="ms-2">{t(`portal.lab.${fl}` as any)}</Badge>}
                                      </td>
                                      <td className="py-1 text-start text-muted-foreground" dir="ltr">
                                        {f?.normal_min != null || f?.normal_max != null ? `${f?.normal_min ?? ""} – ${f?.normal_max ?? ""}` : "-"}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {it.result_notes && <p className="text-xs text-muted-foreground mt-2 whitespace-pre-line">{it.result_notes}</p>}
                      </div>
                    );
                  })}
                  {l.result_notes && <p className="text-sm whitespace-pre-line">{l.result_notes}</p>}
                </div>
              )}

              <div className={cn("flex flex-wrap gap-2 items-center", rtl && "flex-row-reverse")}>
                {inv && (
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/portal/invoices?open=${inv.id}`}><FileText className="h-4 w-4 me-2" />{t("portal.lab.view_invoice" as any)}</Link>
                  </Button>
                )}
                {l.is_published && (
                  <>
                    <Button asChild size="sm" variant="ghost">
                      <a href="/lab-reports" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 me-2" />{t("portal.lab.open_report" as any)}</a>
                    </Button>
                    {l.access_code && (
                      <span className="text-xs text-muted-foreground">
                        {t("portal.lab.access_code" as any)}: <span className="font-mono font-semibold" dir="ltr">{l.access_code}</span>
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { FileText, HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { invoicePayStatus, payStatusVariant } from "@/components/portal/portalStatus";

type Ctx = { patientId: string };

export default function PortalInvoicesPage() {
  const { patientId } = useOutletContext<Ctx>();
  const { t } = useTranslation();
  const rtl = useIsRTL();
  const qc = useQueryClient();
  const { formatCurrency } = useCurrencyFormatter();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<"all" | "opd" | "lab">("all");
  const openId = params.get("open");

  const { data: rows, isLoading } = useQuery({
    queryKey: ["portal-invoices", patientId],
    queryFn: async () => {
      const [{ data, error }, { data: labs }, { data: funds }] = await Promise.all([
        supabase.from("invoices")
          .select("id, invoice_number, invoice_date, total_amount, paid_amount, status, notes")
          .eq("patient_id", patientId)
          .order("invoice_date", { ascending: false })
          .limit(100),
        (supabase as any).from("lab_orders").select("invoice_id").eq("patient_id", patientId).not("invoice_id", "is", null),
        (supabase as any).from("fund_utilizations").select("id, invoice_id, fund, department, amount").eq("patient_id", patientId),
      ]);
      if (error) throw error;
      const labIds = new Set(((labs ?? []) as any[]).map((l) => l.invoice_id));
      const byInv = new Map<string, any[]>();
      ((funds ?? []) as any[]).forEach((f) => {
        if (!f.invoice_id) return;
        byInv.set(f.invoice_id, [...(byInv.get(f.invoice_id) ?? []), f]);
      });
      return (data ?? []).map((i: any) => {
        const num = String(i.invoice_number ?? "");
        const isLab = labIds.has(i.id) || num.startsWith("LAB-");
        const f = byInv.get(i.id) ?? [];
        const isIpd = num.startsWith("IPD-") || f.some((x) => String(x.department ?? "").toLowerCase() === "ipd");
        return { ...i, isLab, isOpd: !isLab && !isIpd, funds: f, covered: f.reduce((s, x) => s + Number(x.amount ?? 0), 0) };
      });
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel(`portal-invoices-${patientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices", filter: `patient_id=eq.${patientId}` }, () => {
        qc.invalidateQueries({ queryKey: ["portal-invoices", patientId] });
        qc.invalidateQueries({ queryKey: ["portal-invoice-detail"] });
        qc.invalidateQueries({ queryKey: ["portal-labs", patientId] });
        qc.invalidateQueries({ queryKey: ["portal-counts", patientId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [patientId, qc]);

  const { data: detail } = useQuery({
    queryKey: ["portal-invoice-detail", openId],
    enabled: !!openId,
    queryFn: async () => {
      const [items, pays] = await Promise.all([
        supabase.from("invoice_items").select("id, description, quantity, unit_price, total_price").eq("invoice_id", openId!),
        supabase.from("payments").select("id, amount, payment_date, reference_number").eq("invoice_id", openId!).order("payment_date"),
      ]);
      return { items: (items.data ?? []) as any[], payments: (pays.data ?? []) as any[] };
    },
  });

  const list = (rows ?? []).filter((r: any) => tab === "all" || (tab === "lab" ? r.isLab : r.isOpd));
  const open = rows?.find((r: any) => r.id === openId);
  const setOpen = (id: string | null) => {
    const p = new URLSearchParams(params);
    if (id) p.set("open", id); else p.delete("open");
    setParams(p, { replace: true });
  };
  const welfareNote = (notes?: string | null) => (notes ?? "").match(/\[Welfare:[^\]]*\]/g);
  const sum = (k: (r: any) => number) => (rows ?? []).reduce((s: number, r: any) => s + k(r), 0);
  const totals = {
    billed: sum((r) => Number(r.total_amount ?? 0)),
    covered: sum((r) => r.covered),
    self: sum((r) => Math.max(Number(r.paid_amount ?? 0) - r.covered, 0)),
    owed: sum((r) => Math.max(Number(r.total_amount ?? 0) - Number(r.paid_amount ?? 0), 0)),
  };

  return (
    <div className="space-y-4">
      <div className={cn("flex items-center justify-between gap-3 flex-wrap", rtl && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{t("portal.nav.invoices" as any)}</h1>
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="all">{t("portal.inv.all" as any)}</TabsTrigger>
            <TabsTrigger value="opd">{t("portal.inv.opd" as any)}</TabsTrigger>
            <TabsTrigger value="lab">{t("portal.inv.lab" as any)}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {(rows ?? []).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {([
            ["billed", totals.billed, ""],
            ["covered", totals.covered, "text-primary"],
            ["you_paid", totals.self, ""],
            ["owed", totals.owed, totals.owed > 0 ? "text-destructive" : ""],
          ] as const).map(([k, v, c]) => (
            <div key={k} className="border rounded-lg p-3 bg-card text-start">
              <p className="text-xs text-muted-foreground">{t(`portal.inv.${k}` as any)}</p>
              <p className={cn("text-lg font-semibold", c)}>{formatCurrency(v)}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">{t("portal.inv.live" as any)}</p>

      {isLoading && <p className="text-muted-foreground">{t("common.loading" as any)}</p>}
      {!isLoading && list.length === 0 && (
        <div className="text-center text-muted-foreground py-12 border rounded-lg">{t("portal.no_invoices" as any)}</div>
      )}

      <div className="space-y-2">
        {list.map((inv: any) => {
          const total = Number(inv.total_amount ?? 0);
          const paid = Number(inv.paid_amount ?? 0);
          const balance = Math.max(total - paid, 0);
          const ps = invoicePayStatus(inv);
          return (
            <button
              key={inv.id}
              onClick={() => setOpen(inv.id)}
              className={cn("w-full border rounded-lg p-4 bg-card flex items-start gap-3 hover:border-primary transition-colors text-start", rtl && "flex-row-reverse text-end")}
            >
              <div className="rounded-md bg-primary/10 p-2"><FileText className="h-5 w-5 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{inv.invoice_number ?? inv.id.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground">{inv.invoice_date ? format(new Date(inv.invoice_date), "PPP") : ""}</div>
                <div className="text-sm mt-1">
                  {t("portal.total" as any)}: {formatCurrency(total)} · {t("portal.paid" as any)}: {formatCurrency(paid)} ·{" "}
                  <span className={balance > 0 ? "text-destructive font-medium" : ""}>{t("portal.balance" as any)}: {formatCurrency(balance)}</span>
                </div>
                {inv.covered > 0 && (
                  <div className={cn("text-xs mt-1 flex items-center gap-1 text-primary", rtl && "flex-row-reverse")}>
                    <HeartHandshake className="h-3 w-3" />
                    {t("portal.inv.covered" as any)}: {formatCurrency(inv.covered)} ({total > 0 ? Math.round((inv.covered / total) * 100) : 0}%)
                  </div>
                )}
              </div>
              <Badge variant={payStatusVariant[ps]}>{t(`portal.status.${ps}` as any)}</Badge>
            </button>
          );
        })}
      </div>

      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side={rtl ? "left" : "right"} dir={rtl ? "rtl" : "ltr"} className={cn("overflow-y-auto", rtl && "text-end")}>
          <SheetHeader>
            <SheetTitle>{open?.invoice_number ?? ""}</SheetTitle>
          </SheetHeader>
          {open && (
            <div className="space-y-4 mt-4">
              <Badge variant={payStatusVariant[invoicePayStatus(open)]}>{t(`portal.status.${invoicePayStatus(open)}` as any)}</Badge>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("portal.inv.items" as any)}</p>
                {(detail?.items ?? []).map((it) => (
                  <div key={it.id} className={cn("flex justify-between text-sm py-1", rtl && "flex-row-reverse")}>
                    <span>{it.description}{Number(it.quantity) > 1 ? ` × ${it.quantity}` : ""}</span>
                    <span className="font-medium">{formatCurrency(Number(it.total_price ?? 0))}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div><p className="text-muted-foreground">{t("portal.total" as any)}</p><p className="font-semibold">{formatCurrency(Number(open.total_amount ?? 0))}</p></div>
                <div><p className="text-muted-foreground">{t("portal.paid" as any)}</p><p className="font-semibold">{formatCurrency(Number(open.paid_amount ?? 0))}</p></div>
                <div><p className="text-muted-foreground">{t("portal.balance" as any)}</p><p className="font-semibold">{formatCurrency(Math.max(Number(open.total_amount ?? 0) - Number(open.paid_amount ?? 0), 0))}</p></div>
              </div>
              {(open.funds?.length > 0 || welfareNote(open.notes)) && (
                <div className="rounded-md border p-3 text-sm space-y-1">
                  <div className={cn("flex items-center gap-2 font-medium", rtl && "flex-row-reverse")}><HeartHandshake className="h-4 w-4 text-primary" />{t("portal.inv.welfare" as any)}</div>
                  {open.funds?.length > 0 ? (
                    <>
                      {open.funds.map((f: any) => (
                        <div key={f.id} className={cn("flex justify-between", rtl && "flex-row-reverse")}>
                          <span className="capitalize">{String(f.fund).replace(/_/g, " ")}</span>
                          <span className="font-medium">{formatCurrency(Number(f.amount))}</span>
                        </div>
                      ))}
                      <div className={cn("flex justify-between text-muted-foreground", rtl && "flex-row-reverse")}>
                        <span>{t("portal.inv.you_paid" as any)}</span>
                        <span>{formatCurrency(Math.max(Number(open.paid_amount ?? 0) - open.covered, 0))}</span>
                      </div>
                    </>
                  ) : welfareNote(open.notes)!.map((w, i) => <p key={i} className="text-muted-foreground">{w.replace(/^\[Welfare:\s*|\]$/g, "")}</p>)}
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("portal.inv.payments" as any)}</p>
                {(detail?.payments ?? []).length === 0 && <p className="text-sm text-muted-foreground">{t("portal.inv.no_payments" as any)}</p>}
                {(detail?.payments ?? []).map((p) => (
                  <div key={p.id} className={cn("flex justify-between text-sm py-1", rtl && "flex-row-reverse")}>
                    <span>{p.payment_date ? format(new Date(p.payment_date), "PP p") : ""}{p.reference_number ? ` · ${p.reference_number}` : ""}</span>
                    <span className="font-medium">{formatCurrency(Number(p.amount ?? 0))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

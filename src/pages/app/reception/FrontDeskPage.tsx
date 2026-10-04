import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, UserPlus, Trash2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { usePatients, useCreatePatient } from "@/hooks/usePatients";
import { useServiceTypes, usePaymentMethods, useCreateInvoice, useRecordPayment } from "@/hooks/useBilling";
import { useActiveSession } from "@/hooks/useBillingSessions";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useFundBalances, useApplyFund, pickFund } from "@/hooks/useWelfareFunds";
import { useWelfareT, WELFARE_FUNDS } from "@/lib/welfare/i18n";
import { cn } from "@/lib/utils";

const VISIT_TYPES = ["opd", "ipd", "lab", "pharmacy", "bloodbank", "procedure"] as const;
type Line = { service_type_id: string | null; description: string; unit_price: number; quantity: number };

export default function FrontDeskPage() {
  const { t, rtl } = useWelfareT();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { formatCurrency } = useCurrencyFormatter();
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 300);
  const { data: results = [], isFetching } = usePatients(dq.length >= 2 ? dq : "__none_search__");
  const createPatient = useCreatePatient();
  const { data: services = [] } = useServiceTypes();
  const { data: methods = [] } = usePaymentMethods();
  const { data: session } = useActiveSession();
  const { data: balances = [] } = useFundBalances();
  const createInvoice = useCreateInvoice();
  const recordPayment = useRecordPayment();
  const applyFund = useApplyFund();

  const [patient, setPatient] = useState<any>(null);
  const [showNew, setShowNew] = useState(false);
  const [np, setNp] = useState({ first_name: "", last_name: "", phone: "", gender: "male", guardian_name: "", guardian_phone: "", is_welfare: false, welfare_fund: "any", welfare_coverage_pct: "100" });
  const [visit, setVisit] = useState<string>("opd");
  const [svc, setSvc] = useState("__none__");
  const [lines, setLines] = useState<Line[]>([]);
  const [method, setMethod] = useState("__none__");
  const [busy, setBusy] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<string | null>(null);

  const total = lines.reduce((s, l) => s + l.unit_price * l.quantity, 0);
  const welfare = !!patient?.is_welfare;
  const cov = welfare ? Math.min(100, Math.max(0, Number(patient?.welfare_coverage_pct ?? 100))) : 0;
  const fundShare = Math.round(total * cov) / 100;
  const patientShare = Math.max(0, total - fundShare);
  const chosen = useMemo(() => pickFund(balances, patient?.welfare_fund, fundShare), [balances, patient, fundShare]);
  const fundShort = welfare && fundShare > 0 && (!chosen.fund || chosen.available < fundShare);

  const savePatient = async () => {
    if (!np.first_name.trim() || !np.phone.trim()) return toast.error(`${t("firstName")} / ${t("phone")}`);
    if (np.gender === "child" && (!np.guardian_name.trim() || !np.guardian_phone.trim())) return toast.error(t("guardian"));
    const p = await createPatient.mutateAsync({
      first_name: np.first_name.trim(), last_name: np.last_name.trim() || null, phone: np.phone.trim(), gender: np.gender as any,
      guardian_name: np.guardian_name || null, guardian_phone: np.guardian_phone || null, branch_id: profile?.branch_id || "",
      is_welfare: np.is_welfare, welfare_fund: np.is_welfare ? np.welfare_fund : null,
      welfare_coverage_pct: Number(np.welfare_coverage_pct) || 100,
    } as any);
    setPatient(p); setShowNew(false);
  };

  const addLine = () => {
    const s = services.find((x: any) => x.id === svc);
    if (!s) return;
    setLines([...lines, { service_type_id: s.id, description: s.name, unit_price: Number(s.default_price || 0), quantity: 1 }]);
    setSvc("__none__");
  };

  const collect = async () => {
    if (!patient || lines.length === 0) return;
    if (fundShort) return toast.error(`${t("fundLow")} ${formatCurrency(chosen.available)}`);
    if (patientShare > 0 && method === "__none__") return toast.error(t("paymentMethod"));
    const branchId = patient.branch_id || profile?.branch_id;
    if (!branchId) return toast.error("Branch missing");
    setBusy(true);
    try {
      const inv: any = await createInvoice.mutateAsync({
        patientId: patient.id, branchId, department: visit,
        items: lines.map(l => ({ description: l.description, quantity: l.quantity, unit_price: l.unit_price, service_type_id: l.service_type_id })),
      });
      const invoiceId = inv?.id ?? inv?.invoice?.id;
      if (!invoiceId) throw new Error("Invoice not created");
      if (welfare && fundShare > 0 && chosen.fund) {
        try {
          // Trigger validates fund balance, posts GL, and updates invoice paid/balance/status
          await applyFund.mutateAsync({ invoiceId, patientId: patient.id, fund: chosen.fund, amount: fundShare, department: visit });
        } catch (fe) {
          await supabase.from("invoices").update({ status: "cancelled" } as any).eq("id", invoiceId).select();
          throw fe;
        }
      }
      if (patientShare > 0) {
        await recordPayment.mutateAsync({ invoiceId, amount: patientShare, paymentMethodId: method, billingSessionId: session?.id });
      }
      toast.success(t("done"));
      setLastInvoice(invoiceId); setLines([]);
    } catch (e: any) {
      toast.error(e?.message || "Error");
    } finally { setBusy(false); }
  };

  return (
    <div className={cn("space-y-6", rtl && "text-end")}>
      <PageHeader title={t("frontDesk")} description={t("frontDeskDesc")} />
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Patient */}
        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", rtl && "flex-row-reverse")}>
            <CardTitle className="text-base">{patient ? t("selected") : t("patient")}</CardTitle>
            {!patient && <Button size="sm" variant="outline" onClick={() => setShowNew(!showNew)}><UserPlus className="h-4 w-4 me-1" />{t("newPatient")}</Button>}
            {patient && <Button size="sm" variant="ghost" onClick={() => { setPatient(null); setLastInvoice(null); }}>{t("change")}</Button>}
          </CardHeader>
          <CardContent className="space-y-3">
            {patient ? (
              <div className="rounded-md border p-3 space-y-1">
                <div className={cn("flex items-center gap-2", rtl && "flex-row-reverse")}>
                  <span className="font-semibold">{patient.first_name} {patient.last_name}</span>
                  {welfare && <Badge>{t("welfareBadge")}: {t(patient.welfare_fund || "any")} · {cov}%</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">{patient.patient_number} · {patient.phone}</div>
              </div>
            ) : showNew ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>{t("firstName")}</Label><Input value={np.first_name} onChange={e => setNp({ ...np, first_name: e.target.value })} /></div>
                <div><Label>{t("lastName")}</Label><Input value={np.last_name} onChange={e => setNp({ ...np, last_name: e.target.value })} /></div>
                <div><Label>{t("phone")}</Label><Input value={np.phone} onChange={e => setNp({ ...np, phone: e.target.value })} /></div>
                <div><Label>{t("gender")}</Label>
                  <Select value={np.gender} onValueChange={v => setNp({ ...np, gender: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["male", "female", "child"].map(g => <SelectItem key={g} value={g}>{t(g)}</SelectItem>)}</SelectContent>
                  </Select></div>
                {np.gender === "child" && <>
                  <div><Label>{t("guardian")}</Label><Input value={np.guardian_name} onChange={e => setNp({ ...np, guardian_name: e.target.value })} /></div>
                  <div><Label>{t("guardianPhone")}</Label><Input value={np.guardian_phone} onChange={e => setNp({ ...np, guardian_phone: e.target.value })} /></div>
                </>}
                <label className={cn("flex items-center gap-2 sm:col-span-2", rtl && "flex-row-reverse justify-end")}>
                  <Checkbox checked={np.is_welfare} onCheckedChange={v => setNp({ ...np, is_welfare: !!v })} />{t("needsWelfare")}
                </label>
                {np.is_welfare && <>
                  <div><Label>{t("payingFund")}</Label>
                    <Select value={np.welfare_fund} onValueChange={v => setNp({ ...np, welfare_fund: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{WELFARE_FUNDS.map(f => <SelectItem key={f} value={f}>{t(f)}</SelectItem>)}</SelectContent>
                    </Select></div>
                  <div><Label>{t("coverage")}</Label><Input type="number" min={0} max={100} value={np.welfare_coverage_pct} onChange={e => setNp({ ...np, welfare_coverage_pct: e.target.value })} /></div>
                </>}
                <Button className="sm:col-span-2" onClick={savePatient} disabled={createPatient.isPending}>
                  {createPatient.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}{t("savePatient")}
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="ps-9" placeholder={t("search")} value={q} onChange={e => setQ(e.target.value)} />
                </div>
                {dq.length >= 2 && (
                  <div className="max-h-72 overflow-auto divide-y rounded-md border">
                    {isFetching && <div className="p-3"><Loader2 className="h-4 w-4 animate-spin" /></div>}
                    {!isFetching && results.length === 0 && <div className="p-3 text-sm text-muted-foreground">{t("noResults")}</div>}
                    {results.slice(0, 20).map((p: any) => (
                      <button key={p.id} type="button" onClick={() => setPatient(p)}
                        className={cn("w-full p-3 text-start hover:bg-muted flex items-center justify-between", rtl && "flex-row-reverse text-end")}>
                        <span><span className="font-medium">{p.first_name} {p.last_name}</span><span className="text-xs text-muted-foreground ms-2">{p.patient_number} · {p.phone}</span></span>
                        {p.is_welfare && <Badge variant="secondary">{t("welfareBadge")}</Badge>}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Visit + billing */}
        <Card className={cn(!patient && "opacity-50 pointer-events-none")}>
          <CardHeader><CardTitle className="text-base">{t("visitType")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {VISIT_TYPES.map(v => <Button key={v} size="sm" variant={visit === v ? "default" : "outline"} onClick={() => setVisit(v)}>{t(v)}</Button>)}
            </div>
            <div className={cn("flex gap-2", rtl && "flex-row-reverse")}>
              <Select value={svc} onValueChange={setSvc}>
                <SelectTrigger className="flex-1"><SelectValue placeholder={t("service")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t("service")}</SelectItem>
                  {services.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name} — {formatCurrency(s.default_price)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={addLine} disabled={svc === "__none__"}>{t("addService")}</Button>
            </div>
            {lines.length > 0 && (
              <div className="divide-y rounded-md border">
                {lines.map((l, i) => (
                  <div key={i} className={cn("flex items-center gap-2 p-2", rtl && "flex-row-reverse")}>
                    <span className="flex-1 text-sm">{l.description}</span>
                    <Input type="number" className="w-28" value={l.unit_price}
                      onChange={e => setLines(lines.map((x, j) => j === i ? { ...x, unit_price: Number(e.target.value) || 0 } : x))} />
                    <Button size="icon" variant="ghost" aria-label={t("remove")} onClick={() => setLines(lines.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-1 rounded-md bg-muted p-3 text-sm">
              <div className="flex justify-between"><span>{t("total")}</span><span className="font-semibold">{formatCurrency(total)}</span></div>
              {welfare && <div className="flex justify-between"><span>{t("fundShare")} ({chosen.fund ? t(chosen.fund) : t("noFundMoney")})</span><span>{formatCurrency(fundShare)}</span></div>}
              {welfare && <div className="flex justify-between text-muted-foreground"><span>{t("fundAvailable")}</span><span>{formatCurrency(chosen.available)}</span></div>}
              <div className="flex justify-between text-base font-bold"><span>{t("patientShare")}</span><span>{formatCurrency(patientShare)}</span></div>
              {fundShort && <div className="text-destructive">{t("fundLow")} {formatCurrency(chosen.available)}</div>}
            </div>
            {patientShare > 0 && (
              <div><Label>{t("paymentMethod")}</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t("paymentMethod")}</SelectItem>
                    {methods.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select></div>
            )}
            <Button className="w-full" onClick={collect} disabled={busy || lines.length === 0 || fundShort}>
              {busy ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <Receipt className="h-4 w-4 me-2" />}{t("collect")}
            </Button>
            {lastInvoice && <Button variant="outline" className="w-full" onClick={() => navigate(`/app/billing/invoices/${lastInvoice}`)}>{t("printReceipt")}</Button>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

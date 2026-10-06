import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Droplets, FlaskConical, Package, Send, Tent } from "lucide-react";
import { format, startOfMonth } from "date-fns";

type Period = "today" | "month" | "all";
const db = supabase as any;

const D: Record<string, Record<string, string>> = {
  en: { title: "Blood bag flow", today: "Today", month: "This month", all: "All time", collected: "Collected", hospital: "Hospital", camp: "Camps",
    tested: "Tested", passed: "Passed", failed: "Failed", stock: "In stock", ready: "Ready", waiting: "Awaiting tests", held: "Held for patient",
    issued: "Issued", transfused: "Transfused", discarded: "Discarded", expired: "Expired", bags: "bags", campBags: "Camp bags" },
  ur: { title: "خون کے بیگ کا بہاؤ", today: "آج", month: "اس مہینے", all: "اب تک", collected: "جمع شدہ", hospital: "ہسپتال", camp: "کیمپ",
    tested: "ٹیسٹ شدہ", passed: "پاس", failed: "فیل", stock: "اسٹاک میں", ready: "تیار", waiting: "ٹیسٹ کے منتظر", held: "مریض کے لیے مخصوص",
    issued: "جاری شدہ", transfused: "لگایا گیا", discarded: "ضائع", expired: "میعاد ختم", bags: "بیگ", campBags: "کیمپ بیگ" },
  ar: { title: "تدفق أكياس الدم", today: "اليوم", month: "هذا الشهر", all: "الكل", collected: "المجموع", hospital: "المستشفى", camp: "الحملات",
    tested: "المفحوصة", passed: "ناجحة", failed: "مرفوضة", stock: "في المخزون", ready: "جاهزة", waiting: "بانتظار الفحص", held: "محجوزة لمريض",
    issued: "المصروفة", transfused: "نُقلت", discarded: "متلفة", expired: "منتهية", bags: "كيس", campBags: "أكياس الحملات" },
};

async function fetchAll(build: (from: number, to: number) => any) {
  const out: any[] = [];
  for (let i = 0; ; i += 1000) {
    const { data, error } = await build(i, i + 999);
    if (error) throw error;
    out.push(...(data || []));
    if (!data || data.length < 1000) return out;
  }
}

export function BloodFlowPanel() {
  const { profile } = useAuth();
  const { language } = useTranslation() as { language?: string };
  const lang = language === "ur" || language === "ar" ? language : "en";
  const t = (k: string) => D[lang][k] ?? D.en[k];
  const rtl = lang !== "en";
  const [period, setPeriod] = useState<Period>("month");
  const orgId = profile?.organization_id;

  const { data, isLoading } = useQuery({
    queryKey: ["blood-flow-totals", orgId, period],
    enabled: !!orgId,
    queryFn: async () => {
      const since = period === "today" ? format(new Date(), "yyyy-MM-dd") : period === "month" ? format(startOfMonth(new Date()), "yyyy-MM-dd") : null;
      const [don, inv] = await Promise.all([
        fetchAll((a, b) => { let q = db.from("blood_donations").select("id, status, volume_ml, camp_id, received_status").eq("organization_id", orgId).range(a, b); if (since) q = q.gte("donation_date", since); return q; }),
        fetchAll((a, b) => { let q = db.from("blood_inventory").select("id, status, volume_ml, blood_group, camp_id, discard_reason").eq("organization_id", orgId).range(a, b); if (since) q = q.gte("collection_date", since); return q; }),
      ]);
      const sum = (rows: any[]) => ({ n: rows.length, ml: rows.reduce((s, r) => s + (Number(r.volume_ml) || 0), 0) });
      const collectedRows = don.filter((d) => d.status !== "rejected" || d.received_status === "rejected");
      const by = (st: string[]) => inv.filter((u) => st.includes(u.status));
      const failed = inv.filter((u) => u.discard_reason === "failed_screening");
      const stockRows = by(["available", "quarantine", "reserved", "cross_matched"]);
      const groups: Record<string, number> = {};
      stockRows.forEach((u) => { groups[u.blood_group] = (groups[u.blood_group] || 0) + 1; });
      return {
        collected: sum(collectedRows), hospital: sum(collectedRows.filter((d) => !d.camp_id)), camp: sum(collectedRows.filter((d) => d.camp_id)),
        passed: sum(inv.filter((u) => u.status !== "quarantine" && u.discard_reason !== "failed_screening")), failed: sum(failed),
        stock: sum(stockRows), ready: sum(by(["available"])), waiting: sum(by(["quarantine"])), held: sum(by(["reserved", "cross_matched"])),
        issuedAll: sum(by(["issued", "transfused"])), issued: sum(by(["issued"])), transfused: sum(by(["transfused"])),
        discarded: sum(by(["discarded"])), expired: sum(by(["expired"])),
        campBags: sum(inv.filter((u) => u.camp_id)), groups: Object.entries(groups).sort(),
      };
    },
  });

  const fmt = (v?: { n: number; ml: number }) => v ? `${v.n} ${t("bags")} • ${v.ml.toLocaleString()} ml` : "-";
  const end = rtl ? "text-end" : "";
  const line = (k: string, v?: { n: number; ml: number }) => (
    <div className={`flex justify-between gap-2 text-xs ${rtl ? "flex-row-reverse" : ""}`}><span className="text-muted-foreground">{t(k)}</span><span>{v ? `${v.n} • ${v.ml.toLocaleString()} ml` : "-"}</span></div>
  );
  const stage = (icon: any, title: string, main: { n: number; ml: number } | undefined, rows: [string, any][], extra?: React.ReactNode) => {
    const Icon = icon;
    return (
      <Card><CardContent className={`p-4 space-y-2 ${end}`}>
        <div className={`flex items-center gap-2 ${rtl ? "flex-row-reverse" : ""}`}><Icon className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{t(title)}</span></div>
        <p className="text-2xl font-bold">{main?.n ?? 0}</p>
        <p className="text-xs text-muted-foreground">{(main?.ml ?? 0).toLocaleString()} ml</p>
        <div className="space-y-1 pt-1 border-t">{rows.map(([k, v]) => <div key={k}>{line(k, v)}</div>)}</div>
        {extra}
      </CardContent></Card>
    );
  };

  return (
    <Card dir={rtl ? "rtl" : "ltr"}>
      <CardHeader className={`flex flex-row items-center justify-between gap-2 space-y-0 ${rtl ? "flex-row-reverse" : ""}`}>
        <CardTitle className={end}>{t("title")}</CardTitle>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>{(["today", "month", "all"] as Period[]).map((p) => <TabsTrigger key={p} value={p}>{t(p)}</TabsTrigger>)}</TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-40" /> : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stage(Droplets, "collected", data?.collected, [["hospital", data?.hospital], ["camp", data?.camp]])}
            {stage(FlaskConical, "tested", data && { n: data.passed.n + data.failed.n, ml: data.passed.ml + data.failed.ml }, [["passed", data?.passed], ["failed", data?.failed]])}
            {stage(Package, "stock", data?.stock, [["ready", data?.ready], ["waiting", data?.waiting], ["held", data?.held]],
              data?.groups.length ? <div className={`flex flex-wrap gap-1 pt-1 ${rtl ? "flex-row-reverse" : ""}`}>{data.groups.map(([g, n]) => <Badge key={g} variant="outline">{g}: {n}</Badge>)}</div> : null)}
            {stage(Send, "issued", data?.issuedAll, [["issued", data?.issued], ["transfused", data?.transfused], ["discarded", data?.discarded], ["expired", data?.expired]])}
          </div>
        )}
        {!isLoading && data && data.campBags.n > 0 && (
          <div className={`flex items-center gap-2 mt-3 text-sm text-muted-foreground ${rtl ? "flex-row-reverse" : ""}`}><Tent className="h-4 w-4" />{t("campBags")}: {fmt(data.campBags)}</div>
        )}
      </CardContent>
    </Card>
  );
}

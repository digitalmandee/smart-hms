import { UseFormReturn } from "react-hook-form";
import { HeartHandshake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WELFARE_FUNDS, useWelfareT } from "@/lib/welfare/i18n";
import { useCountryConfig } from "@/contexts/CountryConfigContext";

const DICT = {
  en: {
    title: "Welfare / Need Assessment", needs: "Needs welfare support", needsHint: "Turn on if the patient cannot pay fully",
    income: "Monthly household income", family: "Family members", earning: "Earning members", headOcc: "Head of household occupation",
    housing: "House", own: "Own", rented: "Rented", none: "No house / shelter",
    zakat: "Zakat eligible", yes: "Yes", no: "No", fund: "Preferred fund", fZakat: "Zakat", fSadaqah: "Sadaqah", fAny: "Any eligible fund",
    coverage: "Suggested coverage %", referral: "Referred by", rSelf: "Self", rNgo: "NGO", rMosque: "Mosque", rDoctor: "Doctor",
    notes: "Assessment notes",
  },
  ur: {
    title: "فلاحی / ضرورت کا جائزہ", needs: "فلاحی امداد درکار ہے", needsHint: "اگر مریض مکمل ادائیگی نہیں کر سکتا تو آن کریں",
    income: "ماہانہ گھریلو آمدنی", family: "خاندان کے افراد", earning: "کمانے والے افراد", headOcc: "سربراہِ خانہ کا پیشہ",
    housing: "گھر", own: "ذاتی", rented: "کرائے کا", none: "گھر نہیں",
    zakat: "زکوٰۃ کا مستحق", yes: "ہاں", no: "نہیں", fund: "ترجیحی فنڈ", fZakat: "زکوٰۃ", fSadaqah: "صدقہ", fAny: "کوئی بھی اہل فنڈ",
    coverage: "تجویز کردہ کوریج %", referral: "حوالہ دینے والا", rSelf: "خود", rNgo: "این جی او", rMosque: "مسجد", rDoctor: "ڈاکٹر",
    notes: "جائزے کے نوٹس",
  },
  ar: {
    title: "تقييم الحاجة / الرعاية", needs: "يحتاج إلى دعم خيري", needsHint: "فعّل إذا لم يستطع المريض الدفع كاملاً",
    income: "الدخل الشهري للأسرة", family: "عدد أفراد الأسرة", earning: "عدد العاملين", headOcc: "مهنة رب الأسرة",
    housing: "السكن", own: "ملك", rented: "إيجار", none: "بدون سكن",
    zakat: "مستحق للزكاة", yes: "نعم", no: "لا", fund: "الصندوق المفضل", fZakat: "الزكاة", fSadaqah: "الصدقة", fAny: "أي صندوق مؤهل",
    coverage: "نسبة التغطية المقترحة %", referral: "جهة الإحالة", rSelf: "ذاتي", rNgo: "منظمة خيرية", rMosque: "مسجد", rDoctor: "طبيب",
    notes: "ملاحظات التقييم",
  },
};

export function useWelfareDict() {
  const { default_language } = useCountryConfig();
  return DICT[(default_language as keyof typeof DICT)] || DICT.en;
}

export function WelfareAssessmentSection({ form }: { form: UseFormReturn<any> }) {
  const d = useWelfareDict();
  const needs = form.watch("needs_welfare");
  const { t: wt } = useWelfareT();

  const sel = (name: string, label: string, opts: [string, string][]) => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)} value={field.value || "__none__"}>
          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
          <SelectContent>
            <SelectItem value="__none__">—</SelectItem>
            {opts.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </FormItem>
    )} />
  );
  const num = (name: string, label: string, extra: any = {}) => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl><Input type="number" min={0} {...extra} {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <HeartHandshake className="h-5 w-5 text-primary" /> {d.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField control={form.control} name="needs_welfare" render={({ field }) => (
          <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div>
              <FormLabel>{d.needs}</FormLabel>
              <p className="text-xs text-muted-foreground">{d.needsHint}</p>
            </div>
            <FormControl><Switch checked={!!field.value} onCheckedChange={field.onChange} /></FormControl>
          </FormItem>
        )} />
        {needs && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {num("monthly_income", d.income)}
            {num("family_members", d.family)}
            {num("earning_members", d.earning)}
            <FormField control={form.control} name="head_occupation" render={({ field }) => (
              <FormItem><FormLabel>{d.headOcc}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            {sel("housing_status", d.housing, [["own", d.own], ["rented", d.rented], ["none", d.none]])}
            {sel("zakat_eligible", d.zakat, [["yes", d.yes], ["no", d.no]])}
            <FormField control={form.control} name="preferred_fund" render={({ field }) => (
              <FormItem><FormLabel>{d.fund}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "any"}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>{WELFARE_FUNDS.map((f) => <SelectItem key={f} value={f}>{wt(f)}</SelectItem>)}</SelectContent>
                </Select></FormItem>
            )} />
            {num("suggested_coverage_pct", d.coverage, { max: 100 })}
            {sel("welfare_referral", d.referral, [["self", d.rSelf], ["ngo", d.rNgo], ["mosque", d.rMosque], ["doctor", d.rDoctor]])}
            <FormField control={form.control} name="welfare_notes" render={({ field }) => (
              <FormItem className="sm:col-span-2 lg:col-span-3"><FormLabel>{d.notes}</FormLabel>
                <FormControl><Textarea rows={2} {...field} /></FormControl></FormItem>
            )} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

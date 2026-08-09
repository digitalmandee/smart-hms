import React, { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { Languages, Printer } from "lucide-react";

type Lang = "en" | "ur" | "ar";

const T: Record<Lang, Record<string, string>> = {
  en: {
    title: "Funding Requirement — SAR 3.0M over 24 Months",
    subtitle: "Year 1 is the first tranche, not the final ask. Model the Year-1 requirement below.",
    totalAsk: "Total requirement (24 months)",
    year1: "Year 1 tranche",
    year2: "Year 2 tranche",
    slider: "Year-1 immediate requirement",
    lean: "Lean",
    base: "Base",
    full: "Full",
    blocks: "Year-1 cost blocks",
    block: "Cost block",
    amount: "Amount (SAR)",
    share: "Share",
    covers: "What it covers",
    monthly: "Monthly spend (M1–M12)",
    cumulative: "Cumulative spend",
    month: "Month",
    total: "Total",
    y2plan: "Year 2 — what the remaining tranche funds",
    note: "Year-1 blocks scale with the slider. Engineering stays at 50% of the Year-1 tranche in every scenario.",
    print: "Print",
    eng: "Engineering team",
    hipaa: "HIPAA audit & certification",
    ksa: "KSA compliance & integrations",
    ai: "AI / Tabeebi + GPU",
    infra: "Infrastructure & self-host",
    legal: "Legal, licensing & contingency",
    engD: "6 engineers, staggered hiring — backend, frontend, AI/ML, QA, DevOps",
    hipaaD: "Gap assessment, remediation, third-party audit, BAA framework, penetration test",
    ksaD: "NPHIES, ZATCA Phase 2, Wasfaty, Tatmeen/RSD, Nafath, Sehhaty/HESN — fees, build, UAT",
    aiD: "GPU server, model quality, Arabic + Urdu ASR/TTS, evaluation harness, guardrails",
    infraD: "Servers, backup/DR, monitoring, staging, security tooling",
    legalD: "Entity/licensing, contracts, SFDA/MOH paperwork, contingency",
    y2a: "Sales & marketing launch after certifications clear",
    y2b: "Team scale-up from 6 to 9–11 engineers",
    y2c: "Pilot-to-production rollouts and hospital onboarding",
    y2d: "Multi-region infrastructure and 24/7 support coverage",
  },
  ur: {
    title: "فنڈنگ ضرورت — 24 ماہ میں SAR 3.0M",
    subtitle: "سال 1 پہلی قسط ہے، حتمی مطالبہ نہیں۔ نیچے سال 1 کی ضرورت ماڈل کریں۔",
    totalAsk: "کل ضرورت (24 ماہ)",
    year1: "سال 1 قسط",
    year2: "سال 2 قسط",
    slider: "سال 1 فوری ضرورت",
    lean: "کم",
    base: "بنیادی",
    full: "مکمل",
    blocks: "سال 1 لاگت کے حصے",
    block: "لاگت کا حصہ",
    amount: "رقم (SAR)",
    share: "حصہ",
    covers: "کیا شامل ہے",
    monthly: "ماہانہ اخراجات (M1–M12)",
    cumulative: "مجموعی اخراجات",
    month: "ماہ",
    total: "کل",
    y2plan: "سال 2 — باقی قسط کہاں لگے گی",
    note: "سال 1 کے حصے سلائیڈر کے ساتھ تبدیل ہوتے ہیں۔ انجینئرنگ ہر صورت میں 50% رہتی ہے۔",
    print: "پرنٹ",
    eng: "انجینئرنگ ٹیم",
    hipaa: "HIPAA آڈٹ اور سرٹیفیکیشن",
    ksa: "سعودی تعمیل اور انٹیگریشنز",
    ai: "AI / طبیبی + GPU",
    infra: "انفراسٹرکچر اور سیلف ہوسٹ",
    legal: "قانونی، لائسنسنگ اور ہنگامی رقم",
    engD: "6 انجینئرز، مرحلہ وار بھرتی — بیک اینڈ، فرنٹ اینڈ، AI/ML، QA، DevOps",
    hipaaD: "گیپ اسیسمنٹ، اصلاح، تھرڈ پارٹی آڈٹ، BAA فریم ورک، پینیٹریشن ٹیسٹ",
    ksaD: "NPHIES، ZATCA فیز 2، وصفتی، تتمین/RSD، نفاذ، صحتی/HESN — فیس، تعمیر، UAT",
    aiD: "GPU سرور، ماڈل کوالٹی، عربی + اردو ASR/TTS، جانچ، گارڈریلز",
    infraD: "سرورز، بیک اپ/DR، مانیٹرنگ، اسٹیجنگ، سیکیورٹی ٹولنگ",
    legalD: "ادارہ/لائسنس، معاہدے، SFDA/MOH کاغذات، ہنگامی رقم",
    y2a: "سرٹیفیکیشن مکمل ہونے کے بعد سیلز اور مارکیٹنگ کا آغاز",
    y2b: "ٹیم 6 سے 9–11 انجینئرز تک",
    y2c: "پائلٹ سے پروڈکشن رول آؤٹ اور اسپتال آن بورڈنگ",
    y2d: "ملٹی ریجن انفراسٹرکچر اور 24/7 سپورٹ",
  },
  ar: {
    title: "متطلبات التمويل — 3.0 مليون ريال على 24 شهراً",
    subtitle: "السنة الأولى هي الدفعة الأولى وليست الطلب النهائي. اضبط متطلبات السنة الأولى أدناه.",
    totalAsk: "إجمالي المتطلبات (24 شهراً)",
    year1: "دفعة السنة الأولى",
    year2: "دفعة السنة الثانية",
    slider: "المتطلبات الفورية للسنة الأولى",
    lean: "الحد الأدنى",
    base: "الأساسي",
    full: "الكامل",
    blocks: "بنود تكاليف السنة الأولى",
    block: "بند التكلفة",
    amount: "المبلغ (ريال)",
    share: "النسبة",
    covers: "ما يغطيه",
    monthly: "الإنفاق الشهري (م1–م12)",
    cumulative: "الإنفاق التراكمي",
    month: "الشهر",
    total: "الإجمالي",
    y2plan: "السنة الثانية — ما تموّله الدفعة المتبقية",
    note: "بنود السنة الأولى تتغير مع المؤشر. الهندسة تبقى 50٪ من دفعة السنة الأولى في كل السيناريوهات.",
    print: "طباعة",
    eng: "فريق الهندسة",
    hipaa: "تدقيق واعتماد HIPAA",
    ksa: "الامتثال والتكامل السعودي",
    ai: "الذكاء الاصطناعي / طبيبي + GPU",
    infra: "البنية التحتية والاستضافة الذاتية",
    legal: "القانوني والتراخيص والاحتياطي",
    engD: "6 مهندسين بتوظيف تدريجي — خلفي، واجهة، ذكاء اصطناعي، جودة، DevOps",
    hipaaD: "تقييم الفجوات، المعالجة، تدقيق طرف ثالث، إطار BAA، اختبار اختراق",
    ksaD: "نفيس، ZATCA المرحلة 2، وصفتي، تتمين/RSD، نفاذ، صحتي/HESN — رسوم وبناء واختبار",
    aiD: "سيرفر GPU، جودة النماذج، ASR/TTS للعربية والأردية، منظومة تقييم، ضوابط",
    infraD: "سيرفرات، نسخ احتياطي/DR، مراقبة، بيئات اختبار، أدوات أمن",
    legalD: "الكيان/التراخيص، العقود، أوراق الهيئة/الوزارة، احتياطي",
    y2a: "انطلاق البيع والتسويق بعد اكتمال الاعتمادات",
    y2b: "توسيع الفريق من 6 إلى 9–11 مهندساً",
    y2c: "التحول من التجريب إلى الإنتاج وتأهيل المستشفيات",
    y2d: "بنية تحتية متعددة المناطق ودعم على مدار الساعة",
  },
};

const TOTAL_ASK = 3_000_000;

// Base (SAR 1.55M) block weights
const BLOCKS = [
  { key: "eng", desc: "engD", base: 775_000, color: "hsl(174 62% 40%)" },
  { key: "ksa", desc: "ksaD", base: 260_000, color: "hsl(200 70% 45%)" },
  { key: "ai", desc: "aiD", base: 230_000, color: "hsl(262 55% 55%)" },
  { key: "hipaa", desc: "hipaaD", base: 130_000, color: "hsl(38 85% 50%)" },
  { key: "infra", desc: "infraD", base: 85_000, color: "hsl(150 50% 42%)" },
  { key: "legal", desc: "legalD", base: 70_000, color: "hsl(0 60% 55%)" },
] as const;

// Monthly ramp weights per block (12 months), normalized inside the component
const RAMPS: Record<string, number[]> = {
  eng: [3, 4, 5, 7, 8, 9, 9, 9, 9, 9, 9, 9],
  ksa: [1, 2, 4, 8, 10, 12, 12, 12, 10, 8, 6, 5],
  ai: [16, 16, 8, 6, 6, 6, 6, 6, 6, 8, 8, 8],
  hipaa: [4, 6, 6, 8, 10, 12, 12, 10, 10, 8, 7, 7],
  infra: [12, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
  legal: [14, 10, 8, 8, 8, 8, 8, 8, 8, 7, 7, 6],
};

export default function Year1Budget() {
  const [lang, setLang] = useState<Lang>("en");
  const [y1, setY1] = useState<number>(1_550_000);
  const t = T[lang];
  const dir = lang === "en" ? "ltr" : "rtl";

  const fmt = (n: number) => `SAR ${Math.round(n).toLocaleString("en-US")}`;
  const fmtK = (n: number) => `${Math.round(n / 1000)}K`;

  const blocks = useMemo(() => {
    const scale = y1 / 1_550_000;
    return BLOCKS.map((b) => ({
      key: b.key,
      desc: b.desc,
      color: b.color,
      amount: b.base * scale,
      share: b.base / 1_550_000,
    }));
  }, [y1]);

  const monthly = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const row: Record<string, number | string> = { month: `M${i + 1}` };
      let total = 0;
      blocks.forEach((b) => {
        const ramp = RAMPS[b.key].map((v) => (typeof v === "number" ? v : 0));
        const sum = ramp.reduce((a, c) => a + c, 0);
        const val = (b.amount * ramp[i]) / sum;
        row[b.key] = Math.round(val);
        total += val;
      });
      row.total = Math.round(total);
      return row;
    });
  }, [blocks]);

  const cumulative = useMemo(() => {
    let run = 0;
    return monthly.map((m) => {
      run += Number(m.total);
      return { month: m.month, cumulative: Math.round(run) };
    });
  }, [monthly]);

  const year2 = TOTAL_ASK - y1;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <SEO
        title="Funding Requirement — SAR 3.0M over 24 Months | HealthOS24"
        description="HealthOS24 funding requirement: SAR 3.0M across 24 months, with a modelled Year-1 tranche of SAR 1.4M–1.7M covering compliance, KSA integrations, AI and engineering."
      />
      <div className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            {(["en", "ur", "ar"] as Lang[]).map((l) => (
              <Button key={l} size="sm" variant={lang === l ? "default" : "outline"} onClick={() => setLang(l)}>
                {l === "en" ? "English" : l === "ur" ? "اردو" : "العربية"}
              </Button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 me-2" /> {t.print}
          </Button>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">{t.totalAsk}</p>
            <p className="text-3xl font-bold text-primary mt-1">{fmt(TOTAL_ASK)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">{t.year1}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{fmt(y1)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">{t.year2}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{fmt(year2)}</p>
          </Card>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-foreground">{t.slider}</h2>
            <Badge variant="secondary">
              {y1 <= 1_450_000 ? t.lean : y1 >= 1_650_000 ? t.full : t.base}
            </Badge>
          </div>
          <Slider
            min={1_400_000}
            max={1_700_000}
            step={10_000}
            value={[y1]}
            onValueChange={(v) => setY1(v[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>SAR 1.40M · {t.lean}</span>
            <span>SAR 1.55M · {t.base}</span>
            <span>SAR 1.70M · {t.full}</span>
          </div>
          <p className="text-sm text-muted-foreground">{t.note}</p>
        </Card>

        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-foreground">{t.blocks}</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={blocks.map((b) => ({ name: t[b.key], value: Math.round(b.amount) }))}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="52%"
                    outerRadius="82%"
                    paddingAngle={2}
                  >
                    {blocks.map((b) => (
                      <Cell key={b.key} fill={b.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.block}</TableHead>
                    <TableHead>{t.amount}</TableHead>
                    <TableHead>{t.share}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocks.map((b) => (
                    <TableRow key={b.key}>
                      <TableCell>
                        <div className="font-medium text-foreground">{t[b.key]}</div>
                        <div className="text-xs text-muted-foreground">{t[b.desc]}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{fmt(b.amount)}</TableCell>
                      <TableCell>{(b.share * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-semibold">{t.total}</TableCell>
                    <TableCell className="font-semibold whitespace-nowrap">{fmt(y1)}</TableCell>
                    <TableCell className="font-semibold">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{t.monthly}</h2>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis tickFormatter={fmtK} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend />
                {blocks.map((b) => (
                  <Bar key={b.key} dataKey={b.key} name={t[b.key]} stackId="a" fill={b.color} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{t.cumulative}</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulative}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis tickFormatter={fmtK} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Line type="monotone" dataKey="cumulative" name={t.cumulative} stroke="hsl(174 62% 40%)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{t.y2plan} — {fmt(year2)}</h2>
          <ul className="list-disc ps-6 space-y-1.5 text-sm text-muted-foreground">
            <li>{t.y2a}</li>
            <li>{t.y2b}</li>
            <li>{t.y2c}</li>
            <li>{t.y2d}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

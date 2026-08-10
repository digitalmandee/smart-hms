import React, { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ComposedChart,
} from "recharts";
import { Languages, Printer } from "lucide-react";

type Lang = "en" | "ur" | "ar";

const T: Record<Lang, Record<string, string>> = {
  en: {
    title: "Funding Requirement — SAR 3.0M over 24 Months",
    subtitle: "Year 1 is the first tranche of SAR 1.75M, not the final ask. Year 2 funds commercial launch.",
    totalAsk: "Total requirement (24 months)",
    year1: "Year 1 tranche",
    year2: "Year 2 tranche",
    slider: "Year-1 immediate requirement — fixed base case",
    base: "Base",
    blocks: "Year-1 cost blocks",
    block: "Cost block",
    amount: "Amount (SAR)",
    share: "Share",
    monthly: "Monthly spend (M1–M12)",
    cumulative: "Cumulative spend",
    total: "Total",
    y2plan: "Year 2 — what the remaining tranche funds",
    note: "Base case: SAR 1,750,000 for Year 1, of which SAR 1,094,000 (63%) is engineering payroll for a team that reaches 14 people by Month 12. Hiring is hard-staggered so the tranche is not exceeded; full-strength burn is SAR 329,000 per month.",
    print: "Print",
    team: "Engineering team and hiring ramp",
    role: "Role",
    heads: "Heads",
    salary: "Monthly salary",
    starts: "Start months",
    headcount: "Headcount",
    payrollK: "Payroll (SAR '000)",
    gap: "Year-2 funding gap and the three ways to close it",
    option: "Option",
    need: "Year-2 need",
    means: "What it means",
    eng: "Engineering team",
    ksa: "KSA compliance & integrations",
    ai: "AI / Tabeebi + GPU",
    audit: "HIPAA audit",
    cert: "HIPAA certification & licensing",
    infra: "Infrastructure & self-host",
    legal: "Legal & contingency",
    engD: "14 people at full strength: 8 developers (2 senior), 2 AI/ML, 1 DevOps, 2 QA, 1 UI/UX designer",
    ksaD: "NPHIES, ZATCA Phase 2, Wasfaty, Tatmeen/RSD, Nafath, Sehhaty/HESN — onboarding fees, sandbox and UAT cycles",
    aiD: "GPU capacity, model quality, Arabic + Urdu ASR/TTS, evaluation harness, safety guardrails",
    auditD: "Gap assessment, remediation, penetration test and retest, third-party audit fieldwork (Months 2–7)",
    certD: "Certification body fees, license issuance, BAA framework, policy attestation, renewal setup (Months 7–12)",
    infraD: "Servers, backup/DR, monitoring, staging environments, security tooling",
    legalD: "Entity and licensing, contracts, SFDA/MOH paperwork, contingency reserve",
    optRaiseT: "Raise the Year-2 tranche",
    optRaise: "Fund the full 14-person team for 12 months (SAR 3,948,000) plus sales, support and infrastructure. Total 24-month requirement becomes roughly SAR 6.2M.",
    optCapT: "Cap steady-state headcount",
    optCap: "Hold the team at 7–8 people after Month 12 (about SAR 165,000 per month) and grow only against signed contracts.",
    optRevT: "Offset with pilot revenue",
    optRev: "Reference-site licence and implementation fees from Month 13 fund part of payroll; reduces but does not remove the gap.",
    y2a: "Engineering payroll — SAR 900,000",
    y2b: "Sales & marketing launch after certifications clear — SAR 280,000",
    y2c: "Implementation & support for live hospitals — SAR 150,000",
    y2d: "Infrastructure and recertification — SAR 80,000; contingency SAR 40,000",
  },
  ur: {
    title: "فنڈنگ ضرورت — 24 ماہ میں SAR 3.0M",
    subtitle: "سال 1 پہلی قسط (SAR 1.75M) ہے، حتمی مطالبہ نہیں۔ سال 2 کمرشل لانچ کے لیے ہے۔",
    totalAsk: "کل ضرورت (24 ماہ)",
    year1: "سال 1 قسط",
    year2: "سال 2 قسط",
    slider: "سال 1 فوری ضرورت — طے شدہ بنیادی کیس",
    base: "بنیادی",
    blocks: "سال 1 لاگت کے حصے",
    block: "لاگت کا حصہ",
    amount: "رقم (SAR)",
    share: "حصہ",
    monthly: "ماہانہ اخراجات (M1–M12)",
    cumulative: "مجموعی اخراجات",
    total: "کل",
    y2plan: "سال 2 — باقی قسط کہاں لگے گی",
    note: "بنیادی کیس: سال 1 کے لیے SAR 1,750,000، جس میں SAR 1,094,000 (63%) انجینئرنگ تنخواہیں ہیں — ٹیم مہینہ 12 تک 14 افراد تک پہنچتی ہے۔ بھرتی مرحلہ وار ہے تاکہ قسط سے تجاوز نہ ہو؛ مکمل ٹیم کا ماہانہ خرچ SAR 329,000 ہے۔",
    print: "پرنٹ",
    team: "انجینئرنگ ٹیم اور بھرتی کا مرحلہ",
    role: "کردار",
    heads: "افراد",
    salary: "ماہانہ تنخواہ",
    starts: "آغاز کے مہینے",
    headcount: "افراد کی تعداد",
    payrollK: "تنخواہ (SAR '000)",
    gap: "سال 2 کا فنڈنگ گیپ اور اسے پورا کرنے کے تین طریقے",
    option: "آپشن",
    need: "سال 2 ضرورت",
    means: "مطلب",
    eng: "انجینئرنگ ٹیم",
    ksa: "سعودی تعمیل اور انٹیگریشنز",
    ai: "AI / طبیبی + GPU",
    audit: "HIPAA آڈٹ",
    cert: "HIPAA سرٹیفیکیشن اور لائسنسنگ",
    infra: "انفراسٹرکچر اور سیلف ہوسٹ",
    legal: "قانونی اور ہنگامی رقم",
    engD: "مکمل ٹیم 14 افراد: 8 ڈیولپرز (2 سینئر)، 2 AI/ML، 1 DevOps، 2 QA، 1 UI/UX ڈیزائنر",
    ksaD: "NPHIES، ZATCA فیز 2، وصفتی، تتمین/RSD، نفاذ، صحتی/HESN — فیس، سینڈ باکس اور UAT",
    aiD: "GPU کپیسٹی، ماڈل کوالٹی، عربی + اردو ASR/TTS، جانچ، گارڈریلز",
    auditD: "گیپ اسیسمنٹ، اصلاح، پینیٹریشن ٹیسٹ، تھرڈ پارٹی آڈٹ (مہینہ 2–7)",
    certD: "سرٹیفیکیشن فیس، لائسنس اجرا، BAA فریم ورک، پالیسی تصدیق، تجدید (مہینہ 7–12)",
    infraD: "سرورز، بیک اپ/DR، مانیٹرنگ، اسٹیجنگ، سیکیورٹی ٹولنگ",
    legalD: "ادارہ/لائسنس، معاہدے، SFDA/MOH کاغذات، ہنگامی رقم",
    optRaiseT: "سال 2 کی قسط بڑھائیں",
    optRaise: "پوری 14 رکنی ٹیم کے 12 ماہ (SAR 3,948,000) کے علاوہ سیلز، سپورٹ اور انفراسٹرکچر۔ کل 24 ماہ کی ضرورت تقریباً SAR 6.2M ہو جائے گی۔",
    optCapT: "مستقل افراد کی حد مقرر کریں",
    optCap: "مہینہ 12 کے بعد ٹیم 7–8 افراد پر رکھیں (تقریباً SAR 165,000 ماہانہ) اور صرف دستخط شدہ معاہدوں کے مطابق بڑھائیں۔",
    optRevT: "پائلٹ آمدنی سے پورا کریں",
    optRev: "مہینہ 13 سے ریفرنس سائٹ لائسنس اور امپلیمینٹیشن فیس تنخواہوں کا حصہ پورا کرے گی؛ گیپ کم ہوگا مگر ختم نہیں۔",
    y2a: "انجینئرنگ تنخواہیں — SAR 900,000",
    y2b: "سرٹیفیکیشن کے بعد سیلز اور مارکیٹنگ — SAR 280,000",
    y2c: "لائیو اسپتالوں کی امپلیمینٹیشن اور سپورٹ — SAR 150,000",
    y2d: "انفراسٹرکچر اور دوبارہ سرٹیفیکیشن — SAR 80,000؛ ہنگامی SAR 40,000",
  },
  ar: {
    title: "متطلبات التمويل — 3.0 مليون ريال على 24 شهراً",
    subtitle: "السنة الأولى هي الدفعة الأولى (1.75 مليون ريال) وليست الطلب النهائي. السنة الثانية تموّل الانطلاق التجاري.",
    totalAsk: "إجمالي المتطلبات (24 شهراً)",
    year1: "دفعة السنة الأولى",
    year2: "دفعة السنة الثانية",
    slider: "المتطلبات الفورية للسنة الأولى — الحالة الأساسية",
    base: "الأساسي",
    blocks: "بنود تكاليف السنة الأولى",
    block: "بند التكلفة",
    amount: "المبلغ (ريال)",
    share: "النسبة",
    monthly: "الإنفاق الشهري (م1–م12)",
    cumulative: "الإنفاق التراكمي",
    total: "الإجمالي",
    y2plan: "السنة الثانية — ما تموّله الدفعة المتبقية",
    note: "الحالة الأساسية: 1,750,000 ريال للسنة الأولى، منها 1,094,000 ريال (63٪) رواتب هندسية لفريق يصل إلى 14 شخصاً بحلول الشهر 12. التوظيف تدريجي صارم لعدم تجاوز الدفعة؛ التكلفة الشهرية بكامل الفريق 329,000 ريال.",
    print: "طباعة",
    team: "فريق الهندسة ومسار التوظيف",
    role: "الدور",
    heads: "العدد",
    salary: "الراتب الشهري",
    starts: "أشهر البدء",
    headcount: "عدد الأفراد",
    payrollK: "الرواتب (ألف ريال)",
    gap: "فجوة تمويل السنة الثانية والطرق الثلاث لإغلاقها",
    option: "الخيار",
    need: "احتياج السنة الثانية",
    means: "ما يعنيه",
    eng: "فريق الهندسة",
    ksa: "الامتثال والتكامل السعودي",
    ai: "الذكاء الاصطناعي / طبيبي + GPU",
    audit: "تدقيق HIPAA",
    cert: "اعتماد وترخيص HIPAA",
    infra: "البنية التحتية والاستضافة الذاتية",
    legal: "القانوني والاحتياطي",
    engD: "14 شخصاً بكامل القوة: 8 مطورين (2 كبار)، 2 ذكاء اصطناعي، 1 DevOps، 2 جودة، 1 مصمم واجهات",
    ksaD: "نفيس، ZATCA المرحلة 2، وصفتي، تتمين/RSD، نفاذ، صحتي/HESN — رسوم وبيئات اختبار ودورات UAT",
    aiD: "قدرة GPU، جودة النماذج، ASR/TTS للعربية والأردية، منظومة تقييم، ضوابط سلامة",
    auditD: "تقييم الفجوات، المعالجة، اختبار الاختراق، تدقيق طرف ثالث (الأشهر 2–7)",
    certD: "رسوم جهة الاعتماد، إصدار الترخيص، إطار BAA، إقرار السياسات، التجديد (الأشهر 7–12)",
    infraD: "سيرفرات، نسخ احتياطي/DR، مراقبة، بيئات اختبار، أدوات أمن",
    legalD: "الكيان والتراخيص، العقود، أوراق الهيئة/الوزارة، احتياطي",
    optRaiseT: "زيادة دفعة السنة الثانية",
    optRaise: "تمويل الفريق الكامل (14 شخصاً) لمدة 12 شهراً (3,948,000 ريال) مع البيع والدعم والبنية التحتية. يصبح إجمالي 24 شهراً نحو 6.2 مليون ريال.",
    optCapT: "تحديد سقف عدد الأفراد",
    optCap: "إبقاء الفريق عند 7–8 أشخاص بعد الشهر 12 (نحو 165,000 ريال شهرياً) والتوسع فقط مقابل عقود موقعة.",
    optRevT: "التعويض بإيرادات المرحلة التجريبية",
    optRev: "رسوم الترخيص والتنفيذ لموقع مرجعي من الشهر 13 تغطي جزءاً من الرواتب؛ تقلل الفجوة ولا تلغيها.",
    y2a: "الرواتب الهندسية — 900,000 ريال",
    y2b: "انطلاق البيع والتسويق بعد الاعتمادات — 280,000 ريال",
    y2c: "التنفيذ والدعم للمستشفيات الحية — 150,000 ريال",
    y2d: "البنية التحتية وإعادة الاعتماد — 80,000 ريال؛ احتياطي 40,000 ريال",
  },
};

const TOTAL_ASK = 3_000_000;
const Y1 = 1_750_000;

// (rate, start month) — 14 heads, hard-staggered
const ROLES: [number, number][] = [
  [22_000, 1], [32_000, 5], [30_000, 7], [22_000, 9], [25_000, 10],
  [15_000, 11], [18_000, 11], [22_000, 12], [32_000, 12], [30_000, 12],
  [22_000, 12], [22_000, 12], [22_000, 12], [15_000, 12],
];

const ROLE_SUMMARY = [
  { role: "Developer", heads: 6, salary: 22_000, starts: "M1, M9, M12 ×4" },
  { role: "Senior Developer", heads: 2, salary: 30_000, starts: "M7, M12" },
  { role: "AI / ML Engineer", heads: 2, salary: 32_000, starts: "M5, M12" },
  { role: "DevOps Engineer", heads: 1, salary: 25_000, starts: "M10" },
  { role: "QA Engineer", heads: 2, salary: 15_000, starts: "M11, M12" },
  { role: "UI/UX Designer", heads: 1, salary: 18_000, starts: "M11" },
];

const payroll = Array.from({ length: 12 }, (_, m) =>
  ROLES.reduce((sum, [rate, start]) => (m + 1 >= start ? sum + rate : sum), 0),
);
const headcount = Array.from({ length: 12 }, (_, m) =>
  ROLES.filter(([, start]) => m + 1 >= start).length,
);
const ENG_TOTAL = payroll.reduce((a, b) => a + b, 0); // 1,094,000
const FULL_BURN = payroll[11]; // 329,000

const BLOCKS = [
  { key: "eng", desc: "engD", amount: ENG_TOTAL, color: "hsl(178 85% 22%)" },
  { key: "ksa", desc: "ksaD", amount: 150_000, color: "hsl(200 70% 39%)" },
  { key: "ai", desc: "aiD", amount: 135_000, color: "hsl(262 36% 47%)" },
  { key: "audit", desc: "auditD", amount: 130_000, color: "hsl(38 79% 47%)" },
  { key: "cert", desc: "certD", amount: 95_000, color: "hsl(26 82% 39%)" },
  { key: "infra", desc: "infraD", amount: 120_000, color: "hsl(150 50% 36%)" },
  { key: "legal", desc: "legalD", amount: 26_000, color: "hsl(2 47% 53%)" },
] as const;

const RAMPS: Record<string, number[]> = {
  ksa: [1, 2, 4, 8, 10, 12, 12, 12, 10, 8, 6, 5],
  ai: [16, 16, 8, 6, 6, 6, 6, 6, 6, 8, 8, 8],
  audit: [0, 3, 5, 6, 6, 5, 3, 0, 0, 0, 0, 0],
  cert: [0, 0, 0, 0, 0, 0, 2, 3, 4, 4, 4, 3],
  infra: [12, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
  legal: [14, 10, 8, 8, 8, 8, 8, 8, 8, 7, 7, 6],
};

export default function Year1Budget() {
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];
  const dir = lang === "en" ? "ltr" : "rtl";

  const fmt = (n: number) => `SAR ${Math.round(n).toLocaleString("en-US")}`;
  const fmtK = (n: number) => `${Math.round(n / 1000)}K`;

  const monthly = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const row: Record<string, number | string> = { month: `M${i + 1}` };
      let total = 0;
      BLOCKS.forEach((b) => {
        const val =
          b.key === "eng"
            ? payroll[i]
            : (b.amount * RAMPS[b.key][i]) / RAMPS[b.key].reduce((a, c) => a + c, 0);
        row[b.key] = Math.round(val);
        total += val;
      });
      row.total = Math.round(total);
      return row;
    });
  }, []);

  const cumulative = useMemo(() => {
    let run = 0;
    return monthly.map((m) => {
      run += Number(m.total);
      return { month: m.month, cumulative: Math.round(run) };
    });
  }, [monthly]);

  const teamRamp = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({
      month: `M${i + 1}`,
      headcount: headcount[i],
      payroll: Math.round(payroll[i] / 1000),
    })),
    [],
  );

  const peak = Math.max(...monthly.map((m) => Number(m.total)));
  const year2 = TOTAL_ASK - Y1;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <SEO
        title="Funding Requirement — SAR 3.0M over 24 Months | HealthOS24"
        description="HealthOS24 funding requirement: SAR 3.0M across 24 months. Year-1 tranche of SAR 1.75M covers a 14-person engineering ramp, HIPAA audit and certification, KSA integrations and AI infrastructure."
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
            <p className="text-3xl font-bold text-foreground mt-1">{fmt(Y1)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">{t.year2}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{fmt(year2)}</p>
          </Card>
        </div>

        <Card className="p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-foreground">{t.slider}</h2>
            <Badge variant="secondary">{t.base} · SAR 1.75M</Badge>
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
                    data={BLOCKS.map((b) => ({ name: t[b.key], value: b.amount }))}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="52%"
                    outerRadius="82%"
                    paddingAngle={2}
                  >
                    {BLOCKS.map((b) => (
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
                  {BLOCKS.map((b) => (
                    <TableRow key={b.key}>
                      <TableCell>
                        <div className="font-medium text-foreground">{t[b.key]}</div>
                        <div className="text-xs text-muted-foreground">{t[b.desc]}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{fmt(b.amount)}</TableCell>
                      <TableCell>{((b.amount / Y1) * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-semibold">{t.total}</TableCell>
                    <TableCell className="font-semibold whitespace-nowrap">{fmt(Y1)}</TableCell>
                    <TableCell className="font-semibold">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-foreground">{t.team}</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.role}</TableHead>
                  <TableHead>{t.heads}</TableHead>
                  <TableHead>{t.salary}</TableHead>
                  <TableHead>{t.starts}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROLE_SUMMARY.map((r) => (
                  <TableRow key={r.role}>
                    <TableCell className="font-medium text-foreground">{r.role}</TableCell>
                    <TableCell>{r.heads}</TableCell>
                    <TableCell className="whitespace-nowrap">{fmt(r.salary)}</TableCell>
                    <TableCell>{r.starts}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-semibold">{t.total}</TableCell>
                  <TableCell className="font-semibold">14</TableCell>
                  <TableCell className="font-semibold whitespace-nowrap">{fmt(FULL_BURN)}</TableCell>
                  <TableCell className="font-semibold">M12</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={teamRamp}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis yAxisId="l" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis yAxisId="r" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="l" dataKey="headcount" name={t.headcount} fill="hsl(178 40% 62%)" />
                <Line yAxisId="r" type="monotone" dataKey="payroll" name={t.payrollK} stroke="hsl(178 85% 22%)" strokeWidth={2.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-foreground">{t.monthly}</h2>
            <Badge variant="secondary">{fmt(peak)} · M12</Badge>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis tickFormatter={fmtK} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend />
                {BLOCKS.map((b) => (
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
                <Line type="monotone" dataKey="cumulative" name={t.cumulative} stroke="hsl(178 85% 22%)" strokeWidth={2.5} dot={false} />
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

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{t.gap}</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.option}</TableHead>
                  <TableHead>{t.need}</TableHead>
                  <TableHead>{t.means}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-foreground">{t.optRaiseT}</TableCell>
                  <TableCell className="whitespace-nowrap">~SAR 4.6M</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.optRaise}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-foreground">{t.optCapT}</TableCell>
                  <TableCell className="whitespace-nowrap">~SAR 2.6M</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.optCap}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-foreground">{t.optRevT}</TableCell>
                  <TableCell className="whitespace-nowrap">—</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.optRev}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

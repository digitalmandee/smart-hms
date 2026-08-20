import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2, Droplet, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

type Lang = "en" | "ur" | "ar";

const COPY: Record<Lang, Record<string, string>> = {
  en: {
    org: "Aleem Dar Foundation",
    sub: "Thalassemia Care Centre — powered by HealthOS 24",
    demo: "Demo access",
    demoHelp: "Select a role to sign in instantly with the demo account.",
    manual: "Sign in with email",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    failed: "Login failed",
    welcome: "Welcome back",
    secure: "Secure, role-based access",
  },
  ur: {
    org: "علیم ڈار فاؤنڈیشن",
    sub: "تھیلیسیمیا کیئر سینٹر — ہیلتھ او ایس 24",
    demo: "ڈیمو رسائی",
    demoHelp: "فوری لاگ ان کے لیے کوئی کردار منتخب کریں۔",
    manual: "ای میل سے لاگ ان کریں",
    email: "ای میل",
    password: "پاس ورڈ",
    signIn: "لاگ ان",
    signingIn: "لاگ ان ہو رہا ہے...",
    failed: "لاگ ان ناکام",
    welcome: "خوش آمدید",
    secure: "محفوظ، کردار کے مطابق رسائی",
  },
  ar: {
    org: "مؤسسة عليم دار",
    sub: "مركز رعاية الثلاسيميا — بدعم من HealthOS 24",
    demo: "دخول تجريبي",
    demoHelp: "اختر دورًا لتسجيل الدخول فورًا بحساب تجريبي.",
    manual: "تسجيل الدخول بالبريد الإلكتروني",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signIn: "تسجيل الدخول",
    signingIn: "جارٍ تسجيل الدخول...",
    failed: "فشل تسجيل الدخول",
    welcome: "مرحبًا بعودتك",
    secure: "وصول آمن حسب الدور",
  },
};

const DEMO_PASSWORD = "ADF@healthos24";

const ACCOUNTS: { email: string; label: Record<Lang, string>; role: string }[] = [
  { email: "adf@healthos24.com", role: "org_admin", label: { en: "Organization Admin", ur: "آرگنائزیشن ایڈمن", ar: "مدير المؤسسة" } },
  { email: "doctor@healthos24.com", role: "doctor", label: { en: "Doctor", ur: "ڈاکٹر", ar: "طبيب" } },
  { email: "reception@healthos24.com", role: "receptionist", label: { en: "Reception", ur: "استقبالیہ", ar: "الاستقبال" } },
  { email: "finance@healthos24.com", role: "finance_manager", label: { en: "Finance", ur: "فنانس", ar: "المالية" } },
  { email: "procurement@healthos24.com", role: "store_manager", label: { en: "Procurement / Store", ur: "پروکیورمنٹ / اسٹور", ar: "المشتريات / المخزن" } },
  { email: "lab@healthos24.com", role: "lab_technician", label: { en: "Lab Technician", ur: "لیب ٹیکنیشن", ar: "فني المختبر" } },
  { email: "pharmacy@healthos24.com", role: "pharmacist", label: { en: "Pharmacist", ur: "فارماسسٹ", ar: "الصيدلي" } },
  { email: "bloodbank@healthos24.com", role: "blood_bank_technician", label: { en: "Blood Bank", ur: "بلڈ بینک", ar: "بنك الدم" } },
];

export default function AdfLoginPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [pending, setPending] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const c = COPY[lang];
  const rtl = lang !== "en";

  const doLogin = async (mail: string, pass: string) => {
    setPending(mail);
    try {
      const { error } = await signIn(mail, pass);
      if (error) {
        toast({ title: c.failed, description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: c.welcome, description: mail });
      navigate("/app/dashboard", { replace: true });
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col" dir={rtl ? "rtl" : "ltr"}>
      <SEO
        title="Aleem Dar Foundation — Staff Login | HealthOS 24"
        description="Secure staff sign-in for Aleem Dar Foundation Thalassemia Care Centre, powered by HealthOS 24."
        path="/adf/login"
      />

      <header className="border-b bg-card">
        <div className={`max-w-5xl mx-auto px-4 h-16 flex items-center gap-3 ${rtl ? "flex-row-reverse" : ""}`}>
          <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
            <Droplet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className={rtl ? "text-end" : ""}>
            <div className="font-semibold leading-tight">{c.org}</div>
            <div className="text-xs text-muted-foreground">{c.sub}</div>
          </div>
          <div className="flex-1" />
          <div className="flex gap-1">
            {(["en", "ur", "ar"] as Lang[]).map((l) => (
              <Button key={l} size="sm" variant={l === lang ? "default" : "ghost"} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className={rtl ? "text-end" : ""}>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {c.demo}
            </CardTitle>
            <CardDescription>{c.demoHelp}</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            {ACCOUNTS.map((a) => (
              <Button
                key={a.email}
                variant="outline"
                className="h-auto py-3 flex flex-col items-start gap-1"
                disabled={pending !== null}
                onClick={() => doLogin(a.email, DEMO_PASSWORD)}
              >
                <span className="font-medium flex items-center gap-2">
                  {pending === a.email && <Loader2 className="h-3 w-3 animate-spin" />}
                  {a.label[lang]}
                </span>
                <span className="text-xs text-muted-foreground font-normal">{a.email}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader className={rtl ? "text-end" : ""}>
            <CardTitle>{c.manual}</CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                {c.secure}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                doLogin(email.trim(), password);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="adf-email">{c.email}</Label>
                <Input id="adf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adf-password">{c.password}</Label>
                <Input
                  id="adf-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={pending !== null}>
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                    {c.signingIn}
                  </>
                ) : (
                  c.signIn
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t bg-card py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {c.org} · HealthOS 24
      </footer>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DoctorAvatar } from "@/components/ai/DoctorAvatar";
import { supabase } from "@/integrations/supabase/client";
import {
  Mic, Globe, Brain, ArrowRight, Eye, EyeOff,
  Stethoscope, Shield, Clock, HeartPulse, MessageSquare,
  BookOpen, Users, CheckCircle2, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AuthMode = "login" | "signup";

const HERO_STATS = [
  { value: "50K+", label: "Consultations", icon: MessageSquare },
  { value: "3", label: "Languages", icon: Globe },
  { value: "24/7", label: "Available", icon: Clock },
  { value: "98%", label: "Accuracy", icon: CheckCircle2 },
];

const AI_CAPABILITIES = [
  {
    icon: HeartPulse,
    title: "Custom-Trained Medical AI",
    desc: "Built on proprietary medical datasets — trained specifically for symptom analysis, clinical reasoning, and patient-friendly explanations.",
  },
  {
    icon: Mic,
    title: "Voice-First Consultation",
    desc: "Speak naturally in English, Arabic, or Urdu. Tabeebi listens, understands context, and responds like a real physician.",
  },
  {
    icon: Brain,
    title: "Intelligent Follow-Up",
    desc: "Asks focused clinical questions one at a time — severity, duration, aggravating factors — just like a trained doctor would.",
  },
  {
    icon: Shield,
    title: "Safe & Structured Guidance",
    desc: "Provides OTC medication with exact dosages, home remedies, red flags to watch for, and when to see a specialist.",
  },
  {
    icon: BookOpen,
    title: "Continuous Learning",
    desc: "Tabeebi's AI model continuously improves from thousands of clinical interactions, getting smarter with every consultation.",
  },
  {
    icon: Users,
    title: "Doctor-Grade Accuracy",
    desc: "Follows the same diagnostic flow as experienced physicians — chief complaint, history, differentials, and structured assessment.",
  },
];

const TESTIMONIALS = [
  { text: "Tabeebi asked better follow-up questions than some doctors I've visited. The assessment was spot on.", name: "Sarah M.", role: "Patient" },
  { text: "I described my symptoms in Urdu and got a detailed, accurate response. Truly impressive.", name: "Ahmed K.", role: "Patient" },
  { text: "As a doctor, I'm impressed by how Tabeebi follows clinical reasoning. It's a genuinely useful triage tool.", name: "Dr. Fatima", role: "Physician" },
];

export default function TabeebiLandingPage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/tabeebi/chat", { replace: true });
      }
      setCheckingAuth(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/tabeebi/chat", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      if (authMode === "signup") {
        if (!fullName.trim()) {
          toast.error("Please enter your name");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: window.location.origin + "/tabeebi/chat",
          },
        });
        if (error) throw error;
        toast.success("Account created! Redirecting...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="animate-pulse">
          <DoctorAvatar state="thinking" size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col overflow-x-hidden">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-foreground">Tabeebi <span className="text-primary">AI</span></span>
        </div>
        <span className="text-[11px] text-muted-foreground font-medium px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10">
          Custom Medical AI
        </span>
      </header>

      {/* ── Hero ── */}
      <section className="px-5 py-10 lg:py-16">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left: Hero content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 max-w-xl">
            <DoctorAvatar state="idle" size="lg" />

            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                <Zap className="h-3 w-3" />
                Custom-Trained AI — Not a Generic Chatbot
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
                Your Personal <span className="text-primary">AI Doctor</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Tabeebi is a custom-built medical AI trained on clinical protocols and real physician workflows. 
                It doesn't just answer — it <strong className="text-foreground">thinks like a doctor</strong>.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 w-full max-w-sm">
              {HERO_STATS.map((s) => (
                <div key={s.label} className="text-center p-2 rounded-xl bg-muted/50 border border-border/30">
                  <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground leading-none">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* How it works mini */}
            <div className="space-y-2 w-full max-w-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">How it works</p>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                Describe your symptoms — voice or text
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                Tabeebi asks focused follow-up questions
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                Get a structured doctor's assessment
              </div>
            </div>
          </div>

          {/* Right: Auth form */}
          <div className="w-full max-w-sm">
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 space-y-5">
                {/* Mode toggle */}
                <div className="flex rounded-lg bg-muted p-1">
                  <button
                    onClick={() => setAuthMode("signup")}
                    className={cn(
                      "flex-1 text-sm font-medium py-2 rounded-md transition-all",
                      authMode === "signup"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setAuthMode("login")}
                    className={cn(
                      "flex-1 text-sm font-medium py-2 rounded-md transition-all",
                      authMode === "login"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Log In
                  </button>
                </div>

                <div className="text-center">
                  <h2 className="text-lg font-semibold text-foreground">
                    {authMode === "signup" ? "Start Your Consultation" : "Welcome Back"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {authMode === "signup"
                      ? "Free — no credit card required"
                      : "Continue your health journey"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {authMode === "signup" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pr-10"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base group" disabled={loading}>
                    {loading ? (
                      <span className="animate-pulse">Please wait...</span>
                    ) : (
                      <>
                        {authMode === "signup" ? "Talk to Tabeebi" : "Log In"}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-[10px] text-center text-muted-foreground">
                  By continuing, you agree to our Terms of Service. 
                  Tabeebi is for informational purposes only.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── AI Capabilities ── */}
      <section className="px-5 py-14 bg-muted/30 border-y border-border/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Why Tabeebi is <span className="text-primary">Different</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Not another generic chatbot. Tabeebi is a custom AI trained specifically for medical consultations with physician-grade clinical reasoning.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AI_CAPABILITIES.map((cap) => (
              <div key={cap.title} className="rounded-2xl border bg-background p-5 hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <cap.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-5 py-14">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            What Patients Say
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border bg-muted/30 p-5">
                <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 py-5 text-center border-t border-border/30">
        <p className="text-xs text-muted-foreground">
          © 2025 Tabeebi AI — A Custom Medical AI by HealthOS 24. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

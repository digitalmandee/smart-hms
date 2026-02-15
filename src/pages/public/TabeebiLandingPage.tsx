import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DoctorAvatar } from "@/components/ai/DoctorAvatar";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Globe, Brain, Sparkles, ArrowRight, Eye, EyeOff, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AuthMode = "login" | "signup";

const FEATURES = [
  { icon: Mic, label: "Voice Consultation", desc: "Talk naturally in your language" },
  { icon: Globe, label: "Trilingual", desc: "English, Arabic & Urdu" },
  { icon: Brain, label: "Smart Diagnostics", desc: "Clinical symptom analysis" },
];

export default function TabeebiLandingPage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Check if already authenticated
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
    <div className="min-h-[100dvh] bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-foreground">HealthOS <span className="text-primary">24</span></span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Virtual Clinic
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-5 py-8 max-w-6xl mx-auto w-full">
        {/* Left: Hero */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 max-w-lg">
          <DoctorAvatar state="idle" size="lg" />

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Meet <span className="text-primary">Tabeebi</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Your Personal Doctor
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Describe your symptoms by voice or text in English, Arabic or Urdu. 
              Tabeebi asks follow-up questions just like a real doctor and provides 
              structured clinical guidance.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 border"
              >
                <f.icon className="h-4 w-4 text-primary shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-medium text-foreground">{f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.desc}</div>
                </div>
              </div>
            ))}
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
                  {authMode === "signup" ? "Create Your Account" : "Welcome Back"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {authMode === "signup"
                    ? "Start your consultation"
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
                      {authMode === "signup" ? "Start Consultation" : "Log In"}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-[10px] text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service. 
                Tabeebi is for informational purposes only — not a substitute for professional medical advice.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-5 py-4 text-center border-t">
        <p className="text-xs text-muted-foreground">
          © 2025 HealthOS 24. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

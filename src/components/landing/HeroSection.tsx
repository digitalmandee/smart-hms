import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Building2, Users, Stethoscope, FlaskConical, Pill, Receipt, Hotel, Siren, Scissors, BarChart3, Bot, ShieldCheck, Clock, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatedSection } from "./AnimatedSection";

const typewriterPhrases = [
  "AI-Powered Hospital System",
  "OPD to IPD in One Platform",
  "20+ Integrated Modules",
  "Smart Clinical Automation",
  "Pharmacy & Lab Automation",
];

const hmsModules = [
  { icon: Users, label: "Patients" },
  { icon: Stethoscope, label: "OPD" },
  { icon: Hotel, label: "IPD" },
  { icon: Siren, label: "Emergency" },
  { icon: Scissors, label: "OT" },
  { icon: FlaskConical, label: "Laboratory" },
  { icon: Pill, label: "Pharmacy" },
  { icon: Receipt, label: "Billing" },
  { icon: BarChart3, label: "Reports" },
];

const stats = [
  { icon: Building2, label: "500+ Clinics", color: "text-primary" },
  { icon: ShieldCheck, label: "20+ Modules", color: "text-primary" },
  { icon: Globe, label: "3 Languages", color: "text-primary" },
  { icon: Clock, label: "24/7 Available", color: "text-primary" },
];

export const HeroSection = () => {
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = typewriterPhrases[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (displayText.length < currentPhrase.length) {
        timeout = setTimeout(() => setDisplayText(currentPhrase.slice(0, displayText.length + 1)), 60);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 30);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % typewriterPhrases.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Subtle gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-5 sm:px-6 lg:px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <AnimatedSection animation="fade-right" className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">
                Powered by Tabeebi AI — Built-in Medical Intelligence
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              <span className="text-primary">{displayText}</span>
              <span className="animate-pulse">|</span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-4xl lg:text-5xl">
                for Smart Clinics & Hospitals
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              The AI-powered hospital system with{" "}
              <span className="text-foreground font-medium">20+ integrated modules</span> — from OPD, IPD, and Emergency to Pharmacy, Lab, Billing, and HR. With{" "}
              <span className="text-primary font-semibold">Tabeebi AI</span> built in for intelligent patient pre-screening.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group text-lg px-8" asChild>
                <Link to="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="group text-lg px-8" asChild>
                <Link to="/auth/login">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  View Demo
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="pt-8 border-t border-border">
              <div className="flex flex-wrap gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-sm font-medium text-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Right: HMS Module Grid */}
          <AnimatedSection animation="fade-left" delay={200} className="relative mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 rounded-3xl blur-2xl" />

            <div className="relative max-w-sm mx-auto lg:max-w-md">
              <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">AI Hospital System</h4>
                    <span className="text-xs text-muted-foreground">All modules • One platform</span>
                  </div>
                </div>

                {/* Module grid */}
                <div className="p-5 grid grid-cols-3 gap-3">
                  {hmsModules.map((mod, i) => (
                    <div
                      key={mod.label}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <mod.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{mod.label}</span>
                    </div>
                  ))}
                </div>

                {/* Tabeebi badge */}
                <div className="px-5 py-3 border-t bg-muted/20 flex items-center justify-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    + Tabeebi AI built into every module
                  </span>
                </div>
              </div>

              <div className="text-center mt-4">
                <span className="text-sm text-muted-foreground">Complete HMS with 20+ modules</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

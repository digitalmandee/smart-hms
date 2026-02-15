import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./AnimatedSection";
import { Stethoscope, Mic, Globe, Brain, FileText, Shield, ArrowRight, Zap, HeartPulse } from "lucide-react";

const AI_FEATURES = [
  {
    icon: Stethoscope,
    title: "Tabeebi — Custom AI Doctor",
    description: "A purpose-built medical AI that conducts voice consultations in English, Arabic & Urdu. Trained on clinical protocols to think like a real physician.",
    badge: "Custom AI",
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: Brain,
    title: "Intelligent Diagnostics",
    description: "Custom-trained symptom analysis with structured clinical follow-up questions. Follows the same diagnostic flow as experienced physicians.",
    badge: "Physician-Grade",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
  },
  {
    icon: FileText,
    title: "AI Clinical Summaries",
    description: "Auto-generated patient encounter summaries, structured assessments, and clinical notes — saving doctors hours of documentation.",
    badge: "Auto-Generate",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
  },
];

const CAPABILITIES = [
  { icon: Mic, label: "Voice-First Consultation" },
  { icon: Globe, label: "Trilingual (EN/AR/UR)" },
  { icon: Shield, label: "Structured Guidance" },
  { icon: HeartPulse, label: "Custom Medical Training" },
];

export function AIFeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 lg:px-4">
        {/* Section header */}
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Custom-Built Medical AI</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Meet <span className="text-primary">Tabeebi</span> — Your AI Doctor
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The first HMS with a custom-trained AI doctor. Voice consultations, intelligent diagnostics, 
            and auto-generated clinical summaries — purpose-built for healthcare.
          </p>
        </AnimatedSection>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {AI_FEATURES.map((feature, i) => (
            <AnimatedSection key={feature.title} animation="fade-up" delay={i * 150}>
              <div className={`relative group h-full rounded-2xl border bg-gradient-to-br ${feature.color} p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center ${feature.iconColor}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-background/80 text-foreground/70">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA strip */}
        <AnimatedSection animation="fade-up" delay={500}>
          <div className="relative rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Try Tabeebi Free
                </h3>
                <p className="text-muted-foreground mb-4 md:mb-0">
                  Talk to our custom AI doctor now — trained for real clinical consultations.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  {CAPABILITIES.map((cap) => (
                    <span
                      key={cap.label}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-background border text-muted-foreground"
                    >
                      <cap.icon className="h-3 w-3 text-primary" />
                      {cap.label}
                    </span>
                  ))}
                </div>
              </div>
              <Button size="lg" className="group text-lg px-8 shrink-0" asChild>
                <Link to="/tabeebi">
                  Talk to Tabeebi
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

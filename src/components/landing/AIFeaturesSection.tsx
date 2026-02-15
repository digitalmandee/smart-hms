import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./AnimatedSection";
import {
  Stethoscope, Mic, Globe, Brain, FileText, Shield, ArrowRight, Zap,
  HeartPulse, Users, ClipboardList, BarChart3, UserCheck, Clock, Bot,
  ChevronRight,
} from "lucide-react";

const PERSPECTIVES = [
  {
    title: "For Patients",
    icon: HeartPulse,
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    items: [
      "24/7 voice consultations — no waiting rooms",
      "Trilingual support: English, Arabic & Urdu",
      "Symptom pre-screening before visiting the clinic",
      "Structured medical guidance you can trust",
    ],
  },
  {
    title: "For Doctors",
    icon: Stethoscope,
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
    items: [
      "AI-assisted patient intake — pre-screened before you see them",
      "Auto-generated clinical summaries after each visit",
      "Smart diagnostic suggestions during OPD",
      "Reduced documentation time by up to 70%",
    ],
  },
  {
    title: "For Admins",
    icon: BarChart3,
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    items: [
      "More patients per day with reduced doctor workload",
      "Automated documentation saves hours daily",
      "Stand out from competitors with AI-powered care",
      "Complete audit trail of every AI consultation",
    ],
  },
];

const WORKFLOW_STEPS = [
  { icon: Users, label: "Patient talks to Tabeebi", sub: "Voice or text" },
  { icon: Brain, label: "AI pre-screens symptoms", sub: "Custom-trained model" },
  { icon: ClipboardList, label: "Doctor gets summary", sub: "On their dashboard" },
  { icon: FileText, label: "AI clinical notes", sub: "Auto-generated" },
  { icon: UserCheck, label: "Prescription ready", sub: "In seconds" },
];

const CAPABILITIES = [
  { icon: Bot, label: "Custom-Trained Medical AI" },
  { icon: Mic, label: "Voice-First Consultation" },
  { icon: Globe, label: "Trilingual (EN/AR/UR)" },
  { icon: Shield, label: "Clinically Structured Guidance" },
  { icon: Clock, label: "Available 24/7" },
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
            <span className="text-primary">Tabeebi</span> — AI Integrated Across Your HMS
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Not a generic chatbot. A purpose-built, custom-trained AI doctor embedded into every layer of your 
            hospital management system — helping patients, doctors, and admins simultaneously.
          </p>
        </AnimatedSection>

        {/* Three perspective cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {PERSPECTIVES.map((p, i) => (
            <AnimatedSection key={p.title} animation="fade-up" delay={i * 150}>
              <div className={`relative group h-full rounded-2xl border bg-gradient-to-br ${p.color} p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-11 h-11 rounded-xl bg-background/80 flex items-center justify-center ${p.iconColor}`}>
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{p.title}</h3>
                </div>
                <ul className="space-y-3">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className={`h-4 w-4 mt-0.5 shrink-0 ${p.iconColor}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Workflow strip */}
        <AnimatedSection animation="fade-up" delay={300} className="mb-16">
          <h3 className="text-xl font-bold text-foreground text-center mb-8">How Tabeebi Works Across Your Workflow</h3>
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-3 md:gap-0">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center text-center px-4 py-4 rounded-xl bg-card border min-w-[140px]">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{step.label}</span>
                  <span className="text-[11px] text-muted-foreground mt-1">{step.sub}</span>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground/40 mx-1 hidden md:block shrink-0" />
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* CTA strip */}
        <AnimatedSection animation="fade-up" delay={500}>
          <div className="relative rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Experience Tabeebi — Custom AI Doctor
                </h3>
                <p className="text-muted-foreground mb-4 md:mb-0">
                  Talk to our custom-trained medical AI now. Purpose-built for real clinical consultations.
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
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Button size="lg" className="group text-lg px-8" asChild>
                  <Link to="/tabeebi">
                    Try Tabeebi Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="group text-lg px-8" asChild>
                  <Link to="/auth/login">
                    See Full Demo
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./AnimatedSection";
import {
  Brain, Mic, FileText, Shield, ArrowRight, Zap,
  HeartPulse, Stethoscope, BarChart3, Pill, FlaskConical,
  ClipboardList, BookOpen, Lock, TrendingUp, Bot,
} from "lucide-react";

const capabilities = [
  {
    icon: Brain,
    title: "Custom-Trained on Clinical Data",
    description: "Not a generic chatbot. Trained on medical protocols, drug interactions, and clinical workflows specific to your practice.",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Mic,
    title: "Voice-First Consultations",
    description: "Patients speak naturally in English, Arabic, or Urdu. Tabeebi listens, understands, and responds like a real doctor.",
    color: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: FileText,
    title: "Prescription Generation",
    description: "Generates complete e-prescriptions with dosages, drug interaction checks, and pharmacy routing — all from the consultation.",
    color: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
  {
    icon: ClipboardList,
    title: "Clinical Summaries for Doctors",
    description: "Every patient interaction produces a structured clinical summary that appears on the doctor's dashboard before they even see the patient.",
    color: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
];

const aiModules = [
  { icon: HeartPulse, module: "OPD", desc: "AI pre-screens patients before doctor sees them" },
  { icon: Pill, module: "Pharmacy", desc: "Smart drug interaction alerts powered by AI" },
  { icon: BarChart3, module: "Billing", desc: "AI-suggested billing codes from diagnosis" },
  { icon: FlaskConical, module: "Lab", desc: "AI flags abnormal results with clinical context" },
];

const trustPoints = [
  { icon: BookOpen, text: "Trained on 100K+ clinical conversations" },
  { icon: Shield, text: "Clinically structured guidance — not random internet answers" },
  { icon: TrendingUp, text: "Continuously learning from your practice patterns" },
  { icon: Lock, text: "Complete audit trail of every consultation" },
];

export function AIFeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-6 sm:px-8 lg:px-4">
        {/* Section header */}
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Built-in Medical AI</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Meet <span className="text-primary">Tabeebi</span> — Your Built-in AI Doctor
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every HealthOS 24 installation comes with Tabeebi — a purpose-trained medical AI
            that handles patient pre-screening, generates prescriptions, and feeds clinical summaries to your doctors.
          </p>
        </AnimatedSection>

        {/* Row 1: Four capability cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {capabilities.map((cap, i) => (
            <AnimatedSection key={cap.title} animation="fade-up" delay={i * 100}>
              <div className="h-full rounded-2xl border bg-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl ${cap.color} flex items-center justify-center mb-4`}>
                  <cap.icon className={`h-6 w-6 ${cap.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Row 2: AI Across Every Module */}
        <AnimatedSection animation="fade-up" className="mb-20">
          <h3 className="text-2xl font-bold text-foreground text-center mb-2">AI Across Every Module</h3>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Tabeebi isn't just a chatbot — it enhances every part of your HMS with intelligent automation.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiModules.map((mod) => (
              <div
                key={mod.module}
                className="flex items-start gap-3 p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <mod.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground">{mod.module}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Row 3: Training & Trust */}
        <AnimatedSection animation="fade-up">
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-accent/5 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Training & Trust</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {trustPoints.map((tp) => (
                <div key={tp.text} className="flex items-start gap-3">
                  <tp.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{tp.text}</span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

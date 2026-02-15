import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Building2, MessageCircle, Globe, Clock, Bot } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatedSection } from "./AnimatedSection";

const chatMessages = [
  { role: "patient", text: "I have a headache and mild fever since yesterday" },
  { role: "doctor", text: "I understand. Let me ask a few questions.\nIs the headache on one side or both sides? Any nausea or vomiting?" },
  { role: "patient", text: "Both sides, no nausea" },
  { role: "doctor", text: "Based on your symptoms, this appears to be a tension headache with viral fever. I recommend Paracetamol 500mg every 6 hours and plenty of fluids. If fever persists beyond 3 days, please visit the clinic." },
];

const aiStats = [
  { icon: MessageCircle, label: "50K+ Consultations", color: "text-primary" },
  { icon: Globe, label: "3 Languages", color: "text-primary" },
  { icon: Clock, label: "24/7 Available", color: "text-primary" },
];

export const HeroSection = () => {
  const [displayText, setDisplayText] = useState("");
  const [visibleMessages, setVisibleMessages] = useState(0);
  const fullText = "Custom-Trained AI Doctor";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 60);
    return () => clearInterval(timer);
  }, []);

  // Animate chat messages appearing one by one
  useEffect(() => {
    if (visibleMessages < chatMessages.length) {
      const timer = setTimeout(() => {
        setVisibleMessages((prev) => prev + 1);
      }, 1200 + visibleMessages * 1500);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages]);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Subtle gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-5 sm:px-6 lg:px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <AnimatedSection animation="fade-right" className="space-y-8">
            <Link
              to="/tabeebi"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">
                Meet Tabeebi — Your Custom AI Doctor
              </span>
            </Link>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              <span className="text-primary">{displayText}</span>
              <span className="animate-pulse">|</span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-4xl lg:text-5xl">
                Inside Your HMS
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Meet <span className="text-primary font-semibold">Tabeebi</span> — a purpose-built medical AI that handles patient consultations, generates prescriptions, creates clinical summaries, and speaks{" "}
              <span className="text-foreground font-medium">3 languages</span>. All integrated into your hospital management system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group text-lg px-8" asChild>
                <Link to="/tabeebi">
                  Try Tabeebi Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="group text-lg px-8" asChild>
                <Link to="/auth/signup">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Start Free Trial
                </Link>
              </Button>
            </div>

            {/* AI Stats + Social Proof */}
            <div className="pt-8 border-t border-border">
              <div className="flex flex-wrap gap-3">
                {aiStats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-sm font-medium text-foreground">{stat.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">500+ Clinics</span>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right: Tabeebi Chat Mockup */}
          <AnimatedSection animation="fade-left" delay={200} className="relative mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 rounded-3xl blur-2xl" />

            <div className="relative max-w-sm mx-auto lg:max-w-md">
              <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Dr. Tabeebi</h4>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-xs text-muted-foreground">Online • EN / AR / UR</span>
                    </div>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="p-4 space-y-3 min-h-[280px] bg-muted/20">
                  {chatMessages.slice(0, visibleMessages).map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "patient" ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.role === "patient"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-card border rounded-bl-md text-foreground"
                        }`}
                      >
                        {msg.text.split("\n").map((line, j) => (
                          <p key={j} className={j > 0 ? "mt-1" : ""}>{line}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {visibleMessages < chatMessages.length && (
                    <div className="flex justify-start">
                      <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input bar */}
                <div className="px-4 py-3 border-t bg-card">
                  <div className="flex items-center gap-2 rounded-xl bg-muted/50 border px-4 py-2.5 text-sm text-muted-foreground">
                    <span>Type your symptoms...</span>
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="text-center mt-4">
                <span className="text-sm text-muted-foreground">Live preview of a Tabeebi consultation</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

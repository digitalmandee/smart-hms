import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, Building2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatedSection } from "./AnimatedSection";
import {
  DoctorDashboardScreen,
  PharmacyScreen,
  BillingScreen,
} from "./ProductScreenshots";

const screenshots = [
  { component: DoctorDashboardScreen, label: "Doctor Dashboard" },
  { component: PharmacyScreen, label: "Pharmacy" },
  { component: BillingScreen, label: "Billing" },
];

export const HeroSection = () => {
  const [displayText, setDisplayText] = useState("");
  const [activeScreen, setActiveScreen] = useState(0);
  const fullText = "The Operating System for";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate screenshots
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screenshots.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextScreen = () => setActiveScreen((prev) => (prev + 1) % screenshots.length);
  const prevScreen = () => setActiveScreen((prev) => (prev - 1 + screenshots.length) % screenshots.length);

  const ActiveScreenComponent = screenshots[activeScreen].component;

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
              <span className="text-sm font-medium text-primary">Introducing Tabeebi — AI Virtual Doctor</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              <span className="text-primary">{displayText}</span>
              <span className="animate-pulse">|</span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-4xl lg:text-5xl">
                Modern Healthcare
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Stop juggling paper files, Excel sheets, and WhatsApp groups. 
              <span className="text-foreground font-medium"> One platform</span> for patient registration, 
              appointments, prescriptions, pharmacy, and billing.
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
                  Try Demo
                </Link>
              </Button>
            </div>
            
            {/* Social proof */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Trusted by healthcare facilities across</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">500+ Clinics</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">50,000+ Patients</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">2M+ Prescriptions</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
          
          {/* Right: Screenshot Carousel - visible on all screens */}
          <AnimatedSection animation="fade-left" delay={200} className="relative mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 rounded-3xl blur-2xl" />
            
            {/* Screenshot container */}
            <div className="relative max-w-sm mx-auto lg:max-w-none">
              <div className="transform hover:scale-[1.02] transition-transform duration-500">
                <ActiveScreenComponent />
              </div>
              
              {/* Navigation dots - simplified on mobile */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {/* Arrows hidden on mobile, only dots */}
                <button
                  onClick={prevScreen}
                  className="hidden sm:flex p-2 rounded-full bg-card border hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {screenshots.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveScreen(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeScreen 
                        ? 'w-6 bg-primary' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
                <button
                  onClick={nextScreen}
                  className="hidden sm:flex p-2 rounded-full bg-card border hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              {/* Label */}
              <div className="text-center mt-2">
                <span className="text-sm text-muted-foreground">{screenshots[activeScreen].label}</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, Building2, FileText, Activity } from "lucide-react";
import { useEffect, useState } from "react";

const trustedBy = [
  "500+ Clinics",
  "50,000+ Patients",
  "Pakistan & Middle East"
];

export const HeroSection = () => {
  const [displayText, setDisplayText] = useState("");
  const fullText = "Smart Hospital Management";
  
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

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Subtle gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">Now with AI-powered diagnostics</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              <span className="text-primary">{displayText}</span>
              <span className="animate-pulse">|</span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-4xl lg:text-5xl">
                System
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
              <div className="flex flex-wrap gap-4">
                {trustedBy.map((item) => (
                  <div key={item} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right: Dashboard Mockup */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 rounded-3xl blur-2xl" />
            
            {/* Main Dashboard Card */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform duration-500">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <span className="text-xs text-muted-foreground">SmartHMS Dashboard</span>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-primary/10 text-center">
                  <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">156</p>
                  <p className="text-xs text-muted-foreground">Today&apos;s Patients</p>
                </div>
                <div className="p-4 rounded-xl bg-success/10 text-center">
                  <FileText className="h-6 w-6 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">89</p>
                  <p className="text-xs text-muted-foreground">Prescriptions</p>
                </div>
                <div className="p-4 rounded-xl bg-accent/10 text-center">
                  <Building2 className="h-6 w-6 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">PKR 2.4M</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
              
              {/* Queue Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Patient Queue</span>
                  <span className="text-primary">View All →</span>
                </div>
                {["Muhammad Ali - Token #12", "Fatima Bibi - Token #13", "Ahmed Hassan - Token #14"].map((patient, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">{patient.split(" ")[0][0]}</span>
                      </div>
                      <span className="text-sm text-foreground">{patient}</span>
                    </div>
                    <Activity className="h-4 w-4 text-success" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Floating notification */}
            <div className="absolute -right-4 top-20 bg-card border border-border rounded-xl p-4 shadow-lg animate-bounce">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">New Appointment</p>
                  <p className="text-xs text-muted-foreground">Token #15 generated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";
import { Building2, FlaskConical, Users, Shield } from "lucide-react";

const stats = [
  { icon: Building2, value: "500+", label: "Clinics & Hospitals" },
  { icon: FlaskConical, value: "50+", label: "Lab Networks" },
  { icon: Users, value: "50K+", label: "Patients Managed" },
  { icon: Shield, value: "99.9%", label: "Uptime SLA" },
];

export function ExecTitleSlide() {
  return (
    <div className="slide flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
      {/* Decorative circles */}
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-primary/8 blur-3xl" />

      {/* Confidential badge */}
      <div className="absolute top-6 right-6 px-3 py-1 rounded-full border border-destructive/30 bg-destructive/5 text-destructive text-[10px] font-semibold tracking-widest uppercase">
        Confidential
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <HealthOS24Logo variant="full" size="xl" showTagline />

        <div className="space-y-3 max-w-2xl">
          <h1 className="text-5xl font-extrabold text-foreground leading-tight tracking-tight">
            AI-Powered Hospital<br />Management System
          </h1>
          <p className="text-xl text-primary font-semibold">
            One Platform. Every Department. Zero Fragmentation.
          </p>
          <p className="text-base text-muted-foreground max-w-lg mx-auto">
            Replace 10+ disconnected tools with a single, intelligent system that runs your entire hospital — from reception to accounts.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 mt-6">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-foreground">{s.value}</div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-8 text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>March 2026</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

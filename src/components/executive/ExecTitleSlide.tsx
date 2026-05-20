import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";
import { Building2, FlaskConical, Users, Shield, Bot, Layers, Globe } from "lucide-react";

const stats = [
  { icon: Building2, value: "28", label: "Live Modules" },
  { icon: FlaskConical, value: "2", label: "Live Deployments" },
  { icon: Users, value: "3", label: "Languages (EN · AR · UR)" },
  { icon: Shield, value: "KSA", label: "Native Compliance" },
];

export function ExecTitleSlide() {
  return (
    <div className="slide flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
      {/* Decorative circles */}
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-primary/8 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <HealthOS24Logo variant="full" size="xl" showTagline />

        <div className="space-y-3 max-w-3xl">
          <h1 className="text-5xl font-extrabold text-foreground leading-tight tracking-tight">
            The hospital operating system<br />for Saudi Arabia
          </h1>
          <p className="text-xl text-primary font-semibold">
            AI-native. Saudi-compliant. Already shipped.
          </p>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            One platform that replaces ten. Built for Saudi healthcare from day one. Priced at a fraction of Cerner.
          </p>
        </div>

        {/* Feature badges */}
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Layers className="h-3.5 w-3.5" />20+ Modules
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Globe className="h-3.5 w-3.5" />3 Languages
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Bot className="h-3.5 w-3.5" />Built-in AI
          </span>
        </div>

        {/* Language badge */}
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">🇬🇧 English</span>
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">🇸🇦 عربي</span>
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">🇵🇰 اردو</span>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 mt-4">
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
        <span>healthos24.com</span>
      </div>
    </div>
  );
}

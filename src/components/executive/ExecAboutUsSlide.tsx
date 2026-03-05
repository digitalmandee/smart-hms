import { Target, Eye, Award, Users, Globe, Zap } from "lucide-react";

const highlights = [
  { icon: Target, title: "Our Mission", desc: "Digitize every hospital in Pakistan & the Middle East with affordable, world-class technology." },
  { icon: Eye, title: "Our Vision", desc: "A future where every patient receives data-driven care — regardless of hospital size or location." },
  { icon: Award, title: "Track Record", desc: "5+ years building health-tech solutions across clinics, hospitals, and lab networks." },
  { icon: Users, title: "Team Strength", desc: "40+ engineers, designers, and healthcare consultants dedicated to one product." },
  { icon: Globe, title: "Market Reach", desc: "Deployed across Pakistan with expansion into Saudi Arabia, UAE, and East Africa." },
  { icon: Zap, title: "Innovation DNA", desc: "First HMS in the region with a built-in medical AI (Tabeebi) for patient pre-screening." },
];

export function ExecAboutUsSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background to-primary/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="h-2 bg-gradient-to-r from-primary to-primary/60 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-primary font-semibold mb-1">About Us</p>
          <h2 className="text-3xl font-extrabold text-foreground">Who We Are</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pakistan's leading health-tech company building the future of hospital management.
          </p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">2 / 12</span>
      </div>

      <div className="grid grid-cols-3 gap-5 flex-1">
        {highlights.map((h) => (
          <div key={h.title} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
              <h.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground">{h.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>HealthOS 24 | AI-Powered Hospital Management</span>
        <span>healthos24.com | Confidential</span>
      </div>
    </div>
  );
}

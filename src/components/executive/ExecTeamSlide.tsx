import { Linkedin, Mail } from "lucide-react";

const founders = [
  {
    initials: "SM",
    name: "Sannan Malik",
    role: "Co-Founder",
    bio: "Building HealthOS 24 from the ground up — product, engineering, and KSA market entry.",
    gradient: "from-indigo-500 to-cyan-500",
  },
  {
    initials: "FS",
    name: "Farhan Saleem",
    role: "Co-Founder",
    bio: "Building HealthOS 24 from the ground up — clinical workflows, partnerships, and growth.",
    gradient: "from-blue-500 to-teal-500",
  },
];

export function ExecTeamSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-indigo-500/5 via-background to-cyan-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-indigo-600 font-semibold mb-1">The Team</p>
          <h2 className="text-3xl font-extrabold text-foreground">Meet the Founders</h2>
          <p className="text-sm text-muted-foreground mt-1">Builders shipping clinical software for hospitals across MENA & South Asia.</p>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">28 / 30</span>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1 items-center px-8">
        {founders.map((f) => (
          <div key={f.name} className="rounded-2xl border bg-card p-8 flex flex-col items-center text-center shadow-sm">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white text-4xl font-extrabold shadow-xl mb-4`}>
              {f.initials}
            </div>
            <div className="text-2xl font-extrabold text-foreground">{f.name}</div>
            <div className="mt-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              {f.role}
            </div>
            <div className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-xs">{f.bio}</div>
            <div className="flex items-center gap-3 mt-4 text-muted-foreground">
              <Linkedin className="h-4 w-4" />
              <Mail className="h-4 w-4" />
            </div>
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

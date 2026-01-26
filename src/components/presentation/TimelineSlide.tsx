import { 
  Calendar, Database, Users, Rocket, Headphones, 
  CheckCircle2, ArrowRight, Clock, Activity 
} from "lucide-react";

const phases = [
  {
    week: "Week 1-2",
    title: "Setup & Migration",
    icon: Database,
    color: "bg-blue-500",
    tasks: [
      "System installation & configuration",
      "Data migration from legacy system",
      "User accounts & role setup",
      "Branch configuration",
    ],
  },
  {
    week: "Week 3",
    title: "Training",
    icon: Users,
    color: "bg-purple-500",
    tasks: [
      "Department-wise training sessions",
      "Super-user certification",
      "Workflow customization",
      "Template configuration",
    ],
  },
  {
    week: "Week 4",
    title: "Go-Live",
    icon: Rocket,
    color: "bg-green-500",
    tasks: [
      "Parallel run with support",
      "Issue resolution on-site",
      "Performance optimization",
      "Full production launch",
    ],
  },
  {
    week: "Ongoing",
    title: "Support",
    icon: Headphones,
    color: "bg-orange-500",
    tasks: [
      "24/7 helpdesk support",
      "Regular system updates",
      "Quarterly health checks",
      "Feature enhancements",
    ],
  },
];

export const TimelineSlide = () => {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Gradient Header Bar */}
      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-orange-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <Calendar className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Implementation Timeline</h2>
            <p className="text-sm text-muted-foreground">From Kickoff to Go-Live in 4 Weeks</p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
          29 / 30
        </span>
      </div>

      {/* Timeline Phases */}
      <div className="flex-1">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            return (
              <div key={phase.week} className="relative">
                {/* Connector Arrow */}
                {index < phases.length - 1 && (
                  <div className="absolute top-10 -right-4 z-10">
                    <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
                
                <div className="bg-card border border-border rounded-xl p-5 h-full hover:shadow-md transition-shadow">
                  {/* Phase Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${phase.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">{phase.week}</div>
                      <div className="font-bold">{phase.title}</div>
                    </div>
                  </div>
                  
                  {/* Tasks */}
                  <div className="space-y-2">
                    {phase.tasks.map((task) => (
                      <div key={task} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Timeline Bar */}
        <div className="bg-muted rounded-full h-3 overflow-hidden flex">
          <div className="w-1/4 bg-blue-500" />
          <div className="w-1/4 bg-purple-500" />
          <div className="w-1/4 bg-green-500" />
          <div className="w-1/4 bg-orange-500" />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground px-2">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4+</span>
        </div>
      </div>

      {/* Key Commitments */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold">4 Weeks</div>
              <div className="text-xs text-muted-foreground">Typical Rollout</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold">On-Site</div>
              <div className="text-xs text-muted-foreground">Dedicated Team</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold">Full Migration</div>
              <div className="text-xs text-muted-foreground">Legacy Data Import</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold">Zero Downtime</div>
              <div className="text-xs text-muted-foreground">Parallel Running</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>HealthOS - Hospital Management System</span>
        <span>smarthms.devmine.co</span>
      </div>
    </div>
  );
};

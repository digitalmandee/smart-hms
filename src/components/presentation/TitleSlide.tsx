import { Activity, Users, FlaskConical, Building2, Shield, Zap } from "lucide-react";

const stats = [
  { icon: Building2, value: "500+", label: "Clinics" },
  { icon: FlaskConical, value: "50+", label: "Labs" },
  { icon: Users, value: "50,000+", label: "Patients" },
];

const highlights = [
  'OPD & IPD', 
  'Laboratory', 
  'Pharmacy', 
  'Billing', 
  'HR & Payroll', 
  'Accounts',
  'OT & Surgery',
  'Radiology',
];

export const TitleSlide = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="slide flex flex-col bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-primary blur-3xl" />
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl">
            <Activity className="h-16 w-16 text-primary-foreground" />
          </div>
          <div>
            <span className="text-5xl font-bold tracking-tight">HealthOS</span>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Enterprise Healthcare Platform</span>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 leading-tight">
          Complete Hospital<br />
          <span className="text-primary">Management System</span>
        </h1>

        {/* Subtitle */}
        <p className="text-2xl text-muted-foreground text-center mb-6 max-w-2xl">
          20 Integrated Modules for Modern Healthcare Operations
        </p>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-4xl">
          {highlights.map((item) => (
            <span
              key={item}
              className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-8 bg-card border border-border rounded-2xl px-8 py-4 shadow-lg">
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
              {index < stats.length - 1 && (
                <div className="w-px h-10 bg-border ml-6" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="relative z-10 pb-2">
        <div className="flex items-center justify-center gap-8 mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span>Cloud-Based</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>Multi-Branch</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm">
          <span>{currentDate}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>Version 2.0</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>smarthms.devmine.co</span>
        </div>
      </div>
    </div>
  );
};
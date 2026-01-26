import { Activity, Globe, Phone, CheckCircle2, Calendar, Users, FlaskConical, UserCheck, Sparkles } from "lucide-react";

const demoFeatures = [
  "Personalized walkthrough of your workflows",
  "See your data in action with live demo",
  "Get custom pricing for your facility",
  "No obligation consultation",
];

const stats = [
  { icon: Users, value: "500+", label: "Clinics" },
  { icon: FlaskConical, value: "50+", label: "Labs" },
  { icon: UserCheck, value: "50,000+", label: "Patients Served" },
];

export const CTASlide = () => {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-primary/10 via-background to-primary/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">HealthOS</span>
        </div>
        <div className="text-sm text-muted-foreground font-medium">27 / 27</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Main CTA */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Let's Get Started</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 leading-tight">
          Transform Healthcare<br />
          <span className="text-primary">Together</span>
        </h1>

        <p className="text-lg text-muted-foreground text-center mb-8 max-w-2xl">
          Join 500+ healthcare facilities across UAE that trust HealthOS to streamline their operations
        </p>

        <div className="grid grid-cols-2 gap-8 w-full max-w-4xl mb-8">
          {/* Demo Booking Box */}
          <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6" />
              <h3 className="text-xl font-bold">Book a Free Demo</h3>
            </div>
            
            <div className="space-y-2 mb-4">
              {demoFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-white/20 rounded-lg p-3 text-center">
              <span className="text-sm font-medium">Schedule within 24 hours</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Call Us</div>
                  <div className="font-semibold">+971 506802430</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Visit Website</div>
                  <div className="font-semibold">smarthms.devmine.co</div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Available 24/7 for support
            </div>
          </div>
        </div>

        {/* Trust Stats Bar */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm w-full max-w-3xl">
          <div className="flex items-center justify-center gap-8">
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
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          © 2024 HealthOS - Complete Hospital Management System
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Empowering healthcare facilities across the UAE
        </p>
      </div>
    </div>
  );
};

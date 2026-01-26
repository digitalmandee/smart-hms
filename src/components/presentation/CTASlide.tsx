import { 
  Activity, Globe, Phone, CheckCircle2, Calendar, Users, FlaskConical, 
  UserCheck, Sparkles, Mail, MessageCircle, ArrowRight, Shield, Zap 
} from "lucide-react";

const demoFeatures = [
  "Personalized walkthrough of your workflows",
  "See your data in action with live demo",
  "Get custom pricing for your facility",
  "No obligation consultation",
];

const stats = [
  { icon: Users, value: "500+", label: "Clinics & Hospitals" },
  { icon: FlaskConical, value: "50+", label: "Diagnostic Labs" },
  { icon: UserCheck, value: "50,000+", label: "Patients Served Daily" },
];

const valueProps = [
  { icon: Shield, label: "HIPAA Compliant" },
  { icon: Zap, label: "4-Week Implementation" },
  { icon: Activity, label: "99.9% Uptime" },
];

export const CTASlide = () => {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-primary/15 via-background to-primary/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-60 h-60 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-primary blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">HealthOS</span>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
          30 / 30
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Main CTA */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Ready to Transform?</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 leading-tight">
          Let's Build the Future of<br />
          <span className="text-primary">Healthcare Together</span>
        </h1>

        <p className="text-lg text-muted-foreground text-center mb-6 max-w-2xl">
          Join 500+ healthcare facilities across UAE that trust HealthOS to streamline their operations
        </p>

        {/* Value Props */}
        <div className="flex items-center gap-6 mb-6">
          {valueProps.map((prop) => (
            <div key={prop.label} className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border rounded-full px-4 py-2">
              <prop.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{prop.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-4xl mb-6">
          {/* Demo Booking Box */}
          <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl p-6 shadow-xl">
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

            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-medium">Schedule within 24 hours</span>
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Call / WhatsApp</div>
                  <div className="font-semibold">+971 506802430</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Website</div>
                  <div className="font-semibold">smarthms.devmine.co</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="font-semibold">sales@devmine.co</div>
                </div>
              </div>
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
      <div className="pt-4 border-t border-border text-center relative z-10">
        <p className="text-sm text-muted-foreground">
          © 2024 HealthOS - Complete Hospital Management System
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Empowering Healthcare Facilities Across the UAE & Beyond
        </p>
      </div>
    </div>
  );
};

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Users, 
  Building2, 
  Stethoscope,
  ArrowRight,
  Play
} from "lucide-react";

const stats = [
  { label: "Healthcare Facilities", value: "500+", icon: Building2 },
  { label: "Patients Managed", value: "1M+", icon: Users },
  { label: "Consultations Daily", value: "10K+", icon: Stethoscope },
  { label: "Uptime", value: "99.9%", icon: Activity },
];

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        {/* Floating medical icons */}
        <div className="absolute top-1/4 left-[15%] animate-bounce delay-100">
          <div className="p-3 bg-primary/10 rounded-xl backdrop-blur-sm">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="absolute top-1/3 right-[20%] animate-bounce delay-300">
          <div className="p-3 bg-success/10 rounded-xl backdrop-blur-sm">
            <Activity className="h-6 w-6 text-success" />
          </div>
        </div>
        <div className="absolute bottom-1/3 left-[25%] animate-bounce delay-500">
          <div className="p-3 bg-accent/10 rounded-xl backdrop-blur-sm">
            <Users className="h-6 w-6 text-accent-foreground" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-fade-in">
            <Activity className="h-4 w-4" />
            <span>Next-Gen Healthcare Management</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in">
            <span className="text-foreground">Smart </span>
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Hospital Management
            </span>
            <br />
            <span className="text-foreground">System</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in delay-100">
            Streamline your healthcare operations with our comprehensive platform. 
            From patient registration to pharmacy dispensing, manage everything in one place.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-200">
            <Link to="/auth/signup">
              <Button size="lg" className="gap-2 text-lg px-8 py-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 hover:bg-muted/50 transition-all">
                <Play className="h-5 w-5" />
                View Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-12 animate-fade-in delay-300">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

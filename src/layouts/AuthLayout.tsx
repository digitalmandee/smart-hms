import { Outlet } from "react-router-dom";
import { Heart } from "lucide-react";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-10 gradient-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Heart className="h-6 w-6" />
          </div>
          <span className="text-xl font-semibold">HealthOS</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Modern Healthcare
            <br />
            Management System
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Streamline your hospital operations with our comprehensive management
            solution. From patient care to billing, we've got you covered.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-1">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-primary-foreground/70">Active Clinics</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-primary-foreground/70">Patients Served</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm text-primary-foreground/70">Uptime</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-primary-foreground/70">Support</div>
            </div>
          </div>
        </div>

        <p className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} HealthOS. All rights reserved.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center p-8 lg:p-16 bg-background">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-foreground">HealthOS</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function MobileSplashScreen() {
  const navigate = useNavigate();
  const { user, isLoading, roles } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Animate in after mount
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    const redirectTimer = setTimeout(() => {
      if (user) {
        // Redirect to role-based dashboard
        navigate("/mobile/dashboard", { replace: true });
      } else {
        navigate("/mobile/login", { replace: true });
      }
    }, 2000);

    return () => clearTimeout(redirectTimer);
  }, [user, isLoading, navigate, roles]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center">
      {/* Logo */}
      <div 
        className={cn(
          "transition-all duration-700 ease-out",
          showContent ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}
      >
        <HealthOS24Logo variant="icon" size="xl" className="text-white" />
      </div>

      {/* Brand Name */}
      <div 
        className={cn(
          "mt-6 text-center transition-all duration-700 delay-300 ease-out",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <h1 className="text-3xl font-bold text-white">HealthOS</h1>
        <p className="text-white/80 text-sm mt-1">Smart Hospital Management</p>
      </div>

      {/* Loading indicator */}
      <div 
        className={cn(
          "absolute bottom-20 transition-all duration-500 delay-500",
          showContent ? "opacity-100" : "opacity-0"
        )}
      >
        <Loader2 className="h-8 w-8 text-white/70 animate-spin" />
      </div>

      {/* Version */}
      <div className="absolute bottom-8 text-white/50 text-xs">
        v1.0.0
      </div>
    </div>
  );
}

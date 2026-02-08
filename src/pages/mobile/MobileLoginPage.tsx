import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useMobileToast } from "@/hooks/useMobileToast";
import { cn } from "@/lib/utils";
import { UserRolesBadge } from "@/components/auth/UserRolesBadge";
import { ROLE_LABELS } from "@/constants/roles";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function MobileLoginPage() {
  const navigate = useNavigate();
  const { signIn, user, roles, profile, isLoading: authLoading } = useAuth();
  const toast = useMobileToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true
    }
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        toast.error("Login failed", { description: error.message });
        return;
      }

      toast.success("Welcome back!");
      navigate("/mobile/dashboard", { replace: true });
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // If already logged in, show current user info
  if (user && !authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background safe-area-all">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 px-6 pt-16 pb-12">
          <div className="flex flex-col items-center">
            <HealthOS24Logo variant="icon" size="lg" className="text-white" />
            <h1 className="text-2xl font-bold text-white mt-4">Welcome Back</h1>
            <p className="text-white/80 text-sm mt-1">{profile?.full_name || user.email}</p>
          </div>
          
          {/* Curved bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-6">
            <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full">
              <path 
                d="M0 10 Q50 0 100 10 L100 10 L0 10" 
                fill="hsl(var(--background))" 
              />
            </svg>
          </div>
        </div>

        {/* Current User Info */}
        <div className="flex-1 px-6 py-8 space-y-6">
          {/* User ID */}
          <div className="p-4 bg-muted rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>User ID</span>
            </div>
            <p className="font-mono text-xs text-muted-foreground break-all">
              {user.id}
            </p>
          </div>

          {/* Current Roles */}
          <div className="p-4 bg-muted rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-primary" />
              <span>Your Assigned Roles</span>
            </div>
            {roles.length > 0 ? (
              <UserRolesBadge roles={roles as AppRole[]} size="md" maxVisible={10} />
            ) : (
              <p className="text-sm text-muted-foreground">No roles assigned</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Button
              className="w-full h-12 text-base font-semibold"
              onClick={() => navigate("/mobile/dashboard", { replace: true })}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 text-base"
              onClick={() => navigate("/app/dashboard", { replace: true })}
            >
              Open Desktop View
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 HealthOS. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-all">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-br from-primary to-primary/80 px-6 pt-16 pb-12">
        <div className="flex flex-col items-center">
          <HealthOS24Logo variant="icon" size="lg" className="text-white" />
          <h1 className="text-2xl font-bold text-white mt-4">Welcome Back</h1>
          <p className="text-white/80 text-sm mt-1">Sign in to continue</p>
        </div>
        
        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-6">
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full">
            <path 
              d="M0 10 Q50 0 100 10 L100 10 L0 10" 
              fill="hsl(var(--background))" 
            />
          </svg>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              className={cn(
                "h-12 text-base",
                errors.email && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                className={cn(
                  "h-12 text-base pr-12",
                  errors.password && "border-destructive focus-visible:ring-destructive"
                )}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
              />
              <label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => navigate("/auth/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Demo Accounts Note */}
        <div className="mt-8 p-4 bg-muted rounded-xl">
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-medium">Demo Account:</span>
            <br />
            admin@healthos24.com / admin123
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 HealthOS. All rights reserved.
        </p>
      </div>
    </div>
  );
}

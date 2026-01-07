import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Crown, Building, Building2, Stethoscope, Heart, UserCheck, Pill, FlaskConical, Calculator } from "lucide-react";

const demoAccounts = [
  { email: "superadmin@smarthms.demo", role: "Super Admin", icon: Crown, color: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" },
  { email: "orgadmin@smarthms.demo", role: "Org Admin", icon: Building, color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20" },
  { email: "branchadmin@smarthms.demo", role: "Branch Admin", icon: Building2, color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" },
  { email: "doctor@smarthms.demo", role: "Doctor", icon: Stethoscope, color: "bg-green-500/10 text-green-600 hover:bg-green-500/20" },
  { email: "nurse@smarthms.demo", role: "Nurse", icon: Heart, color: "bg-pink-500/10 text-pink-600 hover:bg-pink-500/20" },
  { email: "receptionist@smarthms.demo", role: "Receptionist", icon: UserCheck, color: "bg-teal-500/10 text-teal-600 hover:bg-teal-500/20" },
  { email: "pharmacist@smarthms.demo", role: "Pharmacist", icon: Pill, color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" },
  { email: "labtech@smarthms.demo", role: "Lab Tech", icon: FlaskConical, color: "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20" },
  { email: "accountant@smarthms.demo", role: "Accountant", icon: Calculator, color: "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20" },
];

const DEMO_PASSWORD = "Demo@123";

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/app/dashboard";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleDemoLogin = (email: string) => {
    setValue("email", email);
    setValue("password", DEMO_PASSWORD);
    toast({
      title: "Demo credentials loaded",
      description: `Email: ${email} | Password: ${DEMO_PASSWORD}`,
    });
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        let errorMessage = "An error occurred during login";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email before logging in.";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please try again later.";
        }

        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });

      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isLoading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      {/* Demo Accounts Section */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Demo Accounts
            </span>
          </div>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          Click any role to auto-fill credentials (Password: {DEMO_PASSWORD})
        </p>

        <div className="grid grid-cols-3 gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => handleDemoLogin(account.email)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border border-border transition-all ${account.color}`}
              disabled={isLoading}
            >
              <account.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{account.role}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link to="/auth/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </div>
    </div>
  );
};

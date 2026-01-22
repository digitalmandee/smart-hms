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
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, Crown, Building, Building2, Stethoscope, Heart, UserCheck, Pill, FlaskConical, Calculator, Lock, Unlock, Warehouse, Users, Banknote, Droplets, ScanLine, Bed, Scissors } from "lucide-react";

// Hospital Demo Accounts (Shifa Medical Center)
const hospitalDemoAccounts = [
  // Admin Roles
  { email: "superadmin@healthos.demo", role: "Super Admin", icon: Crown, color: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20" },
  { email: "orgadmin@healthos.demo", role: "Org Admin", icon: Building, color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20" },
  { email: "branchadmin@healthos.demo", role: "Branch Admin", icon: Building2, color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20" },
  // Clinical Roles
  { email: "doctor@healthos.demo", role: "Doctor", icon: Stethoscope, color: "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20" },
  { email: "nurse@healthos.demo", role: "Nurse", icon: Heart, color: "bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 border-pink-500/20" },
  { email: "receptionist@healthos.demo", role: "Receptionist", icon: UserCheck, color: "bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 border-teal-500/20" },
  // Department Roles
  { email: "pharmacist@healthos.demo", role: "Pharmacist", icon: Pill, color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20" },
  { email: "labtech@healthos.demo", role: "Lab Tech", icon: FlaskConical, color: "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 border-violet-500/20" },
  { email: "bloodbank@healthos.demo", role: "Blood Bank", icon: Droplets, color: "bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20" },
  { email: "radiologist@healthos.demo", role: "Radiologist", icon: ScanLine, color: "bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border-cyan-500/20" },
  { email: "ipdnurse@healthos.demo", role: "IPD Nurse", icon: Bed, color: "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-500/20" },
  // Administrative Roles
  { email: "accountant@healthos.demo", role: "Accountant", icon: Calculator, color: "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-slate-500/20" },
  { email: "storemanager@healthos.demo", role: "Store Manager", icon: Warehouse, color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" },
  { email: "hrmanager@healthos.demo", role: "HR Manager", icon: Users, color: "bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 border-sky-500/20" },
];

// Clinic Demo Accounts (Al-Noor Family Clinic)
const clinicDemoAccounts = [
  { email: "clinic.admin@healthos.demo", role: "Clinic Admin", icon: Building, color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" },
  { email: "clinic.doctor@healthos.demo", role: "Clinic Doctor", icon: Stethoscope, color: "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20" },
  { email: "clinic.receptionist@healthos.demo", role: "Token Counter", icon: UserCheck, color: "bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 border-teal-500/20" },
  { email: "clinic.pharmacist@healthos.demo", role: "Pharmacy POS", icon: Pill, color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20" },
];

const DEMO_PASSWORD = "Demo@123";
const UNLOCK_PASSWORD = "1212";

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [quickLoginEmail, setQuickLoginEmail] = useState<string | null>(null);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/app/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleUnlock = () => {
    if (unlockPassword === UNLOCK_PASSWORD) {
      setIsUnlocked(true);
      setUnlockError("");
    } else {
      setUnlockError("Incorrect password");
    }
  };

  const handleUnlockKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUnlock();
    }
  };

  const handleQuickLogin = async (email: string) => {
    setQuickLoginEmail(email);
    try {
      const { error } = await signIn(email, DEMO_PASSWORD);

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
      setQuickLoginEmail(null);
    }
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

  // Lock Screen
  if (!isUnlocked) {
    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Demo Environment</CardTitle>
          <CardDescription>Enter password to access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              onKeyDown={handleUnlockKeyDown}
              className={unlockError ? "border-destructive" : ""}
            />
            {unlockError && (
              <p className="text-sm text-destructive">{unlockError}</p>
            )}
          </div>
          <Button onClick={handleUnlock} className="w-full">
            <Unlock className="mr-2 h-4 w-4" />
            Unlock
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Unlocked - Show Login Form + Demo Accounts
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

      {/* Hospital Demo Login Section */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Hospital Demo (Shifa Medical Center)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {hospitalDemoAccounts.map((account) => {
          const Icon = account.icon;
          const isLoggingIn = quickLoginEmail === account.email;
          
          return (
            <Button
              key={account.email}
              variant="outline"
              className={`h-auto py-2 px-2 flex flex-col items-center gap-1 border ${account.color} transition-all`}
              onClick={() => handleQuickLogin(account.email)}
              disabled={quickLoginEmail !== null}
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="text-[10px] font-medium">{account.role}</span>
            </Button>
          );
        })}
      </div>

      {/* Clinic Demo Login Section */}
      <div className="relative mt-4">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Clinic Demo (Al-Noor Family Clinic)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {clinicDemoAccounts.map((account) => {
          const Icon = account.icon;
          const isLoggingIn = quickLoginEmail === account.email;
          
          return (
            <Button
              key={account.email}
              variant="outline"
              className={`h-auto py-2 px-2 flex flex-col items-center gap-1 border ${account.color} transition-all`}
              onClick={() => handleQuickLogin(account.email)}
              disabled={quickLoginEmail !== null}
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="text-[10px] font-medium">{account.role}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

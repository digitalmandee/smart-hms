import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useKioskAuth } from "@/hooks/useKioskAuth";
import { Monitor, Loader2, KeyRound } from "lucide-react";

export default function KioskLoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading, error, isAuthenticated, session } = useKioskAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to terminal
  useEffect(() => {
    if (!isLoading && isAuthenticated && session?.kioskId) {
      navigate(`/kiosk/terminal/${session.kioskId}`);
    }
  }, [isLoading, isAuthenticated, session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const deviceInfo = {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
      timestamp: new Date().toISOString(),
    };

    const result = await login(username.trim(), password, deviceInfo);

    if (result) {
      toast({
        title: "Login successful",
        description: `Welcome to ${result.kioskName}`,
      });
      navigate(`/kiosk/terminal/${result.kioskId}`);
    } else {
      toast({
        title: "Login failed",
        description: error || "Invalid username or password",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Monitor className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Kiosk Login</CardTitle>
          <CardDescription className="text-lg">
            Enter your kiosk credentials to start the token system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base">Kiosk Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="e.g., kiosk-opd-main"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 text-lg"
                autoComplete="off"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter kiosk password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-lg"
                autoComplete="off"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-5 w-5" />
                  Login to Kiosk
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Contact your administrator if you don't have login credentials
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { navigationLogger } from "@/lib/logger";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, roles } = useAuth();

  useEffect(() => {
    // Log 404 error with full context
    navigationLogger.error("404 Not Found - Route does not exist", undefined, {
      attemptedRoute: location.pathname,
      searchParams: location.search,
      hash: location.hash,
      referrer: document.referrer || 'direct',
      userId: user?.id || 'anonymous',
      userEmail: user?.email || 'anonymous',
      userRole: roles?.[0] || 'unknown',
      organizationId: profile?.organization_id || 'none',
      branchId: profile?.branch_id || 'none',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }, [location.pathname, location.search, location.hash, user, profile, roles]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">Page not found</p>
        </div>
        
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The page <code className="px-2 py-1 bg-muted rounded text-foreground">{location.pathname}</code> does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={handleGoBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={() => navigate('/')} className="gap-2">
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Monitor } from "lucide-react";
import { useRequireSession } from "@/hooks/useRequireSession";
import { CounterType } from "@/hooks/useBillingSessions";
import { OpenSessionDialog } from "./OpenSessionDialog";

interface SessionRequiredGuardProps {
  children?: React.ReactNode;
  counterType?: CounterType;
  message?: string;
  title?: string;
}

/**
 * A guard component that blocks content and shows an "Open Session" prompt
 * if no active billing session exists for the current user.
 * 
 * Use this to wrap payment collection pages/components.
 */
export function SessionRequiredGuard({
  children,
  counterType = "reception",
  message = "You must open a billing session to collect payments",
  title = "Session Required",
}: SessionRequiredGuardProps) {
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const { hasActiveSession, isLoading } = useRequireSession(counterType);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="space-y-4 text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (!hasActiveSession) {
    return (
      <>
        <Card className="max-w-md mx-auto mt-12 border-warning/50">
          <CardContent className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 mb-4">
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
              {message}
            </p>
            <Button 
              onClick={() => setShowOpenDialog(true)}
              className="gap-2"
              size="lg"
            >
              <Monitor className="h-4 w-4" />
              Open Billing Session
            </Button>
          </CardContent>
        </Card>

        <OpenSessionDialog
          open={showOpenDialog}
          onOpenChange={setShowOpenDialog}
          defaultCounterType={counterType}
        />
      </>
    );
  }

  return <>{children}</>;
}

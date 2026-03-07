import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Monitor } from "lucide-react";
import { useRequireSession } from "@/hooks/useRequireSession";
import { CounterType } from "@/hooks/useBillingSessions";
import { OpenSessionDialog } from "./OpenSessionDialog";
import { useTranslation } from "@/lib/i18n";

interface SessionRequiredGuardProps {
  children?: React.ReactNode;
  counterType?: CounterType;
  message?: string;
  title?: string;
}

export function SessionRequiredGuard({
  children,
  counterType = "reception",
  message,
  title,
}: SessionRequiredGuardProps) {
  const { t } = useTranslation();
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const { hasActiveSession, isLoading } = useRequireSession(counterType);

  const displayTitle = title || t('billing.sessionRequired');
  const displayMessage = message || t('billing.mustOpenSession');

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
            <h2 className="text-xl font-semibold mb-2">{displayTitle}</h2>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
              {displayMessage}
            </p>
            <Button 
              onClick={() => setShowOpenDialog(true)}
              className="gap-2"
              size="lg"
            >
              <Monitor className="h-4 w-4" />
              {t('billing.openBillingSession')}
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

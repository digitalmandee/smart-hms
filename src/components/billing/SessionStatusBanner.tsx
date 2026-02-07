import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Monitor, Clock } from "lucide-react";
import { useRequireSession } from "@/hooks/useRequireSession";
import { CounterType, getCurrentShift } from "@/hooks/useBillingSessions";
import { OpenSessionDialog } from "./OpenSessionDialog";

interface SessionStatusBannerProps {
  counterType?: CounterType;
  showTransactionCount?: boolean;
}

/**
 * A persistent banner showing the current billing session status.
 * Shows session details if active, or a warning with "Open Session" button if not.
 */
export function SessionStatusBanner({
  counterType = "reception",
  showTransactionCount = true,
}: SessionStatusBannerProps) {
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const { hasActiveSession, session, isLoading } = useRequireSession(counterType);

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  if (!hasActiveSession) {
    return (
      <>
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-warning/50 bg-warning/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">No Active Session</p>
              <p className="text-xs text-muted-foreground">
                You must open a billing session to collect payments
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowOpenDialog(true)}
            className="gap-2 flex-shrink-0"
          >
            <Monitor className="h-4 w-4" />
            Open Session
          </Button>
        </div>

        <OpenSessionDialog
          open={showOpenDialog}
          onOpenChange={setShowOpenDialog}
          defaultCounterType={counterType}
        />
      </>
    );
  }

  const shiftLabel = session?.shift
    ? session.shift.charAt(0).toUpperCase() + session.shift.slice(1)
    : getCurrentShift().charAt(0).toUpperCase() + getCurrentShift().slice(1);

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-success/30 bg-success/5">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <p className="font-medium text-sm">
              Session {session?.session_number}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Opened {session?.opened_at
                ? format(new Date(session.opened_at), "h:mm a")
                : "—"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {session?.counter_type || counterType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {shiftLabel} Shift
            </Badge>
          </div>
        </div>
      </div>

      {showTransactionCount && (
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-medium">
            Rs. {(session?.total_collections || 0).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {session?.transaction_count || 0} transactions
          </p>
        </div>
      )}
    </div>
  );
}

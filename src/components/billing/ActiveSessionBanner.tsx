import { useState } from "react";
import { useActiveSession } from "@/hooks/useBillingSessions";
import { CloseSessionDialog } from "./CloseSessionDialog";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Monitor, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";

interface ActiveSessionBannerProps {
  counterType?: 'reception' | 'ipd' | 'pharmacy' | 'opd' | 'er';
  compact?: boolean;
}

export function ActiveSessionBanner({
  counterType,
  compact = false,
}: ActiveSessionBannerProps) {
  const { t } = useTranslation();
  const { data: session } = useActiveSession(counterType);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const COUNTER_LABELS: Record<string, string> = {
    reception: t('billing.counterReception'),
    opd: t('billing.counterOpd'),
    ipd: t('billing.counterIpd'),
    pharmacy: t('billing.counterPharmacy'),
    er: t('billing.counterEr'),
  };

  if (!session) return null;

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/10 border border-success/20 text-sm">
          <Monitor className="h-4 w-4 text-success" />
          <span className="font-medium">{session.session_number}</span>
          <span className="text-muted-foreground">|</span>
          <span>{formatCurrency(session.total_collections)}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 ml-auto"
            onClick={() => setShowCloseDialog(true)}
          >
            <X className="h-3 w-3 mr-1" />
            {t('common.close')}
          </Button>
        </div>

        <CloseSessionDialog
          open={showCloseDialog}
          onOpenChange={setShowCloseDialog}
          sessionId={session.id}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-lg bg-success/5 border border-success/20">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-success/10">
            <Monitor className="h-5 w-5 text-success" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{session.session_number}</span>
              <span className="text-sm px-2 py-0.5 rounded bg-success/20 text-success">
                {t('billing.activeSession')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{COUNTER_LABELS[session.counter_type] || session.counter_type}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t('billing.opened')} {format(new Date(session.opened_at), 'hh:mm a')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t('billing.collections')}</p>
            <p className="text-lg font-bold">{formatCurrency(session.total_collections)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t('billing.transactions')}</p>
            <p className="text-lg font-bold">{session.transaction_count}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCloseDialog(true)}
          >
            {t('billing.closeSession')}
          </Button>
        </div>
      </div>

      <CloseSessionDialog
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}
        sessionId={session.id}
      />
    </>
  );
}

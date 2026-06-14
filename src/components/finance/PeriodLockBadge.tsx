import { usePeriodLockStatus } from "@/hooks/useAccountingIntegrity";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  date: string; // YYYY-MM-DD
  className?: string;
}

/**
 * Inline badge showing whether a date sits inside a locked fiscal year.
 * Use on every JE / voucher / invoice form date field.
 */
export function PeriodLockBadge({ date, className }: Props) {
  const { data, isLoading } = usePeriodLockStatus(date);

  if (isLoading || !data) return null;

  if (data.is_locked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className={className}>
              <Lock className="h-3 w-3 mr-1" />
              Period locked
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            Fiscal year <strong>{data.fiscal_year}</strong> is closed.
            New entries for this date will be rejected.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge variant="outline" className={className}>
      <Unlock className="h-3 w-3 mr-1" />
      {data.fiscal_year} · Open
    </Badge>
  );
}

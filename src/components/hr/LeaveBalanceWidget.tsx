import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LeaveBalance {
  id: string;
  entitled_days: number;
  used_days: number;
  carried_forward: number;
  leave_type: {
    id: string;
    name: string;
    code: string;
    color?: string | null;
    is_paid?: boolean | null;
  } | null;
}

interface LeaveBalanceWidgetProps {
  balances: LeaveBalance[];
  compact?: boolean;
}

export function LeaveBalanceWidget({ balances, compact }: LeaveBalanceWidgetProps) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {balances.map((balance) => {
          const total = (balance.entitled_days || 0) + (balance.carried_forward || 0);
          const used = balance.used_days || 0;
          const remaining = total - used;
          const percentage = total > 0 ? (used / total) * 100 : 0;

          return (
            <div
              key={balance.id}
              className="flex items-center justify-between p-2 rounded-md border bg-card"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: balance.leave_type?.color || "#6b7280" }}
                />
                <span className="text-xs font-medium">
                  {balance.leave_type?.code || balance.leave_type?.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {remaining}/{total}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Leave Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {balances.map((balance) => {
          const total = (balance.entitled_days || 0) + (balance.carried_forward || 0);
          const used = balance.used_days || 0;
          const remaining = total - used;
          const percentage = total > 0 ? (used / total) * 100 : 0;

          return (
            <div key={balance.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: balance.leave_type?.color || "#6b7280" }}
                  />
                  <span className="text-sm font-medium">
                    {balance.leave_type?.name}
                  </span>
                  {!balance.leave_type?.is_paid && (
                    <span className="text-xs text-muted-foreground">(Unpaid)</span>
                  )}
                </div>
                <div className="text-sm">
                  <span className="font-medium">{remaining}</span>
                  <span className="text-muted-foreground"> / {total} days</span>
                </div>
              </div>
              <Progress
                value={percentage}
                className={cn(
                  "h-2",
                  percentage > 80 && "[&>div]:bg-red-500",
                  percentage > 50 && percentage <= 80 && "[&>div]:bg-yellow-500"
                )}
              />
              {balance.carried_forward > 0 && (
                <p className="text-xs text-muted-foreground">
                  Includes {balance.carried_forward} carried forward
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

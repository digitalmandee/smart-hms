import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Clock, User, Wallet, LogOut } from "lucide-react";
import { POSSession } from "@/hooks/usePOS";

interface POSSessionWidgetProps {
  session: POSSession | null;
  onOpenSession: () => void;
  onCloseSession: () => void;
  isLoading?: boolean;
}

export function POSSessionWidget({
  session,
  onOpenSession,
  onCloseSession,
  isLoading,
}: POSSessionWidgetProps) {
  if (!session) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-800">No Active Session</p>
                <p className="text-sm text-amber-600">Open a session to start selling</p>
              </div>
            </div>
            <Button onClick={onOpenSession} disabled={isLoading}>
              Open Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="default" className="bg-green-600">
              Session Active
            </Badge>
            
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{session.opener?.full_name || "Unknown"}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Since {format(new Date(session.opened_at), "h:mm a")}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span>
                Opening: Rs. {Number(session.opening_balance).toFixed(2)}
                {session.expected_cash !== null && (
                  <span className="ml-2 text-green-600">
                    (Current: Rs. {Number(session.expected_cash).toFixed(2)})
                  </span>
                )}
              </span>
            </div>
          </div>

          <Button variant="outline" onClick={onCloseSession} disabled={isLoading}>
            <LogOut className="mr-2 h-4 w-4" />
            Close Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

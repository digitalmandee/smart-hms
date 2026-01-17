import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useKioskSessions } from "@/hooks/useKioskAuth";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Monitor, Clock, Ticket, XCircle, RefreshCw, 
  CheckCircle2, Laptop, Globe 
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface KioskSessionData {
  id: string;
  kiosk_id: string;
  started_at: string;
  ended_at: string | null;
  last_activity_at: string;
  tokens_generated: number;
  is_active: boolean;
  ip_address: string | null;
  device_info: {
    userAgent?: string;
    screenWidth?: number;
    screenHeight?: number;
  };
  kiosk: {
    name: string;
    kiosk_type: string;
  };
}

export default function KioskSessionsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { getSessions, endSession } = useKioskSessions(profile?.organization_id);

  const [sessions, setSessions] = useState<KioskSessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const data = await getSessions(showInactive);
      setSessions(data || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      toast({
        title: "Error",
        description: "Failed to load kiosk sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [showInactive, profile?.organization_id]);

  const handleEndSession = async (sessionId: string) => {
    try {
      await endSession(sessionId);
      toast({
        title: "Session ended",
        description: "The kiosk session has been terminated",
      });
      fetchSessions();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive",
      });
    }
  };

  const activeSessions = sessions.filter((s) => s.is_active);
  const inactiveSessions = sessions.filter((s) => !s.is_active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kiosk Sessions"
        description="Monitor active kiosk sessions and their activity"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Kiosks", href: "/app/settings/kiosks" },
          { label: "Sessions" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label htmlFor="show-inactive">Show past sessions</Label>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSessions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Active Sessions */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Active Sessions ({activeSessions.length})
        </h2>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : activeSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active kiosk sessions</p>
              <p className="text-sm text-muted-foreground mt-1">
                Kiosks will appear here when they login
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeSessions.map((session) => (
              <Card key={session.id} className="border-green-200 bg-green-50/30">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <CardTitle className="text-base">
                        {session.kiosk?.name || "Unknown Kiosk"}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="uppercase text-xs">
                      {session.kiosk?.kiosk_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Started</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Activity</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(session.last_activity_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{session.tokens_generated}</span>
                      <span className="text-sm text-muted-foreground">tokens</span>
                    </div>
                    {session.ip_address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        {session.ip_address}
                      </div>
                    )}
                  </div>

                  {session.device_info?.screenWidth && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Laptop className="h-3 w-3" />
                      {session.device_info.screenWidth}x{session.device_info.screenHeight}
                    </div>
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleEndSession(session.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Sessions */}
      {showInactive && inactiveSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Past Sessions ({inactiveSessions.length})
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inactiveSessions.map((session) => (
              <Card key={session.id} className="opacity-75">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      {session.kiosk?.name || "Unknown Kiosk"}
                    </CardTitle>
                    <Badge variant="secondary" className="uppercase text-xs">
                      {session.kiosk?.kiosk_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>
                      {format(new Date(session.started_at), "HH:mm")} -{" "}
                      {session.ended_at
                        ? format(new Date(session.ended_at), "HH:mm")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>{format(new Date(session.started_at), "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tokens</span>
                    <span className="font-medium">{session.tokens_generated}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

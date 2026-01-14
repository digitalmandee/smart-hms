import { useAmbulanceAlerts, AmbulanceAlert } from "@/hooks/useEmergency";
import { AmbulanceAlertCard } from "./AmbulanceAlertCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ambulance, Plus, Bell, BellOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

interface IncomingAmbulancePanelProps {
  compact?: boolean;
}

export const IncomingAmbulancePanel = ({ compact = false }: IncomingAmbulancePanelProps) => {
  const { data: alerts } = useAmbulanceAlerts("incoming");
  const navigate = useNavigate();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const previousCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const incomingAlerts = alerts?.filter(a => a.status === "incoming") || [];
  const criticalAlerts = incomingAlerts.filter(a => a.priority === 1);

  // Audio alert for new incoming ambulances
  useEffect(() => {
    if (audioEnabled && incomingAlerts.length > previousCountRef.current) {
      // Play alert sound
      try {
        const audio = new Audio("/sounds/ambulance-alert.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Ignore if audio fails to play
        });
      } catch {
        // Ignore audio errors
      }
    }
    previousCountRef.current = incomingAlerts.length;
  }, [incomingAlerts.length, audioEnabled]);

  if (compact) {
    return (
      <Card className={incomingAlerts.length > 0 ? "border-red-500" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${incomingAlerts.length > 0 ? "bg-red-100 dark:bg-red-950" : "bg-muted"}`}>
                <Ambulance className={`h-5 w-5 ${incomingAlerts.length > 0 ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
              </div>
              <div>
                <div className="font-medium">Incoming Ambulances</div>
                <div className="text-sm text-muted-foreground">
                  {incomingAlerts.length === 0 
                    ? "None at this time" 
                    : `${incomingAlerts.length} incoming`
                  }
                </div>
              </div>
            </div>
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalAlerts.length} Critical
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={criticalAlerts.length > 0 ? "border-red-500 ring-2 ring-red-500/20" : ""}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Ambulance className={`h-5 w-5 ${incomingAlerts.length > 0 ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
          <CardTitle className="text-lg">Incoming Ambulances</CardTitle>
          {incomingAlerts.length > 0 && (
            <Badge variant="secondary">{incomingAlerts.length}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? "Disable audio alerts" : "Enable audio alerts"}
          >
            {audioEnabled ? (
              <Bell className="h-4 w-4 text-green-500" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <Button size="sm" onClick={() => navigate("/app/emergency/ambulance-alerts")}>
            <Plus className="h-4 w-4 mr-1" />
            New Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {incomingAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ambulance className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No incoming ambulances at this time</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 pr-2">
              {incomingAlerts.map((alert) => (
                <AmbulanceAlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

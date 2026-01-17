import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { RefreshCw, Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePublicQueueDisplay, useFilteredQueue } from "@/hooks/useQueueDisplays";
import { useOrganizationPublic } from "@/hooks/usePublicQueue";
import { cn } from "@/lib/utils";

const priorityConfig = {
  0: { label: "Normal", bgClass: "bg-green-500", textClass: "text-white" },
  1: { label: "Urgent", bgClass: "bg-amber-500", textClass: "text-white" },
  2: { label: "Emergency", bgClass: "bg-red-500", textClass: "text-white" },
};

export default function FilteredQueueDisplayPage() {
  const { displayId } = useParams();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [lastAnnouncedToken, setLastAnnouncedToken] = useState<number | null>(null);

  const { data: displayConfig, isLoading: configLoading } = usePublicQueueDisplay(displayId);
  const { data: queue, isLoading: queueLoading, refetch } = useFilteredQueue(displayId);
  const { data: organization } = useOrganizationPublic(displayConfig?.organization_id);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Audio announcement for new tokens being served
  useEffect(() => {
    if (!displayConfig?.audio_enabled || !audioEnabled || !queue?.length) return;
    
    const servingNow = queue.find((p: any) => p.status === "in_progress");
    if (servingNow && servingNow.token_number !== lastAnnouncedToken) {
      // Play announcement sound
      const utterance = new SpeechSynthesisUtterance(
        `Token number ${servingNow.token_number}, please proceed to ${servingNow.doctor?.name || "the doctor"}`
      );
      speechSynthesis.speak(utterance);
      setLastAnnouncedToken(servingNow.token_number);
    }
  }, [queue, audioEnabled, displayConfig?.audio_enabled, lastAnnouncedToken]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (configLoading || queueLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg">Loading display...</p>
        </div>
      </div>
    );
  }

  if (!displayConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Display Not Found</h1>
          <p className="text-muted-foreground mt-2">
            This queue display is not available or has been disabled.
          </p>
        </div>
      </div>
    );
  }

  // Split queue into now serving and waiting
  const nowServing = queue?.filter((p: any) => p.status === "in_progress") || [];
  const waiting = queue?.filter((p: any) => p.status === "checked_in") || [];
  const nextUp = waiting.slice(0, displayConfig.show_next_count || 5);

  // Sort by priority then token
  const sortedNowServing = [...nowServing].sort((a: any, b: any) => 
    (b.priority || 0) - (a.priority || 0) || (a.token_number || 0) - (b.token_number || 0)
  );
  const sortedNextUp = [...nextUp].sort((a: any, b: any) => 
    (b.priority || 0) - (a.priority || 0) || (a.token_number || 0) - (b.token_number || 0)
  );

  const displayTypeLabels = {
    opd: "OPD Queue",
    ipd: "IPD Queue", 
    emergency: "Emergency Queue",
    combined: "Patient Queue",
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      displayConfig.theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    )}>
      {/* Header */}
      <div className={cn(
        "px-6 py-4 flex items-center justify-between",
        displayConfig.theme === "dark" ? "bg-gray-800" : "bg-white shadow-sm"
      )}>
        <div>
          <h1 className="text-2xl font-bold">{organization?.name || "Hospital"}</h1>
          <p className="text-sm opacity-75">
            {displayTypeLabels[displayConfig.display_type]} • {displayConfig.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-bold font-mono">
              {format(currentTime, "HH:mm:ss")}
            </div>
            <div className="text-sm opacity-75">
              {format(currentTime, "EEEE, d MMMM yyyy")}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={displayConfig.theme === "dark" ? "border-gray-700" : ""}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className={displayConfig.theme === "dark" ? "border-gray-700" : ""}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className={displayConfig.theme === "dark" ? "border-gray-700" : ""}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 grid grid-cols-3 gap-6">
        {/* Now Serving - Left 2/3 */}
        <div className="col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Now Serving</h2>
          {sortedNowServing.length === 0 ? (
            <div className={cn(
              "flex-1 flex items-center justify-center rounded-lg",
              displayConfig.theme === "dark" ? "bg-gray-800" : "bg-white shadow"
            )}>
              <p className="text-lg opacity-50">No patients being served</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedNowServing.map((patient: any) => {
                const priority = priorityConfig[patient.priority as keyof typeof priorityConfig] || priorityConfig[0];
                return (
                  <div
                    key={patient.id}
                    className={cn(
                      "p-6 rounded-lg flex items-center justify-between",
                      displayConfig.theme === "dark" ? "bg-gray-800" : "bg-white shadow"
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-24 h-24 rounded-xl flex items-center justify-center text-4xl font-bold",
                        priority.bgClass, priority.textClass
                      )}>
                        {patient.token_number}
                      </div>
                      <div>
                        <p className="text-2xl font-semibold">
                          {patient.patient?.first_name} {patient.patient?.last_name}
                        </p>
                        <p className="text-lg opacity-75">
                          Dr. {patient.doctor?.name}
                        </p>
                        {patient.doctor?.specialization && (
                          <Badge variant="outline" className="mt-1">
                            {patient.doctor.specialization}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {patient.priority > 0 && (
                      <Badge className={cn(priority.bgClass, priority.textClass, "text-lg px-4 py-2")}>
                        {priority.label}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Next Up - Right 1/3 */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Up Next ({waiting.length} waiting)</h2>
          <div className={cn(
            "flex-1 rounded-lg overflow-hidden",
            displayConfig.theme === "dark" ? "bg-gray-800" : "bg-white shadow"
          )}>
            {sortedNextUp.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="opacity-50">No patients waiting</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sortedNextUp.map((patient: any, index: number) => {
                  const priority = priorityConfig[patient.priority as keyof typeof priorityConfig] || priorityConfig[0];
                  return (
                    <div
                      key={patient.id}
                      className={cn(
                        "p-4 flex items-center gap-4",
                        index === 0 && "bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold",
                        priority.bgClass, priority.textClass
                      )}>
                        {patient.token_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {patient.patient?.first_name} {patient.patient?.last_name}
                        </p>
                        <p className="text-sm opacity-75 truncate">
                          Dr. {patient.doctor?.name}
                        </p>
                      </div>
                      {patient.priority > 0 && (
                        <Badge variant="outline" className={cn("text-xs", priority.bgClass, priority.textClass)}>
                          {priority.label}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with Legend */}
      <div className={cn(
        "px-6 py-3 flex items-center justify-between text-sm",
        displayConfig.theme === "dark" ? "bg-gray-800" : "bg-white shadow-sm"
      )}>
        <div className="flex items-center gap-4">
          <span className="opacity-75">Priority:</span>
          <div className="flex gap-2">
            <Badge className="bg-green-500">Normal</Badge>
            <Badge className="bg-amber-500">Urgent</Badge>
            <Badge className="bg-red-500">Emergency</Badge>
          </div>
        </div>
        <p className="opacity-50">Auto-refreshes every 5 seconds</p>
      </div>
    </div>
  );
}

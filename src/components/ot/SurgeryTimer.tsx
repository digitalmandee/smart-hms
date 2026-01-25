import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2, Play } from "lucide-react";
import { format, differenceInSeconds, addMinutes } from "date-fns";
import { cn } from "@/lib/utils";

interface SurgeryTimerProps {
  startTime: string;
  estimatedDurationMinutes?: number;
  endTime?: string | null;
  procedureName: string;
  surgeonName?: string;
  roomName?: string;
  className?: string;
}

export function SurgeryTimer({
  startTime,
  estimatedDurationMinutes = 60,
  endTime,
  procedureName,
  surgeonName,
  roomName,
  className,
}: SurgeryTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const startDate = useMemo(() => new Date(startTime), [startTime]);
  const estimatedEndDate = useMemo(
    () => addMinutes(startDate, estimatedDurationMinutes),
    [startDate, estimatedDurationMinutes]
  );

  useEffect(() => {
    // If surgery is completed, calculate final elapsed time
    if (endTime) {
      const finalElapsed = differenceInSeconds(new Date(endTime), startDate);
      setElapsedSeconds(finalElapsed);
      return;
    }

    // Calculate initial elapsed time
    const initial = differenceInSeconds(new Date(), startDate);
    setElapsedSeconds(Math.max(0, initial));

    // Update every second
    const interval = setInterval(() => {
      const elapsed = differenceInSeconds(new Date(), startDate);
      setElapsedSeconds(Math.max(0, elapsed));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime, startDate]);

  const formatDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const estimatedTotalSeconds = estimatedDurationMinutes * 60;
  const progressPercent = Math.min(
    100,
    (elapsedSeconds / estimatedTotalSeconds) * 100
  );
  const isOvertime = elapsedSeconds > estimatedTotalSeconds;
  const isNearingEnd = progressPercent >= 75 && !isOvertime;

  const getStatusColor = () => {
    if (endTime) return "text-muted-foreground";
    if (isOvertime) return "text-destructive";
    if (isNearingEnd) return "text-yellow-600";
    return "text-primary";
  };

  const getProgressColor = () => {
    if (endTime) return "bg-muted";
    if (isOvertime) return "bg-destructive";
    if (isNearingEnd) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <Card className={cn("border-2", className, {
      "border-destructive/50 bg-destructive/5": isOvertime && !endTime,
      "border-yellow-500/50 bg-yellow-50": isNearingEnd && !endTime,
      "border-primary/30": !isOvertime && !isNearingEnd && !endTime,
      "border-muted": endTime,
    })}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {endTime ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : isOvertime ? (
                <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
              ) : (
                <Play className="h-5 w-5 text-primary" />
              )}
              <span className="font-semibold text-lg">
                {endTime ? "Surgery Completed" : "Live Surgery Timer"}
              </span>
            </div>
            <Badge variant={endTime ? "secondary" : isOvertime ? "destructive" : "default"}>
              {endTime ? "Completed" : isOvertime ? "Overtime" : "In Progress"}
            </Badge>
          </div>

          {/* Timer Display */}
          <div className="text-center py-4">
            <div className={cn("text-5xl font-mono font-bold tracking-wider", getStatusColor())}>
              {formatDuration(elapsedSeconds)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Estimated: {Math.floor(estimatedDurationMinutes / 60)}h {estimatedDurationMinutes % 60}m
              {isOvertime && !endTime && (
                <span className="text-destructive ml-2">
                  (+{formatDuration(elapsedSeconds - estimatedTotalSeconds)} over)
                </span>
              )}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500", getProgressColor())}
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
              {isOvertime && !endTime && (
                <div 
                  className="absolute inset-0 bg-destructive/20 animate-pulse"
                  style={{ width: '100%' }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Started: {format(startDate, "hh:mm a")}</span>
              <span>{Math.round(progressPercent)}%</span>
              <span>Est. End: {format(estimatedEndDate, "hh:mm a")}</span>
            </div>
          </div>

          {/* Surgery Info */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t text-sm">
            <div>
              <p className="text-muted-foreground">Procedure</p>
              <p className="font-medium truncate" title={procedureName}>
                {procedureName}
              </p>
            </div>
            {surgeonName && (
              <div>
                <p className="text-muted-foreground">Lead Surgeon</p>
                <p className="font-medium">{surgeonName}</p>
              </div>
            )}
            {roomName && (
              <div>
                <p className="text-muted-foreground">OT Room</p>
                <p className="font-medium">{roomName}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

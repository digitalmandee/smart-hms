import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AmbulanceAlert, useUpdateAmbulanceAlert } from "@/hooks/useEmergency";
import { formatDistanceToNow } from "date-fns";
import { Ambulance, Clock, Phone, Users, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface AmbulanceAlertCardProps {
  alert: AmbulanceAlert;
  onArrived?: () => void;
}

export const AmbulanceAlertCard = ({ alert, onArrived }: AmbulanceAlertCardProps) => {
  const navigate = useNavigate();
  const updateMutation = useUpdateAmbulanceAlert();
  const [etaRemaining, setEtaRemaining] = useState<number | null>(null);

  // Calculate remaining ETA
  useEffect(() => {
    if (!alert.eta_minutes || alert.status !== "incoming") {
      setEtaRemaining(null);
      return;
    }

    const calculateEta = () => {
      const createdAt = new Date(alert.created_at);
      const expectedArrival = new Date(createdAt.getTime() + alert.eta_minutes! * 60 * 1000);
      const remaining = Math.max(0, Math.ceil((expectedArrival.getTime() - Date.now()) / 60000));
      setEtaRemaining(remaining);
    };

    calculateEta();
    const interval = setInterval(calculateEta, 30000);
    return () => clearInterval(interval);
  }, [alert.created_at, alert.eta_minutes, alert.status]);

  const handleMarkArrived = async () => {
    await updateMutation.mutateAsync({
      id: alert.id,
      status: "arrived",
      arrival_time: new Date().toISOString(),
    });
    onArrived?.();
    // Navigate to registration with prefilled data
    navigate(`/app/emergency/register?ambulance_id=${alert.id}`);
  };

  const priorityColors = {
    1: "border-red-500 bg-red-50 dark:bg-red-950/30",
    2: "border-orange-500 bg-orange-50 dark:bg-orange-950/30",
    3: "border-green-500 bg-green-50 dark:bg-green-950/30",
  };

  const priorityLabels = {
    1: { label: "Critical", color: "destructive" as const },
    2: { label: "Serious", color: "secondary" as const },
    3: { label: "Stable", color: "outline" as const },
  };

  const priority = (alert.priority || 2) as 1 | 2 | 3;

  return (
    <Card
      className={cn(
        "border-l-4 transition-all",
        priorityColors[priority],
        alert.status === "incoming" && priority === 1 && "animate-pulse"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Ambulance className="h-5 w-5 text-red-500" />
                <span className="font-semibold">
                  {alert.ambulance_id || "Unknown Vehicle"}
                </span>
              </div>
              <Badge variant={priorityLabels[priority].color}>
                {priorityLabels[priority].label}
              </Badge>
              {alert.status === "arrived" && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Arrived
                </Badge>
              )}
            </div>

            {/* ETA */}
            {alert.status === "incoming" && etaRemaining !== null && (
              <div className={cn(
                "flex items-center gap-2 text-lg font-bold",
                etaRemaining <= 5 ? "text-red-600 animate-pulse" : "text-orange-600"
              )}>
                <Clock className="h-5 w-5" />
                ETA: {etaRemaining} min
                {etaRemaining <= 5 && (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            )}

            {/* Condition Summary */}
            {alert.condition_summary && (
              <p className="text-sm text-muted-foreground">
                {alert.condition_summary}
              </p>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              {alert.patient_count > 1 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {alert.patient_count} patients
                </span>
              )}
              {alert.caller_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {alert.caller_name && `${alert.caller_name}: `}
                  {alert.caller_phone}
                </span>
              )}
              <span>
                Reported {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Prehospital care */}
            {alert.prehospital_care && (
              <div className="text-xs bg-muted p-2 rounded">
                <strong>Prehospital Care:</strong> {alert.prehospital_care}
              </div>
            )}
          </div>

          {/* Actions */}
          {alert.status === "incoming" && (
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleMarkArrived}
              disabled={updateMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Patient Arrived
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

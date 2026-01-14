import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OTRoomStatusBadge } from "./OTRoomStatusBadge";
import { Building2, Settings, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OTRoom, Surgery } from "@/hooks/useOT";

interface OTRoomCardProps {
  room: OTRoom;
  currentSurgery?: Surgery | null;
  onManage?: () => void;
  className?: string;
}

export function OTRoomCard({ room, currentSurgery, onManage, className }: OTRoomCardProps) {
  const getStatusColor = () => {
    switch (room.status) {
      case 'available': return 'border-l-green-500';
      case 'occupied': return 'border-l-red-500';
      case 'cleaning': return 'border-l-yellow-500';
      case 'maintenance': return 'border-l-gray-500';
      case 'reserved': return 'border-l-blue-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <Card className={cn("border-l-4", getStatusColor(), className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">{room.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{room.room_number}</p>
            </div>
          </div>
          <OTRoomStatusBadge status={room.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {room.floor && (
          <p className="text-sm text-muted-foreground">
            Floor: {room.floor}
          </p>
        )}
        
        {room.room_type && (
          <p className="text-sm">
            <span className="text-muted-foreground">Type:</span>{" "}
            <span className="font-medium capitalize">{room.room_type}</span>
          </p>
        )}

        {currentSurgery && room.status === 'occupied' && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {currentSurgery.patient?.first_name} {currentSurgery.patient?.last_name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {currentSurgery.procedure_name}
            </p>
            {currentSurgery.actual_start_time && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Started: {new Date(currentSurgery.actual_start_time).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        {onManage && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onManage}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

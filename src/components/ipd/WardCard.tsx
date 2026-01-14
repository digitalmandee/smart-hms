import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Building2, Bed, Users, Phone, Clock, Edit, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface WardCardProps {
  ward: {
    id: string;
    name: string;
    code: string;
    ward_type: string;
    floor?: string;
    total_beds?: number;
    is_active?: boolean;
    visiting_hours?: string;
    contact_extension?: string;
    nurse_in_charge?: { id: string; full_name: string } | null;
    beds?: Array<{ id: string; bed_number: string; status: string }>;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const WardCard = ({ ward, onView, onEdit }: WardCardProps) => {
  const beds = ward.beds || [];
  const occupiedBeds = beds.filter((b) => b.status === "occupied").length;
  const availableBeds = beds.filter((b) => b.status === "available").length;
  const totalBeds = beds.length || ward.total_beds || 0;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const getOccupancyColor = () => {
    if (occupancyRate >= 90) return "text-destructive";
    if (occupancyRate >= 70) return "text-warning";
    return "text-success";
  };

  const getProgressColor = () => {
    if (occupancyRate >= 90) return "bg-destructive";
    if (occupancyRate >= 70) return "bg-warning";
    return "bg-success";
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", !ward.is_active && "opacity-60")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">{ward.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{ward.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={ward.is_active ? "default" : "secondary"}>
              {ward.ward_type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Occupancy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Occupancy</span>
            <span className={cn("font-medium", getOccupancyColor())}>
              {occupancyRate}%
            </span>
          </div>
          <Progress 
            value={occupancyRate} 
            className="h-2"
            // @ts-ignore - custom indicator color
            indicatorClassName={getProgressColor()}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              {occupiedBeds}/{totalBeds} beds
            </span>
            <span className="text-success">{availableBeds} available</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          {ward.floor && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>Floor: {ward.floor}</span>
            </div>
          )}
          {ward.nurse_in_charge && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>In-charge: {ward.nurse_in_charge.full_name}</span>
            </div>
          )}
          {ward.visiting_hours && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{ward.visiting_hours}</span>
            </div>
          )}
          {ward.contact_extension && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>Ext: {ward.contact_extension}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onView && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(ward.id)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(ward.id)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NurseWithDetails, NURSE_SPECIALIZATIONS } from "@/hooks/useNurses";
import { Heart, MapPin, Phone, Calendar, AlertTriangle, Eye } from "lucide-react";
import { format, parseISO, isBefore, addDays } from "date-fns";

interface NurseEmployeeCardProps {
  nurse: NurseWithDetails;
  onClick?: () => void;
  compact?: boolean;
}

export function NurseEmployeeCard({ nurse, onClick, compact }: NurseEmployeeCardProps) {
  const employee = nurse.employee;
  const fullName = employee 
    ? `${employee.first_name} ${employee.last_name || ''}`.trim()
    : 'Unknown';

  const specializationLabel = NURSE_SPECIALIZATIONS.find(
    s => s.value === nurse.specialization
  )?.label || nurse.specialization;

  const isLicenseExpired = nurse.license_expiry 
    ? isBefore(parseISO(nurse.license_expiry), new Date()) 
    : false;

  const isLicenseExpiringSoon = nurse.license_expiry 
    ? isBefore(parseISO(nurse.license_expiry), addDays(new Date(), 30)) && !isLicenseExpired
    : false;

  if (compact) {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={employee?.profile_photo_url || ''} />
              <AvatarFallback className="bg-pink-100 text-pink-700">
                {fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{fullName}</p>
                {!nurse.is_available && (
                  <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {specializationLabel || 'General Nursing'}
              </p>
            </div>
            {nurse.is_charge_nurse && (
              <Badge variant="default" className="bg-pink-500">
                Charge
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex items-start gap-3">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
              <AvatarImage src={employee?.profile_photo_url || ''} />
              <AvatarFallback className="bg-pink-100 text-pink-700 text-lg">
                {fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{fullName}</h3>
                {nurse.is_charge_nurse && (
                  <Badge variant="default" className="bg-pink-500">
                    <Heart className="h-3 w-3 mr-1" />
                    Charge Nurse
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {employee?.employee_number}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {employee?.category && (
                  <Badge 
                    variant="outline" 
                    style={{ 
                      borderColor: employee.category.color || undefined,
                      color: employee.category.color || undefined 
                    }}
                  >
                    {employee.category.name}
                  </Badge>
                )}
                {!nurse.is_available && (
                  <Badge variant="secondary">Unavailable</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {specializationLabel && (
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-pink-500" />
              <span className="font-medium">{specializationLabel}</span>
            </div>
          )}

          {nurse.qualification && (
            <p className="text-sm text-muted-foreground">
              {nurse.qualification}
            </p>
          )}

          {nurse.assigned_ward && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{nurse.assigned_ward.name}</span>
              {nurse.assigned_ward.ward_type && (
                <Badge variant="outline" className="text-xs">
                  {nurse.assigned_ward.ward_type}
                </Badge>
              )}
            </div>
          )}

          {employee?.personal_phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{employee.personal_phone}</span>
            </div>
          )}

          {nurse.license_number && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>License: {nurse.license_number}</span>
              {isLicenseExpired && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expired
                </Badge>
              )}
              {isLicenseExpiringSoon && (
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expiring Soon
                </Badge>
              )}
            </div>
          )}

          <div className="pt-3 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={onClick}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

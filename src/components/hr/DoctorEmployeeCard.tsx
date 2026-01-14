import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  Phone, 
  Mail, 
  Building, 
  Calendar, 
  DollarSign,
  Eye,
  Edit,
  Clock
} from "lucide-react";
import { DoctorWithProfile } from "@/hooks/useDoctors";
import { useNavigate } from "react-router-dom";

interface DoctorEmployeeCardProps {
  doctor: DoctorWithProfile;
  onViewSchedule?: (doctorId: string) => void;
}

export function DoctorEmployeeCard({ doctor, onViewSchedule }: DoctorEmployeeCardProps) {
  const navigate = useNavigate();

  const displayName = doctor.employee 
    ? `${doctor.employee.first_name} ${doctor.employee.last_name || ''}`
    : doctor.profile?.full_name || 'Unknown Doctor';

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const employeeNumber = doctor.employee?.employee_number;
  const department = doctor.employee?.department?.name;
  const designation = doctor.employee?.designation?.name;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={doctor.profile?.avatar_url || ""} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Dr. {displayName}
                  {doctor.is_available ? (
                    <Badge variant="default" className="bg-green-500">Available</Badge>
                  ) : (
                    <Badge variant="secondary">Unavailable</Badge>
                  )}
                </h3>
                {employeeNumber && (
                  <p className="text-sm text-muted-foreground">
                    {employeeNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {doctor.specialization && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  {doctor.specialization}
                </Badge>
              )}
              {doctor.qualification && (
                <Badge variant="secondary">{doctor.qualification}</Badge>
              )}
              {doctor.employee?.category && (
                <Badge 
                  style={{ 
                    backgroundColor: doctor.employee.category.color || undefined,
                    color: doctor.employee.category.color ? '#fff' : undefined
                  }}
                >
                  {doctor.employee.category.name}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground pt-2">
              {department && (
                <div className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  {department}
                </div>
              )}
              {designation && (
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5" />
                  {designation}
                </div>
              )}
              {doctor.branch?.name && (
                <div className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  {doctor.branch.name}
                </div>
              )}
              {doctor.profile?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {doctor.profile.phone}
                </div>
              )}
              {doctor.profile?.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {doctor.profile.email}
                </div>
              )}
              {doctor.consultation_fee && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Fee: {doctor.consultation_fee.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          {doctor.employee?.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/app/hr/employees/${doctor.employee?.id}`)}
            >
              <Eye className="h-4 w-4 mr-1.5" />
              View Profile
            </Button>
          )}
          {doctor.employee?.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/app/hr/employees/${doctor.employee?.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          )}
          {onViewSchedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewSchedule(doctor.id)}
            >
              <Clock className="h-4 w-4 mr-1.5" />
              Schedule
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

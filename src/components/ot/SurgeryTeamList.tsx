import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserMinus, CheckCircle2 } from "lucide-react";
import type { SurgeryTeamMember, SurgeryTeamRole } from "@/hooks/useOT";

interface SurgeryTeamListProps {
  members: SurgeryTeamMember[];
  onRemove?: (memberId: string) => void;
  editable?: boolean;
}

const roleLabels: Record<SurgeryTeamRole, { label: string; color: string }> = {
  lead_surgeon: { label: "Lead Surgeon", color: "bg-blue-100 text-blue-700" },
  assistant_surgeon: { label: "Assistant", color: "bg-indigo-100 text-indigo-700" },
  anesthetist: { label: "Anesthetist", color: "bg-purple-100 text-purple-700" },
  scrub_nurse: { label: "Scrub Nurse", color: "bg-green-100 text-green-700" },
  circulating_nurse: { label: "Circulating Nurse", color: "bg-teal-100 text-teal-700" },
  technician: { label: "Technician", color: "bg-gray-100 text-gray-700" },
};

export function SurgeryTeamList({ members, onRemove, editable = false }: SurgeryTeamListProps) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No team members assigned yet
      </p>
    );
  }

  const getMemberName = (member: SurgeryTeamMember): string => {
    if (member.doctor?.profile?.full_name) return member.doctor.profile.full_name;
    if (member.nurse?.profile?.full_name) return member.nurse.profile.full_name;
    if (member.employee?.full_name) return member.employee.full_name;
    return "Unknown";
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Group by role
  const groupedMembers = members.reduce((acc, member) => {
    if (!acc[member.role]) acc[member.role] = [];
    acc[member.role].push(member);
    return acc;
  }, {} as Record<SurgeryTeamRole, SurgeryTeamMember[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedMembers).map(([role, roleMembers]) => (
        <div key={role} className="space-y-2">
          <Badge 
            variant="outline" 
            className={roleLabels[role as SurgeryTeamRole]?.color}
          >
            {roleLabels[role as SurgeryTeamRole]?.label || role}
          </Badge>
          <div className="space-y-2">
            {roleMembers.map((member) => {
              const name = getMemberName(member);
              return (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                      {member.doctor?.specialization && (
                        <p className="text-xs text-muted-foreground">
                          {member.doctor.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.is_confirmed && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {editable && onRemove && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onRemove(member.id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

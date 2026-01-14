import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeCardProps {
  employee: {
    id: string;
    first_name: string;
    last_name?: string | null;
    employee_number: string;
    personal_phone?: string | null;
    personal_email?: string | null;
    employment_status?: string | null;
    department?: { id: string; name: string } | null;
    designation?: { id: string; name: string } | null;
    category?: { id: string; name: string; color?: string | null } | null;
  };
  onClick?: () => void;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-700 border-green-200",
  probation: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  on_leave: "bg-blue-500/10 text-blue-700 border-blue-200",
  resigned: "bg-gray-500/10 text-gray-700 border-gray-200",
  terminated: "bg-red-500/10 text-red-700 border-red-200",
};

export function EmployeeCard({ employee, onClick, compact }: EmployeeCardProps) {
  const fullName = `${employee.first_name} ${employee.last_name || ""}`.trim();
  const initials = `${employee.first_name[0]}${employee.last_name?.[0] || ""}`.toUpperCase();

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
      >
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{fullName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {employee.designation?.name || employee.employee_number}
          </p>
        </div>
        {employee.category?.color && (
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: employee.category.color }}
          />
        )}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold truncate">{fullName}</h3>
              {employee.employment_status && (
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize text-xs shrink-0",
                    statusColors[employee.employment_status]
                  )}
                >
                  {employee.employment_status.replace("_", " ")}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {employee.designation?.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {employee.employee_number}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {employee.department && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>{employee.department.name}</span>
                </div>
              )}
              {employee.personal_phone && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{employee.personal_phone}</span>
                </div>
              )}
              {employee.personal_email && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">{employee.personal_email}</span>
                </div>
              )}
            </div>

            {employee.category && (
              <Badge
                variant="secondary"
                className="mt-2 text-xs"
                style={{
                  backgroundColor: employee.category.color
                    ? `${employee.category.color}20`
                    : undefined,
                  color: employee.category.color || undefined,
                }}
              >
                {employee.category.name}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

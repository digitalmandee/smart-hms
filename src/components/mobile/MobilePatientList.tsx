import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, Calendar, MoreVertical, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { StatusBadge } from "@/components/StatusBadge";
import { usePatients, usePatientStats, useUpdatePatient } from "@/hooks/usePatients";
import { useAuth } from "@/contexts/AuthContext";
import { useHaptics } from "@/hooks/useHaptics";
import { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Patient = Database["public"]["Tables"]["patients"]["Row"];

export function MobilePatientList() {
  const navigate = useNavigate();
  const { roles } = useAuth();
  const haptics = useHaptics();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: patients, isLoading, refetch } = usePatients(searchQuery);
  const { data: stats, refetch: refetchStats } = usePatientStats();
  const updatePatient = useUpdatePatient();

  const canRegisterPatient = roles.some(r => 
    ['receptionist', 'nurse', 'org_admin', 'branch_admin', 'super_admin'].includes(r)
  );

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchStats()]);
  };

  const getFullName = (patient: Patient) => {
    return `${patient.first_name}${patient.last_name ? ` ${patient.last_name}` : ""}`;
  };

  const getAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePatientClick = (patient: Patient) => {
    haptics.light();
    navigate(`/app/patients/${patient.id}`);
  };

  const handleToggleActive = (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation();
    haptics.medium();
    updatePatient.mutate({ id, data: { is_active: !currentStatus } });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4 py-4 space-y-4 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Patients</h1>
            <p className="text-sm text-muted-foreground">
              {stats?.total || 0} total patients
            </p>
          </div>
        </div>

        {/* Stats Grid - 2x2 compact */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                <User className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.active || 0}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-info/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.today || 0}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.thisMonth || 0}</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Input
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11"
        />

        {/* Patient List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : patients?.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No patients found</p>
            </div>
          ) : (
            patients?.map((patient) => (
              <Card 
                key={patient.id} 
                className={cn(
                  "cursor-pointer active:scale-[0.98] transition-transform",
                  !patient.is_active && "opacity-60"
                )}
                onClick={() => handlePatientClick(patient)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">{getFullName(patient)}</p>
                          {patient.blood_group && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              {patient.blood_group}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {patient.patient_number}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          {patient.gender && (
                            <span className="capitalize">{patient.gender}</span>
                          )}
                          {patient.date_of_birth && (
                            <span>{getAge(patient.date_of_birth)} yrs</span>
                          )}
                          {patient.city && (
                            <span>{patient.city}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                          {patient.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </span>
                          )}
                          {patient.email && (
                            <span className="flex items-center gap-1 truncate max-w-[150px]">
                              <Mail className="h-3 w-3" />
                              {patient.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={patient.is_active ? "active" : "inactive"} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/patients/${patient.id}`);
                          }}>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/patients/${patient.id}/edit`);
                          }}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleToggleActive(e, patient.id, patient.is_active || false)}
                          >
                            {patient.is_active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      {canRegisterPatient && (
        <Button 
          className="fab bg-primary text-primary-foreground"
          onClick={() => {
            haptics.medium();
            navigate("/app/patients/new");
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </PullToRefresh>
  );
}

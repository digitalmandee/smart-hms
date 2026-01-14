import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllDoctors } from "@/hooks/useDoctors";
import { useBranches } from "@/hooks/useBranches";
import { DoctorEmployeeCard } from "@/components/hr/DoctorEmployeeCard";
import { 
  Plus, 
  Search, 
  Stethoscope, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  Calendar,
  Loader2
} from "lucide-react";

export default function DoctorsListPage() {
  const navigate = useNavigate();
  const { data: doctors, isLoading } = useAllDoctors();
  const { data: branches } = useBranches();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");

  // Filter doctors
  const filteredDoctors = doctors?.filter((doctor) => {
    const name = doctor.employee 
      ? `${doctor.employee.first_name} ${doctor.employee.last_name || ''}`
      : doctor.profile?.full_name || '';
    
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.employee?.employee_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = selectedBranch === "all" || doctor.branch_id === selectedBranch;
    
    const matchesAvailability = 
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && doctor.is_available) ||
      (availabilityFilter === "unavailable" && !doctor.is_available);

    return matchesSearch && matchesBranch && matchesAvailability;
  }) || [];

  // Stats
  const totalDoctors = doctors?.length || 0;
  const availableDoctors = doctors?.filter(d => d.is_available).length || 0;
  const linkedDoctors = doctors?.filter(d => d.employee_id).length || 0;
  const unlinkedDoctors = totalDoctors - linkedDoctors;

  const handleViewSchedule = (doctorId: string) => {
    navigate(`/app/appointments/schedules?doctorId=${doctorId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        description="Manage doctor employees and clinical staff"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Doctors" },
        ]}
        actions={
          <Button onClick={() => navigate("/app/hr/employees/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Doctor Employee
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDoctors}</p>
              <p className="text-sm text-muted-foreground">Total Doctors</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <UserCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{availableDoctors}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{linkedDoctors}</p>
              <p className="text-sm text-muted-foreground">Linked to Employees</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unlinkedDoctors}</p>
              <p className="text-sm text-muted-foreground">Not Linked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, specialization, or employee number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches?.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No Doctors Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedBranch !== "all" || availabilityFilter !== "all"
                ? "Try adjusting your filters"
                : "Add a new doctor employee to get started"}
            </p>
            <Button onClick={() => navigate("/app/hr/employees/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor Employee
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredDoctors.map((doctor) => (
            <DoctorEmployeeCard 
              key={doctor.id} 
              doctor={doctor} 
              onViewSchedule={handleViewSchedule}
            />
          ))}
        </div>
      )}

      {/* Unlinked Doctors Alert */}
      {unlinkedDoctors > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              {unlinkedDoctors} Doctor(s) Not Linked to Employee Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-3">
              These doctors don't have corresponding employee records. Link them to enable HR features like attendance, leaves, and payroll.
            </p>
            <div className="flex flex-wrap gap-2">
              {doctors?.filter(d => !d.employee_id).map((doctor) => (
                <Badge key={doctor.id} variant="outline" className="border-yellow-300">
                  Dr. {doctor.profile?.full_name || 'Unknown'}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

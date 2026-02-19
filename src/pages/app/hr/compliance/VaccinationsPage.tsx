import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";
import { useEmployees, useDepartments } from "@/hooks/useHR";
import { Syringe, Search, Users, AlertTriangle, CheckCircle, Clock, Plus } from "lucide-react";
import { differenceInDays, addMonths, format, subMonths } from "date-fns";

const VACCINE_TYPES = [
  { name: "Hepatitis B", doses: 3, interval: "0, 1, 6 months" },
  { name: "Influenza", doses: 1, interval: "Annual" },
  { name: "Tetanus (Td/Tdap)", doses: 1, interval: "Every 10 years" },
  { name: "MMR", doses: 2, interval: "4 weeks apart" },
  { name: "COVID-19", doses: 2, interval: "As recommended" },
];

export default function VaccinationsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedVaccine, setSelectedVaccine] = useState<string>("all");
  
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: departments, isLoading: loadingDepts } = useDepartments();

  // Mock vaccination data (in production, this would come from a dedicated table)
  const employeeVaccinationData = employees?.map((emp, index) => {
    const vaccines = VACCINE_TYPES.map((vaccine, vIndex) => {
      const isComplete = (index + vIndex) % 3 !== 0;
      const dosesGiven = isComplete ? vaccine.doses : Math.floor(vaccine.doses / 2);
      const lastDoseDate = subMonths(new Date(), (index + vIndex) % 12);
      const nextDueDate = vaccine.name === "Influenza" 
        ? addMonths(lastDoseDate, 12) 
        : vaccine.name === "Tetanus (Td/Tdap)" 
          ? addMonths(lastDoseDate, 120)
          : null;
      
      return {
        name: vaccine.name,
        totalDoses: vaccine.doses,
        dosesGiven,
        isComplete,
        lastDoseDate,
        nextDueDate,
        isDue: nextDueDate ? differenceInDays(nextDueDate, new Date()) <= 30 : false,
      };
    });
    
    const completedCount = vaccines.filter(v => v.isComplete).length;
    const dueCount = vaccines.filter(v => v.isDue).length;
    
    return {
      ...emp,
      vaccines,
      completedCount,
      dueCount,
      compliancePercentage: Math.round((completedCount / VACCINE_TYPES.length) * 100),
    };
  }) || [];

  const filteredEmployees = employeeVaccinationData.filter(emp => {
    const matchesSearch = `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.employee_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === "all" || emp.department_id === selectedDepartment;
    const matchesVaccine = selectedVaccine === "all" || 
                          emp.vaccines.some(v => v.name === selectedVaccine && !v.isComplete);
    return matchesSearch && matchesDept && matchesVaccine;
  });

  const totalEmployees = employees?.length || 0;
  const fullyVaccinated = employeeVaccinationData.filter(e => e.compliancePercentage === 100).length;
  const pendingVaccinations = employeeVaccinationData.filter(e => e.dueCount > 0).length;
  const overallCompliance = totalEmployees > 0 
    ? Math.round(employeeVaccinationData.reduce((sum, e) => sum + e.compliancePercentage, 0) / totalEmployees)
    : 0;

  const isLoading = loadingEmployees || loadingDepts;

  const getDepartmentName = (deptId: string | null) => {
    if (!deptId) return "N/A";
    return departments?.find(d => d.id === deptId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Vaccinations"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Compliance", href: "/app/hr/compliance" },
          { label: "Vaccinations" }
        ]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Vaccination Drive
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fully Vaccinated</p>
                <p className="text-2xl font-bold">{fullyVaccinated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Due</p>
                <p className="text-2xl font-bold">{pendingVaccinations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Syringe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold">{overallCompliance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vaccine Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        {VACCINE_TYPES.map((vaccine) => {
          const completedCount = employeeVaccinationData.filter(
            e => e.vaccines.find(v => v.name === vaccine.name)?.isComplete
          ).length;
          const percentage = totalEmployees > 0 ? Math.round((completedCount / totalEmployees) * 100) : 0;
          
          return (
            <Card key={vaccine.name}>
              <CardContent className="pt-4 pb-4">
                <div className="text-center">
                  <p className="text-sm font-medium">{vaccine.name}</p>
                  <p className="text-2xl font-bold text-primary mt-1">{percentage}%</p>
                  <p className="text-xs text-muted-foreground">{completedCount}/{totalEmployees} complete</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Syringe className="h-5 w-5" />
                Vaccination Records
              </CardTitle>
              <CardDescription>Individual employee vaccination status</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedVaccine} onValueChange={setSelectedVaccine}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Vaccines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vaccines</SelectItem>
                  {VACCINE_TYPES.map((vaccine) => (
                    <SelectItem key={vaccine.name} value={vaccine.name}>{vaccine.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  {VACCINE_TYPES.map(v => (
                    <TableHead key={v.name} className="text-center">{v.name}</TableHead>
                  ))}
                  <TableHead className="text-center">Compliance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No records found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.slice(0, 15).map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={emp.profile_photo_url || ""} />
                            <AvatarFallback>{emp.first_name?.[0]}{emp.last_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                            <p className="text-xs text-muted-foreground">{emp.employee_number}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getDepartmentName(emp.department_id)}</TableCell>
                      {emp.vaccines.map(v => (
                        <TableCell key={v.name} className="text-center">
                          {v.isComplete ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          ) : v.isDue ? (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Due
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {v.dosesGiven}/{v.totalDoses}
                            </Badge>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <Badge 
                          className={
                            emp.compliancePercentage === 100 
                              ? "bg-green-100 text-green-700" 
                              : emp.compliancePercentage >= 50 
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }
                        >
                          {emp.compliancePercentage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

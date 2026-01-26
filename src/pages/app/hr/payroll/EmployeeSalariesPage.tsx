import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Eye, DollarSign, Users, FileText, Stethoscope, AlertCircle } from "lucide-react";
import { useEmployeeSalaries, useSalaryStructures, useCreateEmployeeSalary } from "@/hooks/usePayroll";
import { SalaryBreakdown } from "@/components/hr/SalaryBreakdown";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Hook to get employee IDs that are doctors with compensation plans
function useDoctorsWithCompensationPlans() {
  return useQuery({
    queryKey: ["doctors-with-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_compensation_plans")
        .select(`
          doctor_id,
          plan_type,
          base_salary,
          doctor:doctor_id(employee_id)
        `)
        .eq("is_active", true);
      
      if (error) throw error;
      
      // Create a map of employee_id -> plan info
      const planMap: Record<string, { planType: string; baseSalary: number }> = {};
      data?.forEach((plan: any) => {
        if (plan.doctor?.employee_id) {
          planMap[plan.doctor.employee_id] = {
            planType: plan.plan_type,
            baseSalary: plan.base_salary || 0,
          };
        }
      });
      return planMap;
    },
  });
}

export default function EmployeeSalariesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: salaries, isLoading } = useEmployeeSalaries({ isCurrent: true });
  const { data: structures } = useSalaryStructures();
  const { data: doctorPlans } = useDoctorsWithCompensationPlans();
  const createSalary = useCreateEmployeeSalary();

  const [assignForm, setAssignForm] = useState({
    employee_id: "",
    salary_structure_id: "",
    basic_salary: "",
    effective_from: format(new Date(), "yyyy-MM-dd"),
  });

  const filteredSalaries = salaries?.filter((s: any) => {
    const name = `${s.employee?.first_name} ${s.employee?.last_name}`.toLowerCase();
    const empNo = s.employee?.employee_number?.toLowerCase() || "";
    return name.includes(searchTerm.toLowerCase()) || empNo.includes(searchTerm.toLowerCase());
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  
  // Check if an employee has a doctor compensation plan
  const getDoctorPlanInfo = (employeeId: string) => doctorPlans?.[employeeId];

  const handleAssignSalary = async () => {
    if (!assignForm.salary_structure_id || !assignForm.basic_salary) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await createSalary.mutateAsync({
        employee_id: assignForm.employee_id,
        salary_structure_id: assignForm.salary_structure_id,
        basic_salary: parseFloat(assignForm.basic_salary),
        effective_from: assignForm.effective_from,
        is_current: true,
      });
      setIsAssignDialogOpen(false);
      setAssignForm({
        employee_id: "",
        salary_structure_id: "",
        basic_salary: "",
        effective_from: format(new Date(), "yyyy-MM-dd"),
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const stats = {
    totalEmployees: salaries?.length || 0,
    totalPayroll: salaries?.reduce((sum: number, s: any) => sum + (s.basic_salary || 0), 0) || 0,
    avgSalary: salaries?.length ? (salaries.reduce((sum: number, s: any) => sum + (s.basic_salary || 0), 0) / salaries.length) : 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Salaries"
        description="Manage employee salary assignments and structures"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Payroll", href: "/app/hr/payroll" },
          { label: "Employee Salaries" },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">With assigned salaries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">Monthly basic salaries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgSalary)}</div>
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Employee Salary List</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading salaries...</div>
          ) : filteredSalaries?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No salary records found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Salary Structure</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalaries?.map((salary: any) => {
                  const doctorPlan = getDoctorPlanInfo(salary.employee_id);
                  const isDoctor = !!doctorPlan;
                  
                  return (
                    <TableRow key={salary.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {salary.employee?.first_name} {salary.employee?.last_name}
                          {isDoctor && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Stethoscope className="h-4 w-4 text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">Doctor with Compensation Plan</p>
                                  <p className="text-xs text-muted-foreground">
                                    Plan: {doctorPlan.planType.replace(/_/g, ' ')}<br/>
                                    Salary auto-synced from compensation settings
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{salary.employee?.employee_number || "-"}</TableCell>
                      <TableCell>{salary.salary_structure?.name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {formatCurrency(salary.basic_salary)}
                          {isDoctor && (
                            <Badge variant="outline" className="text-xs ml-1">
                              Synced
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {salary.effective_from ? format(new Date(salary.effective_from), "dd MMM yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={salary.is_current ? "default" : "secondary"}>
                          {salary.is_current ? "Current" : "Previous"}
                        </Badge>
                      </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedEmployee(salary);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setAssignForm({
                              employee_id: salary.employee_id,
                              salary_structure_id: salary.salary_structure_id || "",
                              basic_salary: salary.basic_salary?.toString() || "",
                              effective_from: format(new Date(), "yyyy-MM-dd"),
                            });
                            setIsAssignDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Salary Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Salary Details - {selectedEmployee?.employee?.first_name} {selectedEmployee?.employee?.last_name}
            </DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <SalaryBreakdown
              basicSalary={selectedEmployee.basic_salary || 0}
              components={[]}
              showCard={false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign/Edit Salary Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Salary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Salary Structure</Label>
              <Select
                value={assignForm.salary_structure_id}
                onValueChange={(value) => setAssignForm({ ...assignForm, salary_structure_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select structure" />
                </SelectTrigger>
                <SelectContent>
                  {structures?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Basic Salary (PKR)</Label>
              <Input
                type="number"
                value={assignForm.basic_salary}
                onChange={(e) => setAssignForm({ ...assignForm, basic_salary: e.target.value })}
                placeholder="Enter basic salary"
              />
            </div>
            <div className="space-y-2">
              <Label>Effective From</Label>
              <Input
                type="date"
                value={assignForm.effective_from}
                onChange={(e) => setAssignForm({ ...assignForm, effective_from: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignSalary} disabled={createSalary.isPending}>
              {createSalary.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

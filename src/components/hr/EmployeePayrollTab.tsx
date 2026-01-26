import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEmployeePayslips, useEmployeeCurrentSalary } from "@/hooks/usePayroll";
import { useDoctorCompensationPlan, useUnpaidEarningsForEmployee } from "@/hooks/useDoctorCompensation";
import { PayslipPreview } from "@/components/hr/PayslipPreview";
import { Loader2, Eye, CreditCard, Wallet, TrendingUp, Percent, Stethoscope, Info } from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EmployeePayrollTabProps {
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  departmentName?: string;
  designationName?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Hook to get doctor_id from employee_id
function useDoctorFromEmployee(employeeId: string) {
  return useQuery({
    queryKey: ["doctor-from-employee", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, profile_id")
        .eq("employee_id", employeeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });
}

export function EmployeePayrollTab({ 
  employeeId, 
  employeeName, 
  employeeNumber,
  departmentName,
  designationName 
}: EmployeePayrollTabProps) {
  const { data: payslips, isLoading: loadingPayslips } = useEmployeePayslips(employeeId);
  const { data: currentSalary, isLoading: loadingSalary } = useEmployeeCurrentSalary(employeeId);
  const { data: doctorRecord } = useDoctorFromEmployee(employeeId);
  const { data: compensationPlan } = useDoctorCompensationPlan(doctorRecord?.id || "");
  const { data: unpaidEarnings } = useUnpaidEarningsForEmployee(employeeId); // Takes employeeId, not doctorId
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isDoctor = !!doctorRecord;
  const walletBalance = unpaidEarnings?.total || 0; // unpaidEarnings is an object with .total

  const getPayslipData = (payslip: any) => ({
    employee: {
      name: employeeName,
      employeeNumber: employeeNumber,
      department: departmentName,
      designation: designationName,
    },
    period: {
      month: payslip.payroll_run?.month || 1,
      year: payslip.payroll_run?.year || new Date().getFullYear(),
    },
    earnings: Array.isArray(payslip.earnings) ? payslip.earnings : [],
    deductions: Array.isArray(payslip.deductions) ? payslip.deductions : [],
    workingDays: payslip.total_working_days || 0,
    daysWorked: payslip.present_days || 0,
    leaveDays: payslip.leave_days || 0,
    paymentDate: payslip.payroll_run?.pay_date,
    paymentMethod: payslip.payment_method || "Bank Transfer",
  });

  if (loadingPayslips || loadingSalary) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Compute gross/net from basic salary and structure
  const grossSalary = currentSalary?.basic_salary || 0;
  const netSalary = currentSalary?.basic_salary || 0;
  
  // Parse components safely
  const components = currentSalary?.salary_structure?.components;
  const parsedComponents = Array.isArray(components) ? components : [];
  const earnings = parsedComponents.filter((c: any) => c.type === "earning");
  const deductions = parsedComponents.filter((c: any) => c.type === "deduction");

  return (
    <div className="space-y-6">
      {/* Current Salary Card */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Basic Salary</p>
                <p className="text-2xl font-bold">
                  {currentSalary?.basic_salary 
                    ? formatCurrency(currentSalary.basic_salary) 
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gross Salary</p>
                <p className="text-2xl font-bold">
                  {grossSalary ? formatCurrency(grossSalary) : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Salary</p>
                <p className="text-2xl font-bold">
                  {netSalary ? formatCurrency(netSalary) : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Compensation Plan (if applicable) */}
      {isDoctor && compensationPlan && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Doctor Compensation Plan</CardTitle>
              </div>
              <Badge variant={compensationPlan.plan_type === 'fixed_salary' ? 'secondary' : compensationPlan.plan_type === 'hybrid' ? 'default' : 'outline'}>
                {compensationPlan.plan_type === 'fixed_salary' ? 'Fixed Salary' : 
                 compensationPlan.plan_type === 'hybrid' ? 'Hybrid (Salary + Commission)' : 
                 compensationPlan.plan_type === 'per_consultation' ? 'Per-Consultation' :
                 compensationPlan.plan_type === 'per_procedure' ? 'Per-Procedure' :
                 'Revenue Share'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Base Salary</h4>
                <p className="text-xl font-bold">{formatCurrency(compensationPlan.base_salary || 0)}</p>
                {compensationPlan.plan_type !== 'fixed_salary' && (
                  <p className="text-xs text-muted-foreground">
                    This is your guaranteed monthly salary. Commission earnings are added on top.
                  </p>
                )}
              </div>
              {compensationPlan.plan_type !== 'fixed_salary' && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                    <Percent className="h-4 w-4" /> Commission Rates
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Consultation:</span>
                      <span className="font-medium">{compensationPlan.consultation_share_percent || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Procedure:</span>
                      <span className="font-medium">{compensationPlan.procedure_share_percent || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Surgery:</span>
                      <span className="font-medium">{compensationPlan.surgery_share_percent || 0}%</span>
                    </div>
                    {compensationPlan.anesthesia_share_percent && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Anesthesia:</span>
                        <span className="font-medium">{compensationPlan.anesthesia_share_percent}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {walletBalance > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">Pending Wallet Balance</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Unpaid commissions from consultations, surgeries, etc.<br/>Will be settled in next payroll.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-lg font-bold text-amber-600">{formatCurrency(walletBalance)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Salary Structure */}
      {currentSalary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Current Salary Structure</CardTitle>
              {isDoctor && compensationPlan && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-xs">
                        <Info className="h-3 w-3 mr-1" /> Synced from Compensation Plan
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This salary is automatically synced from the<br/>doctor's compensation plan base salary.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-primary">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Basic Salary</span>
                    <span>{formatCurrency(currentSalary.basic_salary || 0)}</span>
                  </div>
                  {earnings.map((comp: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{comp.name}</span>
                      <span>
                        {comp.calculation_type === "percentage"
                          ? `${comp.value}%`
                          : formatCurrency(comp.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-destructive">Deductions</h4>
                <div className="space-y-2">
                  {deductions.length > 0 ? (
                    deductions.map((comp: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{comp.name}</span>
                        <span>
                          {comp.calculation_type === "percentage"
                            ? `${comp.value}%`
                            : formatCurrency(comp.value)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No fixed deductions</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payslip History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payslip History</CardTitle>
        </CardHeader>
        <CardContent>
          {!payslips?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No payslips found for this employee
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-medium">
                      {MONTHS[(payslip.payroll_run?.month || 1) - 1]} {payslip.payroll_run?.year}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payslip.gross_salary || 0)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {formatCurrency(payslip.total_deductions || 0)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(payslip.net_salary || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={payslip.payroll_run?.status === "completed" ? "default" : "secondary"}>
                        {payslip.payroll_run?.status === "completed" ? "Paid" : "Processing"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPayslip(payslip)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payslip Preview Dialog */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payslip Details</DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <PayslipPreview data={getPayslipData(selectedPayslip)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

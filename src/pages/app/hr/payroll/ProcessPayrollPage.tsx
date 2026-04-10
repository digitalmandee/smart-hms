import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calculator, Users, Check, ArrowRight, ArrowLeft, AlertCircle, Wallet, Info } from "lucide-react";
import { useEmployeeSalaries, useCreatePayrollRun, useEmployeeLoans, useCreatePayrollEntries } from "@/hooks/usePayroll";
import { useSettleWalletEarnings } from "@/hooks/useDoctorCompensation";
import { useSalaryComponents, useTaxSlabs, useMonthlyAttendance, calculateEmployeePayroll } from "@/hooks/usePayrollCalculation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const STEPS = [
  { id: 1, title: "Select Period", icon: Calculator },
  { id: 2, title: "Review Employees", icon: Users },
  { id: 3, title: "Confirm & Process", icon: Check },
];

// Hook to get all unpaid earnings for employees
function useAllUnpaidEarnings(employeeIds: string[], organizationId: string | undefined) {
  return useQuery({
    queryKey: ["all-unpaid-earnings", employeeIds, organizationId],
    queryFn: async () => {
      if (!employeeIds.length || !organizationId) return {};

      // Get doctor records for these employees
      const { data: doctors } = await supabase
        .from("doctors")
        .select("id, employee_id")
        .in("employee_id", employeeIds);

      if (!doctors?.length) return {};

      const doctorMap: Record<string, string> = {};
      doctors.forEach(d => {
        doctorMap[d.employee_id] = d.id;
      });

      // Get unpaid earnings for these doctors
      const { data: earnings } = await supabase
        .from("doctor_earnings")
        .select("id, doctor_id, source_type, doctor_share_amount")
        .in("doctor_id", Object.values(doctorMap))
        .eq("is_paid", false);

      // Group by employee
      const result: Record<string, { 
        doctorId: string; 
        total: number; 
        bySource: Record<string, number>; 
        earningIds: string[] 
      }> = {};

      Object.entries(doctorMap).forEach(([empId, docId]) => {
        const docEarnings = earnings?.filter(e => e.doctor_id === docId) || [];
        const total = docEarnings.reduce((sum, e) => sum + Number(e.doctor_share_amount), 0);
        const bySource: Record<string, number> = {};
        docEarnings.forEach(e => {
          bySource[e.source_type] = (bySource[e.source_type] || 0) + Number(e.doctor_share_amount);
        });

        if (total > 0) {
          result[empId] = {
            doctorId: docId,
            total,
            bySource,
            earningIds: docEarnings.map(e => e.id),
          };
        }
      });

      return result;
    },
    enabled: employeeIds.length > 0 && !!organizationId,
  });
}

export default function ProcessPayrollPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const currentDate = new Date();
  const [step, setStep] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [includeCommissions, setIncludeCommissions] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string, { name: string; amount: number; type: "earning" | "deduction" }[]>>({});
  const [showAdjDialog, setShowAdjDialog] = useState<string | null>(null);
  const [adjName, setAdjName] = useState("");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjType, setAdjType] = useState<"earning" | "deduction">("earning");

  const { data: salaries, isLoading: salariesLoading } = useEmployeeSalaries({ isCurrent: true });
  const { data: loans } = useEmployeeLoans({ status: "active" });
  const createPayrollRun = useCreatePayrollRun();
  const createPayrollEntries = useCreatePayrollEntries();
  const settleWalletEarnings = useSettleWalletEarnings();

  // Get all employee IDs for fetching wallet balances
  const allEmployeeIds = useMemo(() => salaries?.map((s: any) => s.employee_id) || [], [salaries]);
  const { data: allUnpaidEarnings } = useAllUnpaidEarnings(allEmployeeIds, profile?.organization_id);

  const years = Array.from({ length: 5 }, (_, i) => (currentDate.getFullYear() - 2 + i).toString());

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = salaries?.map((s: any) => s.employee_id) || [];
      setSelectedEmployees(allIds);
      // Default include commissions for all
      const commissions: Record<string, boolean> = {};
      allIds.forEach(id => {
        if (allUnpaidEarnings?.[id]) {
          commissions[id] = true;
        }
      });
      setIncludeCommissions(commissions);
    } else {
      setSelectedEmployees([]);
      setIncludeCommissions({});
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
      if (allUnpaidEarnings?.[employeeId]) {
        setIncludeCommissions(prev => ({ ...prev, [employeeId]: true }));
      }
    } else {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
      setIncludeCommissions(prev => {
        const updated = { ...prev };
        delete updated[employeeId];
        return updated;
      });
    }
  };

  const toggleCommission = (employeeId: string, include: boolean) => {
    setIncludeCommissions(prev => ({ ...prev, [employeeId]: include }));
  };

  const getEmployeeLoanDeductions = (employeeId: string) => {
    return loans?.filter((l: any) => l.employee_id === employeeId && l.status === "active")
      .reduce((sum: number, l: any) => sum + (l.emi_amount || 0), 0) || 0;
  };

  const getEmployeeCommission = (employeeId: string) => {
    return includeCommissions[employeeId] ? (allUnpaidEarnings?.[employeeId]?.total || 0) : 0;
  };

  const calculateTotals = () => {
    const selectedSalaries = salaries?.filter((s: any) => selectedEmployees.includes(s.employee_id)) || [];
    const totalGross = selectedSalaries.reduce((sum: number, s: any) => sum + (s.basic_salary || 0), 0);
    const totalDeductions = selectedEmployees.reduce((sum: number, empId: string) => sum + getEmployeeLoanDeductions(empId), 0);
    const totalCommissions = selectedEmployees.reduce((sum: number, empId: string) => sum + getEmployeeCommission(empId), 0);
    return {
      employees: selectedEmployees.length,
      gross: totalGross,
      deductions: totalDeductions,
      commissions: totalCommissions,
      net: totalGross + totalCommissions - totalDeductions,
    };
  };

  const handleProcess = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    if (!profile?.organization_id) {
      toast.error("Organization not found");
      return;
    }

    setIsProcessing(true);
    try {
      const totals = calculateTotals();
      
      // Step 1: Create the payroll run
      const payrollRun = await createPayrollRun.mutateAsync({
        organization_id: profile.organization_id,
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear),
        run_date: new Date().toISOString(),
        status: "draft",
        total_employees: totals.employees,
        total_gross: totals.gross + totals.commissions,
        total_deductions: totals.deductions,
        total_net: totals.net,
      });

      // Step 2: Create individual payroll entries for each selected employee
      const selectedSalaries = salaries?.filter((s: any) => selectedEmployees.includes(s.employee_id)) || [];
      const entries = selectedSalaries.map((salary: any) => {
        const loanDeduction = getEmployeeLoanDeductions(salary.employee_id);
        const commission = getEmployeeCommission(salary.employee_id);
        const basicSalary = salary.basic_salary || 0;
        const grossSalary = basicSalary + commission;
        const netSalary = grossSalary - loanDeduction;
        
        const employee = salary.employee;
        
        const earnings: { name: string; amount: number }[] = [
          { name: "Basic Salary", amount: basicSalary }
        ];
        
        if (commission > 0) {
          const bySource = allUnpaidEarnings?.[salary.employee_id]?.bySource || {};
          Object.entries(bySource).forEach(([source, amount]) => {
            earnings.push({ 
              name: `Commission (${source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())})`, 
              amount: amount as number 
            });
          });
        }
        
        return {
          payroll_run_id: payrollRun.id,
          employee_id: salary.employee_id,
          basic_salary: basicSalary,
          gross_salary: grossSalary,
          net_salary: netSalary,
          total_deductions: loanDeduction,
          total_working_days: 26,
          present_days: 24,
          absent_days: 0,
          leave_days: 2,
          earnings,
          deductions: loanDeduction > 0 ? [{ name: "Loan EMI", amount: loanDeduction }] : [],
          bank_name: employee?.bank_name || null,
          account_number: employee?.account_number || null,
        };
      });

      await createPayrollEntries.mutateAsync(entries);
      
      // Step 3: Settle wallet earnings for employees who had commissions included
      for (const empId of selectedEmployees) {
        if (includeCommissions[empId] && allUnpaidEarnings?.[empId]) {
          await settleWalletEarnings.mutateAsync({
            doctorId: allUnpaidEarnings[empId].doctorId,
            payrollRunId: payrollRun.id,
          });
        }
      }
      
      toast.success(`Payroll run created with ${entries.length} employee entries!`);
      navigate("/app/hr/payroll");
    } catch (error) {
      // Error handled in hooks
    } finally {
      setIsProcessing(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Process Payroll"
        description="Run monthly payroll for employees"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Payroll", href: "/app/hr/payroll" },
          { label: "Process" },
        ]}
      />

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-sm mt-2 ${step >= s.id ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {s.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-24 h-0.5 mx-4 ${step > s.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Select Period */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Payroll Period</CardTitle>
            <CardDescription>Choose the month and year for payroll processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6 max-w-md">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review Employees */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Employees</CardTitle>
            <CardDescription>
              Payroll for {MONTHS[parseInt(selectedMonth) - 1]} {selectedYear} - Select employees to include
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salariesLoading ? (
              <div className="text-center py-8">Loading employees...</div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="selectAll"
                      checked={selectedEmployees.length === salaries?.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="selectAll">Select All ({salaries?.length || 0} employees)</Label>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4" />
                    <span>Toggle to include wallet commissions in payroll</span>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          Wallet Commissions
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Pending earnings from consultations, surgeries, etc.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableHead>
                      <TableHead>Loan Deductions</TableHead>
                      <TableHead>Net Payable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaries?.map((salary: any) => {
                      const loanDeduction = getEmployeeLoanDeductions(salary.employee_id);
                      const walletBalance = allUnpaidEarnings?.[salary.employee_id];
                      const commission = getEmployeeCommission(salary.employee_id);
                      const netPayable = (salary.basic_salary || 0) + commission - loanDeduction;
                      const isSelected = selectedEmployees.includes(salary.employee_id);
                      
                      return (
                        <TableRow key={salary.id}>
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectEmployee(salary.employee_id, !!checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {salary.employee?.first_name} {salary.employee?.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {salary.employee?.employee_number}
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(salary.basic_salary)}</TableCell>
                          <TableCell>
                            {walletBalance ? (
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={includeCommissions[salary.employee_id] || false}
                                  onCheckedChange={(checked) => toggleCommission(salary.employee_id, checked)}
                                  disabled={!isSelected}
                                />
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge 
                                        variant={includeCommissions[salary.employee_id] ? "default" : "outline"}
                                        className="cursor-help"
                                      >
                                        {formatCurrency(walletBalance.total)}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-xs space-y-1">
                                        {Object.entries(walletBalance.bySource).map(([source, amt]) => (
                                          <div key={source} className="flex justify-between gap-4">
                                            <span className="capitalize">{source.replace(/_/g, ' ')}</span>
                                            <span>{formatCurrency(amt as number)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className={loanDeduction > 0 ? "text-destructive" : ""}>
                            {loanDeduction > 0 ? `-${formatCurrency(loanDeduction)}` : "—"}
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(netPayable)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={selectedEmployees.length === 0}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirm & Process */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm & Process</CardTitle>
            <CardDescription>Review summary and process payroll</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{totals.employees}</div>
                  <p className="text-sm text-muted-foreground">Employees</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.gross)}</div>
                  <p className="text-sm text-muted-foreground">Base Salary</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(totals.commissions)}</div>
                  <p className="text-sm text-muted-foreground">Commissions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-destructive">{formatCurrency(totals.deductions)}</div>
                  <p className="text-sm text-muted-foreground">Deductions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">{formatCurrency(totals.net)}</div>
                  <p className="text-sm text-muted-foreground">Net Payable</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">Payroll Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Processing payroll for {MONTHS[parseInt(selectedMonth) - 1]} {selectedYear} for {totals.employees} employees.
                    Total net amount to be disbursed: {formatCurrency(totals.net)}.
                    {totals.commissions > 0 && (
                      <span className="block mt-1 text-blue-600">
                        Includes {formatCurrency(totals.commissions)} in wallet commissions that will be marked as paid.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleProcess} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Process Payroll"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

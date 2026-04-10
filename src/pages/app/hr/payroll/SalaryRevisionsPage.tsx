import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useEmployeeSalaries, useCreateEmployeeSalary } from "@/hooks/usePayroll";
import { useEmployees } from "@/hooks/useHR";
import { toast } from "sonner";

const REVISION_REASONS = [
  { value: "annual_increment", label: "Annual Increment" },
  { value: "appraisal", label: "Performance Appraisal" },
  { value: "market_adjustment", label: "Market Adjustment" },
  { value: "promotion", label: "Promotion" },
  { value: "probation_completion", label: "Probation Completion" },
  { value: "other", label: "Other" },
];

export default function SalaryRevisionsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [newBasicSalary, setNewBasicSalary] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const { data: allSalaries = [], isLoading } = useEmployeeSalaries({});
  const { data: currentSalaries = [] } = useEmployeeSalaries({ isCurrent: true });
  const { data: employees = [] } = useEmployees();
  const createSalary = useCreateEmployeeSalary();

  // Get current salary for selected employee
  const currentSalary = currentSalaries.find((s: any) => s.employee_id === selectedEmployeeId);

  const handleSubmit = async () => {
    if (!selectedEmployeeId || !newBasicSalary || !effectiveDate || !reason) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await createSalary.mutateAsync({
        employee_id: selectedEmployeeId,
        basic_salary: parseFloat(newBasicSalary),
        effective_from: effectiveDate,
        is_current: true,
        salary_structure_id: currentSalary?.salary_structure_id || null,
        component_overrides: currentSalary?.component_overrides || null,
      });

      toast.success(t("finance.salary_revised" as any, "Salary revision saved successfully"));
      setShowDialog(false);
      resetForm();
    } catch (error) {
      // handled by hook
    }
  };

  const resetForm = () => {
    setSelectedEmployeeId("");
    setNewBasicSalary("");
    setEffectiveDate(new Date().toISOString().slice(0, 10));
    setReason("");
    setNotes("");
  };

  // Build revision history: group salaries by employee
  const revisionHistory = allSalaries.reduce((acc: any[], salary: any) => {
    acc.push(salary);
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("finance.salary_revisions" as any, "Salary Revisions")}
        description={t("finance.salary_revisions_desc" as any, "Manage salary increments, appraisals, and adjustments")}
        breadcrumbs={[
          { label: t("nav.hr" as any, "HR"), href: "/app/hr" },
          { label: t("nav.payroll" as any, "Payroll"), href: "/app/hr/payroll" },
          { label: t("finance.salary_revisions" as any, "Salary Revisions") },
        ]}
        actions={
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("finance.new_revision" as any, "New Revision")}
          </Button>
        }
      />

      {/* Current Salaries Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("finance.salary_history" as any, "Salary History")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.employee" as any, "Employee")}</TableHead>
                  <TableHead>{t("finance.basic_salary" as any, "Basic Salary")}</TableHead>
                  <TableHead>{t("finance.effective_from" as any, "Effective From")}</TableHead>
                  <TableHead>{t("finance.effective_to" as any, "Effective To")}</TableHead>
                  <TableHead>{t("common.status" as any, "Status")}</TableHead>
                  <TableHead>{t("finance.change" as any, "Change")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revisionHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No salary records found
                    </TableCell>
                  </TableRow>
                ) : (
                  revisionHistory.map((salary: any, idx: number) => {
                    // Find next salary for this employee to calculate change
                    const prevSalary = revisionHistory.find(
                      (s: any) => s.employee_id === salary.employee_id && s.id !== salary.id &&
                        new Date(s.effective_from) < new Date(salary.effective_from) && !s.is_current
                    );
                    const changePercent = prevSalary
                      ? (((salary.basic_salary - prevSalary.basic_salary) / prevSalary.basic_salary) * 100).toFixed(1)
                      : null;

                    return (
                      <TableRow key={salary.id}>
                        <TableCell>
                          <div className="font-medium">
                            {salary.employee?.first_name} {salary.employee?.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{salary.employee?.employee_number}</div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(salary.basic_salary)}</TableCell>
                        <TableCell>{format(new Date(salary.effective_from), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                          {salary.effective_to ? format(new Date(salary.effective_to), "dd MMM yyyy") : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={salary.is_current ? "default" : "secondary"}>
                            {salary.is_current ? "Current" : "Previous"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {changePercent ? (
                            <div className={`flex items-center gap-1 text-sm ${
                              parseFloat(changePercent) > 0 ? "text-green-600" : parseFloat(changePercent) < 0 ? "text-red-600" : ""
                            }`}>
                              {parseFloat(changePercent) > 0 ? <TrendingUp className="h-3 w-3" /> :
                                parseFloat(changePercent) < 0 ? <TrendingDown className="h-3 w-3" /> :
                                  <Minus className="h-3 w-3" />}
                              {changePercent}%
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Initial</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New Revision Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("finance.new_salary_revision" as any, "New Salary Revision")}</DialogTitle>
            <DialogDescription>{t("finance.revision_desc" as any, "Adjust employee salary with reason tracking")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("common.employee" as any, "Employee")} *</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentSalary && (
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <p className="text-muted-foreground">Current Basic Salary</p>
                <p className="font-bold text-lg">{formatCurrency(currentSalary.basic_salary)}</p>
              </div>
            )}

            <div>
              <Label>{t("finance.new_basic_salary" as any, "New Basic Salary")} *</Label>
              <Input
                type="number"
                value={newBasicSalary}
                onChange={(e) => setNewBasicSalary(e.target.value)}
                placeholder="Enter new salary"
              />
              {currentSalary && newBasicSalary && (
                <p className={`text-xs mt-1 ${
                  parseFloat(newBasicSalary) > currentSalary.basic_salary ? "text-green-600" : "text-red-600"
                }`}>
                  {((parseFloat(newBasicSalary) - currentSalary.basic_salary) / currentSalary.basic_salary * 100).toFixed(1)}% change
                </p>
              )}
            </div>

            <div>
              <Label>{t("finance.effective_date" as any, "Effective Date")} *</Label>
              <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
            </div>

            <div>
              <Label>{t("finance.reason" as any, "Reason")} *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  {REVISION_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("common.notes" as any, "Notes")}</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createSalary.isPending}>
              {createSalary.isPending ? "Saving..." : "Save Revision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

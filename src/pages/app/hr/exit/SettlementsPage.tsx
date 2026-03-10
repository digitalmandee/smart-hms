import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useResignations, useFinalSettlements, useFinalSettlement, useCreateFinalSettlement, useUpdateFinalSettlement } from "@/hooks/useExitManagement";
import { useEmployees } from "@/hooks/useHR";
import { Plus, Eye, CheckCircle, Clock, DollarSign, TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending_approval: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
};

export default function SettlementsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResignation, setSelectedResignation] = useState<string>("");
  const [viewSettlement, setViewSettlement] = useState<string | null>(null);
  
  const { data: settlements, isLoading } = useFinalSettlements(statusFilter !== "all" ? statusFilter : undefined);
  const { data: resignations } = useResignations("accepted");
  const { data: employees } = useEmployees();
  const { data: existingSettlement } = useFinalSettlement(selectedResignation || undefined);
  const createSettlement = useCreateFinalSettlement();
  const updateSettlement = useUpdateFinalSettlement();

  const [formData, setFormData] = useState({
    basic_salary_days: 0,
    basic_salary_amount: 0,
    leave_encashment_days: 0,
    leave_encashment_amount: 0,
    bonus_amount: 0,
    gratuity_amount: 0,
    other_earnings: 0,
    other_earnings_details: "",
    notice_period_shortage_amount: 0,
    loan_recovery: 0,
    advance_recovery: 0,
    tax_deduction: 0,
    other_deductions: 0,
    other_deductions_details: "",
    notes: "",
  });

  const getEmployeeName = (employeeId: string) => {
    const emp = employees?.find((e) => e.id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const getResignationEmployee = (resignationId: string) => {
    const r = resignations?.find((res) => res.id === resignationId);
    return r ? getEmployeeName(r.employee_id) : "Unknown";
  };

  const totalEarnings = formData.basic_salary_amount + formData.leave_encashment_amount +
    formData.bonus_amount + formData.gratuity_amount + formData.other_earnings;

  const totalDeductions = formData.notice_period_shortage_amount + formData.loan_recovery +
    formData.advance_recovery + formData.tax_deduction + formData.other_deductions;

  const netPayable = totalEarnings - totalDeductions;

  const handleSubmit = async () => {
    const resignation = resignations?.find((r) => r.id === selectedResignation);
    if (!resignation) return;

    await createSettlement.mutateAsync({
      resignation_id: selectedResignation,
      employee_id: resignation.employee_id,
      ...formData,
    });
    setIsDialogOpen(false);
    resetForm();
  };

  const handleApprove = async (id: string) => {
    await updateSettlement.mutateAsync({ id, status: "approved" });
  };

  const handleMarkPaid = async (id: string) => {
    await updateSettlement.mutateAsync({ id, status: "paid", payment_date: new Date().toISOString() });
  };

  const resetForm = () => {
    setFormData({
      basic_salary_days: 0, basic_salary_amount: 0, leave_encashment_days: 0, leave_encashment_amount: 0,
      bonus_amount: 0, gratuity_amount: 0, other_earnings: 0, other_earnings_details: "",
      notice_period_shortage_amount: 0, loan_recovery: 0, advance_recovery: 0, tax_deduction: 0,
      other_deductions: 0, other_deductions_details: "", notes: "",
    });
    setSelectedResignation("");
  };

  // Stats
  const pendingCount = settlements?.filter((s) => s.status === "pending_approval").length || 0;
  const totalDue = settlements?.filter((s) => s.status !== "paid").reduce((sum, s) => sum + (s.net_payable || 0), 0) || 0;
  const totalPaid = settlements?.filter((s) => s.status === "paid").reduce((sum, s) => sum + (s.net_payable || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Final Settlements"
        description="Calculate and process full & final settlements for exiting employees"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Exit Management" },
          { label: "Settlements" },
        ]}
        actions={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Settlement
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-amber-600" />
              <div>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-muted-foreground text-sm">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <TrendingDown className="h-8 w-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(totalDue)}</div>
                <p className="text-muted-foreground text-sm">Total Due</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
                <p className="text-muted-foreground text-sm">Total Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Settlements Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Total Deductions</TableHead>
                  <TableHead>Net Payable</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements?.map((settlement) => (
                  <TableRow key={settlement.id}>
                    <TableCell className="font-medium">
                      {getEmployeeName(settlement.employee_id)}
                    </TableCell>
                    <TableCell className="text-green-600">
                      {formatCurrency(settlement.total_earnings || 0)}
                    </TableCell>
                    <TableCell className="text-destructive">
                      {formatCurrency(settlement.total_deductions || 0)}
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(settlement.net_payable || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[settlement.status || "draft"]}>
                        {settlement.status?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(settlement.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {settlement.status === "pending_approval" && (
                          <Button size="sm" variant="outline" onClick={() => handleApprove(settlement.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {settlement.status === "approved" && (
                          <Button size="sm" onClick={() => handleMarkPaid(settlement.id)}>
                            <DollarSign className="h-4 w-4 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!settlements?.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No settlements found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Settlement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Final Settlement</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Resignation Selector */}
            <div>
              <Label>Select Resignation</Label>
              <Select value={selectedResignation} onValueChange={setSelectedResignation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an accepted resignation..." />
                </SelectTrigger>
                <SelectContent>
                  {resignations?.filter((r) => !settlements?.find((s) => s.resignation_id === r.id))
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {getEmployeeName(r.employee_id)} - LWD: {format(new Date(r.last_working_date), "dd MMM yyyy")}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Earnings Section */}
            <div>
              <h4 className="font-semibold mb-3 text-green-700">Earnings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Basic Salary Days</Label>
                  <Input type="number" value={formData.basic_salary_days} 
                    onChange={(e) => setFormData({ ...formData, basic_salary_days: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Basic Salary Amount</Label>
                  <Input type="number" value={formData.basic_salary_amount}
                    onChange={(e) => setFormData({ ...formData, basic_salary_amount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Leave Encashment Days</Label>
                  <Input type="number" value={formData.leave_encashment_days}
                    onChange={(e) => setFormData({ ...formData, leave_encashment_days: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Leave Encashment Amount</Label>
                  <Input type="number" value={formData.leave_encashment_amount}
                    onChange={(e) => setFormData({ ...formData, leave_encashment_amount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Bonus</Label>
                  <Input type="number" value={formData.bonus_amount}
                    onChange={(e) => setFormData({ ...formData, bonus_amount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Gratuity</Label>
                  <Input type="number" value={formData.gratuity_amount}
                    onChange={(e) => setFormData({ ...formData, gratuity_amount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Other Earnings</Label>
                  <Input type="number" value={formData.other_earnings}
                    onChange={(e) => setFormData({ ...formData, other_earnings: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Other Earnings Details</Label>
                  <Input value={formData.other_earnings_details}
                    onChange={(e) => setFormData({ ...formData, other_earnings_details: e.target.value })} />
                </div>
              </div>
              <div className="mt-2 text-right font-semibold text-green-700">
                Total Earnings: {formatCurrency(totalEarnings)}
              </div>
            </div>

            {/* Deductions Section */}
            <div>
              <h4 className="font-semibold mb-3 text-destructive">Deductions</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Notice Period Shortage</Label>
                  <Input type="number" value={formData.notice_period_shortage_amount}
                    onChange={(e) => setFormData({ ...formData, notice_period_shortage_amount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Loan Recovery</Label>
                  <Input type="number" value={formData.loan_recovery}
                    onChange={(e) => setFormData({ ...formData, loan_recovery: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Advance Recovery</Label>
                  <Input type="number" value={formData.advance_recovery}
                    onChange={(e) => setFormData({ ...formData, advance_recovery: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Tax Deduction</Label>
                  <Input type="number" value={formData.tax_deduction}
                    onChange={(e) => setFormData({ ...formData, tax_deduction: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Other Deductions</Label>
                  <Input type="number" value={formData.other_deductions}
                    onChange={(e) => setFormData({ ...formData, other_deductions: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Other Deductions Details</Label>
                  <Input value={formData.other_deductions_details}
                    onChange={(e) => setFormData({ ...formData, other_deductions_details: e.target.value })} />
                </div>
              </div>
              <div className="mt-2 text-right font-semibold text-destructive">
                Total Deductions: {formatCurrency(totalDeductions)}
              </div>
            </div>

            {/* Net Summary */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Net Payable</span>
                <span className={`text-2xl font-bold ${netPayable >= 0 ? "text-green-700" : "text-destructive"}`}>
                  {formatCurrency(netPayable)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!selectedResignation || createSettlement.isPending}>
              Create Settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, XCircle, Clock, Users, DollarSign, FileText, ShieldCheck, AlertTriangle } from "lucide-react";
import { usePayrollRun, useUpdatePayrollRun, usePayrollDetails, useApprovePayrollRun } from "@/hooks/usePayroll";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function PayrollRunDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { roles } = useAuth();

  const { data: payrollRun, isLoading } = usePayrollRun(id || "");
  const { data: payrollEntries, isLoading: entriesLoading } = usePayrollDetails(id || "");
  const updatePayrollRun = useUpdatePayrollRun();
  const approvePayrollRun = useApprovePayrollRun();

  const canApprove = roles.some(r => ["super_admin", "org_admin", "finance_manager"].includes(r));

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" /> Draft</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>;
      case "pending_approval":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700"><AlertTriangle className="h-3 w-3 mr-1" /> {t("payroll.pendingApproval" as any)}</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700"><ShieldCheck className="h-3 w-3 mr-1" /> {t("payroll.approved" as any)}</Badge>;
      case "completed":
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    try {
      await updatePayrollRun.mutateAsync({
        id,
        status: newStatus as any,
        ...(newStatus === "completed" ? { pay_date: new Date().toISOString() } : {}),
      });
      toast.success(`Payroll run ${newStatus === "cancelled" ? "cancelled" : "updated"} successfully`);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleApproval = async (approved: boolean) => {
    if (!id) return;
    try {
      await approvePayrollRun.mutateAsync({ id, approved });
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading payroll details...</p>
      </div>
    );
  }

  if (!payrollRun) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Payroll run not found</p>
        <Button variant="outline" onClick={() => navigate("/app/hr/payroll")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payroll
        </Button>
      </div>
    );
  }

  const periodLabel = `${MONTHS[(payrollRun.month || 1) - 1]} ${payrollRun.year}`;
  const approvedByProfile = (payrollRun as any)?.approved_by_profile;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Payroll Run - ${periodLabel}`}
        description="View and manage payroll run details"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Payroll", href: "/app/hr/payroll" },
          { label: periodLabel },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/hr/payroll")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Approval Banner */}
      {payrollRun.status === "pending_approval" && (
        <Alert className="border-orange-300 bg-orange-50 dark:bg-orange-950/20">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800 dark:text-orange-300">{t("payroll.awaitingApproval" as any)}</AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-400">
            {t("payroll.approvalRequired" as any)}
          </AlertDescription>
        </Alert>
      )}

      {payrollRun.status === "approved" && approvedByProfile && (
        <Alert className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-800 dark:text-emerald-300">{t("payroll.approved" as any)}</AlertTitle>
          <AlertDescription className="text-emerald-700 dark:text-emerald-400">
            {t("payroll.approvedBy" as any)}: {approvedByProfile.full_name}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollRun.total_employees || 0}</div>
            <p className="text-xs text-muted-foreground">Included in this run</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(payrollRun.total_gross || 0)}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deductions</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{formatCurrency(payrollRun.total_deductions || 0)}</div>
            <p className="text-xs text-muted-foreground">Loans, taxes, etc.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Payable</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(payrollRun.total_net || 0)}</div>
            <p className="text-xs text-muted-foreground">Amount to disburse</p>
          </CardContent>
        </Card>
      </div>

      {/* Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Run Details</CardTitle>
              <CardDescription>Payroll run information and status</CardDescription>
            </div>
            {getStatusBadge(payrollRun.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Period</p>
              <p className="font-medium">{periodLabel}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Run Date</p>
              <p className="font-medium">
                {payrollRun.run_date ? format(new Date(payrollRun.run_date), "dd MMM yyyy") : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pay Date</p>
              <p className="font-medium">
                {payrollRun.pay_date ? format(new Date(payrollRun.pay_date), "dd MMM yyyy") : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {payrollRun.created_at ? format(new Date(payrollRun.created_at), "dd MMM yyyy HH:mm") : "-"}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Action Buttons - Updated flow */}
          <div className="flex gap-3 flex-wrap">
            {payrollRun.status === "draft" && (
              <>
                <Button onClick={() => handleStatusUpdate("processing")} disabled={updatePayrollRun.isPending}>
                  Submit for Processing
                </Button>
                <Button variant="destructive" onClick={() => handleStatusUpdate("cancelled")} disabled={updatePayrollRun.isPending}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Run
                </Button>
              </>
            )}
            {payrollRun.status === "processing" && (
              <>
                <Button onClick={() => handleStatusUpdate("pending_approval")} disabled={updatePayrollRun.isPending}>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {t("payroll.submitForApproval" as any)}
                </Button>
                <Button variant="outline" onClick={() => handleStatusUpdate("draft")} disabled={updatePayrollRun.isPending}>
                  {t("payroll.returnToDraft" as any)}
                </Button>
              </>
            )}
            {payrollRun.status === "pending_approval" && canApprove && (
              <>
                <Button onClick={() => handleApproval(true)} disabled={approvePayrollRun.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {t("payroll.approvePayroll" as any)}
                </Button>
                <Button variant="outline" onClick={() => handleApproval(false)} disabled={approvePayrollRun.isPending}>
                  <XCircle className="h-4 w-4 mr-2" />
                  {t("payroll.rejectPayroll" as any)}
                </Button>
              </>
            )}
            {payrollRun.status === "pending_approval" && !canApprove && (
              <p className="text-sm text-muted-foreground italic">
                {t("payroll.approvalRequired" as any)}
              </p>
            )}
            {payrollRun.status === "approved" && (
              <>
                <Button onClick={() => handleStatusUpdate("completed")} disabled={updatePayrollRun.isPending}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t("payroll.markCompleted" as any)}
                </Button>
              </>
            )}
            {payrollRun.status === "completed" && (
              <Button variant="outline" onClick={() => navigate("/app/hr/payroll/slips")}>
                <FileText className="h-4 w-4 mr-2" />
                View Payslips
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employees in this Run</CardTitle>
          <CardDescription>
            {payrollRun.total_employees || 0} employees included
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entriesLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading employee details...</p>
          ) : payrollEntries && payrollEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollEntries.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.employee?.first_name} {entry.employee?.last_name}
                    </TableCell>
                    <TableCell>{entry.employee?.employee_number || "-"}</TableCell>
                    <TableCell>{formatCurrency(entry.basic_salary || 0)}</TableCell>
                    <TableCell>{formatCurrency(entry.gross_salary || 0)}</TableCell>
                    <TableCell className="text-red-600">-{formatCurrency(entry.total_deductions || 0)}</TableCell>
                    <TableCell className="font-medium text-green-600">{formatCurrency(entry.net_salary || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No employee details available. Run full payroll processing to populate.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

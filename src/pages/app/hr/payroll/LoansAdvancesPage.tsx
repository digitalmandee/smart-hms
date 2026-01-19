import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CheckCircle, XCircle, Landmark, Clock, AlertCircle, DollarSign } from "lucide-react";
import { useEmployeeLoans, useApproveLoan } from "@/hooks/usePayroll";
import { format } from "date-fns";

export default function LoansAdvancesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { data: loans, isLoading } = useEmployeeLoans(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );
  const approveLoan = useApproveLoan();

  const filteredLoans = loans?.filter((loan: any) => {
    const name = `${loan.employee?.first_name} ${loan.employee?.last_name}`.toLowerCase();
    const empNo = loan.employee?.employee_number?.toLowerCase() || "";
    return name.includes(searchTerm.toLowerCase()) || empNo.includes(searchTerm.toLowerCase());
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>;
      case "closed":
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" /> Closed</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    await approveLoan.mutateAsync({ id, approved });
    setIsDetailDialogOpen(false);
  };

  const stats = {
    pending: loans?.filter((l: any) => l.status === "pending").length || 0,
    active: loans?.filter((l: any) => l.status === "active").length || 0,
    totalOutstanding: loans?.filter((l: any) => l.status === "active")
      .reduce((sum: number, l: any) => sum + (l.remaining_amount || 0), 0) || 0,
    totalDisbursed: loans?.filter((l: any) => l.status === "active" || l.status === "closed")
      .reduce((sum: number, l: any) => sum + (l.loan_amount || 0), 0) || 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loans & Advances"
        description="Manage employee loans and salary advances"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Payroll", href: "/app/hr/payroll" },
          { label: "Loans & Advances" },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Landmark className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">To be recovered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalDisbursed)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Loan Applications</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee..."
                  className="pl-8 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading loans...</div>
          ) : filteredLoans?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No loan records found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>EMI</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Installments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans?.map((loan: any) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">
                      {loan.employee?.first_name} {loan.employee?.last_name}
                      <div className="text-xs text-muted-foreground">
                        {loan.employee?.employee_number}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{loan.loan_type?.replace(/_/g, " ") || "-"}</TableCell>
                    <TableCell>{formatCurrency(loan.loan_amount)}</TableCell>
                    <TableCell>{formatCurrency(loan.emi_amount)}</TableCell>
                    <TableCell>{formatCurrency(loan.remaining_amount)}</TableCell>
                    <TableCell>
                      {loan.paid_installments || 0} / {loan.total_installments}
                    </TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell>
                      {loan.created_at ? format(new Date(loan.created_at), "dd MMM yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setIsDetailDialogOpen(true);
                        }}
                      >
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

      {/* Loan Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Employee</Label>
                  <p className="font-medium">
                    {selectedLoan.employee?.first_name} {selectedLoan.employee?.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Employee ID</Label>
                  <p className="font-medium">{selectedLoan.employee?.employee_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Loan Type</Label>
                  <p className="font-medium capitalize">{selectedLoan.loan_type?.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedLoan.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Loan Amount</Label>
                  <p className="font-medium">{formatCurrency(selectedLoan.loan_amount)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">EMI Amount</Label>
                  <p className="font-medium">{formatCurrency(selectedLoan.emi_amount)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Installments</Label>
                  <p className="font-medium">{selectedLoan.total_installments}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Paid Installments</Label>
                  <p className="font-medium">{selectedLoan.paid_installments || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Remaining Amount</Label>
                  <p className="font-medium text-red-600">{formatCurrency(selectedLoan.remaining_amount)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Start Date</Label>
                  <p className="font-medium">
                    {selectedLoan.start_date ? format(new Date(selectedLoan.start_date), "dd MMM yyyy") : "-"}
                  </p>
                </div>
              </div>
              {selectedLoan.reason && (
                <div>
                  <Label className="text-muted-foreground">Reason</Label>
                  <p className="mt-1">{selectedLoan.reason}</p>
                </div>
              )}
              {selectedLoan.status === "pending" && (
                <DialogFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleApprove(selectedLoan.id, false)}
                    disabled={approveLoan.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedLoan.id, true)}
                    disabled={approveLoan.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

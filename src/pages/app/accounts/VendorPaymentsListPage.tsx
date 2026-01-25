import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Search, RefreshCw, Download, Eye, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useVendorPayments, useApproveVendorPayment, useCancelVendorPayment } from "@/hooks/useVendorPayments";
import { useVendors } from "@/hooks/useVendors";
import { formatCurrencyFull as formatCurrency } from "@/lib/currency";

export default function VendorPaymentsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  
  const { data: payments, isLoading, refetch } = useVendorPayments({ 
    status: statusFilter !== "all" ? statusFilter : undefined,
    vendorId: vendorFilter !== "all" ? vendorFilter : undefined,
  });
  const { data: vendors } = useVendors();
  const approvePayment = useApproveVendorPayment();
  const cancelPayment = useCancelVendorPayment();

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approved", className: "bg-blue-100 text-blue-800" },
      paid: { label: "Paid", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
    };
    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredPayments = payments?.filter((payment) => {
    const vendorName = payment.vendor?.name?.toLowerCase() || "";
    const paymentNumber = payment.payment_number?.toLowerCase() || "";
    const reference = payment.reference_number?.toLowerCase() || "";
    
    return (
      !search ||
      vendorName.includes(search.toLowerCase()) ||
      paymentNumber.includes(search.toLowerCase()) ||
      reference.includes(search.toLowerCase())
    );
  }) || [];

  // Summary calculations
  const totalPayments = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = filteredPayments.filter(p => p.status === "pending").length;
  const paidCount = filteredPayments.filter(p => p.status === "paid").length;

  const handleApprove = async (paymentId: string) => {
    await approvePayment.mutateAsync(paymentId);
  };

  const handleCancel = async (paymentId: string) => {
    await cancelPayment.mutateAsync(paymentId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Payments"
        description="Record and manage payments to vendors"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Vendor Payments" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => navigate("/app/accounts/vendor-payments/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatCurrency(totalPayments)}</div>
            <div className="text-sm text-muted-foreground">Total Payments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pending Approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{paidCount}</div>
            <div className="text-sm text-muted-foreground">Paid</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by vendor, payment #, or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors?.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono">{payment.payment_number}</TableCell>
                    <TableCell>{format(new Date(payment.payment_date), "dd MMM yyyy")}</TableCell>
                    <TableCell className="font-medium">{payment.vendor?.name || "-"}</TableCell>
                    <TableCell>
                      {payment.grn?.grn_number || payment.purchase_order?.po_number || payment.reference_number || "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/accounts/vendor-payments/${payment.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {payment.status === "pending" && (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Approve Payment?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will post the payment to the general ledger:
                                    <br />• Debit: Accounts Payable
                                    <br />• Credit: Cash/Bank
                                    <br /><br />
                                    Amount: {formatCurrency(payment.amount)}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleApprove(payment.id)}>
                                    Approve & Post
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Payment?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will cancel the payment record. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Payment</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleCancel(payment.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Cancel Payment
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredPayments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No payments found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

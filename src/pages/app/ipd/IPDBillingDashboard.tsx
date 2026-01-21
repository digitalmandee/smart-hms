import { useNavigate } from "react-router-dom";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
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
  Wallet, 
  Receipt, 
  AlertCircle, 
  TrendingUp,
  FileText,
  ArrowRight,
  RefreshCw,
  Bed
} from "lucide-react";
import { useIPDBillingStats } from "@/hooks/useIPDBilling";
import { format, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/exportUtils";

export default function IPDBillingDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading, refetch } = useIPDBillingStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const admissions = stats?.admissionFinancials || [];

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="IPD Billing Dashboard"
        subtitle="Financial overview of all active admissions"
        variant="gradient"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => navigate("/app/ipd/charges")}>
              <FileText className="h-4 w-4 mr-2" />
              View All Charges
            </Button>
          </div>
        }
        quickStats={[
          { label: "Active Admissions", value: admissions.length, variant: "success" },
          { label: "Pending Invoices", value: stats?.pendingInvoiceCount || 0, variant: "warning" },
        ]}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ModernStatsCard
          title="Total Deposits"
          value={formatCurrency(stats?.totalDeposits || 0)}
          icon={Wallet}
          description="Collected from admissions"
          variant="success"
          delay={0}
        />
        <ModernStatsCard
          title="Unbilled Charges"
          value={formatCurrency(stats?.totalUnbilledCharges || 0)}
          icon={Receipt}
          description="IPD charges not yet invoiced"
          variant="warning"
          delay={100}
        />
        <ModernStatsCard
          title="Outstanding Balance"
          value={formatCurrency(stats?.totalOutstandingBalance || 0)}
          icon={AlertCircle}
          description="Amount due from patients"
          variant="destructive"
          delay={200}
        />
        <ModernStatsCard
          title="Estimated Revenue"
          value={formatCurrency(stats?.totalEstimatedRevenue || 0)}
          icon={TrendingUp}
          description="Total estimated billing"
          variant="primary"
          delay={300}
        />
      </div>

      {/* Active Admissions Financial Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Active Admissions Financial Summary
          </CardTitle>
          <Badge variant="outline">{admissions.length} Patients</Badge>
        </CardHeader>
        <CardContent>
          {admissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active admissions
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Admission #</TableHead>
                    <TableHead>Ward / Bed</TableHead>
                    <TableHead className="text-center">Days</TableHead>
                    <TableHead className="text-right">Deposit</TableHead>
                    <TableHead className="text-right">Room Charges</TableHead>
                    <TableHead className="text-right">Service Charges</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admissions.map((adm) => (
                    <TableRow key={adm.admissionId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{adm.patientName}</p>
                          <p className="text-xs text-muted-foreground">{adm.patientNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-mono text-sm"
                          onClick={() => navigate(`/app/ipd/admissions/${adm.admissionId}`)}
                        >
                          {adm.admissionNumber}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{adm.wardName}</p>
                          <p className="text-muted-foreground">Bed {adm.bedNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{adm.daysAdmitted}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-success">
                        {formatCurrency(adm.depositAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p>{formatCurrency(adm.totalRoomCharges)}</p>
                          <p className="text-xs text-muted-foreground">
                            @ {formatCurrency(adm.roomChargePerDay)}/day
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(adm.totalServiceCharges)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(adm.totalEstimated)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-bold ${
                            adm.balanceDue > 0
                              ? "text-destructive"
                              : adm.balanceDue < 0
                              ? "text-success"
                              : ""
                          }`}
                        >
                          {adm.balanceDue < 0 ? "-" : ""}
                          {formatCurrency(Math.abs(adm.balanceDue))}
                        </span>
                        {adm.balanceDue < 0 && (
                          <p className="text-xs text-success">Credit</p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/ipd/discharge/${adm.admissionId}`)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
          onClick={() => navigate("/app/ipd/charges")}
        >
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">View All IPD Charges</p>
              <p className="text-sm text-muted-foreground">Manage daily patient charges</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
          onClick={() => navigate("/app/billing/invoices?filter=ipd")}
        >
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 rounded-xl bg-warning/10 group-hover:bg-warning/20 transition-colors">
              <FileText className="h-6 w-6 text-warning" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Pending IPD Invoices</p>
              <p className="text-sm text-muted-foreground">
                {stats?.pendingInvoiceCount || 0} invoices pending
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-warning transition-colors" />
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
          onClick={() => navigate("/app/ipd/discharges")}
        >
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 rounded-xl bg-info/10 group-hover:bg-info/20 transition-colors">
              <Wallet className="h-6 w-6 text-info" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Discharge & Billing</p>
              <p className="text-sm text-muted-foreground">Process patient discharges</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-info transition-colors" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

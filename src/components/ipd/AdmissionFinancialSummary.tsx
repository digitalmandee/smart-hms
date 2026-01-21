import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmissionFinancials } from "@/hooks/useAdmissionFinancials";
import { usePatientCreditBalance } from "@/hooks/usePharmacyCredits";
import { formatCurrency } from "@/lib/currency";
import { 
  Wallet, 
  BedDouble, 
  Receipt, 
  Pill, 
  TestTube, 
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdmissionFinancialSummaryProps {
  admissionId: string;
  compact?: boolean;
}

export function AdmissionFinancialSummary({ 
  admissionId, 
  compact = false 
}: AdmissionFinancialSummaryProps) {
  const navigate = useNavigate();
  const { data: financials, isLoading, refetch } = useAdmissionFinancials(admissionId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!financials) {
    return null;
  }

  const isCredit = financials.balance < 0;
  const balanceColor = isCredit 
    ? "text-green-600 dark:text-green-400" 
    : financials.balance > 0 
      ? "text-red-600 dark:text-red-400" 
      : "text-muted-foreground";

  if (compact) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Running Balance</p>
              <p className={`text-2xl font-bold ${balanceColor}`}>
                {isCredit ? "Credit " : ""}{formatCurrency(Math.abs(financials.balance))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {financials.daysAdmitted} days @ {formatCurrency(financials.dailyRate)}/day
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Deposit</p>
              <p className="text-lg font-semibold">{formatCurrency(financials.depositAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Financial Summary
        </CardTitle>
        <div className="flex items-center gap-2">
          {financials.hasUnbilledCharges && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unbilled charges
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-primary/5 border">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Deposit Collected</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(financials.depositAmount)}</p>
          </div>
          <div className={`p-4 rounded-lg border ${isCredit ? 'bg-green-500/5 border-green-200' : financials.balance > 0 ? 'bg-red-500/5 border-red-200' : 'bg-muted'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {isCredit ? "Credit Balance" : "Balance Due"}
              </span>
            </div>
            <p className={`text-2xl font-bold ${balanceColor}`}>
              {formatCurrency(Math.abs(financials.balance))}
            </p>
          </div>
        </div>

        {/* Charge Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Charge Breakdown</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-blue-500" />
                <span>Room Charges</span>
                <Badge variant="secondary" className="text-xs">
                  {financials.daysAdmitted} days × {formatCurrency(financials.dailyRate)}
                </Badge>
              </div>
              <span className="font-medium">{formatCurrency(financials.roomCharges)}</span>
            </div>

            {financials.serviceCharges > 0 && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-purple-500" />
                  <span>Service Charges</span>
                </div>
                <span className="font-medium">{formatCurrency(financials.serviceCharges)}</span>
              </div>
            )}

            {financials.medicationCharges > 0 && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-green-500" />
                  <span>Medications</span>
                </div>
                <span className="font-medium">{formatCurrency(financials.medicationCharges)}</span>
              </div>
            )}

            {financials.labCharges > 0 && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4 text-orange-500" />
                  <span>Lab Tests</span>
                </div>
                <span className="font-medium">{formatCurrency(financials.labCharges)}</span>
              </div>
            )}

            {financials.otherCharges > 0 && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <span>Other Charges</span>
                </div>
                <span className="font-medium">{formatCurrency(financials.otherCharges)}</span>
              </div>
            )}

            {/* Pharmacy Credits (Pay Later) */}
            {financials.pharmacyCreditsAmount > 0 && (
              <div className="flex items-center justify-between py-2 border-b bg-amber-50/50 dark:bg-amber-950/20">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>Pharmacy Credits ({financials.pharmacyCreditsCount})</span>
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                    Pay Later
                  </Badge>
                </div>
                <span className="font-medium text-amber-600">{formatCurrency(financials.pharmacyCreditsAmount)}</span>
              </div>
            )}

            {/* Outstanding Invoices */}
            {financials.outstandingAmount > 0 && (
              <div className="flex items-center justify-between py-2 border-b bg-warning/5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span>Outstanding Invoices ({financials.outstandingInvoices.length})</span>
                </div>
                <span className="font-medium text-warning">{formatCurrency(financials.outstandingAmount)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between py-2 bg-muted/50 px-2 rounded font-semibold">
              <span>Total Charges</span>
              <span>{formatCurrency(financials.totalCharges)}</span>
            </div>
          </div>
        </div>

        {/* Room Info */}
        <div className="text-sm text-muted-foreground border-t pt-4">
          <p>
            <strong>Ward:</strong> {financials.wardName || "Not assigned"} | 
            <strong> Bed:</strong> {financials.bedNumber || "-"} | 
            <strong> Type:</strong> {financials.bedType || "Standard"}
          </p>
          <p className="mt-1">
            <strong>Daily Rate:</strong> {formatCurrency(financials.dailyRate)}/day
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => navigate(`/app/ipd/charges?admissionId=${admissionId}`)}
          >
            View All Charges
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => navigate(`/app/ipd/discharge/${admissionId}`)}
          >
            Generate Invoice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

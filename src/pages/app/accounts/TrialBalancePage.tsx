import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useTrialBalance } from "@/hooks/useFinancialReports";
import { exportToCSV, formatCurrency as exportFmtCurrency } from "@/lib/exportUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function TrialBalancePage() {
  const [startDate, setStartDate] = useState(
    format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  const { data, isLoading } = useTrialBalance(startDate, endDate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <PageHeader
        title="Trial Balance"
        description="Summary of all account balances"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Financial Reports", href: "/app/accounts/reports" },
          { label: "Trial Balance" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={() => {
              if (!data) return;
              exportToCSV(data.rows, `trial-balance-${startDate}-to-${endDate}`, [
                { key: "account_number", header: "Account #" },
                { key: "account_name", header: "Account Name" },
                { key: "account_type", header: "Type" },
                { key: "debit", header: "Debit", format: (v: number) => exportFmtCurrency(v) },
                { key: "credit", header: "Credit", format: (v: number) => exportFmtCurrency(v) },
              ]);
            }}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Date Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Status */}
        {data && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {data.isBalanced ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {data.isBalanced ? "Trial Balance is Balanced" : "Trial Balance is NOT Balanced"}
                  </span>
                </div>
                <Badge variant={data.isBalanced ? "default" : "destructive"}>
                  Difference: {formatCurrency(Math.abs(data.totalDebits - data.totalCredits))}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trial Balance Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No accounts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.rows.map((row) => (
                      <TableRow key={row.account_id}>
                        <TableCell className="font-mono">{row.account_number}</TableCell>
                        <TableCell>{row.account_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.account_type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {row.debit > 0 ? formatCurrency(row.debit) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.credit > 0 ? formatCurrency(row.credit) : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {data && (
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(data.totalDebits)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(data.totalCredits)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

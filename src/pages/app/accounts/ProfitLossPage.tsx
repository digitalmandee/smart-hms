import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Printer, Download, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useProfitLoss } from "@/hooks/useFinancialReports";
import { format } from "date-fns";

export default function ProfitLossPage() {
  const [startDate, setStartDate] = useState(
    format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  const { data, isLoading } = useProfitLoss(startDate, endDate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Profit & Loss Statement"
          breadcrumbs={[
            { label: "Accounts", href: "/app/accounts" },
            { label: "Financial Reports", href: "/app/accounts/reports" },
            { label: "Profit & Loss" },
          ]}
        />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profit & Loss Statement"
        description="Income statement showing revenue and expenses"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Financial Reports", href: "/app/accounts/reports" },
          { label: "Profit & Loss" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
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

        {/* P&L Statement */}
        <Card>
          <CardHeader>
            <CardTitle>Income Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Revenue
              </h3>
              <div className="space-y-2 pl-4">
                {data?.revenue.items.map((item) => (
                  <div key={item.account_id} className="flex justify-between py-1">
                    <span>{item.account_name}</span>
                    <span className="font-mono">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                {data?.revenue.items.length === 0 && (
                  <div className="text-muted-foreground">No revenue accounts</div>
                )}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Revenue</span>
                <span className="font-mono text-green-600">{formatCurrency(data?.revenue.total || 0)}</span>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Expenses
              </h3>
              <div className="space-y-2 pl-4">
                {data?.expenses.items.map((item) => (
                  <div key={item.account_id} className="flex justify-between py-1">
                    <span>{item.account_name}</span>
                    <span className="font-mono">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                {data?.expenses.items.length === 0 && (
                  <div className="text-muted-foreground">No expense accounts</div>
                )}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Expenses</span>
                <span className="font-mono text-red-600">{formatCurrency(data?.expenses.total || 0)}</span>
              </div>
            </div>

            {/* Net Income */}
            <Separator />
            <div className={`flex justify-between text-xl font-bold p-4 rounded-lg ${
              data?.isProfit ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              <span>Net {data?.isProfit ? "Income" : "Loss"}</span>
              <span className="font-mono">{formatCurrency(Math.abs(data?.netIncome || 0))}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

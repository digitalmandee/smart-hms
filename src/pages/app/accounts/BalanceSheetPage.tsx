import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useBalanceSheet } from "@/hooks/useFinancialReports";
import { CalendarIcon, Download, Printer, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { exportToCSV, formatCurrency as exportFmtCurrency } from "@/lib/exportUtils";

export default function BalanceSheetPage() {
  const navigate = useNavigate();
  const [asOfDate, setAsOfDate] = useState<Date>(new Date());
  const [hideZero, setHideZero] = useState(true);

  const { data: balanceSheet, isLoading } = useBalanceSheet(format(asOfDate, 'yyyy-MM-dd'));

  const filterZero = (arr: any[]) =>
    hideZero ? (arr || []).filter((a) => Math.abs(Number(a.balance) || 0) > 0.01) : (arr || []);


  const renderAccountGroup = (accounts: any[], title: string, isSubGroup = false) => {
    if (!accounts || accounts.length === 0) return null;
    
    const total = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    
    return (
      <div className={cn("space-y-2", isSubGroup && "ml-4")}>
        <h4 className={cn(
          "font-medium",
          isSubGroup ? "text-sm text-muted-foreground" : "text-base"
        )}>
          {title}
        </h4>
        <div className="space-y-1">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex justify-between py-1 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2"
              onClick={() => navigate(`/app/accounts/general-ledger?accountId=${account.id}`)}
            >
              <span className="text-muted-foreground hover:text-foreground">{account.name}</span>
              <span>{formatCurrency(account.balance || 0)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between py-1 font-medium border-t">
          <span>Total {title}</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    );
  };

  const assetsArray = filterZero(balanceSheet?.assets ? Object.values(balanceSheet.assets) : []);
  const liabilitiesArray = filterZero(balanceSheet?.liabilities ? Object.values(balanceSheet.liabilities) : []);
  const equityArray = filterZero(balanceSheet?.equity ? Object.values(balanceSheet.equity) : []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Balance Sheet"
        description="Financial position as of a specific date"
        actions={
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(asOfDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={asOfDate}
                  onSelect={(date) => date && setAsOfDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => {
              if (!balanceSheet) return;
              const rows = [
                ...(assetsArray as any[]).map((a: any) => ({ section: "Asset", name: a.name, balance: a.balance || 0 })),
                ...(liabilitiesArray as any[]).map((a: any) => ({ section: "Liability", name: a.name, balance: a.balance || 0 })),
                ...(equityArray as any[]).map((a: any) => ({ section: "Equity", name: a.name, balance: a.balance || 0 })),
              ];
              exportToCSV(rows, `balance-sheet-${format(asOfDate, "yyyy-MM-dd")}`, [
                { key: "section", header: "Section" },
                { key: "name", header: "Account" },
                { key: "balance", header: "Balance", format: (v: number) => exportFmtCurrency(v) },
              ]);
            }}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-40 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-40 w-full" /></CardContent>
          </Card>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Scale className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Balance Sheet</h2>
                </div>
                <p className="text-muted-foreground">
                  As of {format(asOfDate, "MMMM d, yyyy")}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderAccountGroup(assetsArray as any[], "Total Assets")}
                <div className="flex justify-between py-2 font-bold border-t-2 text-lg">
                  <span>Total Assets</span>
                  <span>{formatCurrency(balanceSheet?.totalAssets || 0)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liabilities & Equity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderAccountGroup(liabilitiesArray as any[], "Liabilities")}
                {renderAccountGroup(equityArray as any[], "Equity")}
                <div className="flex justify-between py-2 font-bold border-t-2 text-lg">
                  <span>Total Liabilities & Equity</span>
                  <span>{formatCurrency(balanceSheet?.totalLiabilitiesAndEquity || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className={cn(
            balanceSheet?.isBalanced ? "border-green-500/50" : "border-destructive/50"
          )}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Balance Check</p>
                  <p className="text-sm text-muted-foreground">Assets = Liabilities + Equity</p>
                </div>
                <div className={cn(
                  "text-lg font-bold",
                  balanceSheet?.isBalanced ? "text-green-600" : "text-destructive"
                )}>
                  {balanceSheet?.isBalanced ? "✓ Balanced" : "✗ Unbalanced"}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

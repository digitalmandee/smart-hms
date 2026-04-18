import { useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useCashFlow } from "@/hooks/useFinancialReports";
import { CalendarIcon, Download, Printer, ArrowUpRight, ArrowDownRight, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { exportToCSV, formatCurrency as exportFmtCurrency } from "@/lib/exportUtils";

export default function CashFlowPage() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  
  const { data: cashFlow, isLoading } = useCashFlow(
    format(startDate, 'yyyy-MM-dd'),
    format(endDate, 'yyyy-MM-dd')
  );


  const renderCashFlowSection = (
    title: string,
    items: Array<{ name: string; amount: number }>,
    total: number,
    icon: React.ReactNode
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">{item.name}</span>
            <span className={cn(
              item.amount >= 0 ? "text-green-600" : "text-destructive"
            )}>
              {item.amount >= 0 ? "+" : ""}{formatCurrency(item.amount)}
            </span>
          </div>
        ))}
        <div className="flex justify-between py-2 font-medium border-t">
          <span>Net Cash from {title}</span>
          <span className={cn(
            total >= 0 ? "text-green-600" : "text-destructive"
          )}>
            {total >= 0 ? "+" : ""}{formatCurrency(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const operatingItems = cashFlow?.operating?.map(item => ({ name: item.description, amount: item.amount })) || [];
  const investingItems = cashFlow?.investing?.map(item => ({ name: item.description, amount: item.amount })) || [];
  const financingItems = cashFlow?.financing?.map(item => ({ name: item.description, amount: item.amount })) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cash Flow Statement"
        description="Track cash inflows and outflows"
        actions={
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(startDate, "MMM d")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(endDate, "MMM d")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => {
              const allItems = [...operatingItems.map(i => ({ ...i, section: "Operating" })), ...investingItems.map(i => ({ ...i, section: "Investing" })), ...financingItems.map(i => ({ ...i, section: "Financing" }))];
              exportToCSV(allItems, `cash-flow-${format(startDate, "yyyy-MM-dd")}`, [
                { key: "section", header: "Section" },
                { key: "name", header: "Description" },
                { key: "amount", header: "Amount", format: (v: number) => exportFmtCurrency(v) },
              ]);
            }}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
              <CardContent><Skeleton className="h-32 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {renderCashFlowSection("Operating Activities", operatingItems, cashFlow?.operatingTotal || 0, <Banknote className="h-5 w-5" />)}
            {renderCashFlowSection("Investing Activities", investingItems, cashFlow?.investingTotal || 0, <ArrowDownRight className="h-5 w-5" />)}
            {renderCashFlowSection("Financing Activities", financingItems, cashFlow?.financingTotal || 0, <ArrowUpRight className="h-5 w-5" />)}
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Opening Cash & Bank Balance</span>
                <span className="font-mono">{formatCurrency(cashFlow?.openingCash || 0)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <div>
                  <p className="font-medium text-lg">Net Cash Movement</p>
                  <p className="text-sm text-muted-foreground">
                    For period {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                  </p>
                </div>
                <div className={cn(
                  "text-2xl font-bold",
                  (cashFlow?.netCashFlow || 0) >= 0 ? "text-green-600" : "text-destructive"
                )}>
                  {(cashFlow?.netCashFlow || 0) >= 0 ? "+" : ""}
                  {formatCurrency(cashFlow?.netCashFlow || 0)}
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
                <span>Closing Cash & Bank Balance</span>
                <span className="font-mono">{formatCurrency(cashFlow?.closingCash || 0)}</span>
              </div>
              <p className="text-xs text-muted-foreground italic pt-2 border-t">
                Direct method, sourced from posted General Ledger movements on cash and bank accounts.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

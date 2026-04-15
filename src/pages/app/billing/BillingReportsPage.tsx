import { useState } from "react";
import { format, subDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDailyCollections, useRevenueByCategory, usePaymentMethodDistribution, useOutstandingReceivables, useTopServices, useAgingReport } from "@/hooks/useBilling";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { CalendarIcon, DollarSign, Clock, AlertTriangle, TrendingUp, Loader2, FileText, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "@/lib/i18n";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--muted))"];
const AGING_COLORS = ["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export default function BillingReportsPage() {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrencyFormatter();
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const dateFrom = format(dateRange.from, "yyyy-MM-dd");
  const dateTo = format(dateRange.to, "yyyy-MM-dd");

  const { data: dailyData, isLoading: dailyLoading } = useDailyCollections(dateFrom, dateTo);
  const { data: categoryData, isLoading: categoryLoading } = useRevenueByCategory(dateFrom, dateTo);
  const { data: paymentData, isLoading: paymentLoading } = usePaymentMethodDistribution(dateFrom, dateTo);
  const { data: outstandingData, isLoading: outstandingLoading } = useOutstandingReceivables();
  const { data: topServices, isLoading: topLoading } = useTopServices(dateFrom, dateTo);
  const { data: agingData, isLoading: agingLoading } = useAgingReport();

  const totalRevenue = dailyData?.reduce((sum, d) => sum + d.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("billing.reports" as any, "Billing Reports")}
        description={t("billing.reportsDescription" as any, "Revenue analytics and financial insights")}
        actions={
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("billing.totalRevenue" as any, "Total Revenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("billing.outstanding" as any, "Outstanding")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {outstandingLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(outstandingData?.total || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {outstandingData?.count || 0} {t("billing.pendingInvoicesCount" as any, "pending invoices")}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("billing.collectionRate" as any, "Collection Rate")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outstandingData?.collectionRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t("billing.ofTotalBilled" as any, "Of total billed amount")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("billing.avgDaily" as any, "Avg Daily")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dailyData?.length ? Math.round(totalRevenue / dailyData.length) : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("billing.avgCollectionPerDay" as any, "Average collection per day")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Collections */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t("billing.dailyCollections" as any, "Daily Collections")}</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChartContainer config={{ amount: { label: "Amount", color: "hsl(var(--primary))" } }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), "MMM d")} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle>{t("billing.revenueByCategory" as any, "Revenue by Category")}</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <div className="flex h-[250px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : categoryData?.length ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                      onClick={(_, idx) => {
                        const cat = categoryData?.[idx]?.category;
                        if (cat) navigate(`/app/accounts/department-revenue?department=${cat}`);
                      }}
                      className="cursor-pointer"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                {t("common.noData" as any, "No data available")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>{t("billing.paymentMethods" as any, "Payment Methods")}</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentLoading ? (
              <div className="flex h-[250px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : paymentData?.length ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      dataKey="amount"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ method, percent }) => `${method} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {paymentData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                {t("common.noData" as any, "No data available")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Aging Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Accounts Receivable {t("billing.aging" as any, "Aging")}
          </CardTitle>
          <CardDescription>
            {t("billing.agingDescription" as any, "Outstanding invoices grouped by age")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : agingData ? (
            <div className="space-y-6">
              {/* Summary Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex h-4 overflow-hidden rounded-full">
                    {agingData.buckets.map((bucket, index) => {
                      const percentage = agingData.totalOutstanding > 0 
                        ? (bucket.amount / agingData.totalOutstanding) * 100 
                        : 0;
                      return (
                        <div
                          key={bucket.label}
                          className="transition-all"
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: AGING_COLORS[index],
                            minWidth: bucket.amount > 0 ? "4px" : "0"
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{t("billing.totalOutstanding" as any, "Total Outstanding")}</p>
                  <p className="text-lg font-bold text-destructive">
                    {formatCurrency(agingData.totalOutstanding)}
                  </p>
                </div>
              </div>

              {/* Aging Buckets */}
              <div className="grid gap-4 md:grid-cols-3">
                {agingData.buckets.map((bucket, index) => (
                  <Card key={bucket.label} className="border-l-4" style={{ borderLeftColor: AGING_COLORS[index] }}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{bucket.label}</CardTitle>
                        <Badge variant={index === 0 ? "outline" : index === 1 ? "secondary" : "destructive"}>
                          {bucket.range}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" style={{ color: AGING_COLORS[index] }}>
                        {formatCurrency(bucket.amount)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bucket.count} invoice{bucket.count !== 1 ? "s" : ""}
                      </p>
                      
                      {bucket.invoices.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto">
                          {bucket.invoices.slice(0, 5).map((inv) => (
                            <div 
                              key={inv.id} 
                              className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                              onClick={() => navigate(`/app/billing/invoices/${inv.id}`)}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{inv.patient_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {inv.invoice_number} • {inv.days_overdue} days
                                </p>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <span className="font-medium">{formatCurrency(inv.balance)}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          ))}
                          {bucket.invoices.length > 5 && (
                            <p className="text-xs text-center text-muted-foreground pt-2">
                              +{bucket.invoices.length - 5} more invoices
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              {t("billing.noOutstanding" as any, "No outstanding invoices")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle>{t("billing.topServices" as any, "Top Services by Revenue")}</CardTitle>
        </CardHeader>
        <CardContent>
          {topLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : topServices?.length ? (
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                      index === 0 ? "bg-yellow-100 text-yellow-800" :
                      index === 1 ? "bg-gray-100 text-gray-800" :
                      index === 2 ? "bg-amber-100 text-amber-800" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.count} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(service.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              {t("common.noData" as any, "No services data available")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

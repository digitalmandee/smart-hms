import { useState } from "react";
import { format, subDays } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useDailyCollections, useRevenueByCategory, usePaymentMethodDistribution, useOutstandingReceivables, useTopServices } from "@/hooks/useBilling";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { CalendarIcon, DollarSign, Clock, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--muted))"];

export default function BillingReportsPage() {
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

  const totalRevenue = dailyData?.reduce((sum, d) => sum + d.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Reports"
        description="Revenue analytics and financial insights"
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs. {totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {outstandingLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">
                  Rs. {(outstandingData?.total || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {outstandingData?.count || 0} pending invoices
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outstandingData?.collectionRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of total billed amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Daily</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs. {dailyData?.length ? Math.round(totalRevenue / dailyData.length).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Average collection per day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Collections */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Daily Collections</CardTitle>
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
            <CardTitle>Revenue by Category</CardTitle>
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
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
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
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle>Top Services by Revenue</CardTitle>
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
                    <p className="font-medium">Rs. {service.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No services data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

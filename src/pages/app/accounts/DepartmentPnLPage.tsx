import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign,
  Download, FileText, Pill, Building2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useDepartmentPnL, type DepartmentPnLRow } from "@/hooks/useDepartmentPnL";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(142, 76%, 36%)",
  "hsl(217, 91%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(280, 65%, 60%)",
  "hsl(180, 60%, 45%)",
  "hsl(330, 70%, 55%)",
];

function getDatePreset(preset: string): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (preset) {
    case "this_month":
      return {
        start: new Date(y, m, 1).toISOString().slice(0, 10),
        end: now.toISOString().slice(0, 10),
      };
    case "last_month":
      return {
        start: new Date(y, m - 1, 1).toISOString().slice(0, 10),
        end: new Date(y, m, 0).toISOString().slice(0, 10),
      };
    case "this_quarter": {
      const qStart = new Date(y, Math.floor(m / 3) * 3, 1);
      return { start: qStart.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) };
    }
    case "ytd":
      return {
        start: new Date(y, 0, 1).toISOString().slice(0, 10),
        end: now.toISOString().slice(0, 10),
      };
    case "last_year":
      return {
        start: new Date(y - 1, 0, 1).toISOString().slice(0, 10),
        end: new Date(y - 1, 11, 31).toISOString().slice(0, 10),
      };
    default:
      return {
        start: new Date(y, m, 1).toISOString().slice(0, 10),
        end: now.toISOString().slice(0, 10),
      };
  }
}

export default function DepartmentPnLPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const { profile } = useAuth();

  const [preset, setPreset] = useState("this_month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [branchId, setBranchId] = useState<string>("");
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  const dates = useMemo(() => {
    if (preset === "custom" && customStart && customEnd) {
      return { start: customStart, end: customEnd };
    }
    return getDatePreset(preset);
  }, [preset, customStart, customEnd]);

  const { data, isLoading } = useDepartmentPnL(
    dates.start,
    dates.end,
    branchId || undefined
  );

  // Fetch branches for filter
  const { data: branches } = useQuery({
    queryKey: ["branches-filter", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("branches")
        .select("id, name")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true);
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const chartData = useMemo(() => {
    if (!data?.departments) return [];
    return data.departments.map((d) => ({
      name: d.department,
      [t("dept_pnl.revenue")]: d.revenue,
      [t("dept_pnl.expenses")]: d.cogs + d.expenses,
      [t("dept_pnl.net_profit")]: d.netProfit,
    }));
  }, [data, t]);

  const pieData = useMemo(() => {
    if (!data?.departments) return [];
    return data.departments
      .filter((d) => d.revenue > 0)
      .map((d) => ({ name: d.department, value: d.revenue }));
  }, [data]);

  const handleExportCSV = () => {
    if (!data?.departments) return;
    const headers = ["Department", "Revenue", "COGS", "Gross Profit", "Expenses", "Net Profit", "Margin %"];
    const rows = data.departments.map((d) =>
      [d.department, d.revenue, d.cogs, d.grossProfit, d.expenses, d.netProfit, d.marginPercent.toFixed(1)].join(",")
    );
    const totalRow = ["TOTAL", data.totals.revenue, data.totals.cogs, data.totals.grossProfit, data.totals.expenses, data.totals.netProfit, ""].join(",");
    const csv = [headers.join(","), ...rows, totalRow].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `department-pnl-${dates.start}-to-${dates.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dept_pnl.title")}
        subtitle={t("dept_pnl.subtitle")}
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                {t("dept_pnl.period")}
              </label>
              <Select value={preset} onValueChange={setPreset}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_month">{t("dept_pnl.this_month")}</SelectItem>
                  <SelectItem value="last_month">{t("dept_pnl.last_month")}</SelectItem>
                  <SelectItem value="this_quarter">{t("dept_pnl.this_quarter")}</SelectItem>
                  <SelectItem value="ytd">{t("dept_pnl.ytd")}</SelectItem>
                  <SelectItem value="last_year">{t("dept_pnl.last_year")}</SelectItem>
                  <SelectItem value="custom">{t("dept_pnl.custom_range")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {preset === "custom" && (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">{t("common.date")} From</label>
                  <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-[160px]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">{t("common.date")} To</label>
                  <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-[160px]" />
                </div>
              </>
            )}

            {branches && branches.length > 1 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  {t("dept_pnl.branch")}
                </label>
                <Select value={branchId} onValueChange={setBranchId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t("common.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("common.all")}</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!data}>
              <Download className="h-4 w-4 mr-1" /> {t("common.export")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16" /></CardContent></Card>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard
            title={t("dept_pnl.total_revenue")}
            value={formatCurrency(data.totals.revenue)}
            icon={<DollarSign className="h-5 w-5" />}
            className="border-l-4 border-l-green-500"
          />
          <SummaryCard
            title={t("dept_pnl.total_cogs")}
            value={formatCurrency(data.totals.cogs)}
            icon={<BarChart3 className="h-5 w-5" />}
            className="border-l-4 border-l-orange-500"
          />
          <SummaryCard
            title={t("dept_pnl.total_expenses")}
            value={formatCurrency(data.totals.expenses)}
            icon={<TrendingDown className="h-5 w-5" />}
            className="border-l-4 border-l-red-500"
          />
          <SummaryCard
            title={t("dept_pnl.net_income")}
            value={formatCurrency(data.totals.netProfit)}
            icon={<TrendingUp className="h-5 w-5" />}
            positive={data.totals.netProfit >= 0}
            className={cn(
              "border-l-4",
              data.totals.netProfit >= 0 ? "border-l-emerald-500" : "border-l-red-500"
            )}
          />
        </div>
      ) : null}

      {/* Tabs: Table / Charts / Pharmacy */}
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">
            <Building2 className="h-4 w-4 mr-1" /> {t("dept_pnl.by_department")}
          </TabsTrigger>
          <TabsTrigger value="charts">
            <BarChart3 className="h-4 w-4 mr-1" /> {t("dept_pnl.charts")}
          </TabsTrigger>
          <TabsTrigger value="pharmacy">
            <Pill className="h-4 w-4 mr-1" /> {t("dept_pnl.pharmacy_profit")}
          </TabsTrigger>
        </TabsList>

        {/* Department Table */}
        <TabsContent value="table">
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <div className="rounded-md border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("dept_pnl.department")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.revenue")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.cogs")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.gross_profit")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.expenses")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.net_profit")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.margin")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.departments.map((dept) => (
                        <TableRow
                          key={dept.department}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            setExpandedDept(expandedDept === dept.department ? null : dept.department)
                          }
                        >
                          <TableCell className="font-medium">{dept.department}</TableCell>
                          <TableCell className="text-right">{formatCurrency(dept.revenue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(dept.cogs)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(dept.grossProfit)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(dept.expenses)}</TableCell>
                          <TableCell className={cn("text-right font-semibold", dept.netProfit >= 0 ? "text-green-600" : "text-red-600")}>
                            {formatCurrency(dept.netProfit)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={dept.marginPercent >= 0 ? "default" : "destructive"}>
                              {dept.marginPercent.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Totals */}
                      {data && (
                        <TableRow className="bg-muted/50 font-bold border-t-2">
                          <TableCell>{t("dept_pnl.total")}</TableCell>
                          <TableCell className="text-right">{formatCurrency(data.totals.revenue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(data.totals.cogs)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(data.totals.grossProfit)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(data.totals.expenses)}</TableCell>
                          <TableCell className={cn("text-right", data.totals.netProfit >= 0 ? "text-green-600" : "text-red-600")}>
                            {formatCurrency(data.totals.netProfit)}
                          </TableCell>
                          <TableCell className="text-right">
                            {data.totals.revenue > 0
                              ? ((data.totals.netProfit / data.totals.revenue) * 100).toFixed(1) + "%"
                              : "—"}
                          </TableCell>
                        </TableRow>
                      )}
                      {(!data || data.departments.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                            {t("dept_pnl.no_data")}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts */}
        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("dept_pnl.revenue_vs_expenses")}</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey={t("dept_pnl.revenue")} fill="hsl(142, 76%, 36%)" />
                      <Bar dataKey={t("dept_pnl.expenses")} fill="hsl(0, 84%, 60%)" />
                      <Bar dataKey={t("dept_pnl.net_profit")} fill="hsl(217, 91%, 60%)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    {t("dept_pnl.no_data")}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("dept_pnl.revenue_share")}</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    {t("dept_pnl.no_data")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pharmacy Profit */}
        <TabsContent value="pharmacy">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="h-5 w-5" /> {t("dept_pnl.pharmacy_medicine_profit")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64" />
              ) : data?.pharmacyMedicines && data.pharmacyMedicines.length > 0 ? (
                <div className="rounded-md border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>{t("dept_pnl.medicine_name")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.qty_sold")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.cost_price")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.selling_price")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.total_revenue")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.total_cost")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.profit")}</TableHead>
                        <TableHead className="text-right">{t("dept_pnl.margin")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.pharmacyMedicines.map((med, idx) => (
                        <TableRow key={med.medicine_name}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">{med.medicine_name}</TableCell>
                          <TableCell className="text-right">{med.quantity_sold}</TableCell>
                          <TableCell className="text-right">{formatCurrency(med.cost_price)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(med.selling_price)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(med.total_revenue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(med.total_cost)}</TableCell>
                          <TableCell className={cn("text-right font-semibold", med.profit >= 0 ? "text-green-600" : "text-red-600")}>
                            {formatCurrency(med.profit)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={med.margin_percent >= 0 ? "default" : "destructive"}>
                              {med.margin_percent.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  {t("dept_pnl.no_pharmacy_data")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  positive,
  className,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  positive?: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold mt-1", positive === false ? "text-red-600" : "")}>
              {value}
            </p>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

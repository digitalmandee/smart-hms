import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { DollarSign, Users, Building2, TrendingUp } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const GOSI_EMPLOYER_RATE = 0.12; // 12% employer contribution
const GOSI_EMPLOYEE_RATE = 0.10; // 10% employee contribution (Saudi)
const ESB_MONTHLY_RATE = 15 / 365; // ~15 days salary per year of service for first 5 yrs

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

export default function PayrollCostAllocationPage() {
  const { profile } = useAuth();
  const { formatCurrency } = useCurrencyFormatter();
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "yyyy-MM"));

  const months = useMemo(() => {
    const list = [];
    for (let i = 0; i < 12; i++) {
      const d = subMonths(new Date(), i);
      list.push({ value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") });
    }
    return list;
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["payroll-cost-allocation", profile?.organization_id, selectedMonth],
    queryFn: async () => {
      const monthStart = startOfMonth(new Date(selectedMonth + "-01"));
      const monthEnd = endOfMonth(monthStart);

      // Get payroll entries for the month
      const { data: payrollEntries, error: peErr } = await supabase
        .from("payroll_entries")
        .select(`
          id, basic_salary, gross_salary, total_deductions, net_salary,
          allowances, deductions,
          employee:employees(
            id, first_name, last_name, employee_number,
            department:departments(id, name)
          )
        `)
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString());

      if (peErr) throw peErr;

      const entries = (payrollEntries || []) as any[];

      // Aggregate by department
      const deptMap = new Map<string, {
        dept_name: string;
        headcount: number;
        basic_total: number;
        gross_total: number;
        deductions_total: number;
        net_total: number;
        gosi_employer: number;
        gosi_employee: number;
        esb_provision: number;
        total_cost: number;
      }>();

      entries.forEach((entry: any) => {
        const deptName = entry.employee?.department?.name || "Unassigned";
        const deptId = entry.employee?.department?.id || "unassigned";
        const existing = deptMap.get(deptId) || {
          dept_name: deptName,
          headcount: 0,
          basic_total: 0,
          gross_total: 0,
          deductions_total: 0,
          net_total: 0,
          gosi_employer: 0,
          gosi_employee: 0,
          esb_provision: 0,
          total_cost: 0,
        };

        const basic = Number(entry.basic_salary) || 0;
        const gross = Number(entry.gross_salary) || 0;
        const deductions = Number(entry.total_deductions) || 0;
        const net = Number(entry.net_salary) || 0;

        existing.headcount++;
        existing.basic_total += basic;
        existing.gross_total += gross;
        existing.deductions_total += deductions;
        existing.net_total += net;
        existing.gosi_employer += basic * GOSI_EMPLOYER_RATE;
        existing.gosi_employee += basic * GOSI_EMPLOYEE_RATE;
        existing.esb_provision += (basic / 30) * ESB_MONTHLY_RATE * 30; // Monthly ESB accrual
        existing.total_cost = existing.gross_total + existing.gosi_employer + existing.esb_provision;

        deptMap.set(deptId, existing);
      });

      const departments = Array.from(deptMap.values()).sort((a, b) => b.total_cost - a.total_cost);

      const totals = departments.reduce((acc, d) => ({
        headcount: acc.headcount + d.headcount,
        basic_total: acc.basic_total + d.basic_total,
        gross_total: acc.gross_total + d.gross_total,
        deductions_total: acc.deductions_total + d.deductions_total,
        net_total: acc.net_total + d.net_total,
        gosi_employer: acc.gosi_employer + d.gosi_employer,
        gosi_employee: acc.gosi_employee + d.gosi_employee,
        esb_provision: acc.esb_provision + d.esb_provision,
        total_cost: acc.total_cost + d.total_cost,
      }), {
        headcount: 0, basic_total: 0, gross_total: 0, deductions_total: 0,
        net_total: 0, gosi_employer: 0, gosi_employee: 0, esb_provision: 0, total_cost: 0,
      });

      return { departments, totals, entryCount: entries.length };
    },
    enabled: !!profile?.organization_id,
  });

  const pieData = useMemo(() => {
    if (!data?.departments) return [];
    return data.departments.map(d => ({
      name: d.dept_name,
      value: Math.round(d.total_cost),
    }));
  }, [data]);

  const barData = useMemo(() => {
    if (!data?.departments) return [];
    return data.departments.map(d => ({
      name: d.dept_name.length > 12 ? d.dept_name.substring(0, 12) + "…" : d.dept_name,
      "Gross Salary": Math.round(d.gross_total),
      "GOSI (Employer)": Math.round(d.gosi_employer),
      "ESB Provision": Math.round(d.esb_provision),
    }));
  }, [data]);

  return (
    <div>
      <PageHeader
        title="Payroll Cost Allocation"
        description="Department-wise salary breakdown with GOSI & ESB provisions"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Reports", href: "/app/accounts/reports" },
          { label: "Payroll Cost Allocation" },
        ]}
        actions={
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {isLoading ? (
            [1,2,3,4].map(i => <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16" /></CardContent></Card>)
          ) : (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Headcount</p>
                      <p className="text-2xl font-bold">{data?.totals.headcount || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Gross Salary</p>
                      <p className="text-2xl font-bold">{formatCurrency(data?.totals.gross_total || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">GOSI (Employer)</p>
                      <p className="text-2xl font-bold">{formatCurrency(data?.totals.gosi_employer || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-amber-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost to Company</p>
                      <p className="text-2xl font-bold">{formatCurrency(data?.totals.total_cost || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Cost by Department</CardTitle></CardHeader>
            <CardContent>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="Gross Salary" fill="#3b82f6" stackId="a" />
                    <Bar dataKey="GOSI (Employer)" fill="#10b981" stackId="a" />
                    <Bar dataKey="ESB Provision" fill="#f59e0b" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No payroll data for this period</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Cost Distribution</CardTitle></CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Breakdown</CardTitle>
            <CardDescription>Includes GOSI employer contribution (12%) and ESB monthly provision</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-center">Staff</TableHead>
                      <TableHead className="text-right">Basic Salary</TableHead>
                      <TableHead className="text-right">Gross Salary</TableHead>
                      <TableHead className="text-right">GOSI (Employer)</TableHead>
                      <TableHead className="text-right">GOSI (Employee)</TableHead>
                      <TableHead className="text-right">ESB Provision</TableHead>
                      <TableHead className="text-right">Total Deductions</TableHead>
                      <TableHead className="text-right">Net Pay</TableHead>
                      <TableHead className="text-right font-bold">Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.departments.map((dept, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{dept.dept_name}</TableCell>
                        <TableCell className="text-center">{dept.headcount}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dept.basic_total)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dept.gross_total)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dept.gosi_employer)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dept.gosi_employee)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dept.esb_provision)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dept.deductions_total)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dept.net_total)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(dept.total_cost)}</TableCell>
                      </TableRow>
                    ))}
                    {data?.departments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                          No payroll entries found for this period
                        </TableCell>
                      </TableRow>
                    )}
                    {data && data.departments.length > 0 && (
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-center">{data.totals.headcount}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.totals.basic_total)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.totals.gross_total)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.totals.gosi_employer)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.totals.gosi_employee)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.totals.esb_provision)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.totals.deductions_total)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.totals.net_total)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.totals.total_cost)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

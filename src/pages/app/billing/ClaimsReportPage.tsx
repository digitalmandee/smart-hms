import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Shield, 
  Clock, 
  TrendingUp, 
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Building2,
} from "lucide-react";
import { useClaimsStats } from "@/hooks/useClaimsReports";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  approved: "#22c55e",
  rejected: "#ef4444",
  pending: "#f59e0b",
  submitted: "#3b82f6",
  partially_approved: "#8b5cf6",
  draft: "#6b7280",
};

const ClaimsReportPage = () => {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const { data: claimsStats, isLoading: statsLoading } = useClaimsStats(dateRange.start, dateRange.end);

  // Export columns
  const companyColumns = [
    { key: "company_name", header: "Insurance Company" },
    { key: "total_claims", header: "Total Claims" },
    { key: "approved", header: "Approved" },
    { key: "rejected", header: "Rejected" },
    { key: "total_claimed", header: "Amount Claimed", format: (v: number) => formatCurrency(v) },
    { key: "total_approved", header: "Amount Approved", format: (v: number) => formatCurrency(v) },
    { key: "approval_rate", header: "Approval Rate", format: (v: number) => `${v}%` },
  ];

  const agingColumns = [
    { key: "days_range", header: "Age Bucket" },
    { key: "count", header: "Claims" },
    { key: "amount", header: "Amount", format: (v: number) => formatCurrency(v) },
  ];

  const summary = claimsStats?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insurance Claims Report"
        description="Claims analytics, aging analysis, and insurance company performance"
        actions={
          <ReportExportButton
            data={claimsStats?.byCompany || []}
            filename={`claims-report-${dateRange.start}-to-${dateRange.end}`}
            columns={companyColumns}
            title="Insurance Claims Report"
            pdfOptions={{
              title: "Insurance Claims Analysis",
              subtitle: "Company-wise Performance Report",
              dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) },
            }}
          />
        }
      />

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Claims</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.totalClaims || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.approvedClaims || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.rejectedClaims || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.pendingClaims || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${summary?.approvalRate || 0}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${summary?.avgProcessingDays || 0} days`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Claimed</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : formatCurrency(summary?.totalClaimedAmount || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Approved</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : formatCurrency(summary?.totalApprovedAmount || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Recovery Rate</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${summary?.recoveryRate || 0}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Status Breakdown</TabsTrigger>
          <TabsTrigger value="company">By Insurance Company</TabsTrigger>
          <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
          <TabsTrigger value="rejections">Rejection Reasons</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Status Breakdown Tab */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Claims Status Breakdown</CardTitle>
              <CardDescription>Distribution of claims by status</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (claimsStats?.byStatus?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No claims data for the selected period
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={claimsStats?.byStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, percentage }) => `${status}: ${percentage}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {claimsStats?.byStatus?.map((entry) => (
                            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#6b7280"} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimsStats?.byStatus?.map((item) => (
                        <TableRow key={item.status}>
                          <TableCell className="font-medium capitalize">
                            <Badge 
                              variant="outline" 
                              style={{ 
                                backgroundColor: `${STATUS_COLORS[item.status] || "#6b7280"}20`,
                                borderColor: STATUS_COLORS[item.status] || "#6b7280",
                                color: STATUS_COLORS[item.status] || "#6b7280",
                              }}
                            >
                              {item.status.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                          <TableCell className="text-right">{item.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Insurance Company Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Insurance Company Performance</CardTitle>
                <CardDescription>Claims analysis by insurance provider</CardDescription>
              </div>
              <ReportExportButton
                data={claimsStats?.byCompany || []}
                filename={`insurance-company-report-${dateRange.start}`}
                columns={companyColumns}
                title="Insurance Company Report"
                pdfOptions={{
                  title: "Insurance Company Performance",
                  dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) },
                }}
              />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (claimsStats?.byCompany?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No insurance company data available
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={claimsStats?.byCompany?.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="company_name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="approved" stackId="a" fill="#22c55e" name="Approved" />
                        <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
                        <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Insurance Company</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Approved</TableHead>
                        <TableHead className="text-right">Rejected</TableHead>
                        <TableHead className="text-right">Claimed</TableHead>
                        <TableHead className="text-right">Approved Amt</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimsStats?.byCompany?.map((company) => (
                        <TableRow key={company.company_id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {company.company_name}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{company.total_claims}</TableCell>
                          <TableCell className="text-right text-green-600">{company.approved}</TableCell>
                          <TableCell className="text-right text-red-600">{company.rejected}</TableCell>
                          <TableCell className="text-right">{formatCurrency(company.total_claimed)}</TableCell>
                          <TableCell className="text-right text-green-600">{formatCurrency(company.total_approved)}</TableCell>
                          <TableCell className="text-right font-semibold">{company.approval_rate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aging Analysis Tab */}
        <TabsContent value="aging">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Claims Aging Analysis</CardTitle>
                <CardDescription>Outstanding claims by age bucket</CardDescription>
              </div>
              <ReportExportButton
                data={claimsStats?.agingBuckets || []}
                filename={`claims-aging-${dateRange.start}`}
                columns={agingColumns}
                title="Claims Aging"
                pdfOptions={{
                  title: "Claims Aging Report",
                  subtitle: "Outstanding claims by age",
                }}
              />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={claimsStats?.agingBuckets}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="days_range" />
                        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                        <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Claims Count" />
                        <Bar yAxisId="right" dataKey="amount" fill="#22c55e" name="Amount" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age Bucket</TableHead>
                        <TableHead className="text-right">Claims</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimsStats?.agingBuckets?.map((bucket) => (
                        <TableRow key={bucket.bucket}>
                          <TableCell className="font-medium">{bucket.days_range}</TableCell>
                          <TableCell className="text-right">{bucket.count}</TableCell>
                          <TableCell className="text-right">{formatCurrency(bucket.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejection Reasons Tab */}
        <TabsContent value="rejections">
          <Card>
            <CardHeader>
              <CardTitle>Rejection Reasons Analysis</CardTitle>
              <CardDescription>Common reasons for claim rejections</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (claimsStats?.rejectionReasons?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No rejection data available
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={claimsStats?.rejectionReasons} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="reason" type="category" width={200} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ef4444" name="Rejections" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rejection Reason</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Amount Lost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claimsStats?.rejectionReasons?.map((reason) => (
                        <TableRow key={reason.reason}>
                          <TableCell className="font-medium">{reason.reason}</TableCell>
                          <TableCell className="text-right">{reason.count}</TableCell>
                          <TableCell className="text-right text-red-600">{formatCurrency(reason.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Claims Trends</CardTitle>
              <CardDescription>Daily claims activity</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (claimsStats?.dailyTrend?.length || 0) === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No trend data available
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={claimsStats?.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), "MMM dd")} />
                      <YAxis />
                      <Tooltip labelFormatter={(v) => format(new Date(v), "MMM dd, yyyy")} />
                      <Legend />
                      <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2} name="Submitted" />
                      <Line type="monotone" dataKey="approved" stroke="#22c55e" strokeWidth={2} name="Approved" />
                      <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClaimsReportPage;

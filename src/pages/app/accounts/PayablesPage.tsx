import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, RefreshCw, Building2, Clock, CreditCard, Receipt } from "lucide-react";
import { exportToCSV, formatCurrency as exportFmtCurrency, formatDate } from "@/lib/exportUtils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { formatCurrencyFull as formatCurrency } from "@/lib/currency";

export default function PayablesPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [agingFilter, setAgingFilter] = useState<string>("all");

  // Fetch posted GRNs with vendor and payment info
  const { data: payables, isLoading, refetch } = useQuery({
    queryKey: ["payables-grn", profile?.organization_id],
    queryFn: async () => {
      // Fetch posted + verified GRNs
      const { data: grns, error: grnError } = await supabase
        .from("goods_received_notes")
        .select(`
          id,
          grn_number,
          vendor_id,
          received_date,
          invoice_amount,
          status,
          vendor:vendors(id, name, contact_person, phone),
          purchase_order:purchase_orders(po_number)
        `)
        .in("status", ["posted", "verified"])
        .order("received_date", { ascending: false });
      
      if (grnError) throw grnError;

      // Fetch all vendor payments to calculate outstanding
      const { data: payments, error: payError } = await supabase
        .from("vendor_payments")
        .select("grn_id, amount")
        .eq("status", "paid");
      
      if (payError) throw payError;

      // Calculate payments per GRN
      const paymentsByGrn = (payments || []).reduce((acc, p) => {
        if (p.grn_id) {
          acc[p.grn_id] = (acc[p.grn_id] || 0) + (p.amount || 0);
        }
        return acc;
      }, {} as Record<string, number>);

      // Add outstanding calculation to each GRN
      return (grns || []).map(grn => ({
        ...grn,
        paid_amount: paymentsByGrn[grn.id] || 0,
        outstanding_amount: (grn.invoice_amount || 0) - (paymentsByGrn[grn.id] || 0),
        payment_status: paymentsByGrn[grn.id] >= (grn.invoice_amount || 0) 
          ? "paid" 
          : paymentsByGrn[grn.id] > 0 
            ? "partial" 
            : "unpaid"
      }));
    },
    enabled: !!profile?.organization_id,
  });

  const calculateAging = (createdAt: string) => {
    const created = new Date(createdAt);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) return { label: "Current", color: "bg-green-100 text-green-800" };
    if (diffDays <= 60) return { label: "31-60 Days", color: "bg-yellow-100 text-yellow-800" };
    if (diffDays <= 90) return { label: "61-90 Days", color: "bg-orange-100 text-orange-800" };
    return { label: "90+ Days", color: "bg-red-100 text-red-800" };
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      unpaid: "bg-red-100 text-red-800",
      partial: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredPayables = payables?.filter((grn) => {
    const vendorName = grn.vendor?.name?.toLowerCase() || "";
    const grnNumber = grn.grn_number?.toLowerCase() || "";
    const poNumber = grn.purchase_order?.po_number?.toLowerCase() || "";
    const matchesSearch =
      !search ||
      vendorName.includes(search.toLowerCase()) ||
      grnNumber.includes(search.toLowerCase()) ||
      poNumber.includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || grn.payment_status === statusFilter;
    
    if (agingFilter === "all") return matchesSearch && matchesStatus;
    
    const aging = calculateAging(grn.received_date || new Date().toISOString());
    return matchesSearch && matchesStatus && aging.label.toLowerCase().includes(agingFilter.toLowerCase());
  }) || [];

  // Summary calculations - based on outstanding amounts
  const totalOutstanding = filteredPayables.reduce((sum, grn) => sum + (grn.outstanding_amount || 0), 0);
  const unpaidAmount = filteredPayables
    .filter((grn) => grn.payment_status === "unpaid")
    .reduce((sum, grn) => sum + (grn.outstanding_amount || 0), 0);
  const partialAmount = filteredPayables
    .filter((grn) => grn.payment_status === "partial")
    .reduce((sum, grn) => sum + (grn.outstanding_amount || 0), 0);
  const vendorCount = new Set(filteredPayables.map((grn) => grn.vendor_id)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts Payable"
        description="Manage outstanding vendor payables and purchase orders"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Accounts Payable" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              exportToCSV(filteredPayables.map((grn: any) => ({
                grn_number: grn.grn_number,
                po_number: grn.purchase_order?.po_number || "-",
                vendor: grn.vendor?.name || "-",
                date: grn.received_date,
                invoice_amount: grn.invoice_amount || 0,
                paid: grn.paid_amount || 0,
                outstanding: grn.outstanding_amount || 0,
                status: grn.payment_status,
              })), "payables", [
                { key: "grn_number", header: "GRN #" },
                { key: "po_number", header: "PO #" },
                { key: "vendor", header: "Vendor" },
                { key: "date", header: "Date", format: (v: string) => formatDate(v) },
                { key: "invoice_amount", header: "Invoice", format: (v: number) => exportFmtCurrency(v) },
                { key: "paid", header: "Paid", format: (v: number) => exportFmtCurrency(v) },
                { key: "outstanding", header: "Outstanding", format: (v: number) => exportFmtCurrency(v) },
                { key: "status", header: "Status" },
              ]);
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
            <div className="text-sm text-muted-foreground">Total Outstanding</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{formatCurrency(unpaidAmount)}</div>
            </div>
            <div className="text-sm text-muted-foreground">Unpaid Invoices</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(partialAmount)}</div>
            </div>
            <div className="text-sm text-muted-foreground">Partial Payments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{vendorCount}</div>
            </div>
            <div className="text-sm text-muted-foreground">Active Vendors</div>
          </CardContent>
        </Card>
      </div>

      {/* Aging Bar Chart */}
      {payables && payables.length > 0 && (() => {
        const agingBuckets = [
          { name: "Current", min: 0, max: 30, color: "#22c55e" },
          { name: "31-60", min: 31, max: 60, color: "#eab308" },
          { name: "61-90", min: 61, max: 90, color: "#f97316" },
          { name: "90+", min: 91, max: Infinity, color: "#ef4444" },
        ];
        const agingData = agingBuckets.map((bucket) => {
          const total = payables
            .filter((grn: any) => {
              const days = Math.floor((new Date().getTime() - new Date(grn.received_date).getTime()) / (1000 * 60 * 60 * 24));
              return days >= bucket.min && days <= bucket.max;
            })
            .reduce((sum: number, grn: any) => sum + (grn.outstanding_amount || 0), 0);
          return { name: bucket.name, amount: total, fill: bucket.color };
        });
        return (
          <Card>
            <CardHeader><CardTitle className="text-base">Payables Aging Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agingData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} width={70} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {agingData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })()}
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by vendor, GRN or PO number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={agingFilter} onValueChange={setAgingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Aging" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Aging</SelectItem>
                <SelectItem value="current">Current (0-30)</SelectItem>
                <SelectItem value="31-60">31-60 Days</SelectItem>
                <SelectItem value="61-90">61-90 Days</SelectItem>
                <SelectItem value="90+">90+ Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payables Table */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Invoices ({filteredPayables.filter(g => g.outstanding_amount > 0).length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GRN #</TableHead>
                  <TableHead>PO #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Aging</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayables.map((grn) => {
                  const aging = calculateAging(grn.received_date);
                  
                  return (
                    <TableRow key={grn.id}>
                      <TableCell className="font-mono">{grn.grn_number}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {grn.purchase_order?.po_number || "-"}
                      </TableCell>
                      <TableCell className="font-medium">{grn.vendor?.name || "-"}</TableCell>
                      <TableCell>{format(new Date(grn.received_date), "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusBadge(grn.payment_status)}>
                          {grn.payment_status.charAt(0).toUpperCase() + grn.payment_status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={aging.color}>{aging.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(grn.invoice_amount || 0)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(grn.paid_amount || 0)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(grn.outstanding_amount || 0)}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/inventory/grn/${grn.id}`)}
                        >
                          View
                        </Button>
                        {grn.outstanding_amount > 0 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate(`/app/accounts/vendor-payments/new?vendorId=${grn.vendor_id}&grnId=${grn.id}`)}
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredPayables.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No outstanding payables found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

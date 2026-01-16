import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, RefreshCw, Package, Building2, Clock, CreditCard } from "lucide-react";
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

export default function PayablesPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [agingFilter, setAgingFilter] = useState<string>("all");

  // Fetch outstanding purchase orders (payables)
  const { data: payables, isLoading, refetch } = useQuery({
    queryKey: ["payables", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          vendor:vendors(id, name, contact_person, phone)
        `)
        .in("status", ["approved", "ordered", "partially_received", "received"])
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const calculateAging = (createdAt: string) => {
    const created = new Date(createdAt);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) return { label: "Current", color: "bg-green-100 text-green-800" };
    if (diffDays <= 60) return { label: "31-60 Days", color: "bg-yellow-100 text-yellow-800" };
    if (diffDays <= 90) return { label: "61-90 Days", color: "bg-orange-100 text-orange-800" };
    return { label: "90+ Days", color: "bg-red-100 text-red-800" };
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      approved: "bg-blue-100 text-blue-800",
      partial: "bg-yellow-100 text-yellow-800",
      received: "bg-green-100 text-green-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredPayables = payables?.filter((po) => {
    const vendorName = po.vendor?.name?.toLowerCase() || "";
    const matchesSearch =
      !search ||
      vendorName.includes(search.toLowerCase()) ||
      po.po_number.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    
    if (agingFilter === "all") return matchesSearch && matchesStatus;
    
    const aging = calculateAging(po.created_at || new Date().toISOString());
    return matchesSearch && matchesStatus && aging.label.toLowerCase().includes(agingFilter.toLowerCase());
  }) || [];

  // Summary calculations
  const totalPayable = filteredPayables.reduce((sum, po) => sum + (po.total_amount || 0), 0);
  const pendingPayment = filteredPayables
    .filter((po) => po.status === "received")
    .reduce((sum, po) => sum + (po.total_amount || 0), 0);
  const partialPayment = filteredPayables
    .filter((po) => po.status === "partially_received")
    .reduce((sum, po) => sum + (po.total_amount || 0), 0);
  const vendorCount = new Set(filteredPayables.map((po) => po.vendor_id)).size;

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
            <Button variant="outline" size="sm">
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
            <div className="text-2xl font-bold">{formatCurrency(totalPayable)}</div>
            <div className="text-sm text-muted-foreground">Total Payable</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{formatCurrency(pendingPayment)}</div>
            </div>
            <div className="text-sm text-muted-foreground">Ready for Payment</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(partialPayment)}</div>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by vendor or PO number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="received">Received</SelectItem>
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
          <CardTitle>Outstanding Purchase Orders ({filteredPayables.length})</CardTitle>
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
                  <TableHead>PO #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aging</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayables.map((po) => {
                  const aging = calculateAging(po.created_at);
                  
                  return (
                    <TableRow key={po.id}>
                      <TableCell className="font-mono">{po.po_number}</TableCell>
                      <TableCell className="font-medium">{po.vendor?.name || "-"}</TableCell>
                      <TableCell>{po.vendor?.contact_person || "-"}</TableCell>
                      <TableCell>{format(new Date(po.created_at), "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(po.status)}>
                          {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={aging.color}>{aging.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(po.total_amount || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/inventory/purchase-orders/${po.id}`)}
                        >
                          View
                        </Button>
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

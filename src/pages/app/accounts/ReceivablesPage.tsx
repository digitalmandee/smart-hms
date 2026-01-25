import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Filter, RefreshCw, Users, Building2, Clock } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { formatCurrencyFull as formatCurrency } from "@/lib/currency";

export default function ReceivablesPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [agingFilter, setAgingFilter] = useState<string>("all");

  // Fetch outstanding invoices (receivables)
  const { data: receivables, isLoading, refetch } = useQuery({
    queryKey: ["receivables", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          patient:patients(id, first_name, last_name, phone)
        `)
        .in("status", ["pending", "partially_paid"])
        .order("invoice_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const calculateAging = (invoiceDate: string) => {
    const created = new Date(invoiceDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { label: "Current", color: "bg-green-100 text-green-800" };
    if (diffDays <= 30) return { label: "1-30 Days", color: "bg-yellow-100 text-yellow-800" };
    if (diffDays <= 60) return { label: "31-60 Days", color: "bg-orange-100 text-orange-800" };
    if (diffDays <= 90) return { label: "61-90 Days", color: "bg-red-100 text-red-800" };
    return { label: "90+ Days", color: "bg-red-200 text-red-900" };
  };

  const filteredReceivables = receivables?.filter((inv) => {
    const patientName = `${inv.patient?.first_name || ""} ${inv.patient?.last_name || ""}`.toLowerCase();
    const matchesSearch =
      !search ||
      patientName.includes(search.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === "all" || typeFilter === "patient";
    
    if (agingFilter === "all") return matchesSearch && matchesType;
    
    const aging = calculateAging(inv.invoice_date);
    return matchesSearch && matchesType && aging.label.toLowerCase().includes(agingFilter.toLowerCase());
  }) || [];

  // Summary calculations
  const totalReceivable = filteredReceivables.reduce((sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)), 0);
  const patientReceivable = totalReceivable;
  const insuranceReceivable = 0;
  const overdueAmount = filteredReceivables
    .filter((inv) => {
      const diffDays = Math.floor((new Date().getTime() - new Date(inv.invoice_date).getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 30;
    })
    .reduce((sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts Receivable"
        description="Manage outstanding patient and insurance receivables"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Accounts Receivable" },
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
            <div className="text-2xl font-bold">{formatCurrency(totalReceivable)}</div>
            <div className="text-sm text-muted-foreground">Total Receivable</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(patientReceivable)}</div>
            </div>
            <div className="text-sm text-muted-foreground">Patient Receivables</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(insuranceReceivable)}</div>
            </div>
            <div className="text-sm text-muted-foreground">Insurance Receivables</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</div>
            </div>
            <div className="text-sm text-muted-foreground">Overdue Amount</div>
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
                placeholder="Search by patient or invoice number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={agingFilter} onValueChange={setAgingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Aging" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Aging</SelectItem>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="1-30">1-30 Days</SelectItem>
                <SelectItem value="31-60">31-60 Days</SelectItem>
                <SelectItem value="61-90">61-90 Days</SelectItem>
                <SelectItem value="90+">90+ Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Receivables Table */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Invoices ({filteredReceivables.length})</CardTitle>
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
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Patient/Payer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Aging</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceivables.map((inv) => {
                  const aging = calculateAging(inv.invoice_date);
                  const balance = inv.total_amount - (inv.paid_amount || 0);
                  
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono">{inv.invoice_number}</TableCell>
                      <TableCell>
                        {inv.patient
                          ? `${inv.patient.first_name} ${inv.patient.last_name}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Patient</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(inv.invoice_date), "dd MMM yyyy")}</TableCell>
                      <TableCell>{format(new Date(inv.invoice_date), "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        <Badge className={aging.color}>{aging.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.total_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.paid_amount || 0)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(balance)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/billing/invoices/${inv.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/billing/invoices/${inv.id}/pay`)}
                        >
                          Collect
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredReceivables.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No outstanding receivables found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

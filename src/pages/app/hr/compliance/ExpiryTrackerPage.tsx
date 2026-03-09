import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useExpiringLicenses } from "@/hooks/useEmployeeDocuments";
import { useEmployeeContracts } from "@/hooks/useContracts";
import { useTranslation } from "@/lib/i18n";
import { AlertTriangle, Search, Download, Shield, FileText, Calendar } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { exportToCSV } from "@/lib/exportUtils";

type ExpiryItem = {
  id: string;
  type: string;
  name: string;
  employeeName: string;
  employeeNumber: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: "expired" | "critical" | "warning" | "valid";
};

export default function ExpiryTrackerPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const { data: licenses, isLoading: loadingLicenses } = useExpiringLicenses(365);
  const { data: contracts, isLoading: loadingContracts } = useEmployeeContracts();

  const isLoading = loadingLicenses || loadingContracts;

  const allItems = useMemo(() => {
    const items: ExpiryItem[] = [];
    const today = new Date();

    // Licenses
    (licenses || []).forEach((lic: any) => {
      if (!lic.expiry_date) return;
      const days = differenceInDays(parseISO(lic.expiry_date), today);
      items.push({
        id: lic.id,
        type: "License",
        name: lic.license_type,
        employeeName: `${lic.employee?.first_name || ""} ${lic.employee?.last_name || ""}`.trim(),
        employeeNumber: lic.employee?.employee_number || "",
        expiryDate: lic.expiry_date,
        daysUntilExpiry: days,
        status: days < 0 ? "expired" : days <= 30 ? "critical" : days <= 90 ? "warning" : "valid",
      });
    });

    // Contracts
    (contracts || []).forEach((c: any) => {
      if (!c.end_date) return;
      const days = differenceInDays(parseISO(c.end_date), today);
      items.push({
        id: c.id,
        type: "Contract",
        name: c.contract_type,
        employeeName: `${c.employee?.first_name || ""} ${c.employee?.last_name || ""}`.trim(),
        employeeNumber: c.employee?.employee_number || "",
        expiryDate: c.end_date,
        daysUntilExpiry: days,
        status: days < 0 ? "expired" : days <= 30 ? "critical" : days <= 90 ? "warning" : "valid",
      });
    });

    return items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [licenses, contracts]);

  const filtered = useMemo(() => {
    return allItems.filter(item => {
      if (search && !item.employeeName.toLowerCase().includes(search.toLowerCase()) && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (urgencyFilter !== "all" && item.status !== urgencyFilter) return false;
      return true;
    });
  }, [allItems, search, typeFilter, urgencyFilter]);

  const expired = allItems.filter(i => i.status === "expired").length;
  const critical = allItems.filter(i => i.status === "critical").length;
  const warning = allItems.filter(i => i.status === "warning").length;

  const getStatusBadge = (status: string, days: number) => {
    switch (status) {
      case "expired":
        return <Badge variant="destructive">Expired ({Math.abs(days)}d ago)</Badge>;
      case "critical":
        return <Badge className="bg-amber-500 text-white">{days}d left</Badge>;
      case "warning":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">{days}d left</Badge>;
      default:
        return <Badge variant="secondary">{days}d left</Badge>;
    }
  };

  const handleExport = () => {
    const columns = [
      { key: "Type", label: "Type" }, { key: "Name", label: "Name" },
      { key: "Employee", label: "Employee" }, { key: "EmployeeNum", label: "Employee #" },
      { key: "ExpiryDate", label: "Expiry Date" }, { key: "Days", label: "Days Until Expiry" },
      { key: "Status", label: "Status" },
    ];
    exportToCSV(filtered.map(i => ({
      Type: i.type, Name: i.name, Employee: i.employeeName,
      EmployeeNum: i.employeeNumber, ExpiryDate: i.expiryDate,
      Days: i.daysUntilExpiry, Status: i.status,
    })), "expiry-tracker", columns);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Expiry Tracker" description="Unified document expiry dashboard" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Expiry Tracker" description="Monitor all expiring licenses, contracts, and documents" actions={
        <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      } />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-destructive">{expired}</div><p className="text-sm text-muted-foreground">Expired</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-amber-600">{critical}</div><p className="text-sm text-muted-foreground">Expiring in 30 days</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-yellow-600">{warning}</div><p className="text-sm text-muted-foreground">Expiring in 90 days</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-muted-foreground">{allItems.length}</div><p className="text-sm text-muted-foreground">Total Tracked</p></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search employee or document..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="License">Licenses</SelectItem>
                <SelectItem value="Contract">Contracts</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Urgency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="critical">Critical (≤30d)</SelectItem>
                <SelectItem value="warning">Warning (≤90d)</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No expiring items found</TableCell></TableRow>
              ) : (
                filtered.map(item => (
                  <TableRow key={`${item.type}-${item.id}`} className={item.status === "expired" ? "bg-destructive/5" : item.status === "critical" ? "bg-amber-500/5" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.type === "License" ? <Shield className="h-4 w-4 text-blue-500" /> : <FileText className="h-4 w-4 text-green-500" />}
                        <span className="text-sm">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div>{item.employeeName}</div>
                      <div className="text-xs text-muted-foreground">{item.employeeNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(item.expiryDate), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status, item.daysUntilExpiry)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

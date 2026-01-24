import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Award,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Calendar,
  Download,
  Bell,
  Filter,
} from "lucide-react";
import { useExpiringLicenses, LICENSE_TYPES } from "@/hooks/useEmployeeDocuments";
import { useEmployeeCategories } from "@/hooks/useHR";
import { format, parseISO, differenceInDays } from "date-fns";
import { exportToCSV, formatDate } from "@/lib/exportUtils";

export default function MedicalLicensesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [licenseTypeFilter, setLicenseTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Fetch licenses with a wide window to include all
  const { data: licenses, isLoading } = useExpiringLicenses(365);
  const { data: categories } = useEmployeeCategories();

  // Stats calculation
  const stats = {
    expired: licenses?.filter((l) => l.isExpired).length || 0,
    expiringSoon: licenses?.filter((l) => l.isExpiringSoon).length || 0,
    valid: licenses?.filter((l) => !l.isExpired && !l.isExpiringSoon).length || 0,
    total: licenses?.length || 0,
  };

  // Filtered licenses
  const filteredLicenses = licenses?.filter((license) => {
    const employee = license.employee as any;
    const matchesSearch =
      search === "" ||
      employee?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      employee?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      license.license_number?.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      licenseTypeFilter === "all" || license.license_type === licenseTypeFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "expired" && license.isExpired) ||
      (statusFilter === "expiring" && license.isExpiringSoon) ||
      (statusFilter === "valid" && !license.isExpired && !license.isExpiringSoon);

    const matchesCategory =
      categoryFilter === "all" || employee?.category?.id === categoryFilter;

    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const getLicenseTypeLabel = (type: string) => {
    return LICENSE_TYPES.find((l) => l.value === type)?.label || type;
  };

  const getExpiryBadge = (expiryDate: string | null, isExpired: boolean, isExpiringSoon: boolean) => {
    if (!expiryDate) {
      return <Badge variant="secondary">No Expiry</Badge>;
    }

    const daysUntil = differenceInDays(parseISO(expiryDate), new Date());

    if (isExpired) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Expired {Math.abs(daysUntil)} days ago
        </Badge>
      );
    }

    if (isExpiringSoon) {
      return (
        <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
          <AlertTriangle className="h-3 w-3" />
          {daysUntil} days left
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="gap-1 text-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Valid
      </Badge>
    );
  };

  const handleExport = () => {
    if (!filteredLicenses) return;

    exportToCSV(
      filteredLicenses.map((l) => {
        const emp = l.employee as any;
        return {
          employee_name: `${emp?.first_name || ""} ${emp?.last_name || ""}`,
          employee_number: emp?.employee_number || "",
          category: emp?.category?.name || "",
          license_type: getLicenseTypeLabel(l.license_type),
          license_number: l.license_number,
          issuing_authority: l.issuing_authority || "",
          issue_date: l.issue_date || "",
          expiry_date: l.expiry_date || "",
          status: l.isExpired ? "Expired" : l.isExpiringSoon ? "Expiring Soon" : "Valid",
          is_verified: l.is_verified ? "Yes" : "No",
        };
      }),
      `medical-licenses-${format(new Date(), "yyyy-MM-dd")}.csv`,
      [
        { key: "employee_name", header: "Employee Name" },
        { key: "employee_number", header: "Employee #" },
        { key: "category", header: "Category" },
        { key: "license_type", header: "License Type" },
        { key: "license_number", header: "License Number" },
        { key: "issuing_authority", header: "Issuing Authority" },
        { key: "issue_date", header: "Issue Date", format: formatDate },
        { key: "expiry_date", header: "Expiry Date", format: formatDate },
        { key: "status", header: "Status" },
        { key: "is_verified", header: "Verified" },
      ]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Licenses & Certifications"
        description="Track professional licenses and certifications across your organization"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Compliance", href: "/app/hr/compliance" },
          { label: "Medical Licenses" },
        ]}
        actions={
          <Button variant="outline" onClick={handleExport} disabled={!filteredLicenses?.length}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-full">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valid</p>
                <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Licenses</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or license number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={licenseTypeFilter} onValueChange={setLicenseTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="License Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {LICENSE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Licenses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            License Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !filteredLicenses?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No licenses found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>License Type</TableHead>
                  <TableHead>License Number</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((license) => {
                  const employee = license.employee as any;
                  return (
                    <TableRow
                      key={license.id}
                      className={
                        license.isExpired
                          ? "bg-destructive/5"
                          : license.isExpiringSoon
                          ? "bg-amber-50 dark:bg-amber-950/20"
                          : ""
                      }
                    >
                      <TableCell>
                        <div
                          className="cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/app/hr/employees/${employee?.id}`)}
                        >
                          <div className="font-medium">
                            {employee?.first_name} {employee?.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee?.employee_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee?.category && (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: employee.category.color,
                              color: employee.category.color,
                            }}
                          >
                            {employee.category.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getLicenseTypeLabel(license.license_type)}</TableCell>
                      <TableCell className="font-mono">{license.license_number}</TableCell>
                      <TableCell>
                        {license.expiry_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(parseISO(license.expiry_date), "MMM d, yyyy")}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getExpiryBadge(license.expiry_date, license.isExpired, license.isExpiringSoon)}
                      </TableCell>
                      <TableCell>
                        {license.is_verified ? (
                          <Badge variant="default" className="bg-green-500 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {license.document_url && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" asChild>
                                    <a
                                      href={license.document_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Document</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

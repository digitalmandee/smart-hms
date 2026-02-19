import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Search,
  Download,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  User,
  FolderOpen,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeCategories, useDepartments } from "@/hooks/useHR";
import { DOCUMENT_TYPES, DOCUMENT_CATEGORIES } from "@/hooks/useEmployeeDocuments";
import { format, parseISO, isBefore, addDays } from "date-fns";

interface EmployeeWithDocs {
  id: string;
  first_name: string;
  last_name: string | null;
  employee_number: string;
  category: { id: string; name: string; color: string | null } | null;
  department: { id: string; name: string } | null;
  documents: Array<{
    id: string;
    document_name: string;
    document_type: string;
    document_category: string | null;
    document_number: string | null;
    file_url: string;
    expiry_date: string | null;
    verified_at: string | null;
    created_at: string;
  }>;
  licenses: Array<{
    id: string;
    license_type: string;
    license_number: string;
    expiry_date: string | null;
    is_verified: boolean;
    document_url: string | null;
  }>;
}

export default function EmployeeDocumentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [docTypeFilter, setDocTypeFilter] = useState<string>("all");

  const { data: categories } = useEmployeeCategories();
  const { data: departments } = useDepartments();

  // Fetch employees with their documents and licenses
  const { data: employeesWithDocs, isLoading } = useQuery({
    queryKey: ["employees-with-documents", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      // Fetch employees
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select(`
          id,
          first_name,
          last_name,
          employee_number,
          category:category_id(id, name, color),
          department:department_id(id, name)
        `)
        .eq("organization_id", profile.organization_id)
        .eq("employment_status", "active")
        .order("first_name");

      if (empError) throw empError;

      // Fetch documents for all employees
      const employeeIds = employees?.map((e) => e.id) || [];
      
      const { data: documents, error: docError } = await supabase
        .from("employee_documents")
        .select("*")
        .in("employee_id", employeeIds);

      if (docError) throw docError;

      const { data: licenses, error: licError } = await supabase
        .from("employee_licenses")
        .select("*")
        .in("employee_id", employeeIds);

      if (licError) throw licError;

      // Merge data
      return employees?.map((emp) => ({
        ...emp,
        documents: documents?.filter((d) => d.employee_id === emp.id) || [],
        licenses: licenses?.filter((l) => l.employee_id === emp.id) || [],
      })) as EmployeeWithDocs[];
    },
    enabled: !!profile?.organization_id,
  });

  // Filter employees
  const filteredEmployees = employeesWithDocs?.filter((emp) => {
    const matchesSearch =
      search === "" ||
      emp.first_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_number.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || emp.category?.id === categoryFilter;

    const matchesDepartment =
      departmentFilter === "all" || emp.department?.id === departmentFilter;

    const matchesDocType =
      docTypeFilter === "all" ||
      emp.documents.some((d) => d.document_type === docTypeFilter) ||
      emp.licenses.some((l) => l.license_type === docTypeFilter);

    return matchesSearch && matchesCategory && matchesDepartment && matchesDocType;
  });

  // Stats
  const stats = {
    totalEmployees: employeesWithDocs?.length || 0,
    withDocuments: employeesWithDocs?.filter((e) => e.documents.length > 0).length || 0,
    withLicenses: employeesWithDocs?.filter((e) => e.licenses.length > 0).length || 0,
    totalDocs:
      employeesWithDocs?.reduce((sum, e) => sum + e.documents.length + e.licenses.length, 0) || 0,
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find((d) => d.value === type)?.label || type;
  };

  const getLicenseTypeLabel = (type: string) => {
    const licenseTypes = [
      { value: "medical", label: "Medical License (MBBS/MD)" },
      { value: "nursing", label: "Nursing License" },
      { value: "pharmacy", label: "Pharmacy License" },
      { value: "lab_technician", label: "Lab Technician License" },
      { value: "radiology", label: "Radiology Technician License" },
      { value: "physiotherapy", label: "Physiotherapy License" },
      { value: "dental", label: "Dental License" },
      { value: "other", label: "Other Professional License" },
    ];
    return licenseTypes.find((l) => l.value === type)?.label || type;
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const date = parseISO(expiryDate);
    return isBefore(date, addDays(new Date(), 30)) && !isBefore(date, new Date());
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return isBefore(parseISO(expiryDate), new Date());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Documents Repository"
        description="View and manage all employee documents and certifications"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Compliance", href: "/app/hr/compliance" },
          { label: "Documents" },
        ]}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Documents</p>
                <p className="text-2xl font-bold">{stats.withDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Licenses</p>
                <p className="text-2xl font-bold">{stats.withLicenses}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{stats.totalDocs}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-muted-foreground opacity-50" />
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
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

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

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Documents Accordion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Documents by Employee
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !filteredEmployees?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No employees found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {filteredEmployees.map((employee) => {
                const totalDocs = employee.documents.length + employee.licenses.length;
                const hasExpiring =
                  employee.documents.some((d) => isExpiringSoon(d.expiry_date)) ||
                  employee.licenses.some((l) => isExpiringSoon(l.expiry_date));
                const hasExpired =
                  employee.documents.some((d) => isExpired(d.expiry_date)) ||
                  employee.licenses.some((l) => isExpired(l.expiry_date));

                return (
                  <AccordionItem
                    key={employee.id}
                    value={employee.id}
                    className={`border rounded-lg px-4 ${
                      hasExpired
                        ? "border-destructive/50 bg-destructive/5"
                        : hasExpiring
                        ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"
                        : ""
                    }`}
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {employee.first_name[0]}
                              {employee.last_name?.[0] || ""}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="font-medium">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {employee.employee_number}
                              {employee.department && ` • ${employee.department.name}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {employee.category && (
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: employee.category.color || undefined,
                                color: employee.category.color || undefined,
                              }}
                            >
                              {employee.category.name}
                            </Badge>
                          )}
                          <Badge variant="secondary">{totalDocs} docs</Badge>
                          {hasExpired && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Expired
                            </Badge>
                          )}
                          {hasExpiring && !hasExpired && (
                            <Badge
                              variant="outline"
                              className="gap-1 border-amber-500 text-amber-600"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              Expiring
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-4">
                        {/* Documents */}
                        {employee.documents.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Documents
                            </h4>
                            <div className="grid gap-2 md:grid-cols-2">
                              {employee.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-background"
                                >
                                  <div>
                                    <div className="font-medium text-sm">{doc.document_name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {getDocumentTypeLabel(doc.document_type)}
                                      {doc.document_number && ` • #${doc.document_number}`}
                                    </div>
                                    {doc.expiry_date && (
                                      <div
                                        className={`text-xs flex items-center gap-1 mt-1 ${
                                          isExpired(doc.expiry_date)
                                            ? "text-destructive"
                                            : isExpiringSoon(doc.expiry_date)
                                            ? "text-amber-600"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        <Calendar className="h-3 w-3" />
                                        Expires: {format(parseISO(doc.expiry_date), "MMM d, yyyy")}
                                      </div>
                                    )}
                                  </div>
                                  <Button variant="ghost" size="sm" asChild>
                                    <a
                                      href={doc.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Licenses */}
                        {employee.licenses.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Licenses & Certifications
                            </h4>
                            <div className="grid gap-2 md:grid-cols-2">
                              {employee.licenses.map((lic) => (
                                <div
                                  key={lic.id}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-background"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">
                                        {getLicenseTypeLabel(lic.license_type)}
                                      </span>
                                      {lic.is_verified && (
                                        <Badge variant="default" className="bg-green-500 text-xs">
                                          Verified
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      #{lic.license_number}
                                    </div>
                                    {lic.expiry_date && (
                                      <div
                                        className={`text-xs flex items-center gap-1 mt-1 ${
                                          isExpired(lic.expiry_date)
                                            ? "text-destructive"
                                            : isExpiringSoon(lic.expiry_date)
                                            ? "text-amber-600"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        <Calendar className="h-3 w-3" />
                                        Expires: {format(parseISO(lic.expiry_date), "MMM d, yyyy")}
                                      </div>
                                    )}
                                  </div>
                                  {lic.document_url && (
                                    <Button variant="ghost" size="sm" asChild>
                                      <a
                                        href={lic.document_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {employee.documents.length === 0 && employee.licenses.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            No documents on file for this employee
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/app/hr/employees/${employee.id}`)}
                          >
                            View Employee Profile
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

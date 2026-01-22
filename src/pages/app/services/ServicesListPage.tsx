import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceCategoryBadge } from "@/components/billing/ServiceCategoryBadge";
import { 
  useUnifiedServices, 
  useToggleUnifiedServiceStatus,
  useServiceCategoryStats,
  ServiceCategory,
  UnifiedService 
} from "@/hooks/useUnifiedServices";
import { 
  Plus, 
  Search, 
  Edit,
  Link2,
  Stethoscope,
  Syringe,
  FlaskConical,
  Scan,
  Pill,
  Building,
  MoreHorizontal,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type CategoryFilter = ServiceCategory | "all";

const categoryOptions: { value: CategoryFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Categories", icon: null },
  { value: "consultation", label: "Consultation", icon: <Stethoscope className="h-4 w-4" /> },
  { value: "procedure", label: "Procedure / OT", icon: <Syringe className="h-4 w-4" /> },
  { value: "lab", label: "Lab Tests", icon: <FlaskConical className="h-4 w-4" /> },
  { value: "radiology", label: "Radiology", icon: <Scan className="h-4 w-4" /> },
  { value: "pharmacy", label: "Pharmacy", icon: <Pill className="h-4 w-4" /> },
  { value: "room", label: "Rooms / Beds", icon: <Building className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <MoreHorizontal className="h-4 w-4" /> },
];

export default function ServicesListPage() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: services, isLoading } = useUnifiedServices(categoryFilter);
  const { data: stats } = useServiceCategoryStats();
  const toggleStatus = useToggleUnifiedServiceStatus();

  // Filter by search
  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (!searchQuery) return services;
    const query = searchQuery.toLowerCase();
    return services.filter(s => s.name.toLowerCase().includes(query));
  }, [services, searchQuery]);

  const hasLinkedData = (service: UnifiedService) => {
    return !!(service.linked_imaging_procedure || service.linked_bed_type || service.linked_lab_template);
  };

  const getLinkedLabel = (service: UnifiedService) => {
    if (service.linked_imaging_procedure) return "Radiology";
    if (service.linked_bed_type) return "Bed Type";
    if (service.linked_lab_template) return "Lab Template";
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services Catalog"
        description="Manage all billable services, pricing, and configurations"
        actions={
          <Button onClick={() => navigate("/app/services/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        }
      />

      {/* Category Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {categoryOptions.map(({ value, label, icon }) => {
          const stat = stats?.[value] || { total: 0, active: 0 };
          return (
            <Card 
              key={value}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${categoryFilter === value ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setCategoryFilter(value)}
            >
              <CardContent className="pt-4 pb-3 px-3">
                <div className="flex items-center gap-2 mb-1">
                  {icon}
                  <span className="text-xs font-medium truncate">{label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.total}</div>
                <div className="text-xs text-muted-foreground">
                  {stat.active} active
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map(({ value, label, icon }) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  {icon}
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {categoryOptions.find(c => c.value === categoryFilter)?.label || "Services"}
            {filteredServices.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredServices.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? "No services match your search" : "No services in this category"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Service Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price (Rs.)</TableHead>
                  <TableHead className="text-center">Linked</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <ServiceCategoryBadge category={service.category} />
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(service.default_price || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {hasLinkedData(service) && (
                        <Badge variant="outline" className="gap-1">
                          <Link2 className="h-3 w-3" />
                          {getLinkedLabel(service)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={() => toggleStatus.mutate(service.id)}
                        disabled={toggleStatus.isPending}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/app/services/${service.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

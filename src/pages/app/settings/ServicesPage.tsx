import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCategoryBadge } from "@/components/billing/ServiceCategoryBadge";
import { ServiceEditDialog } from "@/components/settings/ServiceEditDialog";
import { 
  useUnifiedServices, 
  useCreateUnifiedService, 
  useUpdateUnifiedService, 
  useToggleUnifiedServiceStatus,
  useServiceCategoryStats,
  ServiceCategory,
  UnifiedService 
} from "@/hooks/useUnifiedServices";
import { 
  Plus, 
  Search, 
  Edit, 
  Settings2, 
  Link2,
  Stethoscope,
  Syringe,
  FlaskConical,
  Scan,
  Pill,
  Building,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type CategoryTab = ServiceCategory | "all";

const categoryIcons: Record<string, React.ReactNode> = {
  all: null,
  consultation: <Stethoscope className="h-4 w-4" />,
  procedure: <Syringe className="h-4 w-4" />,
  lab: <FlaskConical className="h-4 w-4" />,
  radiology: <Scan className="h-4 w-4" />,
  pharmacy: <Pill className="h-4 w-4" />,
  room: <Building className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

const categoryLabels: Record<CategoryTab, string> = {
  all: "All Services",
  consultation: "Consultation",
  procedure: "Procedure / OT",
  lab: "Lab Tests",
  radiology: "Radiology",
  pharmacy: "Pharmacy",
  room: "Rooms / Beds",
  other: "Other",
};

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<UnifiedService | null>(null);

  const { data: services, isLoading } = useUnifiedServices(activeTab);
  const { data: stats } = useServiceCategoryStats();
  const createMutation = useCreateUnifiedService();
  const updateMutation = useUpdateUnifiedService();
  const toggleStatus = useToggleUnifiedServiceStatus();

  // Filter by search
  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (!searchQuery) return services;
    const query = searchQuery.toLowerCase();
    return services.filter(s => 
      s.name.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (service: UnifiedService) => {
    setEditingService(service);
    setDialogOpen(true);
  };

  const handleSave = async (values: {
    id?: string;
    name: string;
    category_id: string;
    default_price: number;
    cost_price: number;
    is_active: boolean;
    price_change_reason?: string;
  }) => {
    if (values.id) {
      await updateMutation.mutateAsync({
        id: values.id,
        name: values.name,
        category_id: values.category_id,
        default_price: values.default_price,
        cost_price: values.cost_price,
        is_active: values.is_active,
        price_change_reason: values.price_change_reason,
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        category_id: values.category_id,
        default_price: values.default_price,
        cost_price: values.cost_price,
        is_active: values.is_active,
      });
    }
    setDialogOpen(false);
  };

  const hasLinkedData = (service: UnifiedService) => {
    return !!(service.linked_imaging_procedure || service.linked_bed_type || service.linked_lab_template);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services Catalog"
        description="Manage all billable services, pricing, and configurations in one place"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        }
      />

      {/* Category Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {Object.entries(categoryLabels).map(([key, label]) => {
          const stat = stats?.[key] || { total: 0, active: 0 };
          return (
            <Card 
              key={key}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${activeTab === key ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setActiveTab(key as CategoryTab)}
            >
              <CardContent className="pt-4 pb-3 px-3">
                <div className="flex items-center gap-2 mb-1">
                  {categoryIcons[key]}
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

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryTab)}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <TabsList className="h-auto flex-wrap">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="gap-1.5">
                {categoryIcons[key]}
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{key === "all" ? "All" : label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
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
      </Tabs>

      {/* Services Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {categoryLabels[activeTab]}
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
                  <TableHead className="w-[30%]">Service Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                  <TableHead className="text-right">Cost Price</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
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
                      <ServiceCategoryBadge 
                        category={service.category_info?.code as any || service.category} 
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(service.default_price || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {(service.cost_price || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(() => {
                        const profit = (service.default_price || 0) - (service.cost_price || 0);
                        const pct = (service.default_price || 0) > 0 
                          ? ((profit / (service.default_price || 1)) * 100).toFixed(0)
                          : "0";
                        return (
                          <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {profit.toLocaleString()} ({pct}%)
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      {hasLinkedData(service) && (
                        <Badge variant="outline" className="gap-1">
                          <Link2 className="h-3 w-3" />
                          {service.linked_imaging_procedure && "Procedure"}
                          {service.linked_bed_type && "Bed Type"}
                          {service.linked_lab_template && "Template"}
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {hasLinkedData(service) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(service)}
                            title="Configure specialized settings"
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <ServiceEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editingService}
        onSave={handleSave}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

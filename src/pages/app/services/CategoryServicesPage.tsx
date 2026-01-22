import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Edit2, Plus, Archive, Loader2 } from "lucide-react";
import { useServiceCategoryByCode } from "@/hooks/useServiceCategories";
import { 
  useUnifiedServices, 
  useUpdateUnifiedService,
  useToggleUnifiedServiceStatus,
  UnifiedService 
} from "@/hooks/useUnifiedServices";
import { ServiceEditDialog } from "@/components/settings/ServiceEditDialog";
import { formatDistanceToNow } from "date-fns";

export default function CategoryServicesPage() {
  const { categoryCode } = useParams<{ categoryCode: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editingService, setEditingService] = useState<UnifiedService | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch category info
  const { data: category, isLoading: categoryLoading } = useServiceCategoryByCode(categoryCode);
  
  // Fetch services - pass category code to filter
  const { data: services, isLoading: servicesLoading } = useUnifiedServices(categoryCode as any);
  
  const updateService = useUpdateUnifiedService();
  const toggleStatus = useToggleUnifiedServiceStatus();

  // Filter services by search and archived status
  const filteredServices = useMemo(() => {
    if (!services) return [];
    
    return services.filter(service => {
      // Filter by active/archived status
      const statusMatch = showArchived ? !service.is_active : service.is_active;
      
      // Filter by search query
      const searchMatch = !searchQuery || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return statusMatch && searchMatch;
    });
  }, [services, searchQuery, showArchived]);

  const handleEdit = (service: UnifiedService) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleSave = async (values: {
    id?: string;
    name: string;
    category_id: string;
    default_price: number;
    is_active: boolean;
    price_change_reason?: string;
  }) => {
    if (!values.id) return;
    
    await updateService.mutateAsync({
      id: values.id,
      name: values.name,
      category_id: values.category_id,
      default_price: values.default_price,
      is_active: values.is_active,
      price_change_reason: values.price_change_reason,
    });
    
    setIsDialogOpen(false);
    setEditingService(null);
  };

  const isLoading = categoryLoading || servicesLoading;
  const pageTitle = category?.name || "Services";
  const activeCount = services?.filter(s => s.is_active).length || 0;
  const archivedCount = services?.filter(s => !s.is_active).length || 0;

  return (
    <div>
      <PageHeader
        title={pageTitle}
        description={`Manage ${pageTitle.toLowerCase()} services and pricing`}
        breadcrumbs={[
          { label: "Services", href: "/app/services" },
          { label: pageTitle },
        ]}
        actions={
          <Button onClick={() => window.location.href = `/app/services/new?category=${categoryCode}`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-medium">
              {showArchived ? "Archived" : "Active"} Services
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({showArchived ? archivedCount : activeCount})
              </span>
            </CardTitle>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              
              {/* Show Archived Toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  id="show-archived"
                  checked={showArchived}
                  onCheckedChange={setShowArchived}
                />
                <Label htmlFor="show-archived" className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Archive className="h-4 w-4" />
                  Show Archived
                </Label>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? (
                <p>No services found matching "{searchQuery}"</p>
              ) : showArchived ? (
                <p>No archived services</p>
              ) : (
                <p>No active services in this category</p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead className="w-[150px] text-right">Price (Rs.)</TableHead>
                  <TableHead className="w-[180px]">Last Updated</TableHead>
                  <TableHead className="w-[100px] text-center">Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {service.default_price?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {service.price_updated_at 
                        ? formatDistanceToNow(new Date(service.price_updated_at), { addSuffix: true })
                        : "-"
                      }
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={() => toggleStatus.mutate(service.id)}
                        disabled={toggleStatus.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ServiceEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        service={editingService}
        onSave={handleSave}
        isPending={updateService.isPending}
      />
    </div>
  );
}

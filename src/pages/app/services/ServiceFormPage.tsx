import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useUnifiedServices,
  useCreateUnifiedService, 
  useUpdateUnifiedService,
  useServicePriceHistory,
  UnifiedService
} from "@/hooks/useUnifiedServices";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { 
  Loader2, 
  Link2,
  ExternalLink,
  Clock,
  Stethoscope,
  Syringe,
  FlaskConical,
  Scan,
  Pill,
  Building,
  MoreHorizontal,
  Circle,
  Heart,
  Activity,
  Thermometer,
  Microscope,
  Scissors,
  Bandage,
} from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category_id: z.string().min(1, "Category is required"),
  default_price: z.coerce.number().min(0, "Price must be positive"),
  is_active: z.boolean(),
  price_change_reason: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Icon mapping for dynamic categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  stethoscope: Stethoscope,
  syringe: Syringe,
  "flask-conical": FlaskConical,
  scan: Scan,
  pill: Pill,
  building: Building,
  "more-horizontal": MoreHorizontal,
  circle: Circle,
  heart: Heart,
  activity: Activity,
  thermometer: Thermometer,
  microscope: Microscope,
  scissors: Scissors,
  bandage: Bandage,
};

export default function ServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);

  const { data: services, isLoading: loadingServices } = useUnifiedServices("all");
  const { data: categories, isLoading: loadingCategories } = useServiceCategories();
  const service = services?.find(s => s.id === id);
  
  const { data: priceHistory, isLoading: loadingHistory } = useServicePriceHistory(id);
  const createMutation = useCreateUnifiedService();
  const updateMutation = useUpdateUnifiedService();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category_id: "",
      default_price: 0,
      is_active: true,
      price_change_reason: "",
    },
  });

  const currentPrice = form.watch("default_price");
  const priceChanged = isEditing && originalPrice !== null && currentPrice !== originalPrice;

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        category_id: service.category_id || "",
        default_price: Number(service.default_price) || 0,
        is_active: service.is_active ?? true,
        price_change_reason: "",
      });
      setOriginalPrice(Number(service.default_price) || 0);
    }
  }, [service, form]);

  const onSubmit = async (values: FormValues) => {
    if (isEditing && id) {
      await updateMutation.mutateAsync({ 
        id, 
        name: values.name,
        category_id: values.category_id,
        default_price: values.default_price,
        is_active: values.is_active,
        price_change_reason: priceChanged ? values.price_change_reason : undefined,
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        category_id: values.category_id,
        default_price: values.default_price,
        is_active: values.is_active,
      });
    }
    navigate("/app/services");
  };

  const getLinkedInfo = (svc: UnifiedService) => {
    if (svc.linked_imaging_procedure) {
      return {
        type: "Radiology Procedure",
        name: svc.linked_imaging_procedure.code || svc.linked_imaging_procedure.modality_type,
        details: `${svc.linked_imaging_procedure.modality_type || 'N/A'} - ${svc.linked_imaging_procedure.body_part || 'N/A'}`,
        editPath: "/app/radiology/procedures",
      };
    }
    if (svc.linked_bed_type) {
      return {
        type: "Bed Type",
        name: svc.linked_bed_type.code || 'Bed Type',
        details: svc.linked_bed_type.description || 'No description',
        editPath: "/app/ipd/setup/bed-types",
      };
    }
    if (svc.linked_lab_template) {
      return {
        type: "Lab Template",
        name: svc.linked_lab_template.test_category || 'Lab Test',
        details: `Category: ${svc.linked_lab_template.test_category || 'Uncategorized'}`,
        editPath: `/app/lab/templates`,
      };
    }
    return null;
  };

  if ((isEditing && loadingServices) || loadingCategories) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isEditing && !service && !loadingServices) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Service not found</p>
        <Button variant="link" onClick={() => navigate("/app/services")}>
          Back to Services
        </Button>
      </div>
    );
  }

  const linkedInfo = service ? getLinkedInfo(service) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit Service" : "New Service"}
        description={isEditing ? "Update service configuration and pricing" : "Create a new billable service"}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Service Details</TabsTrigger>
              {isEditing && <TabsTrigger value="history">Price History</TabsTrigger>}
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                  <CardDescription>
                    Basic information and pricing for this service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., General Consultation" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.map((cat) => {
                                  const IconComp = iconMap[cat.icon] || Circle;
                                  return (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      <div className="flex items-center gap-2">
                                        <IconComp className="h-4 w-4" />
                                        {cat.name}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="default_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Price (Rs.)</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} step={0.01} {...field} />
                            </FormControl>
                            {priceChanged && (
                              <FormDescription className="text-warning">
                                Price changed from Rs. {originalPrice?.toLocaleString()} to Rs. {currentPrice?.toLocaleString()}
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {priceChanged && (
                        <FormField
                          control={form.control}
                          name="price_change_reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reason for Price Change</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="e.g., Annual price revision, cost adjustment..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                This will be recorded in the price history
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                              <FormLabel className="text-base">Active</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Inactive services won't appear in billing forms
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="submit"
                          disabled={createMutation.isPending || updateMutation.isPending}
                        >
                          {(createMutation.isPending || updateMutation.isPending) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {isEditing ? "Update Service" : "Create Service"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => navigate("/app/services")}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {isEditing && (
              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Price History
                    </CardTitle>
                    <CardDescription>
                      Track all price changes for this service
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingHistory ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : priceHistory && priceHistory.length > 0 ? (
                      <div className="space-y-4">
                        {priceHistory.map((entry) => (
                          <div key={entry.id} className="flex items-start gap-4 p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground line-through">
                                  Rs. {(entry.old_price || 0).toLocaleString()}
                                </span>
                                <span className="text-lg font-semibold">
                                  → Rs. {entry.new_price.toLocaleString()}
                                </span>
                              </div>
                              {entry.reason && (
                                <p className="text-sm text-muted-foreground mt-1">{entry.reason}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(entry.changed_at), "PPpp")}
                                {entry.changed_by_profile?.full_name && ` by ${entry.changed_by_profile.full_name}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No price changes recorded
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="space-y-6">
          {linkedInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Link2 className="h-4 w-4" />
                  Linked Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Badge variant="secondary">{linkedInfo.type}</Badge>
                </div>
                <div>
                  <p className="font-medium">{linkedInfo.name}</p>
                  <p className="text-sm text-muted-foreground">{linkedInfo.details}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(linkedInfo.editPath)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Edit {linkedInfo.type}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Price changes here will sync to the linked {linkedInfo.type.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          )}

          {isEditing && service && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={service.is_active ? "default" : "secondary"}>
                    {service.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Price</span>
                  <span className="font-mono">Rs. {(service.default_price || 0).toLocaleString()}</span>
                </div>
                {service.price_updated_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{format(new Date(service.price_updated_at), "PP")}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

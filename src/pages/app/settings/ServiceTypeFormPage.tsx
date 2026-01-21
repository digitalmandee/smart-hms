import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useServiceType, useCreateServiceType, useUpdateServiceType } from "@/hooks/useBilling";
import { Loader2, Stethoscope, Syringe, FlaskConical, Pill, Building, MoreHorizontal, Scan } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["consultation", "procedure", "lab", "pharmacy", "room", "radiology", "other"]),
  default_price: z.coerce.number().min(0, "Price must be positive"),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const categoryOptions = [
  { value: "consultation", label: "Consultation", icon: Stethoscope },
  { value: "procedure", label: "Procedure", icon: Syringe },
  { value: "lab", label: "Lab", icon: FlaskConical },
  { value: "radiology", label: "Radiology", icon: Scan },
  { value: "pharmacy", label: "Pharmacy", icon: Pill },
  { value: "room", label: "Room", icon: Building },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

export default function ServiceTypeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: serviceType, isLoading } = useServiceType(id);
  const createMutation = useCreateServiceType();
  const updateMutation = useUpdateServiceType();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "consultation",
      default_price: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (serviceType) {
      form.reset({
        name: serviceType.name,
        category: serviceType.category || "other",
        default_price: Number(serviceType.default_price) || 0,
        is_active: serviceType.is_active ?? true,
      });
    }
  }, [serviceType, form]);

  const onSubmit = async (values: FormValues) => {
    if (isEditing && id) {
      await updateMutation.mutateAsync({ 
        id, 
        name: values.name,
        category: values.category,
        default_price: values.default_price,
        is_active: values.is_active,
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        category: values.category,
        default_price: values.default_price,
        is_active: values.is_active,
      });
    }
    navigate("/app/settings/services");
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit Service Type" : "New Service Type"}
        description={isEditing ? "Update service configuration" : "Create a new billable service"}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
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
                name="category"
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
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Update Service" : "Create Service"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

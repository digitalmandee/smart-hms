import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganizations";
import { useStore, useCreateStore, useUpdateStore } from "@/hooks/useStores";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save } from "lucide-react";

const hospitalStoreTypes = [
  { value: "central", label: "Central Warehouse" },
  { value: "medical", label: "Medical Store" },
  { value: "surgical", label: "Surgical Store" },
  { value: "dental", label: "Dental Store" },
  { value: "equipment", label: "Equipment Store" },
  { value: "pharmacy", label: "Pharmacy Store" },
  { value: "general", label: "General Store" },
];

const warehouseStoreTypes = [
  { value: "central", label: "Central Warehouse" },
  { value: "distribution", label: "Distribution Center" },
  { value: "cold_storage", label: "Cold Storage" },
  { value: "bulk", label: "Bulk Storage" },
  { value: "equipment", label: "Equipment Store" },
  { value: "general", label: "General Store" },
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().optional(),
  store_type: z.string().min(1, "Select a warehouse type"),
  description: z.string().optional(),
  branch_id: z.string().min(1, "Select a branch").refine(v => v !== "none", "Select a branch"),
  manager_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function StoreFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { profile } = useAuth();
  const { data: organization } = useOrganization(profile?.organization_id);
  const isWarehouse = organization?.facility_type === 'warehouse';
  const storeTypes = isWarehouse ? warehouseStoreTypes : hospitalStoreTypes;

  const { data: store, isLoading: storeLoading } = useStore(id || "");
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();

  // Load branches
  const { data: branches } = useQuery({
    queryKey: ["branches", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Load profiles for manager selection
  const { data: managers } = useQuery({
    queryKey: ["staff-profiles", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("organization_id", profile!.organization_id!)
        .order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      store_type: "general",
      description: "",
      branch_id: profile?.branch_id || "none",
      manager_id: "none",
    },
  });

  useEffect(() => {
    if (isEdit && store) {
      form.reset({
        name: store.name,
        code: store.code || "",
        store_type: store.store_type,
        description: store.description || "",
        branch_id: store.branch_id,
        manager_id: store.manager_id || "",
      });
    }
  }, [store, isEdit, form]);

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateStore.mutate(
        {
          id: id!,
          name: data.name,
          code: data.code,
          store_type: data.store_type,
          description: data.description,
          branch_id: data.branch_id,
          manager_id: data.manager_id || undefined,
        },
        { onSuccess: () => navigate("/app/inventory/stores") }
      );
    } else {
      createStore.mutate(
        {
          name: data.name,
          code: data.code,
          store_type: data.store_type,
          description: data.description,
          branch_id: data.branch_id,
          manager_id: data.manager_id || undefined,
        },
        { onSuccess: () => navigate("/app/inventory/stores") }
      );
    }
  };

  if (isEdit && storeLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Warehouse" : "Create Warehouse"}
        description={isEdit ? "Update warehouse details" : "Add a new warehouse to your organization"}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/inventory/stores")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Medical Store" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MED-01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="store_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {storeTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                  name="branch_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none" disabled>Select a branch</SelectItem>
                          {branches?.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
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
                  name="manager_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Manager</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Manager</SelectItem>
                          {managers?.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional description for this warehouse"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/app/inventory/stores")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createStore.isPending || updateStore.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? "Update Warehouse" : "Create Warehouse"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

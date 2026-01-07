import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMedicine } from "@/hooks/useMedicines";
import { useCreateMedicine, useUpdateMedicine, useMedicineCategories } from "@/hooks/usePharmacy";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/integrations/supabase/types";

type MedicineUnit = Database["public"]["Enums"]["medicine_unit"];

const medicineUnits: MedicineUnit[] = [
  "tablet", "capsule", "syrup", "injection", "cream", 
  "drops", "inhaler", "powder", "gel", "ointment"
];

const medicineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  generic_name: z.string().optional(),
  category_id: z.string().optional(),
  manufacturer: z.string().optional(),
  strength: z.string().optional(),
  unit: z.enum(["tablet", "capsule", "syrup", "injection", "cream", "drops", "inhaler", "powder", "gel", "ointment"] as const).optional().nullable(),
  is_active: z.boolean().default(true),
});

type MedicineFormData = z.infer<typeof medicineSchema>;

export default function MedicineFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isEditing = !!id;

  const { data: medicine, isLoading: medicineLoading } = useMedicine(id);
  const { data: categories } = useMedicineCategories();
  const createMedicine = useCreateMedicine();
  const updateMedicine = useUpdateMedicine();

  const form = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: "",
      generic_name: "",
      category_id: "",
      manufacturer: "",
      strength: "",
      unit: undefined,
      is_active: true,
    },
  });

  useEffect(() => {
    if (medicine) {
      form.reset({
        name: medicine.name,
        generic_name: medicine.generic_name || "",
        category_id: medicine.category_id || "",
        manufacturer: medicine.manufacturer || "",
        strength: medicine.strength || "",
        unit: medicine.unit || undefined,
        is_active: medicine.is_active ?? true,
      });
    }
  }, [medicine, form]);

  const onSubmit = (data: MedicineFormData) => {
    const unitValue = data.unit as MedicineUnit | null | undefined;
    
    if (isEditing) {
      updateMedicine.mutate(
        {
          id: id!,
          ...data,
          category_id: data.category_id || null,
          unit: unitValue || null,
        },
        {
          onSuccess: () => navigate("/app/pharmacy/medicines"),
        }
      );
    } else {
      createMedicine.mutate(
        {
          name: data.name,
          organization_id: profile!.organization_id!,
          generic_name: data.generic_name || null,
          category_id: data.category_id || null,
          manufacturer: data.manufacturer || null,
          strength: data.strength || null,
          unit: unitValue || null,
          is_active: data.is_active ?? true,
        },
        {
          onSuccess: () => navigate("/app/pharmacy/medicines"),
        }
      );
    }
  };

  if (isEditing && medicineLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit Medicine" : "Add Medicine"}
        description={isEditing ? "Update medicine details" : "Add a new medicine to the catalog"}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/pharmacy/medicines")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicine Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Paracetamol 500mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="generic_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Generic Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Acetaminophen" {...field} />
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
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
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
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., GSK, Pfizer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="strength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strength</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 500mg, 10ml" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {medicineUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              <span className="capitalize">{unit}</span>
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
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Inactive medicines won't appear in prescription searches
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/app/pharmacy/medicines")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMedicine.isPending || updateMedicine.isPending}
                >
                  {createMedicine.isPending || updateMedicine.isPending
                    ? "Saving..."
                    : isEditing
                    ? "Update Medicine"
                    : "Add Medicine"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

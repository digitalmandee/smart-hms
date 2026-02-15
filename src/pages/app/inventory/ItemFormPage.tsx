import { useState } from "react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useInventoryItem, useCreateInventoryItem, useUpdateInventoryItem, useAllCategories } from "@/hooks/useInventory";
import { PageHeader } from "@/components/PageHeader";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  unit_of_measure: z.string().min(1, "Unit is required"),
  minimum_stock: z.coerce.number().min(0),
  reorder_level: z.coerce.number().min(0),
  standard_cost: z.coerce.number().min(0),
  is_consumable: z.boolean(),
});

type ItemFormData = z.infer<typeof itemSchema>;

export default function ItemFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: item, isLoading: itemLoading } = useInventoryItem(id || "");
  const { data: categories } = useAllCategories();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      unit_of_measure: "Unit",
      minimum_stock: 0,
      reorder_level: 10,
      standard_cost: 0,
      is_consumable: true,
    },
    values: item ? {
      name: item.name,
      description: item.description || "",
      category_id: item.category_id || "",
      unit_of_measure: item.unit_of_measure,
      minimum_stock: item.minimum_stock,
      reorder_level: item.reorder_level,
      standard_cost: item.standard_cost,
      is_consumable: item.is_consumable,
    } : undefined,
  });

  const onSubmit = async (data: ItemFormData) => {
    try {
      if (isEdit) {
        await updateItem.mutateAsync({ id, ...data });
        navigate(`/app/inventory/items/${id}`);
      } else {
        const result = await createItem.mutateAsync(data);
        navigate(`/app/inventory/items/${result.id}`);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isSubmitting = createItem.isPending || updateItem.isPending;

  if (isEdit && itemLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Item" : "New Item"}
        description={isEdit ? `Editing ${item?.item_code}` : "Add a new inventory item"}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Surgical Gloves" />
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
                          <SelectItem value="none">No Category</SelectItem>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Item description..." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit_of_measure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measure *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Unit">Unit</SelectItem>
                          <SelectItem value="Box">Box</SelectItem>
                          <SelectItem value="Pack">Pack</SelectItem>
                          <SelectItem value="Piece">Piece</SelectItem>
                          <SelectItem value="Bottle">Bottle</SelectItem>
                          <SelectItem value="Vial">Vial</SelectItem>
                          <SelectItem value="Ampoule">Ampoule</SelectItem>
                          <SelectItem value="Strip">Strip</SelectItem>
                          <SelectItem value="Kg">Kg</SelectItem>
                          <SelectItem value="Liter">Liter</SelectItem>
                          <SelectItem value="Meter">Meter</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="standard_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard Cost ({currencySymbol})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>Default purchase price</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimum_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Critical stock level</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reorder_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Level</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>When to reorder</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_consumable"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel>Consumable Item</FormLabel>
                        <FormDescription>
                          Item is consumed when used (not reusable)
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Update Item" : "Create Item"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

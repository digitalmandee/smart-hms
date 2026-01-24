import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useBranches } from "@/hooks/useBranches";
import { useCreatePurchaseOrder, type PurchaseOrderItem } from "@/hooks/usePurchaseOrders";
import { UnifiedPOItemsBuilder } from "@/components/inventory/UnifiedPOItemsBuilder";
import { PageHeader } from "@/components/PageHeader";

const poSchema = z.object({
  vendor_id: z.string().min(1, "Vendor is required"),
  branch_id: z.string().min(1, "Branch is required"),
  expected_delivery_date: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

type POFormData = z.infer<typeof poSchema>;

export default function POFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vendorIdParam = searchParams.get("vendor_id");

  const [items, setItems] = useState<PurchaseOrderItem[]>([]);

  const { data: vendors } = useVendors();
  const { data: branches } = useBranches();
  const createPO = useCreatePurchaseOrder();

  const form = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      vendor_id: vendorIdParam || "",
      branch_id: "",
      expected_delivery_date: "",
      terms: "",
      notes: "",
    },
  });

  const onSubmit = async (data: POFormData) => {
    if (items.length === 0) {
      return;
    }

    try {
      const result = await createPO.mutateAsync({
        vendor_id: data.vendor_id,
        branch_id: data.branch_id,
        expected_delivery_date: data.expected_delivery_date,
        terms: data.terms,
        notes: data.notes,
        items,
      });
      navigate(`/app/inventory/purchase-orders/${result.id}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Purchase Order"
        description="Create a new purchase order"
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vendor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors?.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name} ({vendor.vendor_code})
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
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches?.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
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
                  name="expected_delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedPOItemsBuilder items={items} onChange={setItems} />
              {items.length === 0 && (
                <p className="text-sm text-destructive mt-2">
                  Add at least one item to the purchase order
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Payment terms, delivery terms, etc." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Notes for internal use..." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPO.isPending || items.length === 0}>
              {createPO.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Purchase Order
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

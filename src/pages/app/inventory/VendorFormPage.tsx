import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ArrowLeft, Loader2, Star } from "lucide-react";
import { useVendor, useCreateVendor, useUpdateVendor } from "@/hooks/useVendors";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganizations";
import { PageHeader } from "@/components/PageHeader";

const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  vendor_type: z.enum(['pharmaceutical', 'equipment', 'consumables', 'surgical', 'services', 'general', 'manufacturer', 'distributor', 'wholesaler', 'raw_materials', 'packaging', 'logistics']).default('general'),
  is_preferred: z.boolean().default(false),
  contact_person: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  payment_terms: z.string().optional(),
  tax_number: z.string().optional(),
  rating: z.coerce.number().min(1).max(5),
  notes: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

export default function VendorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { profile } = useAuth();
  const { data: organization } = useOrganization(profile?.organization_id);
  const isWarehouse = organization?.facility_type === 'warehouse';

  const { data: vendor, isLoading: vendorLoading } = useVendor(id || "");
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      vendor_type: "general" as const,
      is_preferred: false,
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "Pakistan",
      payment_terms: "Net 30",
      tax_number: "",
      rating: 3,
      notes: "",
    },
    values: vendor ? {
      name: vendor.name,
      vendor_type: (vendor as any).vendor_type || "general",
      is_preferred: (vendor as any).is_preferred || false,
      contact_person: vendor.contact_person || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
      city: vendor.city || "",
      country: vendor.country || "Pakistan",
      payment_terms: vendor.payment_terms || "Net 30",
      tax_number: vendor.tax_number || "",
      rating: vendor.rating,
      notes: vendor.notes || "",
    } : undefined,
  });

  const onSubmit = async (data: VendorFormData) => {
    try {
      if (isEdit) {
        await updateVendor.mutateAsync({ id, ...data });
        navigate(`/app/inventory/vendors/${id}`);
      } else {
        const result = await createVendor.mutateAsync(data);
        navigate(`/app/inventory/vendors/${result.id}`);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isSubmitting = createVendor.isPending || updateVendor.isPending;

  if (isEdit && vendorLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Vendor" : "New Vendor"}
        description={isEdit ? `Editing ${vendor?.vendor_code}` : "Add a new vendor"}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Vendor Details</CardTitle>
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
                      <FormLabel>Vendor Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={isWarehouse ? "e.g., Global Logistics Co." : "e.g., ABC Pharmaceuticals"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendor_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isWarehouse ? (
                            <>
                              <SelectItem value="manufacturer">Manufacturer</SelectItem>
                              <SelectItem value="distributor">Distributor</SelectItem>
                              <SelectItem value="wholesaler">Wholesaler</SelectItem>
                              <SelectItem value="raw_materials">Raw Materials</SelectItem>
                              <SelectItem value="packaging">Packaging</SelectItem>
                              <SelectItem value="logistics">Logistics</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="pharmaceutical">Pharmaceutical</SelectItem>
                              <SelectItem value="equipment">Medical Equipment</SelectItem>
                              <SelectItem value="consumables">Consumables</SelectItem>
                              <SelectItem value="surgical">Surgical Supplies</SelectItem>
                              <SelectItem value="services">Services</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Primary contact name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} placeholder="vendor@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+92 300 1234567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Street address..." rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Karachi" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Net 15">Net 15</SelectItem>
                          <SelectItem value="Net 30">Net 30</SelectItem>
                          <SelectItem value="Net 45">Net 45</SelectItem>
                          <SelectItem value="Net 60">Net 60</SelectItem>
                          <SelectItem value="Advance">Advance Payment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Number (NTN/STRN)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Tax registration number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <Select value={String(field.value)} onValueChange={(v) => field.onChange(parseInt(v))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 - Poor</SelectItem>
                          <SelectItem value="2">2 - Below Average</SelectItem>
                          <SelectItem value="3">3 - Average</SelectItem>
                          <SelectItem value="4">4 - Good</SelectItem>
                          <SelectItem value="5">5 - Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_preferred"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-warning" />
                          Preferred Vendor
                        </FormLabel>
                        <FormDescription>
                          Mark this vendor as preferred for quick selection in purchase orders
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Additional notes..." rows={3} />
                      </FormControl>
                      <FormMessage />
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
                  {isEdit ? "Update Vendor" : "Create Vendor"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

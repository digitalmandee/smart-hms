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
import { usePaymentMethod, useCreatePaymentMethod, useUpdatePaymentMethod } from "@/hooks/useBilling";
import { Loader2, Banknote, CreditCard, Smartphone, Building2, Wallet } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").regex(/^[a-z_]+$/, "Code must be lowercase with underscores"),
  icon: z.string(),
  requires_reference: z.boolean(),
  sort_order: z.coerce.number().min(0),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const iconOptions = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "bank", label: "Bank", icon: Building2 },
  { value: "mobile", label: "Mobile", icon: Smartphone },
  { value: "wallet", label: "Wallet", icon: Wallet },
];

export default function PaymentMethodFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: paymentMethod, isLoading } = usePaymentMethod(id);
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      icon: "cash",
      requires_reference: false,
      sort_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (paymentMethod) {
      form.reset({
        name: paymentMethod.name,
        code: paymentMethod.code,
        icon: paymentMethod.icon || "cash",
        requires_reference: paymentMethod.requires_reference ?? false,
        sort_order: paymentMethod.sort_order || 0,
        is_active: paymentMethod.is_active ?? true,
      });
    }
  }, [paymentMethod, form]);

  const onSubmit = async (values: FormValues) => {
    if (isEditing && id) {
      await updateMutation.mutateAsync({ 
        id, 
        name: values.name,
        code: values.code,
        icon: values.icon,
        requires_reference: values.requires_reference,
        sort_order: values.sort_order,
        is_active: values.is_active,
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        code: values.code,
        icon: values.icon,
        requires_reference: values.requires_reference,
        sort_order: values.sort_order,
        is_active: values.is_active,
      });
    }
    navigate("/app/settings/payment-methods");
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
        title={isEditing ? "Edit Payment Method" : "New Payment Method"}
        description={isEditing ? "Update payment method configuration" : "Create a new payment option"}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Payment Method Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cash, Credit Card, JazzCash" {...field} />
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
                      <Input placeholder="e.g., cash, credit_card, jazzcash" {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Unique identifier, lowercase with underscores
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((option) => (
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
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Lower numbers appear first
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requires_reference"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel className="text-base">Requires Reference Number</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Enable for card payments, bank transfers, etc.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
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
                        Inactive methods won't appear in payment forms
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
                  {isEditing ? "Update Method" : "Create Method"}
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

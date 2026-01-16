import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountTypes, useCreateAccountType } from "@/hooks/useAccounts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const accountTypeSchema = z.object({
  code: z.string().min(1, "Code is required").max(20, "Code must be 20 characters or less"),
  name: z.string().min(1, "Name is required"),
  category: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  is_debit_normal: z.boolean().default(true),
  sort_order: z.coerce.number().min(0).default(100),
  parent_type_id: z.string().nullable().optional(),
});

type AccountTypeFormData = z.infer<typeof accountTypeSchema>;

export default function AccountTypeFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEditing = !!id;

  const { data: accountTypes, isLoading: typesLoading } = useAccountTypes();
  
  const { data: accountType, isLoading: typeLoading } = useQuery({
    queryKey: ["account-type", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("account_types")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const createAccountType = useCreateAccountType();

  const updateAccountType = useMutation({
    mutationFn: async (data: AccountTypeFormData) => {
      const { error } = await supabase
        .from("account_types")
        .update({
          code: data.code,
          name: data.name,
          category: data.category,
          is_debit_normal: data.is_debit_normal,
          sort_order: data.sort_order,
          parent_type_id: data.parent_type_id || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-types"] });
      queryClient.invalidateQueries({ queryKey: ["account-type", id] });
      toast.success("Account type updated successfully");
      navigate("/app/accounts/settings/types");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const form = useForm<AccountTypeFormData>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues: {
      code: "",
      name: "",
      category: "asset",
      is_debit_normal: true,
      sort_order: 100,
      parent_type_id: null,
    },
  });

  useEffect(() => {
    if (accountType) {
      form.reset({
        code: accountType.code,
        name: accountType.name,
        category: accountType.category as "asset" | "liability" | "equity" | "revenue" | "expense",
        is_debit_normal: accountType.is_debit_normal,
        sort_order: accountType.sort_order,
        parent_type_id: accountType.parent_type_id,
      });
    }
  }, [accountType, form]);

  // Auto-set normal balance based on category
  const category = form.watch("category");
  useEffect(() => {
    if (!isEditing) {
      const isDebitNormal = ["asset", "expense"].includes(category);
      form.setValue("is_debit_normal", isDebitNormal);
    }
  }, [category, form, isEditing]);

  const onSubmit = async (data: AccountTypeFormData) => {
    if (isEditing) {
      updateAccountType.mutate(data);
    } else {
      try {
        await createAccountType.mutateAsync({
          code: data.code,
          name: data.name,
          category: data.category,
          is_debit_normal: data.is_debit_normal,
          sort_order: data.sort_order,
          parent_type_id: data.parent_type_id || null,
          is_system: false,
        });
        navigate("/app/accounts/settings/types");
      } catch {
        // Error handled by mutation
      }
    }
  };

  if (typeLoading || typesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Filter parent types to same category
  const parentTypes = accountTypes?.filter(
    (t) => t.category === form.watch("category") && t.id !== id
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit Account Type" : "New Account Type"}
        description={isEditing ? "Update account type details" : "Add a new account type"}
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Settings", href: "/app/accounts/settings" },
          { label: "Account Types", href: "/app/accounts/settings/types" },
          { label: isEditing ? "Edit" : "New" },
        ]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Type Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., CASH_BANK"
                          {...field}
                          disabled={isEditing && accountType?.is_system}
                        />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for this type
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cash & Bank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isEditing && accountType?.is_system}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="asset">Assets</SelectItem>
                          <SelectItem value="liability">Liabilities</SelectItem>
                          <SelectItem value="equity">Equity</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="expense">Expenses</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parent_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Type</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None (Top Level)</SelectItem>
                          {parentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Optional parent for hierarchical organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_debit_normal"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Normal Balance</FormLabel>
                        <FormDescription>
                          {field.value ? "Debit (Assets, Expenses)" : "Credit (Liabilities, Equity, Revenue)"}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/accounts/settings/types")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAccountType.isPending || updateAccountType.isPending}
            >
              {createAccountType.isPending || updateAccountType.isPending
                ? "Saving..."
                : isEditing
                ? "Update Type"
                : "Create Type"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

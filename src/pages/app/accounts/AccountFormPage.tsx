import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { AccountPicker } from "@/components/accounts/AccountPicker";
import {
  useAccount,
  useAccountTypes,
  useCreateAccount,
  useUpdateAccount,
} from "@/hooks/useAccounts";
import { useBranches } from "@/hooks/useBranches";
import { Skeleton } from "@/components/ui/skeleton";

const accountSchema = z.object({
  account_number: z.string().min(1, "Account number is required"),
  name: z.string().min(1, "Account name is required"),
  account_type_id: z.string().min(1, "Account type is required"),
  parent_account_id: z.string().nullable().optional(),
  branch_id: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  opening_balance: z.coerce.number().default(0),
  opening_balance_date: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  account_level: z.coerce.number().min(1).max(4).default(4),
  is_header: z.boolean().default(false),
});

type AccountFormData = z.infer<typeof accountSchema>;

export default function AccountFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { data: account, isLoading: accountLoading } = useAccount(id);
  const { data: accountTypes, isLoading: typesLoading } = useAccountTypes();
  const { data: branches } = useBranches();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      account_number: "",
      name: "",
      account_type_id: "",
      parent_account_id: null,
      branch_id: null,
      description: "",
      opening_balance: 0,
      opening_balance_date: null,
      is_active: true,
      account_level: 4,
      is_header: false,
    },
  });

  useEffect(() => {
    if (account) {
      form.reset({
        account_number: account.account_number,
        name: account.name,
        account_type_id: account.account_type_id,
        parent_account_id: account.parent_account_id,
        branch_id: account.branch_id,
        description: account.description,
        opening_balance: account.opening_balance,
        opening_balance_date: account.opening_balance_date,
        is_active: account.is_active,
        account_level: account.account_level ?? 4,
        is_header: account.is_header ?? false,
      });
    }
  }, [account, form]);

  const onSubmit = async (data: AccountFormData) => {
    try {
      if (isEditing && id) {
        await updateAccount.mutateAsync({ id, ...data });
      } else {
        await createAccount.mutateAsync({
          account_number: data.account_number,
          name: data.name,
          account_type_id: data.account_type_id,
          parent_account_id: data.parent_account_id ?? null,
          branch_id: data.branch_id ?? null,
          description: data.description ?? null,
          opening_balance: data.opening_balance,
          opening_balance_date: data.opening_balance_date ?? null,
          is_active: data.is_active,
          account_level: data.account_level,
          is_header: data.is_header,
        });
      }
      navigate("/app/accounts/chart-of-accounts");
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (accountLoading || typesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Group account types by category
  const groupedTypes = accountTypes?.reduce((groups, type) => {
    if (!groups[type.category]) {
      groups[type.category] = [];
    }
    groups[type.category].push(type);
    return groups;
  }, {} as Record<string, typeof accountTypes>) || {};

  const categoryLabels: Record<string, string> = {
    asset: "Assets",
    liability: "Liabilities",
    equity: "Equity",
    revenue: "Revenue",
    expense: "Expenses",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit Account" : "New Account"}
        description={isEditing ? "Update account details" : "Add a new account to your chart of accounts"}
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Chart of Accounts", href: "/app/accounts/chart-of-accounts" },
          { label: isEditing ? "Edit" : "New" },
        ]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 1100"
                          {...field}
                          disabled={isEditing && account?.is_system}
                        />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for this account
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
                      <FormLabel>Account Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cash on Hand" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="account_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isEditing && account?.is_system}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(groupedTypes).map(([category, types]) => (
                            <div key={category}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                                {categoryLabels[category]}
                              </div>
                              {types?.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parent_account_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Account</FormLabel>
                      <FormControl>
                        <AccountPicker
                          value={field.value || undefined}
                          onChange={(id) => field.onChange(id || null)}
                          placeholder="Select parent account (optional)"
                          excludeIds={id ? [id] : []}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for top-level accounts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="branch_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === "all" ? null : v)}
                        value={field.value || "all"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Branches (HQ Level)</SelectItem>
                          {branches?.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Leave as "All Branches" for organization-wide accounts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Inactive accounts won't appear in selections
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={account?.is_system}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="account_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Level</FormLabel>
                      <Select
                        onValueChange={(v) => {
                          const level = Number(v);
                          field.onChange(level);
                          if (level <= 3) form.setValue("is_header", true);
                          else form.setValue("is_header", false);
                        }}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Level 1 - Category Header</SelectItem>
                          <SelectItem value="2">Level 2 - Sub-group</SelectItem>
                          <SelectItem value="3">Level 3 - Control Account</SelectItem>
                          <SelectItem value="4">Level 4 - Detail / Posting</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Levels 1-3 are headers; Level 4 accepts journal entries
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_header"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Header Account</FormLabel>
                        <FormDescription>
                          Header accounts group sub-accounts and cannot receive journal entries
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this account's purpose..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opening Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="opening_balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Balance</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Balance when starting to use this account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="opening_balance_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Balance Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
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
              onClick={() => navigate("/app/accounts/chart-of-accounts")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAccount.isPending || updateAccount.isPending}
            >
              {createAccount.isPending || updateAccount.isPending
                ? "Saving..."
                : isEditing
                ? "Update Account"
                : "Create Account"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { useBranch, useCreateBranch, useUpdateBranch } from "@/hooks/useBranches";
import { useOrganizationDefaults } from "@/hooks/useOrganizationDefaults";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkingHoursEditor } from "@/components/settings/WorkingHoursEditor";
import { ReceiptSettingsEditor } from "@/components/settings/ReceiptSettingsEditor";

const branchSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").regex(/^[A-Z0-9-]+$/, "Code must be uppercase letters, numbers, and hyphens only"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  is_active: z.boolean(),
  is_main_branch: z.boolean(),
});

type BranchFormData = z.infer<typeof branchSchema>;

const TIMEZONES = [
  { value: "Asia/Karachi", label: "Pakistan (PKT, UTC+5)" },
  { value: "Asia/Dubai", label: "Dubai (GST, UTC+4)" },
  { value: "Asia/Riyadh", label: "Saudi Arabia (AST, UTC+3)" },
  { value: "Asia/Kolkata", label: "India (IST, UTC+5:30)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
];

export function BranchFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isEditing = !!id;

  const { data: branch, isLoading: branchLoading } = useBranch(id);
  const { data: orgDefaults } = useOrganizationDefaults();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  // Branch-specific overrides
  const [useOrgTaxRate, setUseOrgTaxRate] = useState(true);
  const [taxRate, setTaxRate] = useState("");
  const [useOrgReceipt, setUseOrgReceipt] = useState(true);
  const [receiptHeader, setReceiptHeader] = useState("");
  const [receiptFooter, setReceiptFooter] = useState("");
  const [useOrgHours, setUseOrgHours] = useState(true);
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("20:00");
  const [timezone, setTimezone] = useState("Asia/Karachi");

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "",
      code: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      is_active: true,
      is_main_branch: false,
    },
  });

  useEffect(() => {
    if (branch) {
      form.reset({
        name: branch.name,
        code: branch.code,
        email: branch.email || "",
        phone: branch.phone || "",
        address: branch.address || "",
        city: branch.city || "",
        is_active: branch.is_active ?? true,
        is_main_branch: branch.is_main_branch ?? false,
      });

      // Load branch overrides
      const branchAny = branch as any;
      setUseOrgTaxRate(branchAny.tax_rate == null);
      setTaxRate(branchAny.tax_rate?.toString() || "");
      setUseOrgReceipt(branchAny.receipt_header == null && branchAny.receipt_footer == null);
      setReceiptHeader(branchAny.receipt_header || "");
      setReceiptFooter(branchAny.receipt_footer || "");
      setUseOrgHours(branchAny.working_hours_start == null && branchAny.working_days == null);
      setWorkingDays(branchAny.working_days || []);
      setStartTime(branchAny.working_hours_start || "08:00");
      setEndTime(branchAny.working_hours_end || "20:00");
      setTimezone(branchAny.timezone || "Asia/Karachi");
    }
  }, [branch, form]);

  const generateCode = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 10);
  };

  const onSubmit = async (data: BranchFormData) => {
    if (!profile?.organization_id) return;

    const branchData: any = {
      name: data.name,
      code: data.code,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      is_active: data.is_active,
      is_main_branch: data.is_main_branch,
      // Override fields
      tax_rate: useOrgTaxRate ? null : (parseFloat(taxRate) || null),
      receipt_header: useOrgReceipt ? null : (receiptHeader || null),
      receipt_footer: useOrgReceipt ? null : (receiptFooter || null),
      working_hours_start: useOrgHours ? null : (startTime || null),
      working_hours_end: useOrgHours ? null : (endTime || null),
      working_days: useOrgHours ? null : (workingDays.length > 0 ? workingDays : null),
      timezone: timezone,
    };

    try {
      if (isEditing && id) {
        await updateBranch.mutateAsync({ id, data: branchData });
      } else {
        await createBranch.mutateAsync({
          ...branchData,
          organization_id: profile.organization_id,
        });
      }
      navigate("/app/settings/branches");
    } catch (error) {
      // Error handled by hooks
    }
  };

  if (isEditing && branchLoading) {
    return (
      <div>
        <PageHeader
          title="Edit Branch"
          breadcrumbs={[
            { label: "Settings", href: "/app/settings" },
            { label: "Branches", href: "/app/settings/branches" },
            { label: "Edit" },
          ]}
        />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPending = createBranch.isPending || updateBranch.isPending;

  return (
    <div>
      <PageHeader
        title={isEditing ? "Edit Branch" : "Create Branch"}
        description={isEditing ? "Update branch information" : "Add a new branch to your organization"}
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Branches", href: "/app/settings/branches" },
          { label: isEditing ? "Edit" : "Create" },
        ]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branch Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Main Hospital"
                          onChange={(e) => {
                            field.onChange(e);
                            if (!isEditing && !form.getValues("code")) {
                              form.setValue("code", generateCode(e.target.value));
                            }
                          }}
                        />
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
                      <FormLabel>Branch Code *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="MAIN-HQ" />
                      </FormControl>
                      <FormDescription>Unique identifier for this branch</FormDescription>
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
                        <Input {...field} type="email" placeholder="branch@hospital.com" />
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
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="123 Medical Street" />
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
                      <Input {...field} placeholder="Lahore" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>This branch is operational</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_main_branch"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Main Branch</FormLabel>
                        <FormDescription>Mark as headquarters</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Branch-Specific Settings
              </CardTitle>
              <CardDescription>
                Override organization defaults for this branch. Leave unchecked to use organization defaults.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tax Rate Override */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use-org-tax"
                    checked={useOrgTaxRate}
                    onCheckedChange={(checked) => setUseOrgTaxRate(!!checked)}
                  />
                  <Label htmlFor="use-org-tax" className="text-sm font-medium cursor-pointer">
                    Use organization default tax rate ({orgDefaults?.default_tax_rate || 17}%)
                  </Label>
                </div>
                {!useOrgTaxRate && (
                  <div className="ml-6 space-y-2">
                    <Label>Branch Tax Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      placeholder="Enter branch-specific tax rate"
                    />
                  </div>
                )}
              </div>

              {/* Receipt Override */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use-org-receipt"
                    checked={useOrgReceipt}
                    onCheckedChange={(checked) => setUseOrgReceipt(!!checked)}
                  />
                  <Label htmlFor="use-org-receipt" className="text-sm font-medium cursor-pointer">
                    Use organization default receipt header/footer
                  </Label>
                </div>
                {!useOrgReceipt && (
                  <div className="ml-6">
                    <ReceiptSettingsEditor
                      header={receiptHeader}
                      footer={receiptFooter}
                      onHeaderChange={setReceiptHeader}
                      onFooterChange={setReceiptFooter}
                    />
                  </div>
                )}
              </div>

              {/* Working Hours Override */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use-org-hours"
                    checked={useOrgHours}
                    onCheckedChange={(checked) => setUseOrgHours(!!checked)}
                  />
                  <Label htmlFor="use-org-hours" className="text-sm font-medium cursor-pointer">
                    Use organization default working hours
                    {orgDefaults?.working_hours_start && (
                      <span className="text-muted-foreground ml-1">
                        ({orgDefaults.working_hours_start} - {orgDefaults.working_hours_end})
                      </span>
                    )}
                  </Label>
                </div>
                {!useOrgHours && (
                  <div className="ml-6">
                    <WorkingHoursEditor
                      workingDays={workingDays}
                      startTime={startTime}
                      endTime={endTime}
                      onWorkingDaysChange={setWorkingDays}
                      onStartTimeChange={setStartTime}
                      onEndTimeChange={setEndTime}
                    />
                  </div>
                )}
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/settings/branches")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Branch"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

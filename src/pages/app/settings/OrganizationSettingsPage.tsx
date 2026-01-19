import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization, useUpdateOrganization } from "@/hooks/useOrganizations";
import { useOrganizationDefaults, useUpdateOrganizationDefaults } from "@/hooks/useOrganizationDefaults";
import { Loader2, Building2, Settings2, Receipt, Clock, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { WorkingHoursEditor } from "@/components/settings/WorkingHoursEditor";
import { ReceiptSettingsEditor } from "@/components/settings/ReceiptSettingsEditor";

const orgSettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  tax_number: z.string().optional(),
});

type OrgSettingsFormData = z.infer<typeof orgSettingsSchema>;

export function OrganizationSettingsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: org, isLoading } = useOrganization(profile?.organization_id || undefined);
  const { data: defaults, isLoading: defaultsLoading } = useOrganizationDefaults();
  const updateOrg = useUpdateOrganization();
  const updateDefaults = useUpdateOrganizationDefaults();

  // Local state for organization defaults
  const [taxRate, setTaxRate] = useState<string>("17");
  const [receiptHeader, setReceiptHeader] = useState("");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for visiting!");
  const [workingDays, setWorkingDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("20:00");

  const form = useForm<OrgSettingsFormData>({
    resolver: zodResolver(orgSettingsSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      website: "",
      tax_number: "",
    },
  });

  useEffect(() => {
    if (org) {
      form.reset({
        name: org.name,
        email: org.email || "",
        phone: org.phone || "",
        address: org.address || "",
        city: org.city || "",
        country: org.country || "",
        website: org.website || "",
        tax_number: org.tax_number || "",
      });
    }
  }, [org, form]);

  useEffect(() => {
    if (defaults) {
      setTaxRate(defaults.default_tax_rate?.toString() || "17");
      setReceiptHeader(defaults.receipt_header || "");
      setReceiptFooter(defaults.receipt_footer || "Thank you for visiting!");
      setWorkingDays(defaults.working_days || ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]);
      setStartTime(defaults.working_hours_start || "08:00");
      setEndTime(defaults.working_hours_end || "20:00");
    }
  }, [defaults]);

  const onSubmit = async (data: OrgSettingsFormData) => {
    if (!profile?.organization_id) return;

    try {
      await updateOrg.mutateAsync({
        id: profile.organization_id,
        data: {
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          city: data.city || null,
          country: data.country || null,
          website: data.website || null,
          tax_number: data.tax_number || null,
        },
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleSaveDefaults = async () => {
    try {
      await updateDefaults.mutateAsync({
        default_tax_rate: parseFloat(taxRate) || 17,
        receipt_header: receiptHeader || null,
        receipt_footer: receiptFooter || null,
        working_hours_start: startTime || null,
        working_hours_end: endTime || null,
        working_days: workingDays.length > 0 ? workingDays : null,
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading || defaultsLoading) {
    return (
      <div>
        <PageHeader
          title="Organization Settings"
          breadcrumbs={[
            { label: "Settings", href: "/app/settings" },
            { label: "Organization" },
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

  if (!org) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Organization not found</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Organization Settings"
        description="Manage your organization's profile and settings"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Organization" },
        ]}
      />

      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Profile
                </CardTitle>
                <CardDescription>
                  Basic information about your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Slug</label>
                    <Input value={org.slug} disabled />
                    <p className="text-xs text-muted-foreground">Slug cannot be changed</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="contact@hospital.com" />
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
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://hospital.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Number / NTN</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1234567-8" />
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

                <div className="grid gap-4 md:grid-cols-2">
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

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Pakistan" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={updateOrg.isPending}>
                    {updateOrg.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Facility Configuration
            </CardTitle>
            <CardDescription>
              These settings are configured by Super Admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground">Facility Type</p>
                <p className="text-lg font-semibold capitalize mt-1">
                  {((org as any).facility_type || "hospital").replace("_", " ")}
                </p>
                <Badge variant="outline" className="mt-2">
                  {(org as any).facility_type === "hospital" ? "Full Modules" : "Limited Modules"}
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground">Billing Workflow</p>
                <p className="text-lg font-semibold capitalize mt-1">
                  {((org as any).billing_workflow || "post_visit").replace("_", " ")}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {(org as any).billing_workflow === "pre_visit" 
                    ? "Payment required before consultation"
                    : "Payment collected after services"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Billing & Tax Settings
            </CardTitle>
            <CardDescription>
              Default tax rate applied to all invoices unless branch specifies otherwise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Tax Rate (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="17.00"
                />
                <p className="text-xs text-muted-foreground">
                  Pakistan GST standard rate is 17%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Receipt Customization
            </CardTitle>
            <CardDescription>
              Customize headers and footers for receipts and invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReceiptSettingsEditor
              header={receiptHeader}
              footer={receiptFooter}
              onHeaderChange={setReceiptHeader}
              onFooterChange={setReceiptFooter}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Operating Hours
            </CardTitle>
            <CardDescription>
              Default working hours for all branches. Branches can override these settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkingHoursEditor
              workingDays={workingDays}
              startTime={startTime}
              endTime={endTime}
              onWorkingDaysChange={setWorkingDays}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveDefaults} disabled={updateDefaults.isPending}>
            {updateDefaults.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Default Settings
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Your current subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium capitalize">{org.subscription_plan || "Basic"} Plan</p>
                <p className="text-sm text-muted-foreground capitalize">
                  Status: {org.subscription_status || "Trial"}
                </p>
              </div>
              <Button variant="outline" disabled>
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

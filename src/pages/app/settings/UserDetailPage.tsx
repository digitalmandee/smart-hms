import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useUser, useUpdateUser } from "@/hooks/useUsers";
import { useBranches } from "@/hooks/useBranches";
import { Loader2, User, Shield, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/integrations/supabase/types";
import { StatusBadge } from "@/components/StatusBadge";

type AppRole = Database["public"]["Enums"]["app_role"];

const ALL_ROLES: { value: AppRole; label: string; description: string }[] = [
  { value: "super_admin", label: "Super Admin", description: "Platform-wide access to all organizations" },
  { value: "org_admin", label: "Organization Admin", description: "Full access to organization settings" },
  { value: "branch_admin", label: "Branch Admin", description: "Manage branch operations" },
  { value: "doctor", label: "Doctor", description: "Consultations and prescriptions" },
  { value: "nurse", label: "Nurse", description: "OPD patient vitals and assistance" },
  { value: "ipd_nurse", label: "IPD Nurse", description: "Inpatient ward nursing care" },
  { value: "receptionist", label: "Receptionist", description: "Appointments and patient registration" },
  { value: "pharmacist", label: "Pharmacist", description: "Pharmacy and medicine dispensing" },
  { value: "lab_technician", label: "Lab Technician", description: "Laboratory tests and results" },
  { value: "radiologist", label: "Radiologist", description: "Radiology interpretation and reporting" },
  { value: "radiology_technician", label: "Radiology Tech", description: "Imaging procedures and capture" },
  { value: "blood_bank_technician", label: "Blood Bank Tech", description: "Blood services and transfusions" },
  { value: "accountant", label: "Accountant", description: "Billing and financial reports" },
  { value: "finance_manager", label: "Finance Manager", description: "Financial oversight and approvals" },
  { value: "hr_manager", label: "HR Manager", description: "Staff management and payroll" },
  { value: "hr_officer", label: "HR Officer", description: "HR operations and attendance" },
  { value: "store_manager", label: "Store Manager", description: "Inventory management" },
];

const userSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  branch_id: z.string().optional(),
  is_active: z.boolean(),
  roles: z.array(z.string()).min(1, "At least one role is required"),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user, isLoading: userLoading } = useUser(id);
  const { data: branches } = useBranches();
  const updateUser = useUpdateUser();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      branch_id: "",
      is_active: true,
      roles: [],
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name,
        email: user.email || "",
        phone: user.phone || "",
        branch_id: user.branch_id || "",
        is_active: user.is_active ?? true,
        roles: user.roles,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UserFormData) => {
    if (!id) return;

    try {
      await updateUser.mutateAsync({
        id,
        data: {
          full_name: data.full_name,
          email: data.email || null,
          phone: data.phone || null,
          branch_id: data.branch_id || null,
          is_active: data.is_active,
        },
        roles: data.roles as AppRole[],
      });
      navigate("/app/settings/users");
    } catch (error) {
      // Error handled by hook
    }
  };

  if (userLoading) {
    return (
      <div>
        <PageHeader
          title="Edit User"
          breadcrumbs={[
            { label: "Settings", href: "/app/settings" },
            { label: "Users", href: "/app/settings/users" },
            { label: "Edit" },
          ]}
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit User"
        description={user.full_name}
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Users", href: "/app/settings/users" },
          { label: user.full_name },
        ]}
        actions={
          <StatusBadge status={user.is_active ? "active" : "inactive"} />
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} type="email" disabled />
                          </FormControl>
                          <FormDescription>Email cannot be changed</FormDescription>
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="branch_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No specific branch</SelectItem>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>User can access the system</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Roles
                  </CardTitle>
                  <CardDescription>
                    Assign roles to determine what this user can access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="roles"
                    render={() => (
                      <FormItem>
                        <div className="grid gap-3 md:grid-cols-2">
                          {ALL_ROLES.map((role) => (
                            <FormField
                              key={role.value}
                              control={form.control}
                              name="roles"
                              render={({ field }) => (
                                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(role.value)}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked
                                          ? [...(field.value || []), role.value]
                                          : field.value?.filter((r) => r !== role.value) || [];
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="font-medium cursor-pointer">
                                      {role.label}
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                      {role.description}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">User ID</p>
                      <p className="font-mono text-xs">{user.id.slice(0, 8)}...</p>
                    </div>
                  </div>

                  {user.branch_id && branches && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-info/10">
                        <Building2 className="h-4 w-4 text-info" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current Branch</p>
                        <p className="font-medium text-sm">
                          {branches.find((b) => b.id === user.branch_id)?.name || "-"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/settings/users")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

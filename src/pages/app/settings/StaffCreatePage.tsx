import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { useAuth } from "@/contexts/AuthContext";
import { useBranches } from "@/hooks/useBranches";
import { useDepartments, useDesignations, useEmployeeCategories, useShifts } from "@/hooks/useHR";
import { useSpecializations } from "@/hooks/useConfiguration";
import { useCreateStaffUser, generateRandomPassword } from "@/hooks/useStaffManagement";
import { ROLE_CATEGORIES, CLINICAL_ROLES, NURSING_ROLES, AppRole } from "@/constants/roles";
import { Loader2, ChevronDown, ChevronRight, User, Shield, Briefcase, Stethoscope, Eye, EyeOff, RefreshCw } from "lucide-react";

const staffSchema = z.object({
  // Account
  create_login: z.boolean().default(true),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  
  // Personal
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  
  // Assignment
  branch_id: z.string().optional(),
  department_id: z.string().optional(),
  designation_id: z.string().optional(),
  category_id: z.string().optional(),
  shift_id: z.string().optional(),
  join_date: z.string().optional(),
  
  // Roles
  roles: z.array(z.string()).min(1, "At least one role is required"),
  
  // Clinical
  specialization_id: z.string().optional(),
  qualification: z.string().optional(),
  license_number: z.string().optional(),
  consultation_fee: z.number().optional(),
  
  // Nursing
  nurse_specialization: z.string().optional(),
  nurse_qualification: z.string().optional(),
  nurse_license_number: z.string().optional(),
}).refine(
  (data) => {
    if (data.create_login) {
      return !!data.email && !!data.password;
    }
    return true;
  },
  {
    message: "Email and password are required when creating a login account",
    path: ["email"],
  }
);

type StaffFormData = z.infer<typeof staffSchema>;

export default function StaffCreatePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const createStaff = useCreateStaffUser();
  
  const { data: branches } = useBranches();
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const { data: categories } = useEmployeeCategories();
  const { data: shifts } = useShifts();
  const { data: specializations } = useSpecializations();
  
  const [showPassword, setShowPassword] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["clinical", "nursing", "pharmacy"]);

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      create_login: true,
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      gender: "",
      date_of_birth: "",
      branch_id: "",
      department_id: "",
      designation_id: "",
      category_id: "",
      shift_id: "",
      join_date: new Date().toISOString().slice(0, 10),
      roles: [],
      specialization_id: "",
      qualification: "",
      license_number: "",
      consultation_fee: undefined,
      nurse_specialization: "",
      nurse_qualification: "",
      nurse_license_number: "",
    },
  });

  const watchCreateLogin = form.watch("create_login");
  const watchRoles = form.watch("roles") || [];
  
  const hasClinicalRole = watchRoles.some(r => CLINICAL_ROLES.includes(r as AppRole));
  const hasNursingRole = watchRoles.some(r => NURSING_ROLES.includes(r as AppRole));

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleGeneratePassword = () => {
    const password = generateRandomPassword(12);
    form.setValue("password", password);
  };

  const onSubmit = async (data: StaffFormData) => {
    if (!profile?.organization_id) return;

    try {
      await createStaff.mutateAsync({
        email: data.create_login ? data.email : undefined,
        password: data.create_login ? data.password : undefined,
        first_name: data.first_name,
        last_name: data.last_name || undefined,
        phone: data.phone || undefined,
        gender: data.gender || undefined,
        date_of_birth: data.date_of_birth || undefined,
        organization_id: profile.organization_id,
        branch_id: data.branch_id || undefined,
        department_id: data.department_id || undefined,
        designation_id: data.designation_id || undefined,
        category_id: data.category_id || undefined,
        shift_id: data.shift_id || undefined,
        join_date: data.join_date || undefined,
        roles: data.roles as AppRole[],
        specialization_id: data.specialization_id || undefined,
        qualification: data.qualification || undefined,
        license_number: data.license_number || undefined,
        consultation_fee: data.consultation_fee,
        nurse_specialization: data.nurse_specialization || undefined,
        nurse_qualification: data.nurse_qualification || undefined,
        nurse_license_number: data.nurse_license_number || undefined,
      });
      navigate("/app/settings/users");
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Staff Member"
        description="Add a new staff member with optional login account"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Users", href: "/app/settings/users" },
          { label: "New Staff" },
        ]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <CardTitle>Account Details</CardTitle>
                    </div>
                    <FormField
                      control={form.control}
                      name="create_login"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormLabel className="text-sm">Create Login</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <CardDescription>
                    {watchCreateLogin
                      ? "Staff member will be able to log in with email and password"
                      : "Employee record only (no system access)"}
                  </CardDescription>
                </CardHeader>

                {watchCreateLogin && (
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="staff@hospital.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <div className="relative flex-1">
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min 8 characters"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleGeneratePassword}
                                title="Generate random password"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
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
                      name="department_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments?.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
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
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                      name="designation_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select designation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {designations?.map((des) => (
                                <SelectItem key={des.id} value={des.id}>
                                  {des.name}
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
                      name="shift_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shift</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select shift" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {shifts?.map((shift) => (
                                <SelectItem key={shift.id} value={shift.id}>
                                  {shift.name}
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
                      name="join_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Join Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Roles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Roles & Permissions
                  </CardTitle>
                  <CardDescription>
                    Select roles to determine system access and menu visibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="roles"
                    render={() => (
                      <FormItem>
                        <div className="space-y-3">
                          {Object.entries(ROLE_CATEGORIES).map(([key, category]) => (
                            <Collapsible
                              key={key}
                              open={expandedCategories.includes(key)}
                              onOpenChange={() => toggleCategory(key)}
                            >
                              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline">
                                {expandedCategories.includes(key) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                {category.label}
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2">
                                <div className="grid gap-2 md:grid-cols-2 pl-6">
                                  {category.roles.map((role) => (
                                    <FormField
                                      key={role.value}
                                      control={form.control}
                                      name="roles"
                                      render={({ field }) => (
                                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-3">
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
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Clinical Details - Show for doctor/surgeon/anesthetist */}
              {hasClinicalRole && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Clinical Details
                    </CardTitle>
                    <CardDescription>
                      Additional information for clinical staff
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="specialization_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialization</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select specialization" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {specializations?.map((spec) => (
                                  <SelectItem key={spec.id} value={spec.id}>
                                    {spec.name}
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
                        name="qualification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qualification</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="MBBS, FCPS, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="license_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="PMC-XXXXX" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="consultation_fee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Consultation Fee</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="0"
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Nursing Details - Show for nurse roles */}
              {hasNursingRole && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Nursing Details
                    </CardTitle>
                    <CardDescription>
                      Additional information for nursing staff
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="nurse_specialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nursing Specialization</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="ICU, Emergency, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nurse_qualification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nursing Qualification</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="BSN, RN, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nurse_license_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nursing License Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="PNC-XXXXX" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Account Type</p>
                    <p className="font-medium">
                      {watchCreateLogin ? "Login Account + Employee" : "Employee Only"}
                    </p>
                  </div>
                  
                  {watchRoles.length > 0 && (
                    <div>
                      <p className="text-muted-foreground">Selected Roles</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {watchRoles.map((role) => (
                          <span
                            key={role}
                            className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                          >
                            {role.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasClinicalRole && (
                    <div className="text-info text-xs">
                      ✓ Doctor record will be created
                    </div>
                  )}

                  {hasNursingRole && (
                    <div className="text-info text-xs">
                      ✓ Nurse record will be created
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
            <Button type="submit" disabled={createStaff.isPending}>
              {createStaff.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Staff Member
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

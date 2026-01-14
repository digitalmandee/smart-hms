import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  useEmployee,
  useCreateEmployee,
  useUpdateEmployee,
  useDepartments,
  useDesignations,
  useEmployeeCategories,
  useShifts,
} from "@/hooks/useHR";
import { useBranches } from "@/hooks/useBranches";
import { Loader2, Save, ArrowLeft } from "lucide-react";

const employeeSchema = z.object({
  employee_number: z.string().min(1, "Employee number is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  date_of_birth: z.string().optional(),
  personal_phone: z.string().optional(),
  personal_email: z.string().email().optional().or(z.literal("")),
  national_id: z.string().optional(),
  current_address: z.string().optional(),
  permanent_address: z.string().optional(),
  branch_id: z.string().optional(),
  department_id: z.string().optional(),
  designation_id: z.string().optional(),
  category_id: z.string().optional(),
  shift_id: z.string().optional(),
  join_date: z.string().min(1, "Join date is required"),
  employee_type: z.enum(["permanent", "contractual", "probation", "intern", "consultant"]).optional(),
  employment_status: z.enum(["active", "on_leave", "suspended", "terminated", "resigned"]).optional(),
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  account_title: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
  notes: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: employee, isLoading: loadingEmployee } = useEmployee(id || "");
  const { data: branches } = useBranches();
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const { data: categories } = useEmployeeCategories();
  const { data: shifts } = useShifts();

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_number: "",
      first_name: "",
      last_name: "",
      join_date: new Date().toISOString().split("T")[0],
      employee_type: "permanent",
      employment_status: "active",
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        employee_number: employee.employee_number,
        first_name: employee.first_name,
        last_name: employee.last_name || "",
        gender: employee.gender as any,
        date_of_birth: employee.date_of_birth || "",
        personal_phone: employee.personal_phone || "",
        personal_email: employee.personal_email || "",
        national_id: employee.national_id || "",
        current_address: employee.current_address || "",
        permanent_address: employee.permanent_address || "",
        branch_id: employee.branch_id || "",
        department_id: employee.department_id || "",
        designation_id: employee.designation_id || "",
        category_id: employee.category_id || "",
        shift_id: employee.shift_id || "",
        join_date: employee.join_date,
        employee_type: employee.employee_type as any,
        employment_status: employee.employment_status as any,
        bank_name: employee.bank_name || "",
        account_number: employee.account_number || "",
        account_title: employee.account_title || "",
        emergency_contact_name: employee.emergency_contact_name || "",
        emergency_contact_phone: employee.emergency_contact_phone || "",
        emergency_contact_relation: employee.emergency_contact_relation || "",
        notes: employee.notes || "",
      });
    }
  }, [employee, form]);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      const payload = {
        ...data,
        personal_email: data.personal_email || null,
        branch_id: data.branch_id || null,
        department_id: data.department_id || null,
        designation_id: data.designation_id || null,
        category_id: data.category_id || null,
        shift_id: data.shift_id || null,
      };

      if (isEditing && id) {
        await updateEmployee.mutateAsync({ id, ...payload });
        toast({ title: "Employee updated successfully" });
      } else {
        await createEmployee.mutateAsync(payload);
        toast({ title: "Employee created successfully" });
      }
      navigate("/app/hr/employees");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save employee",
        variant: "destructive",
      });
    }
  };

  if (isEditing && loadingEmployee) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit Employee" : "Add New Employee"}
        description={isEditing ? "Update employee information" : "Register a new staff member"}
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Employees", href: "/app/hr/employees" },
          { label: isEditing ? "Edit" : "New" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/hr/employees")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="bank">Bank Details</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="employee_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="EMP001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
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
                          <Input placeholder="Doe" {...field} />
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

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="national_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National ID / CNIC</FormLabel>
                        <FormControl>
                          <Input placeholder="12345-1234567-1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="employment">
              <Card>
                <CardHeader>
                  <CardTitle>Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                            {designations?.map((desg) => (
                              <SelectItem key={desg.id} value={desg.id}>
                                {desg.name}
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
                        <FormLabel>Category</FormLabel>
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
                        <FormLabel>Join Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employee_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="permanent">Permanent</SelectItem>
                            <SelectItem value="contractual">Contractual</SelectItem>
                            <SelectItem value="probation">Probation</SelectItem>
                            <SelectItem value="intern">Intern</SelectItem>
                            <SelectItem value="consultant">Consultant</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employment_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on_leave">On Leave</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="terminated">Terminated</SelectItem>
                            <SelectItem value="resigned">Resigned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="personal_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+92 300 1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="personal_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="current_address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Current Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter current address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="permanent_address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Permanent Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter permanent address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bank">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="HBL, UBL, MCB..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Title</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emergency">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergency_contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+92 300 1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergency_contact_relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input placeholder="Spouse, Parent, Sibling..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/hr/employees")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEmployee.isPending || updateEmployee.isPending}
            >
              {(createEmployee.isPending || updateEmployee.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update Employee" : "Create Employee"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

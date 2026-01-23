import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Mail, UserPlus, Loader2 } from "lucide-react";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  branch_id: z.string().optional(),
  roles: z.array(z.string()).min(1, "Please select at least one role"),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const availableRoles = [
  { value: "branch_admin", label: "Branch Admin" },
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "ipd_nurse", label: "IPD Nurse" },
  { value: "receptionist", label: "Receptionist" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "lab_technician", label: "Lab Technician" },
  { value: "radiologist", label: "Radiologist" },
  { value: "radiology_technician", label: "Radiology Technician" },
  { value: "blood_bank_technician", label: "Blood Bank Technician" },
  { value: "ot_technician", label: "OT Technician" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "hr_officer", label: "HR Officer" },
  { value: "accountant", label: "Accountant" },
  { value: "store_manager", label: "Store Manager" },
];

export default function UserInvitePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", full_name: "", branch_id: "", roles: [] },
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase.from("branches").select("id, name, code").eq("organization_id", profile.organization_id).eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const onSubmit = async (values: InviteFormValues) => {
    setIsSubmitting(true);
    try {
      // For now, show a placeholder message - actual invitation system needs edge function
      toast({
        title: "Invitation Feature",
        description: `Invitation for ${values.email} would be sent. Full email integration coming soon.`,
      });
      navigate("/app/settings/users");
    } catch (error) {
      toast({ title: "Error", description: "Failed to send invitation.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold">Invite User</h1>
          <p className="text-muted-foreground">Send an invitation to add a new user</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />New User Invitation</CardTitle>
          <CardDescription>Fill in the details to invite a new user</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="user@example.com" className="pl-10" {...field} /></div></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="full_name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="branch_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to Branch (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a branch" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">No specific branch</SelectItem>
                      {branches.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name} ({branch.code})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="roles" render={() => (
                <FormItem>
                  <FormLabel>Assign Roles</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {availableRoles.map((role) => (
                      <FormField key={role.value} control={form.control} name="roles" render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value?.includes(role.value)} onCheckedChange={(checked) => field.onChange(checked ? [...field.value, role.value] : field.value.filter((r) => r !== role.value))} />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">{role.label}</FormLabel>
                        </FormItem>
                      )} />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send Invitation</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

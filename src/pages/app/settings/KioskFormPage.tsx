import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Monitor, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { useKiosk, useCreateKiosk, useUpdateKiosk, useDepartments, KioskFormData } from "@/hooks/useKiosks";
import { useBranches } from "@/hooks/useBranches";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  kiosk_type: z.enum(["opd", "ipd", "emergency"]),
  branch_id: z.string().nullable().optional(),
  departments: z.array(z.string()),
  is_active: z.boolean(),
  auto_print: z.boolean(),
  show_estimated_wait: z.boolean(),
  display_message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function KioskFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: kiosk, isLoading: isLoadingKiosk } = useKiosk(id);
  const { data: branches } = useBranches();
  const { data: departments } = useDepartments();
  const createKiosk = useCreateKiosk();
  const updateKiosk = useUpdateKiosk();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      kiosk_type: "opd",
      branch_id: null,
      departments: [],
      is_active: true,
      auto_print: true,
      show_estimated_wait: true,
      display_message: "",
    },
  });

  useEffect(() => {
    if (kiosk) {
      form.reset({
        name: kiosk.name,
        kiosk_type: kiosk.kiosk_type,
        branch_id: kiosk.branch_id,
        departments: kiosk.departments || [],
        is_active: kiosk.is_active,
        auto_print: kiosk.auto_print,
        show_estimated_wait: kiosk.show_estimated_wait,
        display_message: kiosk.display_message || "",
      });
    }
  }, [kiosk, form]);

  const onSubmit = async (values: FormValues) => {
    const data: KioskFormData = {
      name: values.name,
      kiosk_type: values.kiosk_type,
      branch_id: values.branch_id || null,
      departments: values.departments,
      is_active: values.is_active,
      auto_print: values.auto_print,
      show_estimated_wait: values.show_estimated_wait,
      display_message: values.display_message,
    };

    if (isEdit && id) {
      await updateKiosk.mutateAsync({ id, data });
    } else {
      await createKiosk.mutateAsync(data);
    }
    navigate("/app/settings/kiosks");
  };

  const isSubmitting = createKiosk.isPending || updateKiosk.isPending;

  if (isEdit && isLoadingKiosk) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading..." />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Kiosk" : "Create Kiosk"}
        description={isEdit ? "Update kiosk configuration" : "Set up a new self-service kiosk"}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/settings/kiosks")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Kiosk Details
              </CardTitle>
              <CardDescription>
                Basic information about the kiosk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kiosk Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., OPD Main Entrance" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name to identify this kiosk
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="kiosk_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kiosk Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="opd">OPD - Outpatient</SelectItem>
                          <SelectItem value="ipd">IPD - Inpatient</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Select
                        onValueChange={(val) => field.onChange(val === "all" ? null : val)}
                        value={field.value || "all"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Branches</SelectItem>
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
                name="display_message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Welcome! Please take a token for your appointment."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Custom message shown on the kiosk screen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>
                Select which departments/specializations should appear on this kiosk.
                Leave empty to show all.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="departments"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-2 md:grid-cols-3">
                      {departments?.map((dept) => (
                        <div key={dept} className="flex items-center space-x-2">
                          <Checkbox
                            id={dept}
                            checked={field.value?.includes(dept)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, dept]);
                              } else {
                                field.onChange(field.value.filter((d) => d !== dept));
                              }
                            }}
                          />
                          <label
                            htmlFor={dept}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {dept}
                          </label>
                        </div>
                      ))}
                    </div>
                    {(!departments || departments.length === 0) && (
                      <p className="text-sm text-muted-foreground">
                        No departments found. Add doctors with specializations first.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure kiosk behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Enable or disable this kiosk
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_print"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Auto Print Token</FormLabel>
                      <FormDescription>
                        Automatically print token slip when generated
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_estimated_wait"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Show Estimated Wait Time</FormLabel>
                      <FormDescription>
                        Display estimated waiting time on the token
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/settings/kiosks")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Kiosk" : "Create Kiosk"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

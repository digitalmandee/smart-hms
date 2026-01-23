import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Copy, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useQueueDisplay, 
  useCreateQueueDisplay, 
  useUpdateQueueDisplay 
} from "@/hooks/useQueueDisplays";
import { useDepartments } from "@/hooks/useKiosks";
import { useBranches } from "@/hooks/useBranches";
import { useKiosks } from "@/hooks/useKiosks";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  branch_id: z.string().optional(),
  display_type: z.enum(["opd", "ipd", "emergency", "combined"]),
  departments: z.array(z.string()).optional(),
  linked_kiosk_ids: z.array(z.string()).optional(),
  show_next_count: z.number().min(1).max(20),
  audio_enabled: z.boolean(),
  theme: z.enum(["light", "dark", "auto"]),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function QueueDisplayFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const { data: display, isLoading: displayLoading } = useQueueDisplay(id);
  const { data: branches } = useBranches();
  const { data: departments } = useDepartments();
  const { data: kiosks } = useKiosks();
  const createDisplay = useCreateQueueDisplay();
  const updateDisplay = useUpdateQueueDisplay();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      branch_id: "",
      display_type: "opd",
      departments: [],
      linked_kiosk_ids: [],
      show_next_count: 5,
      audio_enabled: true,
      theme: "light",
      is_active: true,
    },
  });

  useEffect(() => {
    if (display) {
      form.reset({
        name: display.name,
        branch_id: display.branch_id || "",
        display_type: display.display_type,
        departments: display.departments || [],
        linked_kiosk_ids: display.linked_kiosk_ids || [],
        show_next_count: display.show_next_count || 5,
        audio_enabled: display.audio_enabled ?? true,
        theme: display.theme || "light",
        is_active: display.is_active ?? true,
      });
    }
  }, [display, form]);

  const getDisplayUrl = () => {
    if (!id) return "";
    return `${window.location.origin}/display/${id}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "URL copied to clipboard",
    });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await updateDisplay.mutateAsync({ id, data: values });
      } else {
        await createDisplay.mutateAsync({
          name: values.name,
          display_type: values.display_type,
          branch_id: values.branch_id,
          departments: values.departments,
          linked_kiosk_ids: values.linked_kiosk_ids,
          show_next_count: values.show_next_count,
          audio_enabled: values.audio_enabled,
          theme: values.theme,
          is_active: values.is_active,
        });
      }
      navigate("/app/settings/queue-displays");
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isEdit && displayLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Queue Display" : "New Queue Display"}
        description={isEdit ? "Update display configuration" : "Create a new queue display for TV screens"}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/settings/queue-displays")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {isEdit && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="font-medium">Display URL: </span>
              <code className="text-sm bg-muted px-2 py-1 rounded">{getDisplayUrl()}</code>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(getDisplayUrl())}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(getDisplayUrl(), "_blank")}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Details</CardTitle>
              <CardDescription>Basic information about the queue display</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., OPD Main Waiting Area Display" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="display_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="opd">OPD</SelectItem>
                          <SelectItem value="ipd">IPD</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="combined">Combined</SelectItem>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All branches" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All branches</SelectItem>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Configure which tokens appear on this display</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="departments"
                render={() => (
                  <FormItem>
                    <FormLabel>Departments</FormLabel>
                    <FormDescription>
                      Select departments to filter. Leave empty to show all.
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {departments?.map((dept) => (
                        <FormField
                          key={dept}
                          control={form.control}
                          name="departments"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(dept)}
                                  onCheckedChange={(checked) => {
                                    const updated = checked
                                      ? [...(field.value || []), dept]
                                      : field.value?.filter((d) => d !== dept) || [];
                                    field.onChange(updated);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {dept}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linked_kiosk_ids"
                render={() => (
                  <FormItem>
                    <FormLabel>Linked Kiosks</FormLabel>
                    <FormDescription>
                      Only show tokens generated from these kiosks. Leave empty to show from all sources.
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {kiosks?.map((kiosk) => (
                        <FormField
                          key={kiosk.id}
                          control={form.control}
                          name="linked_kiosk_ids"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(kiosk.id)}
                                  onCheckedChange={(checked) => {
                                    const updated = checked
                                      ? [...(field.value || []), kiosk.id]
                                      : field.value?.filter((k) => k !== kiosk.id) || [];
                                    field.onChange(updated);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {kiosk.name}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Configure display behavior and appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="show_next_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Show Next Count</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={20} 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of upcoming tokens to display
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="audio_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel>Audio Announcements</FormLabel>
                      <FormDescription>
                        Play audio when a new token is called
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
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Enable or disable this display
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

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate("/app/settings/queue-displays")}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDisplay.isPending || updateDisplay.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? "Update Display" : "Create Display"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

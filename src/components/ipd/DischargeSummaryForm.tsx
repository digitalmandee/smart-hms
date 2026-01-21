import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateDischargeSummary, useUpdateDischargeSummary } from "@/hooks/useDischarge";
import { CalendarIcon, FileText, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const dischargeSummarySchema = z.object({
  admission_diagnosis: z.string().optional(),
  discharge_diagnosis: z.string().min(1, "Discharge diagnosis is required"),
  condition_at_admission: z.string().optional(),
  condition_at_discharge: z.string().min(1, "Condition at discharge is required"),
  hospital_course: z.string().optional(),
  significant_findings: z.string().optional(),
  follow_up_instructions: z.string().min(1, "Follow-up instructions are required"),
  follow_up_date: z.date().optional(),
  diet_instructions: z.string().optional(),
  activity_instructions: z.string().optional(),
  warning_signs: z.string().optional(),
  medications_on_discharge: z.string().optional(),
  medications_stopped: z.string().optional(),
});

type DischargeSummaryFormValues = z.infer<typeof dischargeSummarySchema>;

interface DischargeSummaryFormProps {
  admissionId: string;
  existingSummary?: any;
  onSuccess?: () => void;
}

export function DischargeSummaryForm({
  admissionId,
  existingSummary,
  onSuccess,
}: DischargeSummaryFormProps) {
  const { mutateAsync: createDischargeSummary, isPending: isCreating } = useCreateDischargeSummary();
  const { mutateAsync: updateDischargeSummary, isPending: isUpdating } = useUpdateDischargeSummary();

  const isEditing = Boolean(existingSummary);

  const form = useForm<DischargeSummaryFormValues>({
    resolver: zodResolver(dischargeSummarySchema),
    defaultValues: {
      admission_diagnosis: existingSummary?.admission_diagnosis || "",
      discharge_diagnosis: existingSummary?.discharge_diagnosis || "",
      condition_at_admission: existingSummary?.condition_at_admission || "",
      condition_at_discharge: existingSummary?.condition_at_discharge || "",
      hospital_course: existingSummary?.hospital_course || "",
      significant_findings: existingSummary?.significant_findings || "",
      follow_up_instructions: existingSummary?.follow_up_instructions || "",
      follow_up_date: existingSummary?.follow_up_appointments?.[0]?.date
        ? new Date(existingSummary.follow_up_appointments[0].date)
        : undefined,
      diet_instructions: existingSummary?.diet_instructions || "",
      activity_instructions: existingSummary?.activity_instructions || "",
      warning_signs: existingSummary?.warning_signs || "",
      medications_on_discharge: existingSummary?.medications_on_discharge
        ? JSON.stringify(existingSummary.medications_on_discharge)
        : "",
      medications_stopped: existingSummary?.medications_stopped
        ? JSON.stringify(existingSummary.medications_stopped)
        : "",
    },
  });

  const onSubmit = async (values: DischargeSummaryFormValues, status: string) => {
    try {
      const payload = {
        admission_id: admissionId,
        admission_diagnosis: values.admission_diagnosis,
        discharge_diagnosis: values.discharge_diagnosis,
        condition_at_admission: values.condition_at_admission,
        condition_at_discharge: values.condition_at_discharge,
        hospital_course: values.hospital_course,
        significant_findings: values.significant_findings,
        follow_up_instructions: values.follow_up_instructions,
        follow_up_appointments: values.follow_up_date
          ? [{ department: "OPD", date: format(values.follow_up_date, "yyyy-MM-dd") }]
          : undefined,
        diet_instructions: values.diet_instructions,
        activity_instructions: values.activity_instructions,
        warning_signs: values.warning_signs,
      };

      if (isEditing && existingSummary?.id) {
        await updateDischargeSummary({ id: existingSummary.id, ...payload, status });
        toast.success("Discharge summary updated");
      } else {
        await createDischargeSummary(payload);
        toast.success("Discharge summary created");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save discharge summary");
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="admission_diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admission Diagnosis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Diagnosis at time of admission..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discharge_diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discharge Diagnosis <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Final diagnosis at discharge..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition_at_admission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition at Admission</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Patient's condition when admitted..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition_at_discharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition at Discharge <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Patient's condition at discharge..."
                      className="min-h-[80px]"
                      {...field}
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
            <CardTitle>Hospital Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="hospital_course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course During Hospital Stay</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Summary of treatment and progress during stay..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="significant_findings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Significant Findings</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Key investigation results and findings..."
                      className="min-h-[100px]"
                      {...field}
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
            <CardTitle>Discharge Instructions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="follow_up_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up Instructions <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Follow-up care instructions..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="follow_up_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Follow-up Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diet_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diet Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dietary recommendations..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activity_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Activity level and restrictions..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warning_signs"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Warning Signs (When to Return)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Signs and symptoms that require immediate medical attention..."
                      className="min-h-[80px]"
                      {...field}
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
            <CardTitle>Medications</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="medications_on_discharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medications on Discharge</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List all medications to continue..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medications_stopped"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medications Stopped</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Medications that have been discontinued..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isCreating || isUpdating}
            onClick={form.handleSubmit((values) => onSubmit(values, "draft"))}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            type="button"
            disabled={isCreating || isUpdating}
            onClick={form.handleSubmit((values) => onSubmit(values, "pending_approval"))}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit for Approval
          </Button>
        </div>
      </form>
    </Form>
  );
}

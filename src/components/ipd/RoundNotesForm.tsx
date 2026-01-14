import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
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
import { Switch } from "@/components/ui/switch";
import { useDailyRounds } from "@/hooks/useDailyRounds";
import { Save } from "lucide-react";
import { toast } from "sonner";

const roundNotesSchema = z.object({
  round_date: z.string(),
  round_time: z.string(),
  condition_status: z.string().optional(),
  findings: z.string().optional(),
  diagnosis_update: z.string().optional(),
  instructions: z.string().optional(),
  diet_orders: z.string().optional(),
  activity_orders: z.string().optional(),
  critical_notes: z.string().optional(),
  medications_changed: z.boolean().default(false),
  notes: z.string().optional(),
});

type RoundNotesFormValues = z.infer<typeof roundNotesSchema>;

interface RoundNotesFormProps {
  admissionId: string;
  doctorId: string;
  onSuccess?: () => void;
}

const conditionStatuses = [
  { value: "stable", label: "Stable" },
  { value: "improving", label: "Improving" },
  { value: "unchanged", label: "Unchanged" },
  { value: "deteriorating", label: "Deteriorating" },
  { value: "critical", label: "Critical" },
  { value: "guarded", label: "Guarded" },
];

export function RoundNotesForm({ admissionId, doctorId, onSuccess }: RoundNotesFormProps) {
  const { createRound, isCreatingRound } = useDailyRounds(admissionId);

  const form = useForm<RoundNotesFormValues>({
    resolver: zodResolver(roundNotesSchema),
    defaultValues: {
      round_date: format(new Date(), "yyyy-MM-dd"),
      round_time: format(new Date(), "HH:mm"),
      condition_status: "stable",
      findings: "",
      diagnosis_update: "",
      instructions: "",
      diet_orders: "",
      activity_orders: "",
      critical_notes: "",
      medications_changed: false,
      notes: "",
    },
  });

  const onSubmit = async (values: RoundNotesFormValues) => {
    try {
      await createRound({
        admission_id: admissionId,
        doctor_id: doctorId,
        round_date: values.round_date,
        round_time: values.round_time,
        condition_status: values.condition_status || null,
        findings: values.findings || null,
        diagnosis_update: values.diagnosis_update || null,
        instructions: values.instructions || null,
        diet_orders: values.diet_orders || null,
        activity_orders: values.activity_orders || null,
        critical_notes: values.critical_notes || null,
        medications_changed: values.medications_changed,
        notes: values.notes || null,
      });
      toast.success("Round notes saved successfully");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save round notes");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Round Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="round_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="round_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Condition</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {conditionStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clinical Findings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="findings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Examination Findings</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Document physical examination findings..."
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
              name="diagnosis_update"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis Update</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any updates to diagnosis..."
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
              name="critical_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Critical Notes / Alerts</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any critical observations or alerts..."
                      className="min-h-[60px]"
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
            <CardTitle>Orders & Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Treatment plan and instructions..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="diet_orders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diet Orders</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Diet recommendations..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activity_orders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Orders</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Activity level and restrictions..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="medications_changed"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Medications Changed</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Were any medications added, removed, or modified?
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any other observations or notes..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isCreatingRound}>
            <Save className="h-4 w-4 mr-2" />
            Save Round Notes
          </Button>
        </div>
      </form>
    </Form>
  );
}

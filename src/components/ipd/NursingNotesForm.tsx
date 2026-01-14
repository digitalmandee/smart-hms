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
import { useNursingCare } from "@/hooks/useNursingCare";
import { FileText, Save } from "lucide-react";
import { toast } from "sonner";

const nursingNotesSchema = z.object({
  note_date: z.string(),
  note_time: z.string(),
  note_type: z.enum([
    "admission",
    "progress",
    "medication",
    "procedure",
    "assessment",
    "discharge",
    "handover",
  ]),
  shift: z.enum(["morning", "evening", "night"]).optional(),
  assessment: z.string().optional(),
  intervention: z.string().optional(),
  evaluation: z.string().optional(),
  patient_response: z.string().optional(),
  pain_assessment: z.string().optional(),
  fall_risk_score: z.coerce.number().min(0).max(10).optional(),
  notes: z.string().optional(),
});

type NursingNotesFormValues = z.infer<typeof nursingNotesSchema>;

interface NursingNotesFormProps {
  admissionId: string;
  onSuccess?: () => void;
}

const noteTypes = [
  { value: "admission", label: "Admission Note" },
  { value: "progress", label: "Progress Note" },
  { value: "medication", label: "Medication Note" },
  { value: "procedure", label: "Procedure Note" },
  { value: "assessment", label: "Assessment Note" },
  { value: "discharge", label: "Discharge Note" },
  { value: "handover", label: "Handover Note" },
];

const shifts = [
  { value: "morning", label: "Morning (6AM - 2PM)" },
  { value: "evening", label: "Evening (2PM - 10PM)" },
  { value: "night", label: "Night (10PM - 6AM)" },
];

export function NursingNotesForm({ admissionId, onSuccess }: NursingNotesFormProps) {
  const { addNursingNote, isAddingNote } = useNursingCare(admissionId);

  const form = useForm<NursingNotesFormValues>({
    resolver: zodResolver(nursingNotesSchema),
    defaultValues: {
      note_date: format(new Date(), "yyyy-MM-dd"),
      note_time: format(new Date(), "HH:mm"),
      note_type: "progress",
      shift: "morning",
      assessment: "",
      intervention: "",
      evaluation: "",
      patient_response: "",
      pain_assessment: "",
      fall_risk_score: undefined,
      notes: "",
    },
  });

  const onSubmit = async (values: NursingNotesFormValues) => {
    try {
      await addNursingNote({
        admission_id: admissionId,
        note_date: values.note_date,
        note_time: values.note_time,
        note_type: values.note_type,
        shift: values.shift || null,
        assessment: values.assessment || null,
        intervention: values.intervention || null,
        evaluation: values.evaluation || null,
        patient_response: values.patient_response || null,
        pain_assessment: values.pain_assessment || null,
        fall_risk_score: values.fall_risk_score || null,
        notes: values.notes || null,
      });
      toast.success("Nursing note added successfully");
      form.reset({
        note_date: format(new Date(), "yyyy-MM-dd"),
        note_time: format(new Date(), "HH:mm"),
        note_type: "progress",
        shift: "morning",
      });
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to add nursing note");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Note Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <FormField
              control={form.control}
              name="note_date"
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
              name="note_time"
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
              name="note_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {noteTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="shift"
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
                      {shifts.map((shift) => (
                        <SelectItem key={shift.value} value={shift.value}>
                          {shift.label}
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
            <CardTitle>Nursing Assessment (AIPE)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="assessment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Patient's current condition and observations..."
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
              name="intervention"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intervention</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nursing interventions performed..."
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
              name="patient_response"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Response</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How patient responded to interventions..."
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
              name="evaluation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evaluation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Evaluation of patient progress..."
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
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="pain_assessment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pain Assessment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Location, intensity, character of pain..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fall_risk_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fall Risk Score (0-10)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={10} placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
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
                      <Textarea placeholder="Any other observations..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isAddingNote}>
            <Save className="h-4 w-4 mr-2" />
            Save Nursing Note
          </Button>
        </div>
      </form>
    </Form>
  );
}

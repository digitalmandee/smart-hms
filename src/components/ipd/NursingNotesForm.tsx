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
import { useCreateNursingNote } from "@/hooks/useNursingCare";
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
  content: z.string().min(1, "Note content is required"),
  is_critical: z.boolean().default(false),
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
  const { mutateAsync: addNursingNote, isPending: isAddingNote } = useCreateNursingNote();

  const form = useForm<NursingNotesFormValues>({
    resolver: zodResolver(nursingNotesSchema),
    defaultValues: {
      note_date: format(new Date(), "yyyy-MM-dd"),
      note_time: format(new Date(), "HH:mm"),
      note_type: "progress",
      shift: "morning",
      content: "",
      is_critical: false,
    },
  });

  const onSubmit = async (values: NursingNotesFormValues) => {
    try {
      await addNursingNote({
        admission_id: admissionId,
        note_type: values.note_type,
        content: values.content,
        is_critical: values.is_critical,
      });
      toast.success("Nursing note added successfully");
      form.reset({
        note_date: format(new Date(), "yyyy-MM-dd"),
        note_time: format(new Date(), "HH:mm"),
        note_type: "progress",
        shift: "morning",
        content: "",
        is_critical: false,
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
            <CardTitle>Nursing Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Content *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter nursing observations, assessments, interventions..."
                      className="min-h-[200px]"
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
          <Button type="submit" disabled={isAddingNote}>
            <Save className="h-4 w-4 mr-2" />
            Save Nursing Note
          </Button>
        </div>
      </form>
    </Form>
  );
}

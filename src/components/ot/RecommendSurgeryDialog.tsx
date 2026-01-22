import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSurgeryRequest, SurgeryRequestPriority } from "@/hooks/useSurgeryRequests";
import { useDoctors } from "@/hooks/useDoctors";
import { CalendarIcon, Loader2, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

const surgeryRequestSchema = z.object({
  procedure_name: z.string().min(1, "Procedure name is required"),
  diagnosis: z.string().optional(),
  priority: z.enum(["elective", "urgent", "emergency"]).default("elective"),
  recommended_by: z.string().optional(),
  clinical_notes: z.string().optional(),
  preferred_date_from: z.date().optional(),
  preferred_date_to: z.date().optional(),
  estimated_duration_minutes: z.coerce.number().optional(),
});

type SurgeryRequestFormValues = z.infer<typeof surgeryRequestSchema>;

interface RecommendSurgeryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
  consultationId?: string;
  onSuccess?: () => void;
}

export function RecommendSurgeryDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  consultationId,
  onSuccess,
}: RecommendSurgeryDialogProps) {
  const createRequest = useCreateSurgeryRequest();
  const { data: doctors } = useDoctors();

  const surgeons = doctors?.filter(d => 
    d.specialization?.toLowerCase().includes('surg') || 
    d.specialization?.toLowerCase().includes('ortho') ||
    d.specialization?.toLowerCase().includes('neuro') ||
    d.specialization?.toLowerCase().includes('cardio') ||
    d.specialization?.toLowerCase().includes('gynae') ||
    d.specialization?.toLowerCase().includes('ent') ||
    d.specialization?.toLowerCase().includes('uro') ||
    d.specialization?.toLowerCase().includes('plastic')
  ) || doctors;

  const form = useForm<SurgeryRequestFormValues>({
    resolver: zodResolver(surgeryRequestSchema),
    defaultValues: {
      procedure_name: "",
      diagnosis: "",
      priority: "elective",
      clinical_notes: "",
      estimated_duration_minutes: 60,
    },
  });

  const onSubmit = async (values: SurgeryRequestFormValues) => {
    await createRequest.mutateAsync({
      patient_id: patientId,
      procedure_name: values.procedure_name,
      diagnosis: values.diagnosis,
      priority: values.priority as SurgeryRequestPriority,
      recommended_by: values.recommended_by,
      clinical_notes: values.clinical_notes,
      preferred_date_from: values.preferred_date_from 
        ? format(values.preferred_date_from, "yyyy-MM-dd") 
        : undefined,
      preferred_date_to: values.preferred_date_to 
        ? format(values.preferred_date_to, "yyyy-MM-dd") 
        : undefined,
      estimated_duration_minutes: values.estimated_duration_minutes,
      consultation_id: consultationId,
    });

    form.reset();
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            Recommend Surgery
          </DialogTitle>
          <DialogDescription>
            Create a surgery recommendation for <span className="font-medium">{patientName}</span>.
            Reception will be notified to schedule admission and OT.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="procedure_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Procedure Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Laparoscopic Cholecystectomy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cholelithiasis" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 grid-cols-2">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="elective">Elective</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recommended_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surgeon</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select surgeon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {surgeons?.map(doc => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.profile?.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <FormField
                control={form.control}
                name="preferred_date_from"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Preferred From</FormLabel>
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
                name="preferred_date_to"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Preferred To</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="estimated_duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min={15} step={15} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clinical_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinical Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requirements or notes..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

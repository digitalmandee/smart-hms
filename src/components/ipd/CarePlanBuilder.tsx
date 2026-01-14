import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useCreateCarePlan } from "@/hooks/useNursingCare";
import { ClipboardList } from "lucide-react";

const schema = z.object({
  problem: z.string().min(1, "Problem statement is required"),
  goals: z.string().min(1, "Goals are required"),
  interventions: z.string().min(1, "Interventions are required"),
  evaluation_criteria: z.string().optional(),
  target_date: z.string().optional(),
  priority: z.string().default("3"),
});

type FormValues = z.infer<typeof schema>;

interface CarePlanBuilderProps {
  admissionId: string;
  onSuccess?: () => void;
}

export function CarePlanBuilder({ admissionId, onSuccess }: CarePlanBuilderProps) {
  const { mutate: createCarePlan, isPending } = useCreateCarePlan();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      problem: "",
      goals: "",
      interventions: "",
      evaluation_criteria: "",
      target_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      priority: "3",
    },
  });

  const onSubmit = (values: FormValues) => {
    createCarePlan(
      {
        admission_id: admissionId,
        problem: values.problem,
        goals: values.goals,
        interventions: values.interventions,
        evaluation_criteria: values.evaluation_criteria,
        target_date: values.target_date,
        priority: parseInt(values.priority),
      },
      {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          New Care Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Critical</SelectItem>
                        <SelectItem value="2">2 - High</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - Low</SelectItem>
                        <SelectItem value="5">5 - Routine</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="problem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nursing Problem / Diagnosis *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the nursing problem or diagnosis..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goals / Expected Outcomes *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Define measurable goals and expected outcomes..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interventions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nursing Interventions *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List nursing interventions to achieve goals..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evaluation_criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evaluation Criteria</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How will progress be measured?"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Create Care Plan"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

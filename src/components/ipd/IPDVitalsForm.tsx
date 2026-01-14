import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNursingCare } from "@/hooks/useNursingCare";
import { Activity, Save } from "lucide-react";
import { toast } from "sonner";

const vitalsFormSchema = z.object({
  temperature: z.coerce.number().min(90).max(110).optional(),
  systolic_bp: z.coerce.number().min(50).max(300).optional(),
  diastolic_bp: z.coerce.number().min(30).max(200).optional(),
  pulse_rate: z.coerce.number().min(30).max(250).optional(),
  respiratory_rate: z.coerce.number().min(5).max(60).optional(),
  oxygen_saturation: z.coerce.number().min(50).max(100).optional(),
  blood_glucose: z.coerce.number().min(20).max(600).optional(),
  weight: z.coerce.number().min(0.5).max(500).optional(),
  height: z.coerce.number().min(20).max(300).optional(),
  pain_score: z.coerce.number().min(0).max(10).optional(),
  consciousness_level: z.string().optional(),
  intake_ml: z.coerce.number().min(0).optional(),
  output_ml: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type VitalsFormValues = z.infer<typeof vitalsFormSchema>;

interface IPDVitalsFormProps {
  admissionId: string;
  onSuccess?: () => void;
}

const consciousnessLevels = [
  { value: "alert", label: "Alert" },
  { value: "verbal", label: "Responds to Verbal" },
  { value: "pain", label: "Responds to Pain" },
  { value: "unresponsive", label: "Unresponsive" },
  { value: "confused", label: "Confused" },
  { value: "drowsy", label: "Drowsy" },
];

export function IPDVitalsForm({ admissionId, onSuccess }: IPDVitalsFormProps) {
  const { recordVitals, isRecordingVitals } = useNursingCare(admissionId);

  const form = useForm<VitalsFormValues>({
    resolver: zodResolver(vitalsFormSchema),
    defaultValues: {
      temperature: undefined,
      systolic_bp: undefined,
      diastolic_bp: undefined,
      pulse_rate: undefined,
      respiratory_rate: undefined,
      oxygen_saturation: undefined,
      blood_glucose: undefined,
      weight: undefined,
      height: undefined,
      pain_score: undefined,
      consciousness_level: "alert",
      intake_ml: undefined,
      output_ml: undefined,
      notes: "",
    },
  });

  const onSubmit = async (values: VitalsFormValues) => {
    try {
      await recordVitals({
        admission_id: admissionId,
        temperature: values.temperature || null,
        systolic_bp: values.systolic_bp || null,
        diastolic_bp: values.diastolic_bp || null,
        pulse_rate: values.pulse_rate || null,
        respiratory_rate: values.respiratory_rate || null,
        oxygen_saturation: values.oxygen_saturation || null,
        blood_glucose: values.blood_glucose || null,
        weight: values.weight || null,
        height: values.height || null,
        pain_score: values.pain_score || null,
        consciousness_level: values.consciousness_level || null,
        intake_ml: values.intake_ml || null,
        output_ml: values.output_ml || null,
        notes: values.notes || null,
      });
      toast.success("Vitals recorded successfully");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to record vitals");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature (°F)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="98.6" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systolic_bp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Systolic BP</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="120" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diastolic_bp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diastolic BP</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="80" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pulse_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pulse Rate</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="72" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="respiratory_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Respiratory Rate</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="16" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="oxygen_saturation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SpO2 (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="98" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="blood_glucose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Glucose</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pain_score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pain Score (0-10)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={10} placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Measurements</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="70" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="170" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intake_ml"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intake (ml)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="output_ml"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output (ml)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consciousness_level"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Level of Consciousness</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {consciousnessLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
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
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional observations..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isRecordingVitals}>
            <Save className="h-4 w-4 mr-2" />
            Record Vitals
          </Button>
        </div>
      </form>
    </Form>
  );
}

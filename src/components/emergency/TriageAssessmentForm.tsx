import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TriageLevel, TRIAGE_LEVELS, useTriagePatient, ER_ZONES } from "@/hooks/useEmergency";
import { useDoctors } from "@/hooks/useDoctors";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, Activity, Thermometer, Heart, Wind } from "lucide-react";

const triageSchema = z.object({
  triage_level: z.string().min(1, "Triage level is required"),
  chief_complaint: z.string().optional(),
  assigned_zone: z.string().optional(),
  assigned_doctor_id: z.string().optional(),
  vitals: z.object({
    blood_pressure_systolic: z.string().optional(),
    blood_pressure_diastolic: z.string().optional(),
    pulse: z.string().optional(),
    temperature: z.string().optional(),
    respiratory_rate: z.string().optional(),
    spo2: z.string().optional(),
    gcs: z.string().optional(),
  }).optional(),
});

type TriageFormData = z.infer<typeof triageSchema>;

interface TriageAssessmentFormProps {
  registrationId: string;
  initialData?: {
    chief_complaint?: string;
    vitals?: Record<string, any>;
  };
  onSuccess?: () => void;
}

const colorClasses: Record<string, { border: string; bg: string; ring: string }> = {
  red: { border: "border-red-500", bg: "bg-red-500/10 hover:bg-red-500/20", ring: "ring-red-500" },
  orange: { border: "border-orange-500", bg: "bg-orange-500/10 hover:bg-orange-500/20", ring: "ring-orange-500" },
  yellow: { border: "border-yellow-400", bg: "bg-yellow-400/10 hover:bg-yellow-400/20", ring: "ring-yellow-400" },
  green: { border: "border-green-500", bg: "bg-green-500/10 hover:bg-green-500/20", ring: "ring-green-500" },
  blue: { border: "border-blue-500", bg: "bg-blue-500/10 hover:bg-blue-500/20", ring: "ring-blue-500" },
};

export const TriageAssessmentForm = ({
  registrationId,
  initialData,
  onSuccess,
}: TriageAssessmentFormProps) => {
  const [selectedLevel, setSelectedLevel] = useState<TriageLevel | null>(null);
  const { data: doctors } = useDoctors();
  const triageMutation = useTriagePatient();

  const form = useForm<TriageFormData>({
    resolver: zodResolver(triageSchema),
    defaultValues: {
      triage_level: "",
      chief_complaint: initialData?.chief_complaint || "",
      assigned_zone: "",
      assigned_doctor_id: "",
      vitals: {
        blood_pressure_systolic: initialData?.vitals?.blood_pressure_systolic || "",
        blood_pressure_diastolic: initialData?.vitals?.blood_pressure_diastolic || "",
        pulse: initialData?.vitals?.pulse || "",
        temperature: initialData?.vitals?.temperature || "",
        respiratory_rate: initialData?.vitals?.respiratory_rate || "",
        spo2: initialData?.vitals?.spo2 || "",
        gcs: initialData?.vitals?.gcs || "",
      },
    },
  });

  const onSubmit = async (data: TriageFormData) => {
    await triageMutation.mutateAsync({
      id: registrationId,
      triage_level: data.triage_level as TriageLevel,
      vitals: data.vitals,
      assigned_zone: data.assigned_zone,
      assigned_doctor_id: data.assigned_doctor_id || undefined,
    });
    onSuccess?.();
  };

  const handleLevelSelect = (level: TriageLevel) => {
    setSelectedLevel(level);
    form.setValue("triage_level", level);
    const triageInfo = TRIAGE_LEVELS.find(t => t.level === level);
    if (triageInfo) {
      form.setValue("assigned_zone", triageInfo.zone);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Triage Level Selection */}
        <div className="space-y-3">
          <FormLabel className="text-base font-semibold">Triage Level *</FormLabel>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {TRIAGE_LEVELS.map((triage) => {
              const colors = colorClasses[triage.color];
              const isSelected = selectedLevel === triage.level;
              return (
                <Card
                  key={triage.level}
                  className={cn(
                    "cursor-pointer transition-all border-2",
                    colors.border,
                    colors.bg,
                    isSelected && `ring-2 ${colors.ring}`
                  )}
                  onClick={() => handleLevelSelect(triage.level)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold mb-1">{triage.level}</div>
                    <div className="font-medium text-sm">{triage.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {triage.description}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {form.formState.errors.triage_level && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {form.formState.errors.triage_level.message}
            </p>
          )}
        </div>

        {/* Vitals */}
        <div className="space-y-3">
          <FormLabel className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Vital Signs
          </FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 flex gap-2">
              <FormField
                control={form.control}
                name="vitals.blood_pressure_systolic"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">BP Systolic</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Heart className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input {...field} placeholder="120" className="pl-8" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <span className="self-end mb-2">/</span>
              <FormField
                control={form.control}
                name="vitals.blood_pressure_diastolic"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Diastolic</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="80" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="vitals.pulse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Pulse (bpm)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="72" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vitals.temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs flex items-center gap-1">
                    <Thermometer className="h-3 w-3" /> Temp (°F)
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="98.6" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vitals.respiratory_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs flex items-center gap-1">
                    <Wind className="h-3 w-3" /> RR (/min)
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="16" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vitals.spo2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">SpO2 (%)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="98" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vitals.gcs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">GCS (3-15)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="15" type="number" min="3" max="15" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Zone and Doctor Assignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assigned_zone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned Zone</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ER_ZONES.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assigned_doctor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign Doctor</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors?.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        Dr. {doc.profile?.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={triageMutation.isPending}>
            {triageMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Complete Triage
          </Button>
        </div>
      </form>
    </Form>
  );
};

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateDeathRecordInput } from "@/hooks/useDeathRecords";

const deathRecordSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  admission_id: z.string().optional(),
  death_date: z.string().min(1, "Death date is required"),
  death_time: z.string().min(1, "Death time is required"),
  place_of_death: z.string().optional(),
  immediate_cause: z.string().optional(),
  immediate_cause_interval: z.string().optional(),
  antecedent_cause: z.string().optional(),
  antecedent_cause_interval: z.string().optional(),
  underlying_cause: z.string().optional(),
  underlying_cause_interval: z.string().optional(),
  contributing_conditions: z.string().optional(),
  manner_of_death: z.string().optional(),
  is_mlc: z.boolean().optional(),
  mlc_number: z.string().optional(),
  autopsy_performed: z.boolean().optional(),
  autopsy_findings: z.string().optional(),
  certifying_physician_id: z.string().optional(),
  body_condition: z.string().optional(),
  notes: z.string().optional(),
});

type DeathRecordFormData = z.infer<typeof deathRecordSchema>;

interface DeathRecordFormProps {
  defaultValues?: Partial<DeathRecordFormData>;
  onSubmit: (data: CreateDeathRecordInput) => void;
  isLoading?: boolean;
  patient?: { id: string; first_name: string; last_name: string; patient_number: string };
  doctors?: any[];
}
}

export function DeathRecordForm({
  defaultValues,
  onSubmit,
  isLoading,
  patient,
  doctors = [],
}: DeathRecordFormProps) {
  const form = useForm<DeathRecordFormData>({
    resolver: zodResolver(deathRecordSchema),
    defaultValues: {
      death_date: format(new Date(), "yyyy-MM-dd"),
      death_time: format(new Date(), "HH:mm"),
      place_of_death: "hospital",
      manner_of_death: "natural",
      is_mlc: false,
      autopsy_performed: false,
      ...defaultValues,
      patient_id: patient?.id || defaultValues?.patient_id || "",
    },
  });

  const isMLC = form.watch("is_mlc");
  const autopsyPerformed = form.watch("autopsy_performed");

  const handleSubmit = (data: DeathRecordFormData) => {
    onSubmit(data as CreateDeathRecordInput);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient ? (
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">
                  {patient.first_name} {patient.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{patient.patient_number}</p>
                <input type="hidden" {...form.register("patient_id")} />
              </div>
            ) : (
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient ID *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter patient ID" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Death Details */}
        <Card>
          <CardHeader>
            <CardTitle>Death Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="death_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Death *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="death_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time of Death *</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="place_of_death"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place of Death</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select place" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="icu">ICU</SelectItem>
                      <SelectItem value="emergency">Emergency Department</SelectItem>
                      <SelectItem value="ot">Operation Theater</SelectItem>
                      <SelectItem value="home">Brought Dead (Home)</SelectItem>
                      <SelectItem value="transit">Brought Dead (Transit)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manner_of_death"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manner of Death</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="accident">Accident</SelectItem>
                      <SelectItem value="suicide">Suicide</SelectItem>
                      <SelectItem value="homicide">Homicide</SelectItem>
                      <SelectItem value="pending">Pending Investigation</SelectItem>
                      <SelectItem value="undetermined">Undetermined</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="certifying_physician_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certifying Physician</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select physician" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.profiles?.full_name || doctor.name || 'Unknown'}
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

        {/* MLC Information */}
        <Card>
          <CardHeader>
            <CardTitle>Medico-Legal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="is_mlc"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">This is a Medico-Legal Case</FormLabel>
                </FormItem>
              )}
            />
            {isMLC && (
              <FormField
                control={form.control}
                name="mlc_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MLC Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="MLC reference number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Cause of Death */}
        <Card>
          <CardHeader>
            <CardTitle>Cause of Death (ICD-10 Format)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Part I - Disease or condition directly leading to death
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-3">
                  <FormField
                    control={form.control}
                    name="immediate_cause"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>(a) Immediate Cause</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Direct cause of death" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="immediate_cause_interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 2 hours" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-3">
                  <FormField
                    control={form.control}
                    name="antecedent_cause"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>(b) Antecedent Cause (due to)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Condition leading to (a)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="antecedent_cause_interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 5 days" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-3">
                  <FormField
                    control={form.control}
                    name="underlying_cause"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>(c) Underlying Cause (due to)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Original disease/condition" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="underlying_cause_interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 3 months" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Part II - Other significant conditions contributing to death
              </p>
              <FormField
                control={form.control}
                name="contributing_conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Other conditions that contributed to death but not directly related to the chain above"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Autopsy */}
        <Card>
          <CardHeader>
            <CardTitle>Autopsy Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="autopsy_performed"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Autopsy Performed</FormLabel>
                </FormItem>
              )}
            />
            {autopsyPerformed && (
              <FormField
                control={form.control}
                name="autopsy_findings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autopsy Findings</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Summary of autopsy findings" rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Body Condition */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="body_condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Condition</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Condition of the body" />
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
                    <Textarea {...field} placeholder="Any additional notes..." rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Death Record"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

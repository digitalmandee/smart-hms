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
import { CreateBirthRecordInput } from "@/hooks/useBirthRecords";

const birthRecordSchema = z.object({
  mother_patient_id: z.string().min(1, "Mother patient is required"),
  baby_patient_id: z.string().optional(),
  admission_id: z.string().optional(),
  birth_date: z.string().min(1, "Birth date is required"),
  birth_time: z.string().min(1, "Birth time is required"),
  delivery_type: z.string().optional(),
  place_of_birth: z.string().optional(),
  birth_weight_grams: z.coerce.number().optional(),
  birth_length_cm: z.coerce.number().optional(),
  head_circumference_cm: z.coerce.number().optional(),
  chest_circumference_cm: z.coerce.number().optional(),
  gender: z.string().optional(),
  apgar_1min: z.coerce.number().min(0).max(10).optional(),
  apgar_5min: z.coerce.number().min(0).max(10).optional(),
  apgar_10min: z.coerce.number().min(0).max(10).optional(),
  resuscitation_required: z.boolean().optional(),
  nicu_admission: z.boolean().optional(),
  condition_at_birth: z.string().optional(),
  father_name: z.string().optional(),
  father_cnic: z.string().optional(),
  father_occupation: z.string().optional(),
  father_address: z.string().optional(),
  delivered_by: z.string().optional(),
  bcg_given: z.boolean().optional(),
  opv0_given: z.boolean().optional(),
  hep_b_given: z.boolean().optional(),
  vitamin_k_given: z.boolean().optional(),
  notes: z.string().optional(),
});

type BirthRecordFormData = z.infer<typeof birthRecordSchema>;

interface BirthRecordFormProps {
  defaultValues?: Partial<BirthRecordFormData>;
  onSubmit: (data: CreateBirthRecordInput) => void;
  isLoading?: boolean;
  motherPatient?: { id: string; first_name: string; last_name: string };
  doctors?: any[];
}

export function BirthRecordForm({
  defaultValues,
  onSubmit,
  isLoading,
  motherPatient,
  doctors = [],
}: BirthRecordFormProps) {
  const form = useForm<BirthRecordFormData>({
    resolver: zodResolver(birthRecordSchema),
    defaultValues: {
      birth_date: format(new Date(), "yyyy-MM-dd"),
      birth_time: format(new Date(), "HH:mm"),
      place_of_birth: "hospital",
      resuscitation_required: false,
      nicu_admission: false,
      bcg_given: false,
      opv0_given: false,
      hep_b_given: false,
      vitamin_k_given: false,
      ...defaultValues,
      mother_patient_id: motherPatient?.id || defaultValues?.mother_patient_id || "",
    },
  });

  const handleSubmit = (data: BirthRecordFormData) => {
    onSubmit(data as CreateBirthRecordInput);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Mother Information */}
        <Card>
          <CardHeader>
            <CardTitle>Mother Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {motherPatient ? (
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">
                  {motherPatient.first_name} {motherPatient.last_name}
                </p>
                <input type="hidden" {...form.register("mother_patient_id")} />
              </div>
            ) : (
              <FormField
                control={form.control}
                name="mother_patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother Patient ID *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter mother's patient ID" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Birth Details */}
        <Card>
          <CardHeader>
            <CardTitle>Birth Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birth_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time of Birth *</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="ambiguous">Ambiguous</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="delivery_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="normal">Normal Vaginal</SelectItem>
                      <SelectItem value="cesarean">Cesarean Section</SelectItem>
                      <SelectItem value="assisted">Assisted Delivery</SelectItem>
                      <SelectItem value="vacuum">Vacuum Extraction</SelectItem>
                      <SelectItem value="forceps">Forceps Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="place_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place of Birth</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select place" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="transit">In Transit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="delivered_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivered By</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
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

        {/* Measurements */}
        <Card>
          <CardHeader>
            <CardTitle>Measurements</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="birth_weight_grams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Weight (grams)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder="e.g., 3200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birth_length_cm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} placeholder="e.g., 50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="head_circumference_cm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Head Circumference (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} placeholder="e.g., 34" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chest_circumference_cm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chest Circumference (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} placeholder="e.g., 32" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* APGAR Scores */}
        <Card>
          <CardHeader>
            <CardTitle>APGAR Scores</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="apgar_1min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1 Minute (0-10)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apgar_5min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>5 Minutes (0-10)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apgar_10min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>10 Minutes (0-10)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Condition & Complications */}
        <Card>
          <CardHeader>
            <CardTitle>Condition & Complications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="condition_at_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition at Birth</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Describe baby's condition at birth" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="resuscitation_required"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Resuscitation Required</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nicu_admission"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">NICU Admission</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Father Details */}
        <Card>
          <CardHeader>
            <CardTitle>Father Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="father_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Father's Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="father_cnic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Father's CNIC</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="XXXXX-XXXXXXX-X" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="father_occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Father's occupation" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="father_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Father's address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Vaccinations at Birth */}
        <Card>
          <CardHeader>
            <CardTitle>Vaccinations at Birth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="bcg_given"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">BCG</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="opv0_given"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">OPV-0</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hep_b_given"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Hepatitis B</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vitamin_k_given"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Vitamin K</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
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
            {isLoading ? "Saving..." : "Save Birth Record"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

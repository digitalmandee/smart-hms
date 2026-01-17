import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCertificateInput, CertificateType, FitnessStatus } from "@/hooks/useMedicalCertificates";

const certificateSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  certificate_type: z.string().min(1, "Certificate type is required"),
  purpose: z.string().optional(),
  valid_from: z.string().optional(),
  valid_to: z.string().optional(),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
  restrictions: z.string().optional(),
  leave_from: z.string().optional(),
  leave_to: z.string().optional(),
  diagnosis: z.string().optional(),
  fitness_status: z.string().optional(),
  job_type: z.string().optional(),
  employer_name: z.string().optional(),
  disability_percentage: z.coerce.number().optional(),
  disability_type: z.string().optional(),
  issued_by: z.string().optional(),
  notes: z.string().optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

interface MedicalCertificateFormProps {
  certificateType: CertificateType;
  defaultValues?: Partial<CertificateFormData>;
  onSubmit: (data: CreateCertificateInput) => void;
  isLoading?: boolean;
  patient?: { id: string; first_name: string; last_name: string; patient_number: string };
  doctors?: any[];
}

export function MedicalCertificateForm({
  certificateType,
  defaultValues,
  onSubmit,
  isLoading,
  patient,
  doctors = [],
}: MedicalCertificateFormProps) {
  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      certificate_type: certificateType,
      valid_from: format(new Date(), "yyyy-MM-dd"),
      ...defaultValues,
      patient_id: patient?.id || defaultValues?.patient_id || "",
    },
  });

  const handleSubmit = (data: CertificateFormData) => {
    onSubmit({
      ...data,
      certificate_type: certificateType,
      fitness_status: data.fitness_status as FitnessStatus,
    } as CreateCertificateInput);
  };

  const getCertificateTitle = () => {
    switch (certificateType) {
      case 'fitness': return 'Medical Fitness Certificate';
      case 'sick_leave': return 'Sick Leave Certificate';
      case 'disability': return 'Disability Certificate';
      case 'vaccination': return 'Vaccination Certificate';
      case 'medical_report': return 'Medical Report';
      case 'medical_legal': return 'Medical Legal Certificate';
      case 'age_verification': return 'Age Verification Certificate';
      default: return 'Medical Certificate';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{getCertificateTitle()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Patient Info */}
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

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Purpose of certificate" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Fitness Certificate Fields */}
        {certificateType === 'fitness' && (
          <Card>
            <CardHeader>
              <CardTitle>Fitness Assessment</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fitness_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fitness Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fit">Fit</SelectItem>
                        <SelectItem value="unfit">Unfit</SelectItem>
                        <SelectItem value="fit_with_restrictions">Fit with Restrictions</SelectItem>
                        <SelectItem value="temporarily_unfit">Temporarily Unfit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="job_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Heavy machinery operator" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employer Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Company/employer name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="restrictions"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Restrictions/Limitations</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any work restrictions..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Sick Leave Certificate Fields */}
        {certificateType === 'sick_leave' && (
          <Card>
            <CardHeader>
              <CardTitle>Leave Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>Diagnosis</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Medical condition/diagnosis" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="leave_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave From *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="leave_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave To *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Disability Certificate Fields */}
        {certificateType === 'disability' && (
          <Card>
            <CardHeader>
              <CardTitle>Disability Assessment</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="disability_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Disability</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Orthopedic, Visual, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="disability_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disability Percentage (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Common Fields */}
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
                    <Textarea {...field} placeholder="Clinical examination findings..." rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recommendations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommendations</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Medical recommendations..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Validity & Issuing */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="valid_from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid From</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valid_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid Until</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="issued_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issued By</FormLabel>
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
                    <Textarea {...field} placeholder="Any additional notes..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Issuing..." : "Issue Certificate"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

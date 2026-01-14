import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useMedicines } from "@/hooks/useMedicines";
import { useCreateIPDMedication } from "@/hooks/useNursingCare";
import { Pill } from "lucide-react";

const schema = z.object({
  medicine_id: z.string().min(1, "Medicine is required"),
  dosage: z.string().min(1, "Dosage is required"),
  route: z.string().min(1, "Route is required"),
  frequency: z.string().min(1, "Frequency is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  is_prn: z.boolean().default(false),
  prn_indication: z.string().optional(),
  timing_schedule: z.array(z.string()).optional(),
  special_instructions: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const ROUTES = [
  { value: "oral", label: "Oral (PO)" },
  { value: "iv", label: "Intravenous (IV)" },
  { value: "im", label: "Intramuscular (IM)" },
  { value: "sc", label: "Subcutaneous (SC)" },
  { value: "topical", label: "Topical" },
  { value: "inhalation", label: "Inhalation" },
  { value: "rectal", label: "Rectal" },
  { value: "sublingual", label: "Sublingual" },
  { value: "transdermal", label: "Transdermal" },
];

const FREQUENCIES = [
  { value: "stat", label: "STAT (Immediately)" },
  { value: "od", label: "OD (Once Daily)" },
  { value: "bd", label: "BD (Twice Daily)" },
  { value: "tds", label: "TDS (Three Times Daily)" },
  { value: "qid", label: "QID (Four Times Daily)" },
  { value: "q4h", label: "Q4H (Every 4 Hours)" },
  { value: "q6h", label: "Q6H (Every 6 Hours)" },
  { value: "q8h", label: "Q8H (Every 8 Hours)" },
  { value: "q12h", label: "Q12H (Every 12 Hours)" },
  { value: "prn", label: "PRN (As Needed)" },
  { value: "hs", label: "HS (At Bedtime)" },
  { value: "ac", label: "AC (Before Meals)" },
  { value: "pc", label: "PC (After Meals)" },
];

const TIMING_OPTIONS = [
  { value: "06:00", label: "6:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "22:00", label: "10:00 PM" },
];

interface IPDMedicationOrderFormProps {
  admissionId: string;
  onSuccess?: () => void;
}

export function IPDMedicationOrderForm({ admissionId, onSuccess }: IPDMedicationOrderFormProps) {
  const { data: medicines = [] } = useMedicines();
  const { mutate: createMedication, isPending } = useCreateIPDMedication();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      medicine_id: "",
      dosage: "",
      route: "",
      frequency: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: "",
      is_prn: false,
      prn_indication: "",
      timing_schedule: [],
      special_instructions: "",
    },
  });

  const isPrn = form.watch("is_prn");

  const onSubmit = (values: FormValues) => {
    createMedication(
      {
        admission_id: admissionId,
        medicine_id: values.medicine_id,
        dosage: values.dosage,
        route: values.route,
        frequency: values.frequency,
        start_date: values.start_date,
        end_date: values.end_date || undefined,
        is_prn: values.is_prn,
        prn_indication: values.prn_indication || undefined,
        timing_schedule: values.timing_schedule,
        special_instructions: values.special_instructions || undefined,
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
          <Pill className="h-5 w-5" />
          New Medication Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="medicine_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicine *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select medicine" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {medicines.map((med: any) => (
                          <SelectItem key={med.id} value={med.id}>
                            {med.name} ({med.generic_name || med.dosage_form})
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
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 500mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="route"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROUTES.map((route) => (
                          <SelectItem key={route.value} value={route.value}>
                            {route.label}
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
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FREQUENCIES.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
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
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
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
              name="is_prn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    PRN (As Needed) Medication
                  </FormLabel>
                </FormItem>
              )}
            />

            {isPrn && (
              <FormField
                control={form.control}
                name="prn_indication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PRN Indication</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., For pain, For fever" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="timing_schedule"
              render={() => (
                <FormItem>
                  <FormLabel>Administration Times</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {TIMING_OPTIONS.map((time) => (
                      <FormField
                        key={time.value}
                        control={form.control}
                        name="timing_schedule"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(time.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, time.value]);
                                  } else {
                                    field.onChange(current.filter((v) => v !== time.value));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {time.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="special_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional instructions for administration..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Add Medication Order"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

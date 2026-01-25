import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, Percent, Building2 } from "lucide-react";
import { useDoctorCompensationPlan } from "@/hooks/useDoctorCompensation";

const PLAN_TYPES = [
  { value: "fixed_salary", label: "Fixed Salary", description: "Monthly fixed salary only" },
  { value: "per_consultation", label: "Per Consultation", description: "Earnings based on consultations" },
  { value: "per_procedure", label: "Per Procedure", description: "Earnings based on procedures" },
  { value: "revenue_share", label: "Revenue Share", description: "Percentage of all revenue" },
  { value: "hybrid", label: "Hybrid", description: "Base salary + revenue share" },
];

interface DoctorCompensationFormProps {
  form: UseFormReturn<any>;
  doctorId?: string;
  isSurgeon?: boolean;
  isAnesthetist?: boolean;
}

export function DoctorCompensationForm({ 
  form, 
  doctorId,
  isSurgeon = false,
  isAnesthetist = false,
}: DoctorCompensationFormProps) {
  const { data: existingPlan, isLoading } = useDoctorCompensationPlan(doctorId);

  // Populate form with existing plan data
  useEffect(() => {
    if (existingPlan) {
      form.setValue("compensation_plan_type", existingPlan.plan_type);
      form.setValue("consultation_share_percent", existingPlan.consultation_share_percent);
      form.setValue("procedure_share_percent", existingPlan.procedure_share_percent);
      form.setValue("surgery_share_percent", existingPlan.surgery_share_percent);
      form.setValue("anesthesia_share_percent", existingPlan.anesthesia_share_percent || 50);
      form.setValue("lab_referral_percent", existingPlan.lab_referral_percent);
      form.setValue("minimum_guarantee", existingPlan.minimum_guarantee);
    }
  }, [existingPlan, form]);

  const planType = form.watch("compensation_plan_type");
  const showShareFields = planType && planType !== "fixed_salary";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <CardTitle>Compensation Settings</CardTitle>
        </div>
        <CardDescription>
          Configure revenue share and commission percentages for this {isAnesthetist ? "anesthetist" : isSurgeon ? "surgeon" : "doctor"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Type */}
        <FormField
          control={form.control}
          name="compensation_plan_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compensation Plan Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PLAN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Revenue Share Fields */}
        {showShareFields && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Percent className="h-4 w-4" />
              Revenue Share Percentages
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Consultation Share */}
              <FormField
                control={form.control}
                name="consultation_share_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Share %</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="50"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </FormControl>
                    <FormDescription>Share from OPD consultations</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Procedure Share */}
              <FormField
                control={form.control}
                name="procedure_share_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Procedure Share %</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="50"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </FormControl>
                    <FormDescription>Share from minor procedures</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Surgery Share - Show for surgeons or general doctors */}
              {(isSurgeon || !isAnesthetist) && (
                <FormField
                  control={form.control}
                  name="surgery_share_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surgery Share %</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="50"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormDescription>Share from OT surgeries</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Anesthesia Share - Show for anesthetists */}
              {isAnesthetist && (
                <FormField
                  control={form.control}
                  name="anesthesia_share_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anesthesia Share %</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="50"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormDescription>Share from anesthesia fees</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Lab Referral Share */}
              <FormField
                control={form.control}
                name="lab_referral_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Referral %</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="10"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </FormControl>
                    <FormDescription>Share from lab referrals</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Minimum Guarantee */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Minimum Guarantee
          </div>

          <FormField
            control={form.control}
            name="minimum_guarantee"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Monthly Minimum (Rs.)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      className="pl-10"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Minimum guaranteed amount regardless of earnings
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Info about existing plan */}
        {existingPlan && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium">Current active plan since {existingPlan.effective_from}</p>
            <p>Saving will update the existing plan settings.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

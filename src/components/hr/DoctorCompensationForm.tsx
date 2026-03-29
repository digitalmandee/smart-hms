import { useEffect, useMemo } from "react";
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
import { Wallet, Percent, Building2, Stethoscope, HeartPulse, Bed, Calculator, TestTube } from "lucide-react";
import { useDoctorCompensationPlan } from "@/hooks/useDoctorCompensation";
import { formatCurrency } from "@/lib/currency";

const PLAN_TYPES = [
  { value: "fixed_salary", label: "Fixed Salary Only", description: "Monthly fixed salary, no commission" },
  { value: "per_consultation", label: "Commission Only", description: "Earnings based on consultations/procedures" },
  { value: "hybrid", label: "Salary + Commission", description: "Base salary plus revenue share" },
];

interface DoctorCompensationFormProps {
  form: UseFormReturn<any>;
  doctorId?: string;
  isSurgeon?: boolean;
  isAnesthetist?: boolean;
}

// Helper component for Fee + Share % side-by-side
function FeeShareField({
  form,
  feeFieldName,
  shareFieldName,
  feeLabel,
  shareLabel,
  feePlaceholder,
  feeDescription,
  shareDescription,
  icon: Icon,
}: {
  form: UseFormReturn<any>;
  feeFieldName: string;
  shareFieldName: string;
  feeLabel: string;
  shareLabel: string;
  feePlaceholder: string;
  feeDescription: string;
  shareDescription: string;
  icon: any;
}) {
  const feeValue = form.watch(feeFieldName) || 0;
  const shareValue = form.watch(shareFieldName) || 50;
  const doctorEarns = (feeValue * shareValue) / 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" />
        {feeLabel} Charges
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Fee Field - What patient pays */}
        <FormField
          control={form.control}
          name={feeFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient Fee (Rs.)</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rs.</span>
                  <Input
                    type="number"
                    min={0}
                    placeholder={feePlaceholder}
                    className="pl-10"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </FormControl>
              <FormDescription>{feeDescription}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Share Field - Doctor's percentage */}
        <FormField
          control={form.control}
          name={shareFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor's Share (%)</FormLabel>
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
              <FormDescription>{shareDescription}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Real-time calculation display */}
      {feeValue > 0 && (
        <div className="bg-primary/5 rounded-lg p-3 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          <span className="text-sm">
            Doctor earns <span className="font-semibold text-primary">{formatCurrency(doctorEarns)}</span> per {feeLabel.toLowerCase()} 
            <span className="text-muted-foreground"> ({shareValue}% of {formatCurrency(feeValue)})</span>
          </span>
        </div>
      )}
    </div>
  );
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
      form.setValue("ipd_visit_share_percent", (existingPlan as any).ipd_visit_share_percent || 50);
      form.setValue("lab_referral_percent", existingPlan.lab_referral_percent);
      form.setValue("radiology_referral_percent", (existingPlan as any).radiology_referral_percent || 0);
      form.setValue("minimum_guarantee", existingPlan.minimum_guarantee);
    }
  }, [existingPlan, form]);

  const planType = form.watch("compensation_plan_type");
  const showCommissionFields = planType && planType !== "fixed_salary";

  // Calculate earnings summary
  const consultationFee = form.watch("consultation_fee") || 0;
  const consultationShare = form.watch("consultation_share_percent") || 50;
  const surgeryFee = form.watch("default_surgery_fee") || 0;
  const surgeryShare = form.watch("surgery_share_percent") || 50;
  const ipdVisitFee = form.watch("ipd_visit_fee") || 0;
  const ipdVisitShare = form.watch("ipd_visit_share_percent") || 50;
  const procedureShare = form.watch("procedure_share_percent") || 50;
  const anesthesiaShare = form.watch("anesthesia_share_percent") || 50;
  const labReferralShare = form.watch("lab_referral_percent") || 10;
  const radiologyReferralShare = form.watch("radiology_referral_percent") || 10;
  const minimumGuarantee = form.watch("minimum_guarantee") || 0;

  const hasAnyFeeConfigured = consultationFee > 0 || surgeryFee > 0 || ipdVisitFee > 0;

  return (
    <div className="space-y-6">
      {/* Plan Type Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle>Compensation Plan</CardTitle>
          </div>
          <CardDescription>
            Choose how this {isAnesthetist ? "anesthetist" : isSurgeon ? "surgeon" : "doctor"} will be compensated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="compensation_plan_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select compensation plan type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PLAN_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{type.label}</span>
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
        </CardContent>
      </Card>

      {/* OPD Consultation Charges - Show for all except pure anesthetists */}
      {showCommissionFields && !isAnesthetist && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5 text-primary" />
              OPD Consultation
            </CardTitle>
            <CardDescription>
              Patient consultation fee and doctor's share percentage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeeShareField
              form={form}
              feeFieldName="consultation_fee"
              shareFieldName="consultation_share_percent"
              feeLabel="Consultation"
              shareLabel="Consultation Share"
              feePlaceholder="2000"
              feeDescription="Amount charged to patient for OPD visit"
              shareDescription="Doctor's percentage of consultation fee"
              icon={Stethoscope}
            />
          </CardContent>
        </Card>
      )}

      {/* IPD Visit Charges - Show for all doctors who do rounds */}
      {showCommissionFields && !isAnesthetist && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bed className="h-5 w-5 text-primary" />
              IPD Patient Visits
            </CardTitle>
            <CardDescription>
              Per-visit fee for admitted patient rounds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeeShareField
              form={form}
              feeFieldName="ipd_visit_fee"
              shareFieldName="ipd_visit_share_percent"
              feeLabel="IPD Visit"
              shareLabel="Visit Share"
              feePlaceholder="500"
              feeDescription="Fee per IPD patient round/visit"
              shareDescription="Doctor's percentage of visit fee"
              icon={Bed}
            />
          </CardContent>
        </Card>
      )}

      {/* Surgery Charges - Show for surgeons */}
      {showCommissionFields && (isSurgeon || !isAnesthetist) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartPulse className="h-5 w-5 text-primary" />
              {isSurgeon ? "Surgery" : "Procedures"}
            </CardTitle>
            <CardDescription>
              {isSurgeon ? "Default surgery fee and surgeon's share" : "Procedure charges and share percentage"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isSurgeon && (
              <FeeShareField
                form={form}
                feeFieldName="default_surgery_fee"
                shareFieldName="surgery_share_percent"
                feeLabel="Surgery"
                shareLabel="Surgery Share"
                feePlaceholder="50000"
                feeDescription="Default surgeon fee (can be customized per surgery)"
                shareDescription="Surgeon's percentage of surgery charges"
                icon={HeartPulse}
              />
            )}
            
            {/* Procedure share for non-surgeons */}
            {!isSurgeon && (
              <FormField
                control={form.control}
                name="procedure_share_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Procedure Share %</FormLabel>
                    <FormControl>
                      <div className="relative max-w-xs">
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
                    <FormDescription>Doctor's share from minor procedures</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Anesthesia Charges - Show for anesthetists only */}
      {showCommissionFields && isAnesthetist && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartPulse className="h-5 w-5 text-primary" />
              Anesthesia
            </CardTitle>
            <CardDescription>
              Anesthesia fee percentage from surgical procedures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="anesthesia_share_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anesthesia Share %</FormLabel>
                  <FormControl>
                    <div className="relative max-w-xs">
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
                  <FormDescription>Anesthetist's share from anesthesia charges</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* Lab Referral Percentage */}
      {showCommissionFields && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TestTube className="h-5 w-5 text-primary" />
              Lab Referrals
            </CardTitle>
            <CardDescription>
              Commission from lab tests ordered by this doctor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="lab_referral_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lab Referral Commission %</FormLabel>
                  <FormControl>
                    <div className="relative max-w-xs">
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
                  <FormDescription>Doctor's commission on lab test orders</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* Minimum Guarantee */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Minimum Guarantee</CardTitle>
          </div>
          <CardDescription>
            Guaranteed minimum monthly payment regardless of earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  If commission earnings are below this amount, the difference is paid
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Earnings Summary Card */}
      {showCommissionFields && (hasAnyFeeConfigured || minimumGuarantee > 0) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Earnings Summary
            </CardTitle>
            <CardDescription>
              Calculated earnings based on configured rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consultationFee > 0 && !isAnesthetist && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Per OPD Consultation</span>
                  <span className="font-semibold">{formatCurrency((consultationFee * consultationShare) / 100)}</span>
                </div>
              )}
              {ipdVisitFee > 0 && !isAnesthetist && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Per IPD Visit</span>
                  <span className="font-semibold">{formatCurrency((ipdVisitFee * ipdVisitShare) / 100)}</span>
                </div>
              )}
              {surgeryFee > 0 && isSurgeon && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Per Surgery (default)</span>
                  <span className="font-semibold">{formatCurrency((surgeryFee * surgeryShare) / 100)}</span>
                </div>
              )}
              {!isSurgeon && !isAnesthetist && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Procedure Share</span>
                  <span className="font-semibold">{procedureShare}%</span>
                </div>
              )}
              {isAnesthetist && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Anesthesia Share</span>
                  <span className="font-semibold">{anesthesiaShare}%</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Lab Referral Commission</span>
                <span className="font-semibold">{labReferralShare}%</span>
              </div>
              {minimumGuarantee > 0 && (
                <div className="flex justify-between items-center py-2 bg-primary/10 px-2 rounded">
                  <span className="font-medium">Minimum Monthly Guarantee</span>
                  <span className="font-bold text-primary">{formatCurrency(minimumGuarantee)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info about existing plan */}
      {existingPlan && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium">Current active plan since {existingPlan.effective_from}</p>
          <p>Saving will update the existing plan settings.</p>
        </div>
      )}
    </div>
  );
}

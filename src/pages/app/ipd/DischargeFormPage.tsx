import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmission, useDischargePatient } from "@/hooks/useAdmissions";
import { useDischargeSummary, useApproveDischargeSummary, useIPDCharges, useGenerateIPDInvoice } from "@/hooks/useDischarge";
import { useDepositBalance } from "@/hooks/usePatientDeposits";
import { useBedTypes } from "@/hooks/useIPDConfig";
import { useAdmissionSurgeries } from "@/hooks/useOT";
import { useInvoice } from "@/hooks/useBilling";
import { useOutstandingInvoices, calculateOutstandingTotal } from "@/hooks/useOutstandingInvoices";
import { usePatientPharmacyCredits, usePatientCreditBalance } from "@/hooks/usePharmacyCredits";
import { DischargeChecklist } from "@/components/ipd/DischargeChecklist";
import { DischargeSummaryForm } from "@/components/ipd/DischargeSummaryForm";
import { PrintableDischargeSummary } from "@/components/ipd/PrintableDischargeSummary";
import { PrintableDischargeForm } from "@/components/ipd/PrintableDischargeForm";
import { InvoiceStatusPanel } from "@/components/ipd/InvoiceStatusPanel";
import { RoomChargesSyncButton } from "@/components/ipd/RoomChargesSyncButton";
import { useBackfillRoomCharges } from "@/hooks/useRoomChargeSync";
import { InvoiceItemsBuilder } from "@/components/billing/InvoiceItemsBuilder";
import { InvoiceItemInput } from "@/hooks/useBilling";
import { useOrganizationBranding } from "@/hooks/useOrganizationBranding";
import { InsuranceBillingSplit, BillingSplit } from "@/components/insurance/InsuranceBillingSplit";
import { InsuranceClaimPrompt } from "@/components/insurance/InsuranceClaimPrompt";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import {
  User,
  Calendar,
  Bed,
  Clock,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  LogOut,
  Receipt,
  Loader2,
  Pill,
  Scissors,
  ChevronDown,
  Plus,
  Stethoscope,
  TestTube,
  ExternalLink,
} from "lucide-react";

const DISCHARGE_TYPES = [
  { value: "normal", label: "Normal Discharge", color: "bg-success/10 text-success" },
  { value: "against_advice", label: "Left Against Medical Advice", color: "bg-warning/10 text-warning" },
  { value: "referred", label: "Referred to Another Facility", color: "bg-info/10 text-info" },
  { value: "transfer", label: "Transfer to Another Facility", color: "bg-info/10 text-info" },
  { value: "absconded", label: "Absconded", color: "bg-destructive/10 text-destructive" },
  { value: "expired", label: "Expired", color: "bg-muted text-muted-foreground" },
];

export default function DischargeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const summaryPrintRef = useRef<HTMLDivElement>(null);
  const formPrintRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState("billing");
  const [dischargeType, setDischargeType] = useState("normal");
  const [completedChecklist, setCompletedChecklist] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [additionalCharges, setAdditionalCharges] = useState<InvoiceItemInput[]>([]);
  const [showAddCharges, setShowAddCharges] = useState(false);
  const [dischargeBillingSplit, setDischargeBillingSplit] = useState<BillingSplit | null>(null);

  const { data: admission, isLoading: loadingAdmission, refetch: refetchAdmission } = useAdmission(id);
  const { data: dischargeSummary, isLoading: loadingSummary, refetch: refetchSummary } = useDischargeSummary(id);
  const { data: charges = [], refetch: refetchCharges } = useIPDCharges(id);
  const { data: bedTypes = [] } = useBedTypes();
  const { data: surgeries = [] } = useAdmissionSurgeries(id);
  const { mutateAsync: dischargePatient, isPending: discharging } = useDischargePatient();
  const { mutateAsync: approveSummary, isPending: approving } = useApproveDischargeSummary();
  const { mutateAsync: generateInvoice, isPending: generatingInvoice } = useGenerateIPDInvoice();
  const { mutate: backfillRoomCharges } = useBackfillRoomCharges();
  const { data: depositBalanceData } = useDepositBalance(admission?.patient_id);

  // Get invoice if already generated
  const invoiceId = admission?.discharge_invoice_id;
  const { data: existingInvoice, refetch: refetchInvoice } = useInvoice(invoiceId || undefined);

  // Fetch outstanding invoices (lab, pharmacy, etc.) for this patient during admission
  const excludeInvoiceIds = [admission?.admission_invoice_id, admission?.discharge_invoice_id].filter(Boolean) as string[];
  const { data: outstandingInvoices = [] } = useOutstandingInvoices(
    admission?.patient_id,
    admission?.admission_date,
    excludeInvoiceIds
  );
  const outstandingTotal = calculateOutstandingTotal(outstandingInvoices);

  // Fetch pharmacy credits (Pay Later purchases)
  const { data: pharmacyCredits = [] } = usePatientPharmacyCredits(admission?.patient_id);
  const { data: creditBalance } = usePatientCreditBalance(admission?.patient_id);
  const pharmacyCreditsTotal = creditBalance?.total || 0;
  const pendingPharmacyCredits = pharmacyCredits.filter(c => c.status !== "paid");
  const { data: branding } = useOrganizationBranding();
  const isLoading = loadingAdmission || loadingSummary;
  const invoiceGenerated = !!invoiceId;

  // Print handlers
  const handlePrintSummary = useReactToPrint({
    contentRef: summaryPrintRef,
    documentTitle: `Discharge_Summary_${admission?.admission_number}`,
  });

  const handlePrintForm = useReactToPrint({
    contentRef: formPrintRef,
    documentTitle: `Discharge_Form_${admission?.admission_number}`,
  });

  // Get bed type info for room charge calculation
  const bedTypeName = admission?.bed?.bed_type || "Standard";
  const currentBedType = bedTypes.find(bt => bt.code === bedTypeName || bt.name === bedTypeName);
  const dailyRate = currentBedType?.daily_rate || 0;

  // Calculate days admitted
  const daysAdmitted = admission?.admission_date
    ? differenceInDays(new Date(), new Date(admission.admission_date)) + 1
    : 0;

  // Ref to prevent duplicate backfill calls (race condition fix)
  const backfillTriggeredRef = useRef(false);

  // Auto-sync room charges on page load to ensure all days are covered
  useEffect(() => {
    if (
      admission?.id && 
      admission?.admission_date && 
      !isLoading &&
      !backfillTriggeredRef.current  // Only trigger once
    ) {
      backfillTriggeredRef.current = true;
      backfillRoomCharges({
        admissionId: admission.id,
        admissionDate: admission.admission_date,
        bedType: admission.bed?.bed_type || null,
        bedNumber: admission.bed?.bed_number || null,
        wardChargePerDay: dailyRate,
      });
    }
  }, [admission?.id, admission?.admission_date, isLoading, dailyRate]);

  // Check if summary is approved
  const isSummaryApproved = dischargeSummary?.status === "approved" || dischargeSummary?.status === "finalized";
  
  // Check billing status
  const isBillingCleared = existingInvoice?.status === "paid";
  
  // Required checklist items
  const requiredChecklistItems = [
    "discharge_summary", "diagnosis_updated", "medications_reconciled",
    "prescription_printed", "billing_cleared", "follow_up_scheduled",
    "instructions_explained", "reports_handed", "valuables_returned",
    "nursing_clearance", "bed_vacated",
  ];
  const allRequiredComplete = requiredChecklistItems.every((item) => 
    completedChecklist.includes(item)
  );

  // Can discharge if summary is approved and checklist is complete (or LAMA/absconded/expired)
  const canDischarge = 
    (isSummaryApproved && allRequiredComplete) ||
    ["against_advice", "absconded", "expired"].includes(dischargeType);

  const handleCompleteDischarge = async () => {
    if (!id) return;

    try {
      await dischargePatient({
        admissionId: id,
        dischargeData: {
          discharge_type: dischargeType as "normal" | "against_advice" | "referred" | "transfer" | "absconded" | "expired",
          condition_at_discharge: dischargeSummary?.condition_at_discharge || undefined,
          discharge_diagnosis: dischargeSummary?.discharge_diagnosis || undefined,
          discharge_summary: dischargeSummary?.hospital_course || undefined,
          discharge_instructions: dischargeSummary?.follow_up_instructions || undefined,
          follow_up_date: dischargeSummary?.follow_up_appointments?.[0]?.date || undefined,
        },
      });

      toast.success("Patient discharged successfully");
      navigate("/app/ipd/discharges");
    } catch (error) {
      toast.error("Failed to discharge patient");
    }
  };

  const handleApproveSummary = async () => {
    if (!dischargeSummary?.id) return;

    try {
      await approveSummary(dischargeSummary.id);
      refetchSummary();
      toast.success("Discharge summary approved");
    } catch (error) {
      toast.error("Failed to approve summary");
    }
  };

  const handleGenerateInvoice = async () => {
    if (!id || !admission?.patient_id || !admission?.branch_id) {
      toast.error("Missing required information for invoice");
      return;
    }

    try {
      const additionalItemsForInvoice = additionalCharges.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        service_type_id: item.service_type_id,
      }));

      const result = await generateInvoice({
        admissionId: id,
        patientId: admission.patient_id,
        branchId: admission.branch_id,
        depositAmount: admission.deposit_amount || 0,
        daysAdmitted,
        dailyRate,
        bedTypeName: currentBedType?.name || bedTypeName,
        additionalItems: additionalItemsForInvoice,
      });
      
      // Save invoice ID to admission
      await supabase
        .from("admissions")
        .update({ discharge_invoice_id: result.invoiceId })
        .eq("id", id);
      
      refetchAdmission();
      toast.success(`Invoice generated: Rs. ${result.totalAmount.toLocaleString()}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate invoice");
    }
  };

  // Categorize charges for breakdown display
  const chargesBreakdown = useMemo(() => {
    const medication = charges.filter((c: any) => c.charge_type === 'medication');
    const procedure = charges.filter((c: any) => c.charge_type === 'procedure');
    const room = charges.filter((c: any) => c.charge_type === 'room');
    const other = charges.filter((c: any) => !['medication', 'procedure', 'room'].includes(c.charge_type || ''));
    
    return {
      medication: { items: medication, total: medication.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0) },
      procedure: { items: procedure, total: procedure.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0) },
      room: { items: room, total: room.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0) },
      other: { items: other, total: other.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0) },
    };
  }, [charges]);

  // Calculate totals - now using posted room charges from DB instead of calculated estimate
  const additionalChargesTotal = additionalCharges.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100));
  }, 0);
  // Service charges now exclude room charges (they're tracked separately)
  const nonRoomCharges = charges.filter((c: any) => c.charge_type !== 'room');
  const serviceCharges = nonRoomCharges.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0);
  // Use posted room charges from DB - this reflects actual days charged
  const postedRoomCharges = chargesBreakdown.room.total;
  // Calculate expected room charges for comparison
  const expectedRoomCharges = Math.max(1, daysAdmitted) * dailyRate;
  // Use posted charges if available, otherwise fall back to expected (for display before sync)
  const roomCharges = postedRoomCharges > 0 ? postedRoomCharges : expectedRoomCharges;
  // Include outstanding invoices (lab, pharmacy) and pharmacy credits in total
  const totalCharges = serviceCharges + roomCharges + additionalChargesTotal + outstandingTotal + pharmacyCreditsTotal;
  const depositAmount = admission?.deposit_amount || 0;
  const balanceDue = totalCharges - depositAmount;

  // Count unbilled charges
  const unbilledCount = charges.filter((c: any) => !c.is_billed).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!admission) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">Admission not found</h2>
        <Button onClick={() => navigate("/app/ipd/admissions")} className="mt-4">Back to Admissions</Button>
      </div>
    );
  }

  const patient = admission.patient;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Discharge"
        description={`Discharge process for ${patient?.first_name} ${patient?.last_name}`}
        breadcrumbs={[
          { label: "IPD", href: "/app/ipd" },
          { label: "Admissions", href: "/app/ipd/admissions" },
          { label: admission.admission_number, href: `/app/ipd/admissions/${id}` },
          { label: "Discharge" },
        ]}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePrintSummary()} disabled={!dischargeSummary}>
                <FileText className="h-4 w-4 mr-2" />
                Discharge Summary
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrintForm()}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Discharge Form (with signatures)
              </DropdownMenuItem>
              {invoiceGenerated && (
                <DropdownMenuItem onClick={() => navigate(`/app/billing/invoices/${invoiceId}?print=true`)}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Print Invoice
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Patient Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{patient?.first_name} {patient?.last_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {patient?.patient_number} • {patient?.gender}, {patient?.date_of_birth ? format(new Date(patient.date_of_birth), "dd MMM yyyy") : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Admitted: {format(new Date(admission.admission_date), "dd MMM yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{daysAdmitted} days</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span>{admission.ward?.name} - Bed {admission.bed?.bed_number}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-warning border-warning">Pending Discharge</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className={isSummaryApproved ? "border-success/50 bg-success/5" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            {isSummaryApproved ? <CheckCircle2 className="h-8 w-8 text-success" /> : <FileText className="h-8 w-8 text-muted-foreground" />}
            <div>
              <p className="font-medium">Discharge Summary</p>
              <p className="text-sm text-muted-foreground">
                {dischargeSummary?.status === "approved" ? "Approved" : dischargeSummary?.status === "pending_approval" ? "Pending Approval" : dischargeSummary?.status === "draft" ? "Draft" : "Not Started"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={allRequiredComplete ? "border-success/50 bg-success/5" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            {allRequiredComplete ? <CheckCircle2 className="h-8 w-8 text-success" /> : <ClipboardCheck className="h-8 w-8 text-muted-foreground" />}
            <div>
              <p className="font-medium">Pre-Discharge Checklist</p>
              <p className="text-sm text-muted-foreground">{completedChecklist.length} of {requiredChecklistItems.length} items</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Discharge Type</p>
            <Select value={dischargeType} onValueChange={setDischargeType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DISCHARGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Warning for non-normal discharge */}
      {["against_advice", "absconded", "expired"].includes(dischargeType) && (
        <Alert className="border-warning/50 bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription>
            {dischargeType === "against_advice" && "Patient is leaving against medical advice. Ensure proper documentation."}
            {dischargeType === "absconded" && "Patient has absconded. Document circumstances and notify security."}
            {dischargeType === "expired" && "Patient has expired. Ensure death certificate procedures are followed."}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Checklist
          </TabsTrigger>
        </TabsList>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6 space-y-4">
          {/* Insurance Billing Split for insured patients */}
          {admission?.payment_mode === "insurance" && admission?.patient_id && totalCharges > 0 && (
            <InsuranceBillingSplit
              patientId={admission.patient_id}
              totalAmount={totalCharges}
              onSplitCalculated={setDischargeBillingSplit}
            />
          )}

          {/* Insurance Claim Prompt after invoice */}
          {invoiceGenerated && dischargeBillingSplit && !dischargeBillingSplit.isSelfPay && dischargeBillingSplit.insuranceAmount > 0 && (
            <InsuranceClaimPrompt
              patientId={admission.patient_id}
              invoiceId={invoiceId!}
              totalAmount={dischargeBillingSplit.totalAmount}
              insuranceAmount={dischargeBillingSplit.insuranceAmount}
              admissionId={id}
            />
          )}
          {unbilledCount > 0 && !invoiceGenerated && (
            <Alert className="border-warning/50 bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription>
                {unbilledCount} unbilled charge(s) found. These will be included in the final invoice.
              </AlertDescription>
            </Alert>
          )}

          {/* Invoice Status Panel (if generated) */}
          {invoiceGenerated && existingInvoice && (
            <InvoiceStatusPanel
              invoiceId={invoiceId!}
              invoiceNumber={existingInvoice.invoice_number}
              totalAmount={existingInvoice.total_amount || 0}
              paidAmount={existingInvoice.paid_amount || 0}
              depositAmount={depositAmount}
              status={existingInvoice.status || "pending"}
              onPaymentRecorded={() => refetchInvoice()}
            />
          )}

          {/* Billing Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Billing Summary
              </CardTitle>
              {!invoiceGenerated && (
                <Button size="sm" variant="outline" onClick={() => setShowAddCharges(!showAddCharges)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Services
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Bed className="h-4 w-4" />
                    Room ({chargesBreakdown.room.items.length} day{chargesBreakdown.room.items.length !== 1 ? 's' : ''} posted)
                    {chargesBreakdown.room.items.length < daysAdmitted && (
                      <Badge variant="outline" className="text-warning border-warning text-xs">
                        {daysAdmitted - chargesBreakdown.room.items.length} pending
                      </Badge>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Rs. {roomCharges.toLocaleString()}</span>
                    {!invoiceGenerated && admission && (
                      <RoomChargesSyncButton
                        admissionId={admission.id}
                        admissionDate={admission.admission_date}
                        bedType={admission.bed?.bed_type || null}
                        bedNumber={admission.bed?.bed_number || null}
                        wardChargePerDay={dailyRate}
                        size="sm"
                        variant="ghost"
                      />
                    )}
                  </div>
                </div>

                {chargesBreakdown.medication.items.length > 0 && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Pill className="h-4 w-4" />
                      Pharmacy ({chargesBreakdown.medication.items.length} items)
                    </span>
                    <span className="font-medium">Rs. {chargesBreakdown.medication.total.toLocaleString()}</span>
                  </div>
                )}

                {chargesBreakdown.procedure.items.length > 0 && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Scissors className="h-4 w-4" />
                      Surgery ({chargesBreakdown.procedure.items.length} items)
                    </span>
                    <span className="font-medium">Rs. {chargesBreakdown.procedure.total.toLocaleString()}</span>
                  </div>
                )}

                {chargesBreakdown.other.items.length > 0 && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Stethoscope className="h-4 w-4" />
                      Other Services ({chargesBreakdown.other.items.length} items)
                    </span>
                    <span className="font-medium">Rs. {chargesBreakdown.other.total.toLocaleString()}</span>
                  </div>
                )}

                {additionalCharges.length > 0 && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Plus className="h-4 w-4" />
                      Additional ({additionalCharges.length} items)
                    </span>
                    <span className="font-medium">Rs. {additionalChargesTotal.toLocaleString()}</span>
                  </div>
                )}

                {/* Outstanding Invoices (Lab, Pharmacy, etc.) */}
                {outstandingInvoices.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Outstanding Invoices (Lab, Pharmacy, etc.)
                      </p>
                      {outstandingInvoices.map((inv) => (
                        <div key={inv.id} className="flex justify-between items-center">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <TestTube className="h-4 w-4" />
                            <span className="text-sm">{inv.invoice_number}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={() => navigate(`/app/billing/invoices/${inv.id}`)}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </span>
                          <span className="font-medium text-destructive">Rs. {inv.outstanding.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-medium pt-1 border-t border-dashed">
                        <span>Outstanding Subtotal</span>
                        <span className="text-destructive">Rs. {outstandingTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Pharmacy Credits (Pay Later) */}
                {pendingPharmacyCredits.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Pharmacy Credits (Pay Later)
                      </p>
                      {pendingPharmacyCredits.map((credit) => (
                        <div key={credit.id} className="flex justify-between items-center">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Pill className="h-4 w-4" />
                            <span className="text-sm">{credit.transaction?.transaction_number || 'POS Credit'}</span>
                          </span>
                          <span className="font-medium text-destructive">
                            Rs. {(credit.amount - credit.paid_amount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-medium pt-1 border-t border-dashed">
                        <span>Credits Subtotal</span>
                        <span className="text-destructive">Rs. {pharmacyCreditsTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}

                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>Rs. {totalCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-success">
                  <span>Deposit Paid</span>
                  <span>- Rs. {depositAmount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Balance Due</span>
                  <span className={balanceDue > 0 ? 'text-destructive' : 'text-success'}>
                    Rs. {balanceDue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Add Services Section */}
              {showAddCharges && !invoiceGenerated && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Add Additional Charges</h4>
                  <InvoiceItemsBuilder items={additionalCharges} onChange={setAdditionalCharges} />
                </div>
              )}

              {/* Generate Invoice Button */}
              {!invoiceGenerated && (
                <Button onClick={handleGenerateInvoice} disabled={generatingInvoice} className="w-full">
                  {generatingInvoice ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><Receipt className="h-4 w-4 mr-2" />Generate Final Invoice</>}
                </Button>
              )}

              {dailyRate === 0 && (
                <p className="text-sm text-warning">⚠️ No daily rate configured for this bed type.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-6 space-y-4">
          {dischargeSummary?.status === "pending_approval" && (
            <Alert className="border-info/50 bg-info/10">
              <FileText className="h-4 w-4 text-info" />
              <AlertDescription className="flex items-center justify-between">
                <span>Discharge summary is pending approval.</span>
                <Button size="sm" onClick={handleApproveSummary} disabled={approving}>
                  {approving ? "Approving..." : "Approve Summary"}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <DischargeSummaryForm admissionId={id!} existingSummary={dischargeSummary} onSuccess={() => refetchSummary()} />
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="mt-6">
          <DischargeChecklist
            admissionId={id!}
            initialCompleted={completedChecklist}
            onComplete={setCompletedChecklist}
            autoCheckBilling={isBillingCleared}
            autoCheckSummary={isSummaryApproved}
          />
        </TabsContent>
      </Tabs>

      {/* Complete Discharge Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Complete Discharge</h3>
              <p className="text-sm text-muted-foreground">
                {canDischarge ? "All requirements met. You can now discharge the patient." : "Complete the checklist and approve the discharge summary to proceed."}
              </p>
            </div>
            <Button size="lg" disabled={!canDischarge || discharging} onClick={() => setShowConfirmDialog(true)}>
              <LogOut className="h-4 w-4 mr-2" />
              {discharging ? "Processing..." : "Complete Discharge"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Patient Discharge</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to discharge {patient?.first_name} {patient?.last_name} with type: <strong>{DISCHARGE_TYPES.find((t) => t.value === dischargeType)?.label}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteDischarge}>Confirm Discharge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden Printable Elements */}
      <div className="hidden">
        <div ref={summaryPrintRef}>
          {dischargeSummary && admission && (
            <PrintableDischargeSummary admission={admission} summary={dischargeSummary} organization={branding} />
          )}
        </div>
        <div ref={formPrintRef}>
          <PrintableDischargeForm
            admission={admission}
            summary={dischargeSummary}
            organization={branding}
            invoice={existingInvoice ? {
              invoice_number: existingInvoice.invoice_number,
              total_amount: existingInvoice.total_amount || 0,
              paid_amount: existingInvoice.paid_amount || 0,
              status: existingInvoice.status || "pending",
            } : null}
          />
        </div>
      </div>
    </div>
  );
}

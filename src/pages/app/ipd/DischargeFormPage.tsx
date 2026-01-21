import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAdmission, useDischargePatient } from "@/hooks/useAdmissions";
import { useDischargeSummary, useApproveDischargeSummary, useIPDCharges, useGenerateIPDInvoice } from "@/hooks/useDischarge";
import { useBedTypes } from "@/hooks/useIPDConfig";
import { useAdmissionSurgeries } from "@/hooks/useOT";
import { DischargeChecklist } from "@/components/ipd/DischargeChecklist";
import { DischargeSummaryForm } from "@/components/ipd/DischargeSummaryForm";
import { PrintableDischargeSummary } from "@/components/ipd/PrintableDischargeSummary";
import { InvoiceItemsBuilder } from "@/components/billing/InvoiceItemsBuilder";
import { InvoiceItemInput } from "@/hooks/useBilling";
import { usePrint } from "@/hooks/usePrint";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
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
} from "lucide-react";

const DISCHARGE_TYPES = [
  { value: "normal", label: "Normal Discharge", color: "bg-green-100 text-green-800" },
  { value: "against_advice", label: "Left Against Medical Advice", color: "bg-amber-100 text-amber-800" },
  { value: "referred", label: "Referred to Another Facility", color: "bg-blue-100 text-blue-800" },
  { value: "transfer", label: "Transfer to Another Facility", color: "bg-blue-100 text-blue-800" },
  { value: "absconded", label: "Absconded", color: "bg-red-100 text-red-800" },
  { value: "expired", label: "Expired", color: "bg-gray-100 text-gray-800" },
];

export default function DischargeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { printRef, handlePrint } = usePrint();

  const [activeTab, setActiveTab] = useState("checklist");
  const [dischargeType, setDischargeType] = useState("normal");
  const [completedChecklist, setCompletedChecklist] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState<string | null>(null);
  const [additionalCharges, setAdditionalCharges] = useState<InvoiceItemInput[]>([]);
  const [showAddCharges, setShowAddCharges] = useState(false);

  const { data: admission, isLoading: loadingAdmission } = useAdmission(id);
  const { data: dischargeSummary, isLoading: loadingSummary, refetch: refetchSummary } = useDischargeSummary(id);
  const { data: charges = [] } = useIPDCharges(id);
  const { data: bedTypes = [] } = useBedTypes();
  const { data: surgeries = [] } = useAdmissionSurgeries(id);
  const { mutateAsync: dischargePatient, isPending: discharging } = useDischargePatient();
  const { mutateAsync: approveSummary, isPending: approving } = useApproveDischargeSummary();
  const { mutateAsync: generateInvoice, isPending: generatingInvoice } = useGenerateIPDInvoice();

  const isLoading = loadingAdmission || loadingSummary;

  // Get bed type info for room charge calculation
  const bedTypeName = admission?.bed?.bed_type || "Standard";
  const currentBedType = bedTypes.find(bt => bt.code === bedTypeName || bt.name === bedTypeName);
  const dailyRate = currentBedType?.daily_rate || 0;

  // Calculate days admitted
  const daysAdmitted = admission?.admission_date
    ? differenceInDays(new Date(), new Date(admission.admission_date)) + 1
    : 0;

  // Check if summary is approved
  const isSummaryApproved = dischargeSummary?.status === "approved" || dischargeSummary?.status === "finalized";
  
  // Check if all required checklist items are complete
  const requiredChecklistItems = [
    "discharge_summary",
    "diagnosis_updated",
    "medications_reconciled",
    "prescription_printed",
    "billing_cleared",
    "follow_up_scheduled",
    "instructions_explained",
    "reports_handed",
    "valuables_returned",
    "nursing_clearance",
    "bed_vacated",
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
      // Transform additional charges to the format expected by the hook
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
      
      setInvoiceGenerated(true);
      setGeneratedInvoiceId(result.invoiceId);
      toast.success(`Invoice generated: Rs. ${result.totalAmount.toLocaleString()} (${result.chargesCount} items)`);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate invoice");
    }
  };

  // Categorize charges for breakdown display
  const chargesBreakdown = useMemo(() => {
    const medication = charges.filter((c: any) => c.charge_type === 'medication');
    const procedure = charges.filter((c: any) => c.charge_type === 'procedure');
    const other = charges.filter((c: any) => !['medication', 'procedure'].includes(c.charge_type || ''));
    
    return {
      medication: {
        items: medication,
        total: medication.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0),
      },
      procedure: {
        items: procedure,
        total: procedure.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0),
      },
      other: {
        items: other,
        total: other.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0),
      },
    };
  }, [charges]);

  // Calculate additional charges total
  const additionalChargesTotal = additionalCharges.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
    return sum + itemTotal;
  }, 0);

  // Calculate charges breakdown
  const serviceCharges = charges.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0);
  const roomCharges = Math.max(1, daysAdmitted) * dailyRate;
  const totalCharges = serviceCharges + roomCharges + additionalChargesTotal;
  const depositAmount = admission?.deposit_amount || 0;
  const balanceDue = totalCharges - depositAmount;

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
        <Button onClick={() => navigate("/app/ipd/admissions")} className="mt-4">
          Back to Admissions
        </Button>
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
          <div className="flex gap-2">
            {dischargeSummary && (
              <Button variant="outline" onClick={() => handlePrint()}>
                <Printer className="h-4 w-4 mr-2" />
                Print Summary
              </Button>
            )}
          </div>
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
                <h2 className="text-xl font-semibold">
                  {patient?.first_name} {patient?.last_name}
                </h2>
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
                <span>
                  {admission.ward?.name} - Bed {admission.bed?.bed_number}
                </span>
              </div>
            </div>

            <Badge variant="outline" className="text-warning border-warning">
              Pending Discharge
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Discharge Status Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className={isSummaryApproved ? "border-success/50 bg-success/5" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            {isSummaryApproved ? (
              <CheckCircle2 className="h-8 w-8 text-success" />
            ) : (
              <FileText className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Discharge Summary</p>
              <p className="text-sm text-muted-foreground">
                {dischargeSummary?.status === "approved" ? "Approved" : 
                 dischargeSummary?.status === "pending_approval" ? "Pending Approval" :
                 dischargeSummary?.status === "draft" ? "Draft" : "Not Started"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={allRequiredComplete ? "border-success/50 bg-success/5" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            {allRequiredComplete ? (
              <CheckCircle2 className="h-8 w-8 text-success" />
            ) : (
              <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Pre-Discharge Checklist</p>
              <p className="text-sm text-muted-foreground">
                {completedChecklist.length} of {requiredChecklistItems.length} items complete
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Discharge Type</p>
            <Select value={dischargeType} onValueChange={setDischargeType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISCHARGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Warning for non-normal discharge */}
      {["against_advice", "absconded", "expired"].includes(dischargeType) && (
        <Card className="border-warning/50 bg-warning/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <p className="text-sm">
              {dischargeType === "against_advice" && "Patient is leaving against medical advice. Ensure proper documentation and consent."}
              {dischargeType === "absconded" && "Patient has absconded. Document the circumstances and notify security."}
              {dischargeType === "expired" && "Patient has expired. Ensure death certificate and body handling procedures are followed."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Billing Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Itemized Breakdown */}
          <div className="space-y-3 text-sm">
            {/* Room Charges */}
            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Bed className="h-4 w-4" />
                Room Charges ({daysAdmitted} day{daysAdmitted !== 1 ? 's' : ''} × Rs. {dailyRate.toLocaleString()})
              </span>
              <span className="font-medium">Rs. {roomCharges.toLocaleString()}</span>
            </div>

            {/* Pharmacy/Medication Charges */}
            {chargesBreakdown.medication.items.length > 0 && (
              <Collapsible>
                <div className="flex justify-between items-center">
                  <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Pill className="h-4 w-4" />
                    <span>Pharmacy Charges ({chargesBreakdown.medication.items.length} items)</span>
                    <ChevronDown className="h-3 w-3" />
                  </CollapsibleTrigger>
                  <span className="font-medium">Rs. {chargesBreakdown.medication.total.toLocaleString()}</span>
                </div>
                <CollapsibleContent className="pl-6 pt-2 space-y-1">
                  {chargesBreakdown.medication.items.map((charge: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                      <span>{charge.description}</span>
                      <span>Rs. {(charge.total_amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Surgery/Procedure Charges */}
            {chargesBreakdown.procedure.items.length > 0 && (
              <Collapsible>
                <div className="flex justify-between items-center">
                  <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Scissors className="h-4 w-4" />
                    <span>Surgery Charges ({chargesBreakdown.procedure.items.length} items)</span>
                    <ChevronDown className="h-3 w-3" />
                  </CollapsibleTrigger>
                  <span className="font-medium">Rs. {chargesBreakdown.procedure.total.toLocaleString()}</span>
                </div>
                <CollapsibleContent className="pl-6 pt-2 space-y-1">
                  {chargesBreakdown.procedure.items.map((charge: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                      <span>{charge.description}</span>
                      <span>Rs. {(charge.total_amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Other Service Charges */}
            {chargesBreakdown.other.items.length > 0 && (
              <Collapsible>
                <div className="flex justify-between items-center">
                  <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Stethoscope className="h-4 w-4" />
                    <span>Other Services ({chargesBreakdown.other.items.length} items)</span>
                    <ChevronDown className="h-3 w-3" />
                  </CollapsibleTrigger>
                  <span className="font-medium">Rs. {chargesBreakdown.other.total.toLocaleString()}</span>
                </div>
                <CollapsibleContent className="pl-6 pt-2 space-y-1">
                  {chargesBreakdown.other.items.map((charge: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                      <span>{charge.description}</span>
                      <span>Rs. {(charge.total_amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Additional Charges (added during discharge) */}
            {additionalCharges.length > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  Additional Charges ({additionalCharges.length} items)
                </span>
                <span className="font-medium">Rs. {additionalChargesTotal.toLocaleString()}</span>
              </div>
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

          {/* Add Additional Charges Section */}
          <Collapsible open={showAddCharges} onOpenChange={setShowAddCharges}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between" disabled={invoiceGenerated}>
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Additional Charges
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAddCharges ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <InvoiceItemsBuilder
                items={additionalCharges}
                onChange={setAdditionalCharges}
                disabled={invoiceGenerated}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleGenerateInvoice} 
              disabled={generatingInvoice || invoiceGenerated}
              className="flex-1"
            >
              {generatingInvoice ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
              ) : invoiceGenerated ? (
                <><CheckCircle2 className="h-4 w-4 mr-2" />Invoice Generated</>
              ) : (
                <><Receipt className="h-4 w-4 mr-2" />Generate Final Invoice</>
              )}
            </Button>
            {invoiceGenerated && generatedInvoiceId && (
              <Button variant="outline" asChild>
                <Link to={`/app/billing/invoices/${generatedInvoiceId}`}>
                  View Invoice
                </Link>
              </Button>
            )}
          </div>

          {dailyRate === 0 && (
            <p className="text-sm text-warning">⚠️ No daily rate configured for this bed type. Room charges will be Rs. 0.</p>
          )}
        </CardContent>
      </Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Pre-Discharge Checklist
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Discharge Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="mt-6">
          <DischargeChecklist
            admissionId={id!}
            initialCompleted={completedChecklist}
            onComplete={setCompletedChecklist}
          />
        </TabsContent>

        <TabsContent value="summary" className="mt-6 space-y-4">
          {dischargeSummary?.status === "pending_approval" && (
            <Card className="border-info/50 bg-info/10">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-info" />
                  <p className="text-sm text-info">
                    Discharge summary is pending approval.
                  </p>
                </div>
                <Button onClick={handleApproveSummary} disabled={approving}>
                  {approving ? "Approving..." : "Approve Summary"}
                </Button>
              </CardContent>
            </Card>
          )}

          <DischargeSummaryForm
            admissionId={id!}
            existingSummary={dischargeSummary}
            onSuccess={() => refetchSummary()}
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
                {canDischarge
                  ? "All requirements met. You can now discharge the patient."
                  : "Complete the checklist and approve the discharge summary to proceed."}
              </p>
            </div>
            <Button
              size="lg"
              disabled={!canDischarge || discharging}
              onClick={() => setShowConfirmDialog(true)}
            >
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
              You are about to discharge {patient?.first_name} {patient?.last_name} with discharge type: <strong>{DISCHARGE_TYPES.find((t) => t.value === dischargeType)?.label}</strong>.
              <br /><br />
              This action will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Update admission status to discharged</li>
                <li>Mark the bed as available for housekeeping</li>
                <li>Record the discharge time</li>
              </ul>
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteDischarge}>
              Confirm Discharge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden Printable Summary */}
      {dischargeSummary && admission && (
        <div className="hidden">
          <div ref={printRef}>
            <PrintableDischargeSummary
              admission={admission}
              summary={dischargeSummary}
            />
          </div>
        </div>
      )}
    </div>
  );
}

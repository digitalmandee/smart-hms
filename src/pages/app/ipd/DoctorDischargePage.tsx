import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useAdmission } from "@/hooks/useAdmissions";
import { useDischargeSummary, useApproveDischargeSummary } from "@/hooks/useDischarge";
import { DischargeSummaryForm } from "@/components/ipd/DischargeSummaryForm";
import { toast } from "sonner";
import {
  User,
  Calendar,
  Bed,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Send,
  Stethoscope,
} from "lucide-react";

export default function DoctorDischargePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: admission, isLoading: loadingAdmission } = useAdmission(id);
  const { data: dischargeSummary, isLoading: loadingSummary, refetch: refetchSummary } = useDischargeSummary(id);
  const { mutateAsync: approveSummary, isPending: approving } = useApproveDischargeSummary();

  const isLoading = loadingAdmission || loadingSummary;
  
  // Calculate days admitted
  const daysAdmitted = admission?.admission_date
    ? differenceInDays(new Date(), new Date(admission.admission_date)) + 1
    : 0;

  // Check summary status
  const summaryStatus = dischargeSummary?.status || "not_started";
  const isSummaryDraft = summaryStatus === "draft";
  const isSummaryPending = summaryStatus === "pending_approval";
  const isSummaryApproved = summaryStatus === "approved" || summaryStatus === "finalized";
  const canApprove = isSummaryDraft || isSummaryPending;

  const handleApproveAndSend = async () => {
    if (!dischargeSummary?.id) {
      toast.error("Please save the discharge summary first");
      return;
    }

    try {
      await approveSummary(dischargeSummary.id);
      refetchSummary();
      toast.success("Discharge approved and sent to reception for billing");
      setShowConfirmDialog(false);
    } catch (error) {
      toast.error("Failed to approve discharge summary");
    }
  };

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
        <Button onClick={() => navigate("/app/ipd/rounds")} className="mt-4">
          Back to My Patients
        </Button>
      </div>
    );
  }

  const patient = admission.patient;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Request Patient Discharge"
        description={`Complete discharge summary for ${patient?.first_name} ${patient?.last_name}`}
        breadcrumbs={[
          { label: "IPD", href: "/app/ipd" },
          { label: "My Patients", href: "/app/ipd/rounds" },
          { label: admission.admission_number, href: `/app/ipd/admissions/${id}` },
          { label: "Discharge Request" },
        ]}
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
                  {patient?.patient_number} • {patient?.gender},{" "}
                  {patient?.date_of_birth
                    ? format(new Date(patient.date_of_birth), "dd MMM yyyy")
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Admitted: {format(new Date(admission.admission_date), "dd MMM yyyy")}
                </span>
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
            <Badge 
              variant="outline" 
              className={
                isSummaryApproved 
                  ? "text-success border-success" 
                  : isSummaryPending 
                    ? "text-info border-info"
                    : "text-warning border-warning"
              }
            >
              {isSummaryApproved 
                ? "Sent to Reception" 
                : isSummaryPending 
                  ? "Pending Approval" 
                  : "Draft"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Status Alert */}
      {isSummaryApproved && (
        <Alert className="border-success/50 bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertDescription>
            Discharge summary has been approved and sent to reception for billing and final checkout.
            You can view the patient's discharge status from the{" "}
            <Button 
              variant="link" 
              className="px-0 h-auto text-success"
              onClick={() => navigate("/app/ipd/discharges")}
            >
              Discharges page
            </Button>.
          </AlertDescription>
        </Alert>
      )}

      {isSummaryPending && (
        <Alert className="border-info/50 bg-info/10">
          <AlertTriangle className="h-4 w-4 text-info" />
          <AlertDescription className="flex items-center justify-between">
            <span>Discharge summary is ready. Click "Approve & Send to Reception" to proceed.</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Diagnosis Info from Admission */}
      {admission.diagnosis_on_admission && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Admission Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {admission.diagnosis_on_admission}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Discharge Summary Form - Doctor fills this */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Discharge Summary
          </CardTitle>
          <CardDescription>
            Complete the clinical discharge summary including diagnosis, medications, and follow-up instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DischargeSummaryForm
            admissionId={id!}
            existingSummary={dischargeSummary}
            onSuccess={() => refetchSummary()}
          />
        </CardContent>
      </Card>

      {/* Approve and Send Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Approve & Send to Reception</h3>
              <p className="text-sm text-muted-foreground">
                {isSummaryApproved
                  ? "Discharge has been sent to reception for billing."
                  : canApprove && dischargeSummary
                    ? "Once approved, reception will handle billing and final checkout."
                    : "Save the discharge summary first, then approve."}
              </p>
            </div>
            <Button
              size="lg"
              disabled={!canApprove || !dischargeSummary || approving || isSummaryApproved}
              onClick={() => setShowConfirmDialog(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              {approving ? "Sending..." : isSummaryApproved ? "Already Sent" : "Approve & Send"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Discharge Summary</AlertDialogTitle>
            <AlertDialogDescription>
              You are approving the discharge summary for{" "}
              <strong>
                {patient?.first_name} {patient?.last_name}
              </strong>
              . This will send the patient to reception for billing and final checkout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApproveAndSend}>
              Approve & Send to Reception
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

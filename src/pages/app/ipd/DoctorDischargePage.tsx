import { useParams, useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdmission } from "@/hooks/useAdmissions";
import { useDischargeSummary } from "@/hooks/useDischarge";
import { DischargeSummaryForm } from "@/components/ipd/DischargeSummaryForm";
import {
  User,
  Calendar,
  Bed,
  Clock,
  FileText,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";

export default function DoctorDischargePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: admission, isLoading: loadingAdmission } = useAdmission(id);
  const { data: dischargeSummary, isLoading: loadingSummary, refetch: refetchSummary } = useDischargeSummary(id);

  const isLoading = loadingAdmission || loadingSummary;
  
  // Calculate days admitted
  const daysAdmitted = admission?.admission_date
    ? differenceInDays(new Date(), new Date(admission.admission_date)) + 1
    : 0;

  // Check summary status
  const summaryStatus = dischargeSummary?.status || "not_started";
  const isSummaryApproved = summaryStatus === "approved" || summaryStatus === "finalized";

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
                  : "text-warning border-warning"
              }
            >
              {isSummaryApproved ? "Sent to Reception" : "Draft"}
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

      {/* Diagnosis Info from Admission */}
    </div>
  );
}

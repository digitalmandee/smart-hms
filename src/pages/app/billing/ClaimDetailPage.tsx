import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useInsuranceClaim, useUpdateInsuranceClaim } from "@/hooks/useInsurance";
import { useNphiesConfig, useSubmitClaimToNphies, useSubmitPreAuth, useCheckClaimStatus } from "@/hooks/useNphiesConfig";
import { ArrowLeft, Send, CheckCircle, XCircle, DollarSign, Building2, FileText, Loader2, CloudUpload, Clock, AlertCircle, RefreshCw, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";
import { DenialManagementPanel } from "@/components/insurance/DenialManagementPanel";
import { ClaimScrubResults } from "@/components/insurance/ClaimScrubResults";
import { ClaimAttachments } from "@/components/insurance/ClaimAttachments";
import { scrubClaim, hasErrors, ScrubResult } from "@/lib/claimScrubber";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  submitted: "bg-blue-500",
  in_review: "bg-yellow-500",
  approved: "bg-green-500",
  partially_approved: "bg-orange-500",
  rejected: "bg-red-500",
  paid: "bg-emerald-600",
};

const nphiesStatusConfig: Record<string, { color: string; icon: any; label: string }> = {
  approved: { color: "text-green-600", icon: CheckCircle, label: "nphies.claimAccepted" },
  rejected: { color: "text-destructive", icon: XCircle, label: "nphies.claimRejected" },
  pending: { color: "text-yellow-600", icon: Clock, label: "nphies.pendingReview" },
  partially_approved: { color: "text-orange-500", icon: AlertCircle, label: "nphies.partiallyApproved" },
};

const preAuthStatusConfig: Record<string, { color: string; icon: any }> = {
  approved: { color: "text-green-600", icon: CheckCircle },
  denied: { color: "text-destructive", icon: XCircle },
  pending: { color: "text-yellow-600", icon: Clock },
};

function NphiesRejectionDetails({ nphiesResponse }: { nphiesResponse: any }) {
  const { t } = useTranslation();
  if (!nphiesResponse) return null;

  const claimResponse = nphiesResponse?.entry?.find(
    (e: any) => e.resource?.resourceType === "ClaimResponse"
  )?.resource;

  const errors = claimResponse?.error || [];
  const adjudication = claimResponse?.adjudication || [];
  const processNotes = claimResponse?.processNote || [];

  if (errors.length === 0 && adjudication.length === 0 && processNotes.length === 0) return null;

  return (
    <div className="space-y-3">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("nphies.rejectionReasons" as any, "Rejection Reasons")}</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {errors.map((err: any, idx: number) => (
                <li key={idx} className="text-sm">
                  {err.code?.coding?.[0]?.display || err.code?.text || `Error code: ${err.code?.coding?.[0]?.code || "unknown"}`}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      {processNotes.length > 0 && (
        <div className="p-3 rounded-lg bg-muted">
          <Label className="text-muted-foreground text-xs">{t("nphies.processNotes" as any, "Process Notes")}</Label>
          {processNotes.map((note: any, idx: number) => (
            <p key={idx} className="text-sm mt-1">{note.text}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClaimDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [rejectionReason, setRejectionReason] = useState("");
  const [scrubResults, setScrubResults] = useState<ScrubResult[]>([]);

  const handleRunValidation = () => {
    if (!claim) return;
    const results = scrubClaim({
      patient_insurance_id: claim.patient_insurance_id,
      claim_date: claim.claim_date,
      total_amount: claim.total_amount,
      icd_codes: claim.icd_codes || [],
      pre_auth_number: claim.pre_auth_number || undefined,
      pre_auth_required: claim.patient_insurance?.insurance_plan?.pre_auth_required,
      items: (claim as any).items || [],
    });
    setScrubResults(results);
  };

  const { data: claim, isLoading } = useInsuranceClaim(id!);
  const updateClaim = useUpdateInsuranceClaim();
  const { data: nphiesConfig } = useNphiesConfig();
  const submitToNphies = useSubmitClaimToNphies();
  const submitPreAuth = useSubmitPreAuth();
  const checkStatus = useCheckClaimStatus();

  const isNphiesEnabled = nphiesConfig?.nphies_enabled === true;
  const canSubmitToNphies = isNphiesEnabled && claim && ['draft', 'submitted'].includes(claim.status) && !claim.nphies_claim_id;
  const canResubmit = isNphiesEnabled && claim?.nphies_status === "rejected";
  const canRefreshStatus = isNphiesEnabled && claim?.nphies_claim_id && claim?.nphies_status === "pending";
  const canRequestPreAuth = isNphiesEnabled && claim && !claim.pre_auth_number && ['draft', 'submitted'].includes(claim.status);

  const handleSubmitClaim = async () => {
    try {
      await updateClaim.mutateAsync({ id: id!, status: 'submitted' } as any);
      toast.success('Claim submitted successfully');
    } catch (error) {
      toast.error('Failed to submit claim');
    }
  };

  const handleSubmitToNphies = async () => {
    if (!id || !claim) return;
    // Auto-validate before NPHIES submission
    const results = scrubClaim({
      patient_insurance_id: claim.patient_insurance_id,
      claim_date: claim.claim_date,
      total_amount: claim.total_amount,
      icd_codes: claim.icd_codes || [],
      pre_auth_number: claim.pre_auth_number || undefined,
      pre_auth_required: claim.patient_insurance?.insurance_plan?.pre_auth_required,
      items: (claim as any).items || [],
    });
    setScrubResults(results);
    if (hasErrors(results)) {
      toast.error("Please fix validation errors before submitting to NPHIES");
      return;
    }
    submitToNphies.mutate(id);
  };

  const handleResubmitToNphies = async (updates?: { icd_codes?: string[]; notes?: string }) => {
    if (!id) return;
    // Clear old NPHIES data and apply edits before resubmitting
    const updateData: any = {
      id: id!,
      nphies_claim_id: null,
      nphies_status: null,
      nphies_response: null,
      denial_reasons: null,
      status: 'submitted',
    };
    if (updates?.icd_codes) updateData.icd_codes = updates.icd_codes;
    if (updates?.notes) updateData.notes = updates.notes;
    await updateClaim.mutateAsync(updateData);
    submitToNphies.mutate(id);
  };

  const handleRefreshStatus = async () => {
    if (!id) return;
    checkStatus.mutate(id);
  };

  const handleRequestPreAuth = async () => {
    if (!id) return;
    submitPreAuth.mutate(id);
  };

  const handleApproveClaim = async () => {
    try {
      await updateClaim.mutateAsync({
        id: id!,
        status: approvedAmount >= (claim?.total_amount || 0) ? 'approved' : 'partially_approved',
        approved_amount: approvedAmount,
        patient_responsibility: (claim?.total_amount || 0) - approvedAmount,
      } as any);
      toast.success('Claim approved');
      setIsApproveDialogOpen(false);
    } catch (error) {
      toast.error('Failed to approve claim');
    }
  };

  const handleRejectClaim = async () => {
    try {
      await updateClaim.mutateAsync({ id: id!, status: 'rejected', rejection_reason: rejectionReason });
      toast.success('Claim rejected');
      setIsRejectDialogOpen(false);
    } catch (error) {
      toast.error('Failed to reject claim');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await updateClaim.mutateAsync({ id: id!, status: 'paid' });
      toast.success('Claim marked as paid');
    } catch (error) {
      toast.error('Failed to update claim');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!claim) {
    return <div>Claim not found</div>;
  }

  const nphiesStatus = claim.nphies_status ? nphiesStatusConfig[claim.nphies_status] : null;
  const preAuthBadge = claim.pre_auth_status ? preAuthStatusConfig[claim.pre_auth_status] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Claim ${claim.claim_number}`}
        description="Insurance claim details"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={() => navigate('/app/billing/claims')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {claim.status === 'draft' && (
              <Button onClick={handleSubmitClaim}>
                <Send className="h-4 w-4 mr-2" />
                Submit Claim
              </Button>
            )}

            {canRequestPreAuth && (
              <Button
                variant="outline"
                onClick={handleRequestPreAuth}
                disabled={submitPreAuth.isPending}
              >
                {submitPreAuth.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4 mr-2" />
                )}
                {t("nphies.requestPreAuth" as any, "Request Pre-Auth")}
              </Button>
            )}

            {claim.status === 'draft' && (
              <Button variant="outline" onClick={handleRunValidation}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Run Validation
              </Button>
            )}

            {canSubmitToNphies && (
              <Button
                onClick={handleSubmitToNphies}
                disabled={submitToNphies.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {submitToNphies.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CloudUpload className="h-4 w-4 mr-2" />
                )}
                {t("nphies.submitToNphies" as any, "Submit to NPHIES")}
              </Button>
            )}

            {canResubmit && (
              <Button
                onClick={() => handleResubmitToNphies()}
                disabled={submitToNphies.isPending}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                {submitToNphies.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                {t("nphies.resubmitToNphies" as any, "Resubmit to NPHIES")}
              </Button>
            )}

            {canRefreshStatus && (
              <Button
                variant="outline"
                onClick={handleRefreshStatus}
                disabled={checkStatus.isPending}
              >
                {checkStatus.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {t("nphies.refreshStatus" as any, "Refresh Status")}
              </Button>
            )}

            {claim.status === 'submitted' && (
              <>
                <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Claim</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Claim Amount</Label>
                        <p className="text-lg font-medium">{formatCurrency(claim.total_amount)}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Approved Amount</Label>
                        <Input
                          type="number"
                          value={approvedAmount}
                          onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || 0)}
                          max={claim.total_amount}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleApproveClaim} className="bg-green-600 hover:bg-green-700">Confirm Approval</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Claim</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Rejection Reason</Label>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Enter reason for rejection..."
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRejectClaim}>Confirm Rejection</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {(claim.status === 'approved' || claim.status === 'partially_approved') && (
              <Button onClick={handleMarkPaid} className="bg-emerald-600 hover:bg-emerald-700">
                <DollarSign className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            )}
          </div>
        }
      />

      {/* Status Banner */}
      <Card className={`border-l-4 ${statusColors[claim.status] ? 'border-l-' + statusColors[claim.status].replace('bg-', '') : ''}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={statusColors[claim.status]} variant="secondary">
                {claim.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-muted-foreground">
                Created on {format(new Date(claim.created_at), 'PPP')}
              </span>
            </div>
            {/* Pre-Auth Badge */}
            {claim.pre_auth_number && preAuthBadge && (
              <div className={`flex items-center gap-1.5 ${preAuthBadge.color}`}>
                <preAuthBadge.icon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t("nphies.preAuth" as any, "Pre-Auth")}: {claim.pre_auth_status}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* NPHIES Status Card */}
      {claim.nphies_claim_id && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudUpload className="h-5 w-5" />
              {t("nphies.nphiesStatus" as any, "NPHIES Status")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">{t("nphies.nphiesClaimId" as any, "NPHIES Claim ID")}</Label>
                <p className="font-mono font-medium text-sm">{claim.nphies_claim_id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("nphies.nphiesStatus" as any, "Status")}</Label>
                {nphiesStatus && (
                  <div className={`flex items-center gap-1.5 font-medium ${nphiesStatus.color}`}>
                    <nphiesStatus.icon className="h-4 w-4" />
                    {t(nphiesStatus.label as any, claim.nphies_status || "")}
                  </div>
                )}
              </div>
              {claim.submission_date && (
                <div>
                  <Label className="text-muted-foreground">{t("nphies.submissionDate" as any, "Submitted")}</Label>
                  <p className="font-medium">{format(new Date(claim.submission_date), 'PPp')}</p>
                </div>
              )}
            </div>

            {/* Denial Management Panel - replaces simple NphiesRejectionDetails */}
            {(claim.nphies_status === "rejected" || claim.nphies_status === "partially_approved") && (
              <DenialManagementPanel
                nphiesResponse={claim.nphies_response}
                denialReasons={claim.denial_reasons as any}
                resubmissionCount={claim.resubmission_count || 0}
                claimId={claim.id}
                currentIcdCodes={claim.icd_codes || []}
                currentNotes={claim.notes || ""}
                onEditAndResubmit={handleResubmitToNphies}
                isResubmitting={submitToNphies.isPending}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Pre-Auth Card */}
      {claim.pre_auth_number && (
        <Card className="border-l-4 border-l-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              {t("nphies.preAuthDetails" as any, "Pre-Authorization")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">{t("nphies.preAuthNumber" as any, "Pre-Auth Number")}</Label>
                <p className="font-mono font-medium text-sm">{claim.pre_auth_number}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("common.status")}</Label>
                {preAuthBadge && (
                  <div className={`flex items-center gap-1.5 font-medium ${preAuthBadge.color}`}>
                    <preAuthBadge.icon className="h-4 w-4" />
                    {claim.pre_auth_status}
                  </div>
                )}
              </div>
              {claim.pre_auth_date && (
                <div>
                  <Label className="text-muted-foreground">{t("common.date")}</Label>
                  <p className="font-medium">{format(new Date(claim.pre_auth_date), 'PPP')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Claim Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Claim Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Claim Number</Label>
                <p className="font-medium">{claim.claim_number}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Claim Date</Label>
                <p className="font-medium">{format(new Date(claim.claim_date), 'PPP')}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold text-lg">{formatCurrency(claim.total_amount)}</span>
              </div>
              {claim.approved_amount !== null && (
                <div className="flex justify-between text-green-600">
                  <span>Approved Amount</span>
                  <span className="font-medium">{formatCurrency(claim.approved_amount)}</span>
                </div>
              )}
              {claim.copay_amount && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Copay</span>
                  <span>{formatCurrency(claim.copay_amount)}</span>
                </div>
              )}
              {claim.deductible_amount && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Deductible</span>
                  <span>{formatCurrency(claim.deductible_amount)}</span>
                </div>
              )}
              {claim.patient_responsibility && (
                <div className="flex justify-between font-medium">
                  <span>Patient Responsibility</span>
                  <span>{formatCurrency(claim.patient_responsibility)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Insurance Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Insurance Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {claim.patient_insurance && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Insurance Company</Label>
                    <p className="font-medium">
                      {claim.patient_insurance.insurance_plan?.insurance_company?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Plan</Label>
                    <p className="font-medium">
                      {claim.patient_insurance.insurance_plan?.name || '-'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Policy Number</Label>
                    <p className="font-medium">{claim.patient_insurance.policy_number}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Member ID</Label>
                    <p className="font-medium">{claim.patient_insurance.member_id || '-'}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Validation Results */}
      {scrubResults.length > 0 && (
        <ClaimScrubResults results={scrubResults} />
      )}

      {/* Notes & Rejection Reason */}
      {(claim.notes || claim.rejection_reason) && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {claim.notes && (
              <div>
                <Label className="text-muted-foreground">Claim Notes</Label>
                <p className="mt-1">{claim.notes}</p>
              </div>
            )}
            {claim.rejection_reason && (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <Label className="text-destructive">Rejection Reason</Label>
                <p className="mt-1 text-destructive">{claim.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

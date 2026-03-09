import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLabOrder, useUpdateLabOrderItem, useMarkSampleCollected, useCompleteLabOrder } from "@/hooks/useLabOrders";
import { usePublishLabReport } from "@/hooks/usePublicLabReport";
import { useLabSettings } from "@/hooks/useLabSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { SehhatyPushButton } from "@/components/clinical/SehhatyPushButton";
import { usePrint } from "@/hooks/usePrint";
import { useOrganizationBranding } from "@/hooks/useOrganizationBranding";
import { PageHeader } from "@/components/PageHeader";
import { TestResultForm } from "@/components/lab/TestResultForm";
import { PrintableLabReport } from "@/components/lab/PrintableLabReport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Printer, CheckCircle, Loader2, User, Calendar, Stethoscope, FlaskConical, AlertTriangle, Globe, Copy, Mail, Barcode, CreditCard } from "lucide-react";
import { format, differenceInYears } from "date-fns";

const priorityConfig = {
  routine: { label: "Routine", className: "bg-blue-100 text-blue-800" },
  urgent: { label: "Urgent", className: "bg-orange-100 text-orange-800" },
  stat: { label: "STAT", className: "bg-red-100 text-red-800 font-bold" },
};

const statusConfig = {
  ordered: { label: "Ordered", className: "bg-yellow-100 text-yellow-800" },
  collected: { label: "Sample Collected", className: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", className: "bg-purple-100 text-purple-800" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
};

export default function LabResultEntryPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { country_code } = useCountryConfig();
  const { data: labOrder, isLoading } = useLabOrder(orderId);
  const { data: labSettings } = useLabSettings();
  const { data: branding } = useOrganizationBranding();
  const updateItem = useUpdateLabOrderItem();
  const markCollected = useMarkSampleCollected();
  const completeOrder = useCompleteLabOrder();
  const publishReport = usePublishLabReport();
  const { printRef, handlePrint } = usePrint();

  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [resultNotes, setResultNotes] = useState("");
  const [sampleNumber, setSampleNumber] = useState("");
  const userEditedBarcode = useRef(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!labOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium">Lab order not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app/lab/queue")}>
          Back to Queue
        </Button>
      </div>
    );
  }

  const patient = labOrder.patient;
  const doctor = labOrder.doctor as { profile?: { full_name: string }; specialization?: string } | undefined;
  const priority = priorityConfig[labOrder.priority] || priorityConfig.routine;
  const status = statusConfig[labOrder.status] || statusConfig.ordered;

  // Auto-generate barcode based on test category prefix
  if (!barcodeGenerated && labOrder && !sampleNumber && labOrder.status === "ordered") {
    const categoryPrefixes: Record<string, string> = {
      blood: "BLD",
      urine: "URN",
      stool: "STL",
      imaging: "IMG",
      microbiology: "MIC",
      biochemistry: "BCH",
      hematology: "HEM",
      serology: "SER",
      pathology: "PTH",
      lab: "LAB",
    };
    const firstItem = labOrder.items?.[0];
    const category = firstItem?.test_category?.toLowerCase() || "lab";
    const prefix = categoryPrefixes[category] || "LAB";
    const datePart = format(new Date(), "yyMMdd");
    // Extract sequence from order number (e.g., LO-260309-0004 → 0004)
    const seqMatch = labOrder.order_number.match(/(\d+)$/);
    const seq = seqMatch ? seqMatch[1] : String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    setSampleNumber(`${prefix}-${datePart}-${seq}`);
    setBarcodeGenerated(true);
  }

  const patientAge = patient?.date_of_birth
    ? differenceInYears(new Date(), new Date(patient.date_of_birth))
    : null;

  const completedItemsCount = labOrder.items?.filter((i) => i.status === "completed").length || 0;
  const totalItemsCount = labOrder.items?.length || 0;
  const allItemsCompleted = completedItemsCount === totalItemsCount && totalItemsCount > 0;
  const isOrderCompleted = labOrder.status === "completed";
  
  // Check payment and settings for allowing unpaid processing
  const isPaid = labOrder.payment_status === "paid" || labOrder.payment_status === "waived";
  const allowUnpaid = labSettings?.allow_unpaid_processing ?? false;
  const canProcessUnpaid = isPaid || allowUnpaid;

  const handleSaveTestResult = async (
    itemId: string,
    results: Record<string, string | number>,
    notes: string
  ) => {
    setSavingItemId(itemId);
    try {
      await updateItem.mutateAsync({
        id: itemId,
        result_values: results,
        result_notes: notes,
        status: "completed",
        performed_by: profile?.id,
      });
      toast.success("Test result saved successfully");
    } catch (error) {
      toast.error("Failed to save test result");
    } finally {
      setSavingItemId(null);
    }
  };

  const handleMarkCollected = async () => {
    if (!sampleNumber.trim()) {
      toast.error("Please enter a sample number/barcode");
      return;
    }
    try {
      await markCollected.mutateAsync({ orderId: labOrder.id, sampleNumber: sampleNumber.trim() });
      toast.success("Sample collected! You can now enter test results.");
    } catch (error) {
      toast.error("Failed to collect sample");
    }
  };

  // Allow updating results even after order is completed
  const handleUpdateTestResult = async (
    itemId: string,
    results: Record<string, string | number>,
    notes: string
  ) => {
    setSavingItemId(itemId);
    try {
      await updateItem.mutateAsync({
        id: itemId,
        result_values: results,
        result_notes: notes,
        status: "completed",
        performed_by: profile?.id,
      });
      toast.success(isOrderCompleted ? "Results updated successfully" : "Test result saved successfully");
    } catch (error) {
      toast.error("Failed to save test result");
    } finally {
      setSavingItemId(null);
    }
  };

  const handleCompleteOrder = async () => {
    if (!allItemsCompleted) {
      toast.error("Please complete all tests before finalizing the order");
      return;
    }

    try {
      await completeOrder.mutateAsync({
        orderId: labOrder.id,
        result_notes: resultNotes,
      });
      toast.success("Lab order completed successfully");
    } catch (error) {
      toast.error("Failed to complete order");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/lab/queue")} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
          <PageHeader
            title={`Lab Order: ${labOrder.order_number}`}
            description="Enter test results and complete the order"
          />
        </div>

        <Button onClick={() => handlePrint()} disabled={!isOrderCompleted}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
      </div>
      {/* Order Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Order Details</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={priority.className}>{priority.label}</Badge>
              <Badge className={status.className}>{status.label}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">
                  {patient?.first_name} {patient?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {patient?.patient_number}
                  {patientAge !== null && ` • ${patientAge}Y`}
                  {patient?.gender && ` • ${patient.gender}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Referred By</p>
                <p className="font-medium">Dr. {doctor?.profile?.full_name || "Unknown"}</p>
                {doctor?.specialization && (
                  <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{format(new Date(labOrder.created_at), "MMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(labOrder.created_at), "h:mm a")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FlaskConical className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-medium">{completedItemsCount} / {totalItemsCount} tests done</p>
              </div>
            </div>
          </div>

          {labOrder.clinical_notes && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Clinical Notes</p>
                <p className="text-sm bg-muted/50 p-3 rounded-md">{labOrder.clinical_notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sample Collection Status - Payment Required Warning */}
      {labOrder.status === "ordered" && !canProcessUnpaid && (
        <Card className="border-yellow-300 bg-yellow-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Payment Required</p>
                <p className="text-sm text-yellow-600">
                  This order requires payment before sample collection. Please collect payment first or enable "Allow Processing Unpaid Orders" in Lab Settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Collection Form - Show when order is pending collection and payment is cleared or unpaid processing allowed */}
      {labOrder.status === "ordered" && canProcessUnpaid && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Sample Not Collected</p>
                  <p className="text-sm text-orange-600">Enter sample number and mark as collected to enable result entry</p>
                  {!isPaid && (
                    <Badge variant="outline" className="mt-1 text-yellow-700 border-yellow-400 bg-yellow-50">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Payment Pending - Processing allowed
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="sample-number" className="text-orange-800">
                    Sample Number / Barcode <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sample-number"
                      value={sampleNumber}
                      onChange={(e) => setSampleNumber(e.target.value)}
                      placeholder="e.g., LAB-2601170001"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleMarkCollected} 
                  disabled={markCollected.isPending || !sampleNumber.trim()}
                >
                  {markCollected.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Mark Sample Collected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {labOrder.status === "collected" && !isOrderCompleted && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Sample Collected</p>
                  <p className="text-sm text-blue-600">Enter results for each test below, then finalize the report</p>
                </div>
              </div>
              {(labOrder as unknown as { sample_number?: string }).sample_number && (
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  <Barcode className="h-3 w-3 mr-1" />
                  {(labOrder as unknown as { sample_number: string }).sample_number}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results Forms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Test Results</h3>
          {isOrderCompleted && (
            <Badge variant="outline" className="text-green-600 border-green-300">
              Results can be updated anytime
            </Badge>
          )}
        </div>
        {labOrder.items?.map((item) => (
          <TestResultForm
            key={item.id}
            item={item}
            onSave={isOrderCompleted ? handleUpdateTestResult : handleSaveTestResult}
            isSaving={savingItemId === item.id}
            isEditable={labOrder.status !== "ordered" || (labOrder.status === "ordered" && canProcessUnpaid)}
            showUpdateLabel={isOrderCompleted && item.status === "completed"}
            patientInfo={{
              name: `${patient?.first_name || ""} ${patient?.last_name || ""}`.trim(),
              patientNumber: patient?.patient_number || "",
              age: patientAge,
              gender: patient?.gender,
            }}
            orderInfo={{
              orderNumber: labOrder.order_number,
              orderDate: labOrder.created_at,
              sampleNumber: (labOrder as unknown as { sample_number?: string }).sample_number,
              doctorName: doctor?.profile?.full_name,
            }}
          />
        ))}
      </div>

      {/* Complete Order Section */}
      {!isOrderCompleted && allItemsCompleted && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">All tests completed!</span>
              </div>

              <div className="space-y-2">
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  value={resultNotes}
                  onChange={(e) => setResultNotes(e.target.value)}
                  placeholder="Any additional notes for this lab report..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleCompleteOrder}
                disabled={completeOrder.isPending}
                className="w-full sm:w-auto"
                size="lg"
              >
                {completeOrder.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Complete & Finalize Report
              </Button>
            </div>
        </CardContent>
        </Card>
      )}

      {/* Publish Section - visible after order completed */}
      {isOrderCompleted && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Publish & Share Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Make report available online</p>
                <p className="text-sm text-muted-foreground">
                  Patients can view their results at /lab-reports
                </p>
              </div>
              <Switch
                checked={(labOrder as unknown as { is_published?: boolean }).is_published || false}
                onCheckedChange={async (checked) => {
                  try {
                    const result = await publishReport.mutateAsync({ orderId: labOrder.id, publish: checked });
                    if (checked && result.accessCode) {
                      toast.success(`Published! Access code: ${result.accessCode}`);
                    } else {
                      toast.success("Report unpublished");
                    }
                  } catch {
                    toast.error("Failed to update publish status");
                  }
                }}
                disabled={publishReport.isPending}
              />
            </div>

            {(labOrder as unknown as { is_published?: boolean }).is_published && (
              <>
                <Separator />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Access Code</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-lg font-bold">
                        {(labOrder as unknown as { access_code?: string }).access_code || "------"}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText((labOrder as unknown as { access_code?: string }).access_code || "");
                          toast.success("Access code copied!");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Published At</p>
                    <p className="font-medium">
                      {(labOrder as unknown as { published_at?: string }).published_at
                        ? format(new Date((labOrder as unknown as { published_at: string }).published_at), "MMM d, yyyy h:mm a")
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" className="sm:w-auto">
                    <Mail className="h-4 w-4 mr-2" />
                    Send to Patient Email
                  </Button>
                  {country_code === 'SA' && patient && (
                    <SehhatyPushButton
                      syncType="lab_result"
                      patientId={patient.id}
                      patientNationalId={(patient as any).national_id}
                      referenceId={labOrder.id}
                      referenceType="lab_order"
                      syncData={{
                        order_number: labOrder.order_number,
                        tests: labOrder.items?.map(i => i.test_name).join(', '),
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Print Component (hidden) */}
      <div className="hidden">
        <PrintableLabReport
          ref={printRef}
          labOrder={labOrder}
          organization={branding ? {
            name: branding.name,
            address: branding.address,
            phone: branding.phone,
            email: branding.email,
            logo_url: branding.logo_url,
            slug: branding.slug,
            registration_number: branding.registration_number,
            tax_id: branding.tax_id,
          } : undefined}
          performedBy={profile?.full_name}
        />
      </div>
    </div>
  );
}

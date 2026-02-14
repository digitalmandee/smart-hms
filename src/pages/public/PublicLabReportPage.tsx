import { useState, useRef } from "react";
import { useSearchPublicLabReport, useSearchPatientReports, PublicLabReport, PatientReportSummary } from "@/hooks/usePublicLabReport";
import { useLabTestTemplates } from "@/hooks/useLabTemplateManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Search, Loader2, FlaskConical, User, Calendar, Stethoscope, AlertTriangle, Download, Printer, CheckCircle, XCircle, ArrowLeft, FileText, List } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PublicLabReportPage() {
  // Order number search state
  const [orderNumber, setOrderNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [report, setReport] = useState<PublicLabReport | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // MR number search state
  const [mrNumber, setMrNumber] = useState("");
  const [mrVerificationCode, setMrVerificationCode] = useState("");
  const [patientInfo, setPatientInfo] = useState<PublicLabReport["patient"] | null>(null);
  const [patientReports, setPatientReports] = useState<PatientReportSummary[]>([]);
  const [hasMrSearched, setHasMrSearched] = useState(false);
  
  const [searchTab, setSearchTab] = useState<"order" | "mr">("order");
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const searchMutation = useSearchPublicLabReport();
  const searchPatientMutation = useSearchPatientReports();
  const { data: templates = [] } = useLabTestTemplates();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);
    try {
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const el = printRef.current;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? "portrait" : "landscape",
        unit: "mm",
        format: [imgWidth, imgHeight],
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Lab-Report-${report?.order_number || "report"}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);

    if (!orderNumber || !verificationCode) {
      toast.error("Please enter both Order Number and Verification Code");
      return;
    }

    try {
      const result = await searchMutation.mutateAsync({ orderNumber, verificationCode });
      setReport(result);
      if (result) {
        toast.success("Lab report found!");
      }
    } catch {
      toast.error("Report not found or invalid verification code");
      setReport(null);
    }
  };

  const handleMrSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasMrSearched(true);

    if (!mrNumber || !mrVerificationCode) {
      toast.error("Please enter both MR Number and Phone Last 4 Digits");
      return;
    }

    try {
      const result = await searchPatientMutation.mutateAsync({ 
        patientNumber: mrNumber, 
        verificationCode: mrVerificationCode 
      });
      setPatientInfo(result.patient);
      setPatientReports(result.reports);
      if (result.reports.length > 0) {
        toast.success(`Found ${result.reports.length} report(s)!`);
      } else {
        toast.info("No published reports found for this patient");
      }
    } catch {
      toast.error("Patient not found or invalid phone number");
      setPatientInfo(null);
      setPatientReports([]);
    }
  };

  const handleViewReport = async (reportOrderNumber: string) => {
    // Use the verification code from MR search to view specific report
    try {
      const result = await searchMutation.mutateAsync({ 
        orderNumber: reportOrderNumber, 
        verificationCode: mrVerificationCode 
      });
      setReport(result);
      if (result) {
        toast.success("Lab report loaded!");
      }
    } catch {
      toast.error("Failed to load report");
    }
  };

  const handleBackToList = () => {
    setReport(null);
  };

  const handleNewSearch = () => {
    setReport(null);
    setPatientInfo(null);
    setPatientReports([]);
    setHasSearched(false);
    setHasMrSearched(false);
    setOrderNumber("");
    setVerificationCode("");
    setMrNumber("");
    setMrVerificationCode("");
  };

  const getTemplate = (testName: string) => {
    return templates.find((t) => t.test_name.toLowerCase() === testName.toLowerCase());
  };

  const isValueAbnormal = (value: string | number, field: { normalMin?: number; normalMax?: number }) => {
    if (typeof value !== "number" && typeof value !== "string") return false;
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return false;
    if (field.normalMin !== undefined && numValue < field.normalMin) return true;
    if (field.normalMax !== undefined && numValue > field.normalMax) return true;
    return false;
  };

  const patientAge = report?.patient?.date_of_birth
    ? differenceInYears(new Date(), new Date(report.patient.date_of_birth))
    : null;

  const groupedItems = report?.items?.reduce((acc, item) => {
    const category = item.test_category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof report.items>) || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <FlaskConical className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Lab Report Portal</h1>
          </div>
          <p className="text-primary-foreground/80">
            Search and view your lab test results securely
          </p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Search Forms - Show when no report is displayed */}
        {!report && !patientInfo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Your Lab Reports
              </CardTitle>
              <CardDescription>
                Search by Order Number or MR Number to view your results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={searchTab} onValueChange={(v) => setSearchTab(v as "order" | "mr")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="order" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    By Order Number
                  </TabsTrigger>
                  <TabsTrigger value="mr" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    By MR Number
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="order">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="orderNumber">Order Number</Label>
                        <Input
                          id="orderNumber"
                          placeholder="e.g., LO-260117-0001"
                          value={orderNumber}
                          onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                          className="uppercase"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="verificationCode">
                          Access Code / Phone (Last 4 digits)
                        </Label>
                        <Input
                          id="verificationCode"
                          placeholder="e.g., 123456 or 1234"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          maxLength={6}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full sm:w-auto" disabled={searchMutation.isPending}>
                      {searchMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search Report
                        </>
                      )}
                    </Button>
                  </form>

                  {hasSearched && !report && !searchMutation.isPending && (
                    <div className="mt-6 p-4 bg-destructive/10 rounded-lg flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">Report not found</p>
                        <p className="text-sm text-muted-foreground">
                          Please verify your Order Number and Verification Code are correct
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="mr">
                  <form onSubmit={handleMrSearch} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="mrNumber">MR / Patient Number</Label>
                        <Input
                          id="mrNumber"
                          placeholder="e.g., SHIFA-SMC-260116-0009"
                          value={mrNumber}
                          onChange={(e) => setMrNumber(e.target.value.toUpperCase())}
                          className="uppercase"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mrVerificationCode">
                          Phone (Last 4 digits)
                        </Label>
                        <Input
                          id="mrVerificationCode"
                          placeholder="e.g., 1234"
                          value={mrVerificationCode}
                          onChange={(e) => setMrVerificationCode(e.target.value)}
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full sm:w-auto" disabled={searchPatientMutation.isPending}>
                      {searchPatientMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Find My Reports
                        </>
                      )}
                    </Button>
                  </form>

                  {hasMrSearched && !patientInfo && !searchPatientMutation.isPending && (
                    <div className="mt-6 p-4 bg-destructive/10 rounded-lg flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">Patient not found</p>
                        <p className="text-sm text-muted-foreground">
                          Please verify your MR Number and Phone Last 4 Digits are correct
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Patient Reports List */}
        {patientInfo && !report && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={handleNewSearch}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Search
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <CardTitle>{patientInfo.first_name} {patientInfo.last_name}</CardTitle>
                    <CardDescription>{patientInfo.patient_number}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Your Lab Reports ({patientReports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patientReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No published lab reports found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientReports.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{r.order_number}</span>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {r.status === "completed" ? "Completed" : r.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {r.test_names.slice(0, 3).join(", ")}
                            {r.test_names.length > 3 && ` +${r.test_names.length - 3} more`}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(r.completed_at || r.created_at), "MMM d, yyyy")}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewReport(r.order_number)}
                          disabled={searchMutation.isPending}
                        >
                          {searchMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "View Report"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Display */}
        {report && (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {patientInfo ? (
                <Button variant="outline" onClick={handleBackToList}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to List
                </Button>
              ) : (
                <Button variant="outline" onClick={handleNewSearch}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Search Another
                </Button>
              )}
              <div className="flex-1" />
              <Button variant="outline" onClick={() => handlePrint()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                {isDownloading ? "Generating…" : "Download PDF"}
              </Button>
            </div>

            {/* Report Content */}
            <div ref={printRef} className="bg-white print:p-8">
              {/* Header */}
              <Card className="mb-6 print:shadow-none print:border-b print:rounded-none">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">Laboratory Report</h2>
                      <p className="text-muted-foreground">{report.order_number}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {report.status === "completed" ? "Completed" : report.status}
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Patient</p>
                        <p className="font-medium">
                          {report.patient.first_name} {report.patient.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.patient.patient_number}
                          {patientAge !== null && ` • ${patientAge}Y`}
                          {report.patient.gender && ` • ${report.patient.gender}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ordered By</p>
                        <p className="font-medium">
                          Dr. {report.doctor?.profile?.full_name || "Unknown"}
                        </p>
                        {report.doctor?.specialization && (
                          <p className="text-xs text-muted-foreground">
                            {report.doctor.specialization}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Report Date</p>
                        <p className="font-medium">
                          {report.completed_at
                            ? format(new Date(report.completed_at), "MMM d, yyyy")
                            : format(new Date(report.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FlaskConical className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tests</p>
                        <p className="font-medium">{report.items.length} test(s)</p>
                      </div>
                    </div>
                  </div>

                  {report.clinical_notes && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Clinical Notes</p>
                        <p className="text-sm bg-muted/50 p-3 rounded-md">{report.clinical_notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Test Results */}
              {Object.entries(groupedItems).map(([category, items]) => (
                <Card key={category} className="mb-4 print:shadow-none print:break-inside-avoid">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {items.map((item) => {
                      const template = getTemplate(item.test_name);
                      const fields = template?.fields as Array<{
                        name: string;
                        unit?: string;
                        type?: string;
                        normalMin?: number;
                        normalMax?: number;
                      }> | undefined;

                      return (
                        <div key={item.id} className="mb-6 last:mb-0">
                          <h4 className="font-medium mb-3">{item.test_name}</h4>
                          
                          {fields && item.result_values ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2 font-medium">Parameter</th>
                                    <th className="text-left py-2 font-medium">Result</th>
                                    <th className="text-left py-2 font-medium">Unit</th>
                                    <th className="text-left py-2 font-medium">Normal Range</th>
                                    <th className="text-left py-2 font-medium">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {fields.map((field) => {
                                    const value = item.result_values?.[field.name];
                                    const isAbnormal = isValueAbnormal(value as string | number, field);
                                    const normalRange =
                                      field.normalMin !== undefined && field.normalMax !== undefined
                                        ? `${field.normalMin} - ${field.normalMax}`
                                        : field.normalMin !== undefined
                                        ? `> ${field.normalMin}`
                                        : field.normalMax !== undefined
                                        ? `< ${field.normalMax}`
                                        : "-";

                                    return (
                                      <tr key={field.name} className="border-b last:border-0">
                                        <td className="py-2">{field.name}</td>
                                        <td className={`py-2 font-medium ${isAbnormal ? "text-destructive" : ""}`}>
                                          {value ?? "-"}
                                        </td>
                                        <td className="py-2 text-muted-foreground">{field.unit || "-"}</td>
                                        <td className="py-2 text-muted-foreground">{normalRange}</td>
                                        <td className="py-2">
                                          {value !== undefined && value !== null && value !== "" ? (
                                            isAbnormal ? (
                                              <Badge variant="destructive" className="text-xs">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Abnormal
                                              </Badge>
                                            ) : (
                                              <Badge className="bg-green-100 text-green-800 text-xs">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Normal
                                              </Badge>
                                            )
                                          ) : (
                                            <span className="text-muted-foreground">-</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : item.result_values ? (
                            <div className="bg-muted/50 p-3 rounded-md">
                              <pre className="text-sm whitespace-pre-wrap">
                                {JSON.stringify(item.result_values, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No results available</p>
                          )}

                          {item.result_notes && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <span className="font-medium">Notes:</span> {item.result_notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}

              {/* Footer */}
              {report.result_notes && (
                <Card className="print:shadow-none">
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-2">Additional Notes</h4>
                    <p className="text-sm text-muted-foreground">{report.result_notes}</p>
                  </CardContent>
                </Card>
              )}

              <div className="mt-6 text-center text-sm text-muted-foreground print:mt-8">
                <p>Report generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
                <p className="mt-1">This is a computer-generated report.</p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!report && !patientInfo && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Order Number:</strong> You can find this on your lab receipt or in the SMS/email
                sent when your tests were ordered. It looks like "LO-260117-0001".
              </p>
              <p>
                <strong>MR/Patient Number:</strong> Your unique patient ID, found on your registration card
                or receipt. It looks like "SHIFA-SMC-260116-0009".
              </p>
              <p>
                <strong>Verification Code:</strong> Either the 6-digit access code sent to you, or the last
                4 digits of your registered phone number.
              </p>
              <p className="pt-2">
                If you need assistance, please contact the lab reception or call our helpline.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
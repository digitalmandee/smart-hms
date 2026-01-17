import { useState, useRef } from "react";
import { useSearchPublicLabReport, PublicLabReport } from "@/hooks/usePublicLabReport";
import { useLabTestTemplates } from "@/hooks/useLabTemplateManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Search, Loader2, FlaskConical, User, Calendar, Stethoscope, AlertTriangle, Download, Printer, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { useReactToPrint } from "react-to-print";

export default function PublicLabReportPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [report, setReport] = useState<PublicLabReport | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const searchMutation = useSearchPublicLabReport();
  const { data: templates = [] } = useLabTestTemplates();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

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
        {/* Search Form */}
        {!report && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Your Lab Report
              </CardTitle>
              <CardDescription>
                Enter your Order Number and Verification Code to view your results
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      Verification Code / Phone (Last 4 digits)
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
            </CardContent>
          </Card>
        )}

        {/* Report Display */}
        {report && (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => setReport(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Search Another
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => handlePrint()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => handlePrint()}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
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
        {!report && (
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
                <strong>Verification Code:</strong> This is a 6-digit code sent to your phone/email, or
                you can use the last 4 digits of your registered phone number.
              </p>
              <p>
                If you're having trouble accessing your report, please contact the lab or hospital
                where your tests were conducted.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

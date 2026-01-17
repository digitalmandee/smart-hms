import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { ArrowLeft, Printer, FileText, Calendar, Briefcase, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMedicalCertificates, useCreateMedicalCertificate, useIncrementPrintCount, CertificateType } from "@/hooks/useMedicalCertificates";
import { PrintableFitnessCertificate } from "@/components/certificates/PrintableFitnessCertificate";
import { PrintableSickLeaveCertificate } from "@/components/certificates/PrintableSickLeaveCertificate";
import { MedicalCertificateForm } from "@/components/certificates/MedicalCertificateForm";
import { useDoctors } from "@/hooks/useDoctors";

const certificateTypes: { value: CertificateType; label: string; icon: any }[] = [
  { value: "fitness", label: "Fitness", icon: Briefcase },
  { value: "sick_leave", label: "Sick Leave", icon: Clock },
  { value: "disability", label: "Disability", icon: FileText },
  { value: "medical_report", label: "Medical Report", icon: FileText },
];

export default function CertificatesPage() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patient") || undefined;
  const { data: certificates, isLoading } = useMedicalCertificates(patientId);
  const { data: doctors } = useDoctors();
  const createCertificate = useCreateMedicalCertificate();
  const incrementPrint = useIncrementPrintCount();
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedCertificate, setSelectedCertificate] = React.useState<any>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [formType, setFormType] = React.useState<CertificateType>("fitness");

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => {
      if (selectedCertificate) {
        incrementPrint.mutate(selectedCertificate.id);
      }
    },
  });

  const getCertificateTypeLabel = (type: string) => {
    const found = certificateTypes.find((t) => t.value === type);
    return found?.label || type;
  };

  const getFitnessStatusBadge = (status: string | null) => {
    switch (status) {
      case "fit":
        return <Badge className="bg-green-100 text-green-800">Fit</Badge>;
      case "unfit":
        return <Badge variant="destructive">Unfit</Badge>;
      case "fit_with_restrictions":
        return <Badge className="bg-yellow-100 text-yellow-800">Fit with Restrictions</Badge>;
      case "temporarily_unfit":
        return <Badge className="bg-orange-100 text-orange-800">Temporarily Unfit</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Medical Certificates</h1>
            <p className="text-muted-foreground">
              Issue and manage medical certificates
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "View Certificates" : "Issue Certificate"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Issue New Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={formType} onValueChange={(v) => setFormType(v as CertificateType)}>
              <TabsList className="grid grid-cols-4 w-full max-w-lg">
                {certificateTypes.map((type) => (
                  <TabsTrigger key={type.value} value={type.value}>
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <MedicalCertificateForm
              certificateType={formType}
              onSubmit={(data) => {
                createCertificate.mutate(data, {
                  onSuccess: () => setShowForm(false),
                });
              }}
              isLoading={createCertificate.isPending}
              doctors={doctors || []}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : certificates?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Certificates</h3>
                <p className="text-muted-foreground mb-4">
                  No medical certificates have been issued
                </p>
                <Button onClick={() => setShowForm(true)}>Issue Certificate</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {certificates?.map((cert) => (
                <Card key={cert.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-100">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {cert.patient?.first_name} {cert.patient?.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {cert.certificate_number} • {getCertificateTypeLabel(cert.certificate_type)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {cert.certificate_type === "fitness" && getFitnessStatusBadge(cert.fitness_status)}
                        <Badge variant="outline">{getCertificateTypeLabel(cert.certificate_type)}</Badge>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Issued On</p>
                          <p className="font-medium">
                            {cert.issued_at
                              ? format(new Date(cert.issued_at), "dd MMM yyyy")
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      {cert.certificate_type === "sick_leave" && (
                        <>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Leave Period</p>
                              <p className="font-medium">
                                {cert.leave_days || 0} days
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">From - To</p>
                              <p className="font-medium text-xs">
                                {cert.leave_from && cert.leave_to
                                  ? `${format(new Date(cert.leave_from), "dd MMM")} - ${format(new Date(cert.leave_to), "dd MMM")}`
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <Printer className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Print Count</p>
                          <p className="font-medium">{cert.print_count}</p>
                        </div>
                      </div>
                    </div>

                    {cert.purpose && (
                      <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                        <p className="text-muted-foreground">Purpose: {cert.purpose}</p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCertificate(cert);
                          setTimeout(() => handlePrint(), 100);
                        }}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Hidden print components */}
      <div className="hidden">
        {selectedCertificate && selectedCertificate.certificate_type === "fitness" && (
          <PrintableFitnessCertificate ref={printRef} certificate={selectedCertificate} />
        )}
        {selectedCertificate && selectedCertificate.certificate_type === "sick_leave" && (
          <PrintableSickLeaveCertificate ref={printRef} certificate={selectedCertificate} />
        )}
      </div>
    </div>
  );
}

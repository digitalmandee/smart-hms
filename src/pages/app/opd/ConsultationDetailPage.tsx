import { useParams, useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConsultation } from "@/hooks/useConsultations";
import { usePrescriptionByConsultation } from "@/hooks/usePrescriptions";
import { useOrganization } from "@/hooks/useOrganizations";
import { useAuth } from "@/contexts/AuthContext";
import { ConsultationSummary } from "@/components/consultation/ConsultationSummary";
import { PrintablePrescription } from "@/components/consultation/PrintablePrescription";
import { PrintableConsultation } from "@/components/consultation/PrintableConsultation";
import { usePrint } from "@/hooks/usePrint";
import { ArrowLeft, Printer, FileText } from "lucide-react";

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: consultation, isLoading } = useConsultation(id);
  const { data: prescription } = usePrescriptionByConsultation(id);
  const { data: organization } = useOrganization(profile?.organization_id);

  const prescriptionPrint = usePrint();
  const consultationPrint = usePrint();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Consultation not found</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const orgData = organization
    ? {
        name: organization.name,
        address: organization.address,
        phone: organization.phone,
        email: organization.email,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultation Details"
        breadcrumbs={[
          { label: "OPD", href: "/app/opd" },
          { label: "History", href: "/app/opd/history" },
          { label: "Details" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {prescription && (
              <Button
                variant="outline"
                onClick={() =>
                  prescriptionPrint.handlePrint({ title: `Prescription - ${prescription.prescription_number}` })
                }
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Prescription
              </Button>
            )}
            <Button
              onClick={() =>
                consultationPrint.handlePrint({ title: "Consultation Summary" })
              }
            >
              <FileText className="h-4 w-4 mr-2" />
              Print Summary
            </Button>
          </div>
        }
      />

      <ConsultationSummary consultation={consultation} prescription={prescription} />

      {/* Hidden printable content */}
      <div className="hidden">
        {prescription && (
          <PrintablePrescription
            ref={prescriptionPrint.printRef}
            consultation={consultation}
            prescription={prescription}
            organization={orgData}
          />
        )}
        <PrintableConsultation
          ref={consultationPrint.printRef}
          consultation={consultation}
          prescription={prescription}
          organization={orgData}
        />
      </div>
    </div>
  );
}

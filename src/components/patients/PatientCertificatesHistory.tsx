import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useMedicalCertificates } from "@/hooks/useMedicalCertificates";
import { format } from "date-fns";
import { FileText, Plus, Printer, Award, Calendar, Stethoscope } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PatientCertificatesHistoryProps {
  patientId: string;
}

export function PatientCertificatesHistory({ patientId }: PatientCertificatesHistoryProps) {
  const { data: certificates, isLoading } = useMedicalCertificates(patientId);

  const getCertificateTypeBadge = (type: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      fitness: { label: "Fitness", variant: "default" },
      sick_leave: { label: "Sick Leave", variant: "secondary" },
      disability: { label: "Disability", variant: "outline" },
      vaccination: { label: "Vaccination", variant: "default" },
      medical_report: { label: "Medical Report", variant: "outline" },
      medical_legal: { label: "Medico-Legal", variant: "destructive" },
      age_verification: { label: "Age Verification", variant: "secondary" },
    };
    const typeConfig = config[type] || { label: type, variant: "outline" };
    return <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>;
  };

  const getFitnessStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      fit: "default",
      unfit: "destructive",
      fit_with_restrictions: "secondary",
      temporarily_unfit: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status?.replace(/_/g, ' ')}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!certificates?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No certificates issued for this patient</p>
          <Link to={`/app/certificates?patientId=${patientId}`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Issue Certificate
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Medical Certificates ({certificates.length})
          </CardTitle>
          <CardDescription>Issued medical certificates and documents</CardDescription>
        </div>
        <Link to={`/app/certificates?patientId=${patientId}`}>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Issue New
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Issued By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((cert: any) => (
              <TableRow key={cert.id}>
                <TableCell className="font-medium">{cert.certificate_number}</TableCell>
                <TableCell>{getCertificateTypeBadge(cert.certificate_type)}</TableCell>
                <TableCell className="max-w-[200px] truncate">{cert.purpose || '-'}</TableCell>
                <TableCell>
                  {cert.valid_from && (
                    <div className="text-sm">
                      <p>{format(new Date(cert.valid_from), 'MMM dd, yyyy')}</p>
                      {cert.valid_to && (
                        <p className="text-muted-foreground">
                          to {format(new Date(cert.valid_to), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Stethoscope className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {cert.issued_by_doctor?.profiles?.full_name || 'Unknown'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {cert.certificate_type === 'fitness' && cert.fitness_status ? (
                    getFitnessStatusBadge(cert.fitness_status)
                  ) : cert.certificate_type === 'sick_leave' && cert.leave_days ? (
                    <Badge variant="secondary">{cert.leave_days} days</Badge>
                  ) : (
                    <Badge variant="outline">Issued</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link to={`/app/certificates/${cert.id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

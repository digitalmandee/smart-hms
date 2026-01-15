import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { usePatient } from "@/hooks/usePatients";
import { useMedicalHistory } from "@/hooks/useMedicalHistory";
import { useOrganization } from "@/hooks/useOrganizations";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { PrintablePatientCard } from "@/components/patients/PrintablePatientCard";
import { usePrint } from "@/hooks/usePrint";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplets,
  AlertCircle,
  Edit,
  FileText,
  Activity,
  Heart,
  Pill,
  Stethoscope,
  Clock,
  Receipt,
  Scissors,
  TestTubes,
  Bed,
  Siren,
  Scan,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { MedicalHistorySection } from "@/components/patients/MedicalHistorySection";
import { PatientBillingHistory } from "@/components/patients/PatientBillingHistory";
import { PatientSurgicalHistory } from "@/components/ot/PatientSurgicalHistory";
import { PatientVisitsHistory } from "@/components/patients/PatientVisitsHistory";
import { PatientPrescriptionsHistory } from "@/components/patients/PatientPrescriptionsHistory";
import { PatientLabHistory } from "@/components/patients/PatientLabHistory";
import { PatientAdmissionHistory } from "@/components/patients/PatientAdmissionHistory";
import { PatientEmergencyHistory } from "@/components/patients/PatientEmergencyHistory";
import { PatientBloodHistory } from "@/components/patients/PatientBloodHistory";
import { PatientImagingHistory } from "@/components/patients/PatientImagingHistory";

export function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: patient, isLoading } = usePatient(id);
  const { data: medicalHistory } = useMedicalHistory(id);
  const { data: organization } = useOrganization(profile?.organization_id);
  const { printRef, handlePrint } = usePrint();

  const getAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Patient Profile"
          breadcrumbs={[
            { label: "Patients", href: "/app/patients" },
            { label: "Profile" },
          ]}
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-24 w-24 rounded-full mx-auto" />
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  const fullName = `${patient.first_name}${patient.last_name ? ` ${patient.last_name}` : ""}`;
  const age = getAge(patient.date_of_birth);

  return (
    <div>
      <PageHeader
        title={fullName}
        description={`Patient ID: ${patient.patient_number}`}
        breadcrumbs={[
          { label: "Patients", href: "/app/patients" },
          { label: fullName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={patient.is_active ? "active" : "inactive"} />
            <Button variant="outline" onClick={() => handlePrint({ title: "Patient ID Card" })}>
              <Printer className="h-4 w-4 mr-2" />
              Print ID Card
            </Button>
            <Link to={`/app/patients/${patient.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{fullName}</h2>
              <p className="text-sm text-muted-foreground">{patient.patient_number}</p>
              {patient.blood_group && (
                <Badge variant="outline" className="mt-2 gap-1">
                  <Droplets className="h-3 w-3" />
                  {patient.blood_group}
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              {patient.gender && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{patient.gender}</span>
                </div>
              )}

              {patient.date_of_birth && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(patient.date_of_birth), "MMM dd, yyyy")}
                    {age && ` (${age} years)`}
                  </span>
                </div>
              )}

              {patient.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
              )}

              {patient.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm break-all">{patient.email}</span>
                </div>
              )}

              {(patient.address || patient.city) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">
                    {patient.address}
                    {patient.address && patient.city && ", "}
                    {patient.city}
                    {patient.postal_code && ` ${patient.postal_code}`}
                  </span>
                </div>
              )}

              {patient.national_id && (
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.national_id}</span>
                </div>
              )}
            </div>

            {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Emergency Contact
                </h3>
                {patient.emergency_contact_name && (
                  <p className="text-sm">{patient.emergency_contact_name}</p>
                )}
                {patient.emergency_contact_phone && (
                  <p className="text-sm text-muted-foreground">{patient.emergency_contact_phone}</p>
                )}
              </div>
            )}

            <div className="mt-6 pt-6 border-t text-xs text-muted-foreground">
              <p>Registered: {format(new Date(patient.created_at), "MMM dd, yyyy")}</p>
              <p>Last Updated: {format(new Date(patient.updated_at), "MMM dd, yyyy")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="overview" className="gap-2">
                <Activity className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Heart className="h-4 w-4" />
                Medical
              </TabsTrigger>
              <TabsTrigger value="visits" className="gap-2">
                <Stethoscope className="h-4 w-4" />
                Visits
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="gap-2">
                <Pill className="h-4 w-4" />
                Rx
              </TabsTrigger>
              <TabsTrigger value="lab" className="gap-2">
                <TestTubes className="h-4 w-4" />
                Lab
              </TabsTrigger>
              <TabsTrigger value="imaging" className="gap-2">
                <Scan className="h-4 w-4" />
                Imaging
              </TabsTrigger>
              <TabsTrigger value="ipd" className="gap-2">
                <Bed className="h-4 w-4" />
                IPD
              </TabsTrigger>
              <TabsTrigger value="emergency" className="gap-2">
                <Siren className="h-4 w-4" />
                ER
              </TabsTrigger>
              <TabsTrigger value="surgeries" className="gap-2">
                <Scissors className="h-4 w-4" />
                OT
              </TabsTrigger>
              <TabsTrigger value="blood" className="gap-2">
                <Droplets className="h-4 w-4" />
                Blood
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <Receipt className="h-4 w-4" />
                Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-6">
                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Stethoscope className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Total Visits</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-info/10">
                        <Clock className="h-5 w-5 text-info" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">-</p>
                        <p className="text-sm text-muted-foreground">Last Visit</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-warning/10">
                        <Heart className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{medicalHistory?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Medical Records</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Notes */}
                {patient.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {patient.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Activity Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <MedicalHistorySection patientId={patient.id} />
            </TabsContent>

            <TabsContent value="visits">
              <PatientVisitsHistory patientId={patient.id} />
            </TabsContent>

            <TabsContent value="prescriptions">
              <PatientPrescriptionsHistory patientId={patient.id} />
            </TabsContent>

            <TabsContent value="lab">
              <PatientLabHistory patientId={patient.id} />
            </TabsContent>

            <TabsContent value="imaging">
              <PatientImagingHistory patientId={patient.id} />
            </TabsContent>

            <TabsContent value="ipd">
              <PatientAdmissionHistory patientId={patient.id} />
            </TabsContent>

            <TabsContent value="emergency">
              <PatientEmergencyHistory patientId={patient.id} />
            </TabsContent>

            <TabsContent value="surgeries">
              <PatientSurgicalHistory patientId={patient.id} />
            </TabsContent>

            <TabsContent value="blood">
              <PatientBloodHistory patientId={patient.id} />
            </TabsContent>

            <TabsContent value="billing">
              <PatientBillingHistory patientId={patient.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Print Patient ID Card */}
      <div ref={printRef}>
        <PrintablePatientCard 
          patient={patient} 
          organization={organization ? {
            name: organization.name,
            phone: organization.phone,
            address: organization.address,
            city: organization.city
          } : undefined}
        />
      </div>
    </div>
  );
}

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConsultationWithRelations, Vitals } from "@/hooks/useConsultations";
import { PrescriptionWithItems } from "@/hooks/usePrescriptions";
import {
  User,
  Calendar,
  Stethoscope,
  Activity,
  Pill,
  FileText,
  Clock,
} from "lucide-react";

interface ConsultationSummaryProps {
  consultation: ConsultationWithRelations;
  prescription?: PrescriptionWithItems | null;
}

export function ConsultationSummary({
  consultation,
  prescription,
}: ConsultationSummaryProps) {
  const vitals = consultation.vitals as Vitals | null;
  const patient = consultation.patient;
  const doctor = consultation.doctor;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Consultation Summary</h2>
          <p className="text-muted-foreground">
            {format(new Date(consultation.created_at), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        {consultation.appointment?.token_number && (
          <Badge variant="outline" className="text-lg">
            Token #{consultation.appointment.token_number}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>{" "}
              <span className="font-medium">
                {patient?.first_name} {patient?.last_name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">MR#:</span>{" "}
              {patient?.patient_number}
            </div>
            {patient?.phone && (
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {patient.phone}
              </div>
            )}
            {patient?.gender && (
              <div>
                <span className="text-muted-foreground">Gender:</span>{" "}
                <span className="capitalize">{patient.gender}</span>
              </div>
            )}
            {patient?.blood_group && (
              <div>
                <span className="text-muted-foreground">Blood Group:</span>{" "}
                {patient.blood_group}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doctor Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Attending Physician
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Doctor:</span>{" "}
              <span className="font-medium">
                Dr. {(doctor as any)?.profile?.full_name || "Unknown"}
              </span>
            </div>
            {doctor?.specialization && (
              <div>
                <span className="text-muted-foreground">Specialization:</span>{" "}
                {doctor.specialization}
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Date:</span>{" "}
              {format(new Date(consultation.created_at), "MMMM d, yyyy")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vitals */}
      {vitals && Object.keys(vitals).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {vitals.blood_pressure && (
                <div>
                  <span className="text-muted-foreground">Blood Pressure:</span>
                  <p className="font-medium">
                    {vitals.blood_pressure.systolic}/{vitals.blood_pressure.diastolic} mmHg
                  </p>
                </div>
              )}
              {vitals.pulse && (
                <div>
                  <span className="text-muted-foreground">Pulse:</span>
                  <p className="font-medium">{vitals.pulse} bpm</p>
                </div>
              )}
              {vitals.temperature && (
                <div>
                  <span className="text-muted-foreground">Temperature:</span>
                  <p className="font-medium">
                    {vitals.temperature}°{vitals.temperature_unit || 'F'}
                  </p>
                </div>
              )}
              {vitals.spo2 && (
                <div>
                  <span className="text-muted-foreground">SpO2:</span>
                  <p className="font-medium">{vitals.spo2}%</p>
                </div>
              )}
              {vitals.weight && (
                <div>
                  <span className="text-muted-foreground">Weight:</span>
                  <p className="font-medium">{vitals.weight} kg</p>
                </div>
              )}
              {vitals.height && (
                <div>
                  <span className="text-muted-foreground">Height:</span>
                  <p className="font-medium">{vitals.height} cm</p>
                </div>
              )}
              {vitals.bmi && (
                <div>
                  <span className="text-muted-foreground">BMI:</span>
                  <p className="font-medium">{vitals.bmi} kg/m²</p>
                </div>
              )}
              {vitals.respiratory_rate && (
                <div>
                  <span className="text-muted-foreground">Respiratory Rate:</span>
                  <p className="font-medium">{vitals.respiratory_rate}/min</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Clinical Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {consultation.chief_complaint && (
            <div>
              <span className="text-muted-foreground">Chief Complaint:</span>
              <p className="mt-1">{consultation.chief_complaint}</p>
            </div>
          )}
          {consultation.symptoms && (
            <div>
              <span className="text-muted-foreground">Symptoms:</span>
              <p className="mt-1">{consultation.symptoms}</p>
            </div>
          )}
          {consultation.diagnosis && (
            <div>
              <span className="text-muted-foreground">Diagnosis:</span>
              <p className="mt-1 font-medium">{consultation.diagnosis}</p>
            </div>
          )}
          {consultation.clinical_notes && (
            <div>
              <span className="text-muted-foreground">Clinical Notes:</span>
              <p className="mt-1 whitespace-pre-wrap">{consultation.clinical_notes}</p>
            </div>
          )}
          {consultation.follow_up_date && (
            <div>
              <span className="text-muted-foreground">Follow-up Date:</span>
              <p className="mt-1 font-medium">
                {format(new Date(consultation.follow_up_date), "MMMM d, yyyy")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription */}
      {prescription && prescription.items && prescription.items.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Prescription
              <Badge variant="outline" className="ml-2">
                {prescription.prescription_number}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prescription.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-3 border rounded-lg"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.medicine_name}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                      {item.dosage && <span>{item.dosage}</span>}
                      {item.frequency && (
                        <>
                          <span>•</span>
                          <span>{item.frequency}</span>
                        </>
                      )}
                      {item.duration && (
                        <>
                          <span>•</span>
                          <span>{item.duration}</span>
                        </>
                      )}
                      {item.quantity && (
                        <>
                          <span>•</span>
                          <span>Qty: {item.quantity}</span>
                        </>
                      )}
                    </div>
                    {item.instructions && (
                      <p className="text-sm text-muted-foreground mt-1 italic">
                        {item.instructions}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {prescription.notes && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Notes:</span> {prescription.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

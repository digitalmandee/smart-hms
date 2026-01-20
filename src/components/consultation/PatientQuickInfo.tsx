import { format, differenceInYears } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMedicalHistory } from "@/hooks/useMedicalHistory";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Droplet,
  AlertTriangle,
  ChevronRight,
  Activity,
  Thermometer,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";

interface PatientQuickInfoProps {
  patient: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_number: string;
    phone: string | null;
    email?: string | null;
    date_of_birth: string | null;
    gender: string | null;
    blood_group: string | null;
  };
  vitals?: {
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    pulse?: number;
    temperature?: number;
    spo2?: number;
    weight?: number;
    height?: number;
  } | null;
}

export function PatientQuickInfo({ patient, vitals }: PatientQuickInfoProps) {
  const { data: medicalHistory = [] } = useMedicalHistory(patient.id);

  const allergies = medicalHistory.filter((h) => h.condition_type === "allergy");
  const chronicDiseases = medicalHistory.filter((h) => h.condition_type === "chronic_disease");
  const currentMedications = medicalHistory.filter((h) => h.condition_type === "medication");

  const age = patient.date_of_birth
    ? differenceInYears(new Date(), new Date(patient.date_of_birth))
    : null;

  const fullName = `${patient.first_name} ${patient.last_name || ""}`.trim();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Patient Info
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/app/patients/${patient.id}`}>
              View Full <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div>
          <h3 className="font-semibold text-lg">{fullName}</h3>
          <p className="text-sm text-muted-foreground">MR# {patient.patient_number}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {age !== null && (
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {age} years
              </Badge>
            )}
            {patient.gender && (
              <Badge variant="outline" className="capitalize">
                {patient.gender}
              </Badge>
            )}
            {patient.blood_group && (
              <Badge variant="outline">
                <Droplet className="h-3 w-3 mr-1" />
                {patient.blood_group}
              </Badge>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-1 text-sm">
          {patient.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              {patient.phone}
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {patient.email}
            </div>
          )}
        </div>

        {/* Vitals Summary - From Check-in */}
        {vitals && Object.keys(vitals).length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Activity className="h-4 w-4 text-primary" />
                Check-in Vitals
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic && (
                  <div className="flex items-center gap-2">
                    <Heart className="h-3 w-3 text-muted-foreground" />
                    <span>BP: {vitals.blood_pressure_systolic}/{vitals.blood_pressure_diastolic}</span>
                  </div>
                )}
                {vitals.pulse && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                    <span>Pulse: {vitals.pulse}</span>
                  </div>
                )}
                {vitals.temperature && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-3 w-3 text-muted-foreground" />
                    <span>Temp: {vitals.temperature}°F</span>
                  </div>
                )}
                {vitals.spo2 && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                    <span>SpO2: {vitals.spo2}%</span>
                  </div>
                )}
                {vitals.weight && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Wt:</span>
                    <span>{vitals.weight} kg</span>
                  </div>
                )}
                {vitals.height && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Ht:</span>
                    <span>{vitals.height} cm</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Allergies - Prominent Warning */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Allergies
          </h4>
          {allergies.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {allergies.map((allergy) => (
                <Badge key={allergy.id} variant="destructive">
                  {allergy.description}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No known allergies</p>
          )}
        </div>

        {/* Chronic Diseases */}
        <div>
          <h4 className="text-sm font-medium mb-2">Chronic Conditions</h4>
          {chronicDiseases.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {chronicDiseases.map((condition) => (
                <Badge key={condition.id} variant="secondary">
                  {condition.description}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">None recorded</p>
          )}
        </div>

        {/* Current Medications */}
        <div>
          <h4 className="text-sm font-medium mb-2">Current Medications</h4>
          {currentMedications.length > 0 ? (
            <div className="space-y-1">
              {currentMedications.map((med) => (
                <div key={med.id} className="text-sm">
                  • {med.description}
                  {med.notes && (
                    <span className="text-muted-foreground ml-1">({med.notes})</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">None recorded</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

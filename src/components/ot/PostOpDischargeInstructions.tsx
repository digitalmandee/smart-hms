import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, AlertTriangle, Calendar, Phone, Pill } from "lucide-react";
import { usePrint } from "@/hooks/usePrint";

interface DischargeInstructionsProps {
  patientName: string;
  procedureName: string;
  surgeonName: string;
  dischargeDate: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  warningSigns?: string[];
  followUpDate?: string;
  followUpNotes?: string;
  specialInstructions?: string;
  organizationName?: string;
  organizationPhone?: string;
}

export function PostOpDischargeInstructions({
  patientName,
  procedureName,
  surgeonName,
  dischargeDate,
  medications = [],
  warningSigns = [
    "High fever (above 101°F / 38.3°C)",
    "Severe or worsening pain not relieved by medication",
    "Excessive bleeding or discharge from surgical site",
    "Signs of infection: redness, swelling, warmth around incision",
    "Difficulty breathing or shortness of breath",
    "Persistent nausea or vomiting",
    "Inability to eat or drink fluids",
    "Fainting or dizziness",
  ],
  followUpDate,
  followUpNotes,
  specialInstructions,
  organizationName = "Hospital",
  organizationPhone = "Emergency: 115",
}: DischargeInstructionsProps) {
  const { printRef, handlePrint } = usePrint();

  const onPrint = () => {
    handlePrint({
      title: `Discharge-Instructions-${patientName.replace(/\s+/g, '-')}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Print Button */}
      <div className="flex justify-end print:hidden">
        <Button onClick={onPrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Instructions
        </Button>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="bg-white p-6 rounded-lg border print:border-none">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">{organizationName}</h1>
          <p className="text-muted-foreground">Post-Operative Discharge Instructions</p>
        </div>

        <Separator className="my-4" />

        {/* Patient Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Patient Name</p>
            <p className="font-semibold">{patientName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Procedure</p>
            <p className="font-semibold">{procedureName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Surgeon</p>
            <p className="font-semibold">{surgeonName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Discharge Date</p>
            <p className="font-semibold">
              {format(new Date(dischargeDate), "PPP 'at' p")}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Medications */}
        {medications.length > 0 && (
          <Card className="mb-4 border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                Medications to Continue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Medicine</th>
                    <th className="text-left py-2">Dosage</th>
                    <th className="text-left py-2">Frequency</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((med, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2">{med.name}</td>
                      <td className="py-2">{med.dosage}</td>
                      <td className="py-2">{med.frequency}</td>
                      <td className="py-2">{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Warning Signs */}
        <Card className="mb-4 border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Warning Signs - Seek Immediate Medical Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {warningSigns.map((sign, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Follow-up Appointment */}
        {followUpDate && (
          <Card className="mb-4 border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-green-700">
                <Calendar className="h-5 w-5" />
                Follow-up Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">
                {format(new Date(followUpDate), "EEEE, MMMM d, yyyy")}
              </p>
              {followUpNotes && (
                <p className="text-sm text-muted-foreground mt-1">{followUpNotes}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Special Instructions */}
        {specialInstructions && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{specialInstructions}</p>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold">Emergency Contact</p>
                <p className="text-sm text-muted-foreground">{organizationPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-muted-foreground mb-8">Patient/Guardian Signature</p>
              <div className="border-b border-gray-400 w-full"></div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-8">Date</p>
              <div className="border-b border-gray-400 w-full"></div>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-6">
            This document is for informational purposes. Follow your doctor's specific advice.
          </p>
        </div>
      </div>
    </div>
  );
}

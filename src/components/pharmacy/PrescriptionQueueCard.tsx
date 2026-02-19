import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Pill, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PrescriptionQueueItem } from "@/hooks/usePharmacy";
import { useTranslation } from "@/lib/i18n";

interface PrescriptionQueueCardProps {
  prescription: PrescriptionQueueItem;
}

export function PrescriptionQueueCard({ prescription }: PrescriptionQueueCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const patientName = [prescription.patient?.first_name, prescription.patient?.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/app/pharmacy/dispense/${prescription.id}`)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-lg">{prescription.prescription_number}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {format(new Date(prescription.created_at), "MMM d, h:mm a")}
            </div>
          </div>
          <Badge variant={prescription.status === "partially_dispensed" ? "secondary" : "outline"}>
            {prescription.status === "partially_dispensed" ? t('pharmacy.partial' as any) : t('pharmacy.pending' as any)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{patientName}</p>
            <p className="text-xs text-muted-foreground">{prescription.patient?.patient_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{prescription.itemCount} {t('pharmacy.items' as any)}</span>
        </div>
        <div className="pt-2">
          <p className="text-xs text-muted-foreground">
            {t('pharmacy.prescribedBy' as any)}: {prescription.doctor?.profile?.full_name}
          </p>
        </div>
        <Button className="w-full mt-2" size="sm">
          {t('pharmacy.dispense' as any)}
        </Button>
      </CardContent>
    </Card>
  );
}

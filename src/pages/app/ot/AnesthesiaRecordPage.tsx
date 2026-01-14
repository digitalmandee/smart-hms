import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AnesthesiaRecordForm } from "@/components/ot/AnesthesiaRecordForm";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Scissors,
  HeartPulse,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useSurgery, useSaveAnesthesiaRecord } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AnesthesiaRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const { data: surgery, isLoading } = useSurgery(id!);
  const saveRecord = useSaveAnesthesiaRecord();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!surgery) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-lg font-medium">Surgery Not Found</h2>
        <Button onClick={() => navigate("/app/ot/schedule")} className="mt-4">
          Back to Schedule
        </Button>
      </div>
    );
  }

  const patientName = surgery.patient 
    ? `${surgery.patient.first_name} ${surgery.patient.last_name}`
    : 'Unknown Patient';

  const handleSaveRecord = async (data: any) => {
    try {
      await saveRecord.mutateAsync({
        surgeryId: surgery.id,
        ...data,
        anesthetist_id: profile?.id || '',
      });
    } catch (error) {
      toast.error('Failed to save record');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HeartPulse className="h-6 w-6" />
              Anesthesia Record
            </h1>
            <p className="text-muted-foreground">{surgery.surgery_number} - {surgery.procedure_name}</p>
          </div>
        </div>
        {surgery.anesthesia_record && (
          <Badge variant="secondary">Record Exists</Badge>
        )}
      </div>

      {/* Patient & Surgery Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{patientName}</p>
              <p className="text-sm text-muted-foreground">{surgery.patient?.mr_number}</p>
              {surgery.patient?.blood_group && (
                <Badge variant="outline" className="mt-1">
                  Blood: {surgery.patient.blood_group}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">
                {format(new Date(surgery.scheduled_date), 'EEEE, MMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <Scissors className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="font-medium">{surgery.procedure_name}</p>
              <p className="text-sm text-muted-foreground">
                {surgery.lead_surgeon?.profile?.full_name || 'Surgeon TBD'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anesthesia Form */}
      <AnesthesiaRecordForm
        surgeryId={surgery.id}
        record={surgery.anesthesia_record}
        anesthetistId={profile?.id}
        onSave={handleSaveRecord}
        isLoading={saveRecord.isPending}
      />
    </div>
  );
}

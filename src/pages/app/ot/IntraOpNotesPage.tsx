import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IntraOpNotesForm } from "@/components/ot/IntraOpNotesForm";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Scissors,
  FileText,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useSurgery, useSaveIntraOpNotes } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function IntraOpNotesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const { data: surgery, isLoading } = useSurgery(id!);
  const createNotes = useCreateIntraOpNotes();
  const updateNotes = useUpdateIntraOpNotes();

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

  const handleSaveNotes = async (data: any) => {
    try {
      if (surgery.intra_op_notes) {
        await updateNotes.mutateAsync({
          id: surgery.intra_op_notes.id,
          ...data,
        });
      } else {
        await createNotes.mutateAsync({
          ...data,
          surgery_id: surgery.id,
          documented_by: profile?.id || '',
        });
      }
      toast.success('Operative notes saved');
    } catch (error) {
      toast.error('Failed to save notes');
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
              <FileText className="h-6 w-6" />
              Intra-Operative Notes
            </h1>
            <p className="text-muted-foreground">{surgery.surgery_number} - {surgery.procedure_name}</p>
          </div>
        </div>
        {surgery.intra_op_notes && (
          <Badge variant="secondary">Notes Documented</Badge>
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

      {/* Intra-Op Notes Form */}
      <IntraOpNotesForm
        surgeryId={surgery.id}
        notes={surgery.intra_op_notes}
        procedureName={surgery.procedure_name}
        documentedBy={profile?.id}
        onSave={handleSaveNotes}
        isLoading={createNotes.isPending || updateNotes.isPending}
      />
    </div>
  );
}
